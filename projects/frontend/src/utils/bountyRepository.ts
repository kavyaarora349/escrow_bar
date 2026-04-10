import { StoredBounty, getBounties as getLocalBounties, saveBounty as saveLocalBounty, updateBountyStatus as updateLocalBountyStatus } from '@/utils/bountyStorage'

interface SupabaseBountyRow {
  app_id: number
  app_address: string
  creator: string
  title: string
  description: string
  reward: number
  category: string
  difficulty: string
  created_at: number
  status: 'active' | 'claimed' | 'completed'
}

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

function toStoredBounty(row: SupabaseBountyRow): StoredBounty {
  return {
    appId: Number(row.app_id),
    appAddress: row.app_address,
    creator: row.creator,
    title: row.title,
    description: row.description,
    reward: Number(row.reward),
    category: row.category,
    difficulty: row.difficulty,
    createdAt: Number(row.created_at),
    status: row.status,
  }
}

function toSupabaseRow(bounty: StoredBounty): SupabaseBountyRow {
  return {
    app_id: Number(bounty.appId),
    app_address: bounty.appAddress,
    creator: bounty.creator,
    title: bounty.title,
    description: bounty.description,
    reward: Number(bounty.reward),
    category: bounty.category,
    difficulty: bounty.difficulty,
    created_at: Number(bounty.createdAt),
    status: bounty.status,
  }
}

export async function listBounties(): Promise<StoredBounty[]> {
  if (!isSupabaseConfigured()) {
    return getLocalBounties()
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/bounties?select=*&order=created_at.desc`
    const response = await fetch(url, { headers: getSupabaseHeaders() })
    if (!response.ok) throw new Error(`Supabase read failed (${response.status})`)
    const rows = (await response.json()) as SupabaseBountyRow[]
    return rows.map(toStoredBounty)
  } catch (error) {
    console.warn('Falling back to local bounty storage:', error)
    return getLocalBounties()
  }
}

export async function createBountyRecord(bounty: StoredBounty): Promise<void> {
  if (!isSupabaseConfigured()) {
    saveLocalBounty(bounty)
    return
  }

  try {
    const row = toSupabaseRow(bounty)
    const url = `${SUPABASE_URL}/rest/v1/bounties?on_conflict=app_id`
    const response = await fetch(url, {
      method: 'POST',
      headers: getSupabaseHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify([row]),
    })
    if (!response.ok) throw new Error(`Supabase write failed (${response.status})`)
  } catch (error) {
    console.warn('Supabase write failed, saving locally instead:', error)
    saveLocalBounty(bounty)
  }
}

export async function setBountyStatus(appId: number, status: 'active' | 'claimed' | 'completed'): Promise<void> {
  if (!isSupabaseConfigured()) {
    updateLocalBountyStatus(appId, status)
    return
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/bounties?app_id=eq.${appId}`
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getSupabaseHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw new Error(`Supabase status update failed (${response.status})`)
  } catch (error) {
    console.warn('Supabase status update failed, updating local copy instead:', error)
    updateLocalBountyStatus(appId, status)
  }
}

export function usingSupabase(): boolean {
  return isSupabaseConfigured()
}
