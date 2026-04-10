export type DisputeVoteOption = 'creator' | 'worker'
export type DaoDisputeStatus = 'voting' | 'resolved'
export type DaoDisputeResolution = 'creator' | 'worker' | 'tie' | null

export interface DaoDispute {
  id: string
  bountyId: string
  bountyTitle: string
  amount: number
  raisedBy: string
  reason: string
  status: DaoDisputeStatus
  createdAt: number
  votingEndsAt: number
  votesForCreator: number
  votesForWorker: number
  voters: string[]
  resolution: DaoDisputeResolution
}

export interface CreateDisputeInput {
  bountyId: string
  bountyTitle: string
  amount: number
  raisedBy: string
  reason: string
  durationHours?: number
}

interface SupabaseDisputeRow {
  id: string
  bounty_id: string
  bounty_title: string
  amount: number
  raised_by: string
  reason: string
  status: DaoDisputeStatus
  created_at: number
  voting_ends_at: number
  votes_for_creator: number
  votes_for_worker: number
  voters: string[]
  resolution: DaoDisputeResolution
}

const STORAGE_KEY = 'dao_disputes'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
}

function getSupabaseHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: String(SUPABASE_ANON_KEY),
    Authorization: `Bearer ${String(SUPABASE_ANON_KEY)}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

function toDispute(row: SupabaseDisputeRow): DaoDispute {
  return {
    id: row.id,
    bountyId: row.bounty_id,
    bountyTitle: row.bounty_title,
    amount: Number(row.amount),
    raisedBy: row.raised_by,
    reason: row.reason,
    status: row.status,
    createdAt: Number(row.created_at),
    votingEndsAt: Number(row.voting_ends_at),
    votesForCreator: Number(row.votes_for_creator),
    votesForWorker: Number(row.votes_for_worker),
    voters: Array.isArray(row.voters) ? row.voters : [],
    resolution: row.resolution ?? null,
  }
}

function toRow(dispute: DaoDispute): SupabaseDisputeRow {
  return {
    id: dispute.id,
    bounty_id: dispute.bountyId,
    bounty_title: dispute.bountyTitle,
    amount: Number(dispute.amount),
    raised_by: dispute.raisedBy,
    reason: dispute.reason,
    status: dispute.status,
    created_at: Number(dispute.createdAt),
    voting_ends_at: Number(dispute.votingEndsAt),
    votes_for_creator: Number(dispute.votesForCreator),
    votes_for_worker: Number(dispute.votesForWorker),
    voters: dispute.voters,
    resolution: dispute.resolution,
  }
}

function getAllLocal(): DaoDispute[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as DaoDispute[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAllLocal(disputes: DaoDispute[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(disputes))
}

function resolveOutcome(dispute: DaoDispute): DaoDisputeResolution {
  if (dispute.votesForCreator > dispute.votesForWorker) return 'creator'
  if (dispute.votesForWorker > dispute.votesForCreator) return 'worker'
  return 'tie'
}

function closeIfExpired(dispute: DaoDispute): DaoDispute {
  if (dispute.status === 'resolved') return dispute
  if (Date.now() < dispute.votingEndsAt) return dispute
  return {
    ...dispute,
    status: 'resolved',
    resolution: resolveOutcome(dispute),
  }
}

function createId(): string {
  return `dsp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function fetchRawDisputes(): Promise<DaoDispute[]> {
  if (!isSupabaseConfigured()) return getAllLocal()

  try {
    const url = `${SUPABASE_URL}/rest/v1/disputes?select=*&order=created_at.desc`
    const response = await fetch(url, { headers: getSupabaseHeaders() })
    if (!response.ok) throw new Error(`Supabase disputes read failed (${response.status})`)
    const rows = (await response.json()) as SupabaseDisputeRow[]
    return rows.map(toDispute)
  } catch (error) {
    console.warn('Disputes read fallback to local:', error)
    return getAllLocal()
  }
}

async function upsertDispute(dispute: DaoDispute): Promise<void> {
  if (!isSupabaseConfigured()) {
    const all = getAllLocal()
    const index = all.findIndex((entry) => entry.id === dispute.id)
    if (index >= 0) all[index] = dispute
    else all.unshift(dispute)
    saveAllLocal(all)
    return
  }

  try {
    const row = toRow(dispute)
    const url = `${SUPABASE_URL}/rest/v1/disputes?on_conflict=id`
    const response = await fetch(url, {
      method: 'POST',
      headers: getSupabaseHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify([row]),
    })
    if (!response.ok) throw new Error(`Supabase disputes upsert failed (${response.status})`)
  } catch (error) {
    console.warn('Disputes write fallback to local:', error)
    const all = getAllLocal()
    const index = all.findIndex((entry) => entry.id === dispute.id)
    if (index >= 0) all[index] = dispute
    else all.unshift(dispute)
    saveAllLocal(all)
  }
}

export async function listDisputes(): Promise<DaoDispute[]> {
  const raw = await fetchRawDisputes()
  const normalized = raw
    .map((entry) => ({
      ...entry,
      voters: Array.isArray(entry.voters) ? entry.voters : [],
    }))
    .map(closeIfExpired)
    .sort((a, b) => b.createdAt - a.createdAt)

  const changed = normalized.filter((entry, index) => {
    const original = raw[index]
    return original && (original.status !== entry.status || original.resolution !== entry.resolution)
  })

  if (changed.length > 0) {
    await Promise.all(changed.map((entry) => upsertDispute(entry)))
  }

  return normalized
}

export async function createDispute(input: CreateDisputeInput): Promise<DaoDispute> {
  const dispute: DaoDispute = {
    id: createId(),
    bountyId: input.bountyId,
    bountyTitle: input.bountyTitle,
    amount: Number(input.amount),
    raisedBy: input.raisedBy,
    reason: input.reason,
    status: 'voting',
    createdAt: Date.now(),
    votingEndsAt: Date.now() + (input.durationHours ?? 24) * 60 * 60 * 1000,
    votesForCreator: 0,
    votesForWorker: 0,
    voters: [],
    resolution: null,
  }

  await upsertDispute(dispute)
  return dispute
}

export async function castDisputeVote(disputeId: string, voterAddress: string, vote: DisputeVoteOption): Promise<DaoDispute> {
  const disputes = await listDisputes()
  const current = disputes.find((entry) => entry.id === disputeId)

  if (!current) throw new Error('Dispute not found')
  if (current.status === 'resolved') throw new Error('Voting has already closed for this dispute')

  const voter = voterAddress.toLowerCase()
  if (current.voters.some((entry) => entry.toLowerCase() === voter)) {
    throw new Error('You already voted on this dispute')
  }

  const updated: DaoDispute = {
    ...current,
    votesForCreator: vote === 'creator' ? current.votesForCreator + 1 : current.votesForCreator,
    votesForWorker: vote === 'worker' ? current.votesForWorker + 1 : current.votesForWorker,
    voters: [...current.voters, voter],
  }

  const finalized = closeIfExpired(updated)
  await upsertDispute(finalized)
  return finalized
}
