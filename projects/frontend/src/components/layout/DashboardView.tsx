import React from 'react'
import { Trophy, Lock, CheckCircle2, ArrowUpRight } from 'lucide-react'
import { Bounty } from '@/data/bounties'

interface DashboardViewProps {
  bounties: Bounty[]
  onBountyClick: (bounty: Bounty) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({ bounties, onBountyClick }) => {
  const displayBounties = bounties

  // Aggregate mock stats using display bounties
  const activeBounties = displayBounties.filter((b) => b.status === 'Open' || b.status === 'In Progress').length
  
  // Calculate lock funds
  const fundsLockedRaw = displayBounties
    .filter((b) => b.status === 'Open' || b.status === 'In Progress')
    .reduce((sum, b) => {
      const amtMatch = b.reward?.match(/[\d.]+/)
      return sum + (amtMatch ? parseFloat(amtMatch[0]) : 0)
    }, 0)

  const completedTasks = displayBounties.filter((b) => b.status === 'Completed').length

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
        <p className="text-slate-400">Welcome back. Here's what's happening with your bounties.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Active Bounties */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Active Bounties</span>
            <Trophy className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-white">{activeBounties}</div>
        </div>

        {/* Funds Locked */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Funds Locked</span>
            <Lock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-white">{fundsLockedRaw} ALGO</div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="text-slate-400 text-sm font-medium">Completed Tasks</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-white">{completedTasks}</div>
        </div>
      </div>

      {/* Details Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#27272a]">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-400"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-[#27272a]">
            {displayBounties.slice(0, 4).map((bounty, i) => (
              <div
                key={bounty.id || i}
                onClick={() => onBountyClick(bounty)}
                className="p-6 flex items-center justify-between hover:bg-[#202024] transition-colors cursor-pointer group"
              >
                <div>
                  <h4 className="text-white font-medium mb-1">{bounty.title}</h4>
                  <p className="text-sm text-slate-500">Created recently</p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                      bounty.status === 'Open'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : bounty.status === 'In Progress'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {bounty.status === 'Open' ? 'Funded' : bounty.status === 'In Progress' ? 'Submitted' : bounty.status}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))}

            {displayBounties.length === 0 && (
              <div className="p-8 text-center text-slate-500">No recent activity. Create a bounty to get started.</div>
            )}
          </div>
        </div>

        {/* Network Overview */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Network Overview</h3>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Volume</span>
              <span className="text-white font-medium tracking-wide">1.2M ALGO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Users</span>
              <span className="text-white font-medium tracking-wide">4,231</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg. Reward</span>
              <span className="text-white font-medium tracking-wide">150 ALGO</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#27272a]">
            <p className="text-sm text-slate-500 italic">
              "The Algorand network provides instant finality and low transaction fees, making it ideal for escrow applications."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
