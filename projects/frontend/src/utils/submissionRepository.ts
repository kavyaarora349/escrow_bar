export interface BountySubmission {
  id: string
  bountyId: string
  submitter: string
  content: string
  createdAt: number
  status: 'pending' | 'approved' | 'rejected'
}

interface SupabaseSubmissionRow {
  id: string
  bounty_id: string
  submitter: string
  content: string
  created_at: number
  status: 'pending' | 'approved' | 'rejected'
}

const STORAGE_KEY = 'bounty_submissions'
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

function toSubmission(row: SupabaseSubmissionRow): BountySubmission {
  return {
    id: row.id,
    bountyId: row.bounty_id,
    submitter: row.submitter,
    content: row.content,
    createdAt: Number(row.created_at),
    status: row.status,
  }
}

function toRow(submission: BountySubmission): SupabaseSubmissionRow {
  return {
    id: submission.id,
    bounty_id: submission.bountyId,
    submitter: submission.submitter,
    content: submission.content,
    created_at: Number(submission.createdAt),
    status: submission.status,
  }
}

function getAllLocal(): BountySubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as BountySubmission[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAllLocal(items: BountySubmission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function createSubmissionId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export async function listSubmissionsForBounty(bountyId: string): Promise<BountySubmission[]> {
  if (!isSupabaseConfigured()) {
    return getAllLocal()
      .filter((entry) => entry.bountyId === bountyId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/submissions?select=*&bounty_id=eq.${encodeURIComponent(bountyId)}&order=created_at.desc`
    const response = await fetch(url, { headers: getSupabaseHeaders() })
    if (!response.ok) throw new Error(`Supabase submissions read failed (${response.status})`)
    const rows = (await response.json()) as SupabaseSubmissionRow[]
    return rows.map(toSubmission)
  } catch (error) {
    console.warn('Submissions read fallback to local:', error)
    return getAllLocal()
      .filter((entry) => entry.bountyId === bountyId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }
}

export async function createSubmission(bountyId: string, submitter: string, content: string): Promise<BountySubmission> {
  const submission: BountySubmission = {
    id: createSubmissionId(),
    bountyId,
    submitter,
    content,
    createdAt: Date.now(),
    status: 'pending',
  }

  if (!isSupabaseConfigured()) {
    const all = getAllLocal()
    all.push(submission)
    saveAllLocal(all)
    return submission
  }

  try {
    const row = toRow(submission)
    const url = `${SUPABASE_URL}/rest/v1/submissions`
    const response = await fetch(url, {
      method: 'POST',
      headers: getSupabaseHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify([row]),
    })
    if (!response.ok) throw new Error(`Supabase submissions insert failed (${response.status})`)
    return submission
  } catch (error) {
    console.warn('Submissions write fallback to local:', error)
    const all = getAllLocal()
    all.push(submission)
    saveAllLocal(all)
    return submission
  }
}

export async function approveSubmissionById(submissionId: string, bountyId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const all = getAllLocal()
    for (const item of all) {
      if (item.bountyId === bountyId) {
        item.status = item.id === submissionId ? 'approved' : 'pending'
      }
    }
    saveAllLocal(all)
    return
  }

  try {
    // Reset all bounty submissions to pending
    const resetUrl = `${SUPABASE_URL}/rest/v1/submissions?bounty_id=eq.${encodeURIComponent(bountyId)}`
    const resetResponse = await fetch(resetUrl, {
      method: 'PATCH',
      headers: getSupabaseHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ status: 'pending' }),
    })
    if (!resetResponse.ok) throw new Error(`Supabase submissions reset failed (${resetResponse.status})`)

    // Mark selected as approved
    const approveUrl = `${SUPABASE_URL}/rest/v1/submissions?id=eq.${encodeURIComponent(submissionId)}`
    const approveResponse = await fetch(approveUrl, {
      method: 'PATCH',
      headers: getSupabaseHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ status: 'approved' }),
    })
    if (!approveResponse.ok) throw new Error(`Supabase submissions approve failed (${approveResponse.status})`)
  } catch (error) {
    console.warn('Submissions approve fallback to local:', error)
    const all = getAllLocal()
    for (const item of all) {
      if (item.bountyId === bountyId) {
        item.status = item.id === submissionId ? 'approved' : 'pending'
      }
    }
    saveAllLocal(all)
  }
}
