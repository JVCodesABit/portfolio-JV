'use client'

import { motion } from 'framer-motion'

const items = [
  'FULL STACK', 'NEXT.JS', 'REACT', 'POSTGRESQL', 'AI / ML',
  'PRODUCT DESIGN', 'DSA GRINDER', 'GEMINI API', 'NODE.JS', 'TAILWIND CSS',
]

function Track() {
  return (
    <div className="flex gap-12 items-center flex-shrink-0 pr-12">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-4 font-display text-xl tracking-widest text-muted whitespace-nowrap">
          {item}
          <span className="text-accent text-sm">✦</span>
        </span>
      ))}
    </div>
  )
}

export default function MarqueeTicker() {
  return (
    <div className="overflow-hidden border-y border-accent/[0.07] bg-surface py-4 relative">
      <motion.div
        className="flex"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
      >
        <Track />
        <Track />
      </motion.div>
    </div>
  )
}
