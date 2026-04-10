import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bounty, MOCK_BOUNTIES, CATEGORIES } from '@/data/bounties'
import BountyCard from './BountyCard'

interface BountyListProps {
  onBountyClick: (bounty: Bounty) => void
  /** User-created bounties loaded from localStorage */
  extraBounties?: Bounty[]
}

const BountyList = ({ onBountyClick, extraBounties = [] }: BountyListProps) => {
  const [activeCategory, setActiveCategory] = useState('All')

  const allBounties = [...extraBounties, ...MOCK_BOUNTIES]

  const filtered = activeCategory === 'All' ? allBounties : allBounties.filter((b) => b.category === activeCategory)

  return (
    <section id="bounties" className="py-6 max-w-6xl mx-auto px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="container mx-auto">
        <motion.h2
          className="font-display text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          All Bounties
        </motion.h2>
        <motion.p
          className="text-slate-400 mb-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Browse and filter available bounties
        </motion.p>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border ${
                activeCategory === cat ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-[#18181b] border-[#27272a] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid — 2 columns like the reference */}
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {filtered.map((bounty, i) => (
            <motion.div
              key={bounty.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                delay: i * 0.1,
                type: 'spring',
                stiffness: 200,
                damping: 20,
              }}
            >
              <BountyCard bounty={bounty} onClick={onBountyClick} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BountyList
