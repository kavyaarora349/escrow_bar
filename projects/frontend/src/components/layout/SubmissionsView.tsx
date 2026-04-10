import React, { useState } from 'react'
import { Bounty } from '@/data/bounties'
import BountyCard from '@/components/bounty/BountyCard'

interface SubmissionsViewProps {
  onBountyClick: (bounty: Bounty) => void
}

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({ onBountyClick }) => {
  const [activeCategory, setActiveCategory] = useState('All')

  const mockSubmissions: Bounty[] = [
    {
      id: 'sub-1',
      title: 'Write documentation for Escrow Contracts',
      description: 'Create comprehensive documentation detailing exactly how our ARC4 bounty escrow contracts behave under different dispute edge-cases.',
      reward: '150 ALGO',
      category: 'Content',
      difficulty: 'Medium',
      deadline: '10/12/2026',
      creator: 'Kavya',
      status: 'In Progress',
      appId: 1004,
      creatorAddress: 'KAVYA...',
    },
    {
      id: 'sub-2',
      title: 'Fix responsive hero banner on mobile',
      description: 'The main hero banner overflows on iPhone SE viewport sizes. Need it fixed using Tailwind responsive classes.',
      reward: '35 ALGO',
      category: 'Frontend',
      difficulty: 'Easy',
      deadline: '10/15/2026',
      creator: 'DevLead',
      status: 'Completed',
      appId: 1005,
      creatorAddress: 'DEV...',
    },
  ]

  const categories = ['All', 'Frontend', 'Backend', 'Design', 'Content']
  const filtered = activeCategory === 'All' ? mockSubmissions : mockSubmissions.filter((bounty) => bounty.category === activeCategory)

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">My Submissions</h1>
        <p className="text-slate-300/80">Track the work you have submitted to active bounties.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border ${
              activeCategory === cat
                ? 'bg-[#2a4f7f] border-[#5c82b5] text-white shadow-[0_8px_18px_rgba(31,76,140,0.35)]'
                : 'bg-[#10233d]/70 text-slate-300 border-[#3a5f88] hover:bg-[#163150] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-[#3a5f88] rounded-2xl bg-[linear-gradient(180deg,#10233d,#0d1a2d)]">
          <p className="text-slate-300/70 mb-4">No submissions found in this category.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {filtered.map((bounty, i) => (
            <BountyCard key={bounty.id} bounty={bounty} onClick={onBountyClick} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
