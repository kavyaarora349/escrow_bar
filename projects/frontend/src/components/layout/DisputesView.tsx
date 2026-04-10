import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock3, Gavel, Vote } from 'lucide-react'
import { useWallet } from '@txnlab/use-wallet-react'
import { Bounty } from '@/data/bounties'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { castDisputeVote, createDispute, DaoDispute, listDisputes } from '@/utils/disputeRepository'

interface DisputesViewProps {
  bounties: Bounty[]
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatCountdown(endTs: number): string {
  const diff = endTs - Date.now()
  if (diff <= 0) return 'Voting closed'
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  if (hours <= 0) return `${minutes}m left`
  return `${hours}h ${minutes}m left`
}

function parseRewardAmount(reward: string): number {
  const match = reward.match(/[\d.]+/)
  return match ? Number(match[0]) : 0
}

function shortAddress(address: string): string {
  if (!address || address.length < 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const DisputesView: React.FC<DisputesViewProps> = ({ bounties }) => {
  const { activeAddress } = useWallet()
  const [disputes, setDisputes] = useState<DaoDispute[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedBountyId, setSelectedBountyId] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const disputeEligibleBounties = useMemo(
    () => bounties.filter((bounty) => !!bounty.appId && !String(bounty.id).startsWith('mock-') && !String(bounty.id).startsWith('sub-')),
    [bounties],
  )

  const loadDisputes = async () => {
    setLoading(true)
    try {
      const rows = await listDisputes()
      setDisputes(rows)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedBountyId && disputeEligibleBounties.length > 0) {
      setSelectedBountyId(disputeEligibleBounties[0].id)
    }
  }, [disputeEligibleBounties, selectedBountyId])

  useEffect(() => {
    void loadDisputes()
    const intervalId = window.setInterval(() => {
      void loadDisputes()
    }, 8000)
    return () => window.clearInterval(intervalId)
  }, [])

  const handleCreateDispute = async () => {
    if (!selectedBountyId || !reason.trim()) {
      setActionError('Select a bounty and enter a dispute reason.')
      return
    }

    const bounty = disputeEligibleBounties.find((entry) => entry.id === selectedBountyId)
    if (!bounty) {
      setActionError('Selected bounty is not available.')
      return
    }

    setActionError(null)
    setSubmitting(true)
    try {
      await createDispute({
        bountyId: bounty.id,
        bountyTitle: bounty.title,
        amount: parseRewardAmount(bounty.reward),
        raisedBy: activeAddress || 'anonymous',
        reason: reason.trim(),
        durationHours: 24,
      })
      setReason('')
      await loadDisputes()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to create dispute')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (disputeId: string, vote: 'creator' | 'worker') => {
    if (!activeAddress) {
      setActionError('Connect wallet to vote in DAO disputes.')
      return
    }

    setActionError(null)
    try {
      await castDisputeVote(disputeId, activeAddress, vote)
      await loadDisputes()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to cast vote')
    }
  }

  const activeDisputes = disputes.filter((entry) => entry.status === 'voting').length

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">DAO Disputes</h1>
        <p className="text-slate-300/80">Open disputes, collect community votes, and resolve bounty disagreements transparently.</p>
      </div>

      <div className="bg-[linear-gradient(180deg,#10233d,#0d1a2d)] border border-[#40628e]/60 rounded-2xl p-5 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Gavel className="h-5 w-5 text-amber-400" />
          Raise A Dispute
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select value={selectedBountyId} onValueChange={setSelectedBountyId}>
            <SelectTrigger className="bg-[#111f33] border-[#3d5d85] text-slate-200">
              <SelectValue placeholder="Select bounty" />
            </SelectTrigger>
            <SelectContent className="bg-[#111f33] border-[#3d5d85] text-slate-200">
              {disputeEligibleBounties.map((bounty) => (
                <SelectItem key={bounty.id} value={bounty.id}>
                  {bounty.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason for dispute"
            className="bg-[#111f33] border-[#3d5d85] text-slate-200"
          />

          <Button
            onClick={() => void handleCreateDispute()}
            disabled={submitting || disputeEligibleBounties.length === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
          >
            {submitting ? 'Opening...' : 'Open DAO Dispute'}
          </Button>
        </div>
        {disputeEligibleBounties.length === 0 && <p className="text-xs text-slate-300/60 mt-3">No eligible on-chain bounties found yet.</p>}
      </div>

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{actionError}</div>
      )}

      <div className="bg-[linear-gradient(180deg,#10233d,#0d1a2d)] border border-[#40628e]/60 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
        <div className="p-6 border-b border-[#325176]/70 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Vote className="h-5 w-5 text-blue-400" />
            Dispute Voting
          </h3>
          <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold">
            {activeDisputes} Active
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-slate-400">Loading disputes...</div>
        ) : disputes.length === 0 ? (
          <div className="p-8 text-slate-500">No disputes yet. Raise one to start DAO voting.</div>
        ) : (
          <div className="divide-y divide-[#325176]/60">
            {disputes.map((dispute) => {
              const connected = (activeAddress || '').toLowerCase()
              const hasVoted = dispute.voters.some((entry) => entry.toLowerCase() === connected)
              const totalVotes = dispute.votesForCreator + dispute.votesForWorker

              return (
                <div key={dispute.id} className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">{dispute.bountyTitle}</p>
                      <p className="text-slate-300/75 text-sm mt-1 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-slate-300/50" />
                        {dispute.reason}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-300/55 mt-3">
                        <span>Raised by {shortAddress(dispute.raisedBy)}</span>
                        <span>Created {formatDate(dispute.createdAt)}</span>
                        <span>{dispute.amount} ALGO at stake</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          dispute.status === 'voting'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        }`}
                      >
                        {dispute.status === 'voting' ? 'Voting Live' : 'Resolved'}
                      </span>
                      <p className="text-xs text-slate-300/55 mt-2 flex items-center justify-end gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {dispute.status === 'voting' ? formatCountdown(dispute.votingEndsAt) : 'Voting closed'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="rounded-lg border border-[#3b5e86]/60 bg-[#10233c]/70 p-3">
                      <p className="text-xs text-slate-300/70 mb-1">Vote To Pay Creator</p>
                      <p className="text-lg font-bold text-white">{dispute.votesForCreator}</p>
                    </div>
                    <div className="rounded-lg border border-[#3b5e86]/60 bg-[#10233c]/70 p-3">
                      <p className="text-xs text-slate-300/70 mb-1">Vote To Pay Worker</p>
                      <p className="text-lg font-bold text-white">{dispute.votesForWorker}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <p className="text-xs text-slate-300/60">Total votes: {totalVotes}</p>

                    {dispute.status === 'voting' ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => void handleVote(dispute.id, 'creator')}
                          disabled={!activeAddress || hasVoted}
                          className="bg-[#355474] hover:bg-[#3f6490] text-white"
                        >
                          Vote Creator
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => void handleVote(dispute.id, 'worker')}
                          disabled={!activeAddress || hasVoted}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Vote Worker
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolution: {dispute.resolution === 'tie' ? 'Tie / Manual review' : dispute.resolution === 'creator' ? 'Creator wins' : 'Worker wins'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
