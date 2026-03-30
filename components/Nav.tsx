'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { NAV_LINKS } from '@/lib/data'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 md:px-16 py-5 transition-all duration-500"
      style={{
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        background: scrolled ? 'rgba(2,4,8,0.85)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(0,255,224,0.08)' : '1px solid transparent',
      }}
    >
      <a href="#hero" className="font-display text-2xl text-accent tracking-widest cursor-none">
        JV
      </a>

      <ul className="hidden md:flex gap-10 list-none">
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="font-mono text-[0.7rem] tracking-[0.15em] uppercase text-muted hover:text-accent transition-colors duration-300 cursor-none"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <a
        href="mailto:jagrat.varshney.ug24@nsut.ac.in"
        className="hidden md:block font-mono text-[0.7rem] tracking-[0.15em] uppercase border border-accent/40 text-accent px-4 py-2 hover:bg-accent hover:text-bg transition-all duration-300 cursor-none btn-clip"
      >
        Hire Me
      </a>
    </motion.nav>
  )
}
