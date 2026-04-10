import { motion } from 'framer-motion'
import { Bounty } from '@/data/bounties'
import { ArrowRight, Clock } from 'lucide-react'

interface BountyCardProps {
  bounty: Bounty
  onClick: (bounty: Bounty) => void
  index?: number
}

const palettes = [
  { bg: 'group-hover:from-blue-500/10', border: 'hover:border-blue-500/40', accent: 'text-blue-400', dot: 'bg-blue-400' },
  { bg: 'group-hover:from-emerald-500/10', border: 'hover:border-emerald-500/40', accent: 'text-emerald-400', dot: 'bg-emerald-400' },
  { bg: 'group-hover:from-violet-500/10', border: 'hover:border-violet-500/40', accent: 'text-violet-400', dot: 'bg-violet-400' },
  { bg: 'group-hover:from-amber-500/10', border: 'hover:border-amber-500/40', accent: 'text-amber-400', dot: 'bg-amber-400' },
  { bg: 'group-hover:from-sky-500/10', border: 'hover:border-sky-500/40', accent: 'text-sky-400', dot: 'bg-sky-400' },
  { bg: 'group-hover:from-teal-500/10', border: 'hover:border-teal-500/40', accent: 'text-teal-400', dot: 'bg-teal-400' },
]

const BountyCard = ({ bounty, onClick, index = 0 }: BountyCardProps) => {
  const p = palettes[index % palettes.length]

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      onClick={() => onClick(bounty)}
      className={`group min-w-[320px] cursor-pointer rounded-2xl bg-[#18181b] border border-[#27272a] ${p.border} p-6 transition-all duration-300 relative overflow-hidden`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${p.bg} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
      
      {/* Category + difficulty */}
      <div className="relative flex items-center justify-between mb-4 z-10">
        <span className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${p.accent}`}>{bounty.category}</span>
        <span className="flex items-center gap-1.5 rounded-full bg-[#27272a]/80 px-2.5 py-1 text-[11px] font-medium text-slate-300">
          <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
          {bounty.difficulty}
        </span>
      </div>

      {/* Title */}
      <h3 className="relative font-display text-lg font-bold leading-snug text-white line-clamp-2 mb-2 z-10">{bounty.title}</h3>

      {/* Description */}
      <p className="relative text-[13px] leading-relaxed text-slate-400 line-clamp-2 mb-5 z-10">{bounty.description}</p>

      {/* Bottom: reward + deadline + arrow */}
      <div className="relative flex items-center justify-between pt-4 border-t border-[#27272a] z-10">
        <span className={`text-[15px] font-bold ${p.accent}`}>{bounty.reward}</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            {bounty.deadline}
          </span>
          <span
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#27272a] ${p.accent} opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default BountyCard
