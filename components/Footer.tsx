'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border-t border-accent/[0.06] px-8 md:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-3"
    >
      <span className="font-mono text-[0.68rem] tracking-widest text-muted uppercase">
        © 2026 Jagrat Varshney
      </span>
      <span className="font-mono text-[0.68rem] tracking-widest text-muted uppercase">
        Built with obsession & caffeine{' '}
        <span className="text-accent">✦</span>{' '}
        New Delhi, India
      </span>
      <a
        href="#hero"
        className="font-mono text-[0.68rem] tracking-widest text-muted hover:text-accent transition-colors duration-300 uppercase cursor-none"
      >
        Back to top ↑
      </a>
    </motion.footer>
  )
}
