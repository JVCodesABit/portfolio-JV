'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const WINS = [
  {
    id: 'cgpa',
    type: 'academic',
    label: 'NSUT CGPA',
    badge: '9.33',
    detail: 'Dept Rank 2 · Univ Rank 7',
    sub: 'CS (AI) · Batch 2028',
    color: '#ff2d55',
    ring: 99.77,          // percentile
    size: 'hero',         // bento: spans big
    icon: '',
  },
  {
    id: 'jee-advanced',
    type: 'exam',
    label: 'JEE Advanced',
    badge: 'AIR 4065',
    detail: 'Top 0.23% among 1.4M+ candidates',
    sub: 'National Engineering Entrance',
    color: '#00ffe0',
    ring: 93.3,
    size: 'medium',
    icon: '',
  },
  {
    id: 'jee-mains',
    type: 'exam',
    label: 'JEE Mains',
    badge: 'AIR 3942',
    detail: 'Top 0.22% nationally',
    sub: '1.4M+ candidates',
    color: '#ff6b35',
    ring: 99.78,
    size: 'medium',
    icon: '',
  },
  {
    id: 'ai-grind',
    type: 'competition',
    label: 'Delhi AI Grind',
    badge: 'TOP 100',
    detail: 'Out of 1200+ teams',
    sub: 'District Level AI Competition 2026',
    color: '#a259ff',
    ring: 92,
    size: 'wide',
    icon: '',
  },
  {
    id: 'leetcode',
    type: 'coding',
    label: 'LeetCode',
    badge: '350+',
    detail: 'DSA problems solved',
    sub: 'Advanced Data Structures focus',
    color: '#ffb830',
    ring: 70,
    size: 'medium',
    icon: '',
  },
  {
    id: 'cbse-12',
    type: 'academic',
    label: 'CBSE Class XII',
    badge: '97.6%',
    detail: 'School Topper',
    sub: "Lancer's Convent, Delhi · 2024",
    color: '#00ffe0',
    ring: 97.6,
    size: 'small',
    icon: '',
  },
  {
    id: 'cbse-10',
    type: 'academic',
    label: 'CBSE Class X',
    badge: '97.2%',
    detail: 'High distinction',
    sub: "Lancer's Convent, Delhi · 2022",
    color: '#4ecdc4',
    ring: 97.2,
    size: 'small',
    icon: '',
  },
]

/* ─────────────────────────────────────────
   RADIAL PROGRESS RING
───────────────────────────────────────── */
function RadialRing({
  value,
  color,
  size = 80,
}: {
  value: number
  color: string
  size?: number
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (inView) setTimeout(() => setAnimated(true), 300)
  }, [inView])

  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (animated ? (value / 100) * circ : 0)

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      className="flex-shrink-0"
      style={{ transform: 'rotate(-90deg)' }}
    >
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={`${color}18`}
        strokeWidth={3}
      />
      {/* Fill */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transition: animated ? 'stroke-dashoffset 1.4s cubic-bezier(0.33,1,0.68,1)' : 'none',
          filter: `drop-shadow(0 0 6px ${color}80)`,
        }}
      />
    </svg>
  )
}

/* ─────────────────────────────────────────
   TAPE RIBBON
───────────────────────────────────────── */
/* Ribbon removed */

/* ─────────────────────────────────────────
   HERO CARD (big)
───────────────────────────────────────── */
function HeroCard({ win }: { win: typeof WINS[0] }) {
  const [flipped, setFlipped] = useState(false)
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 120, damping: 20 })
  const sy = useSpring(my, { stiffness: 120, damping: 20 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
      animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
      transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
      className="md:col-span-2 md:row-span-2 relative cursor-none"
      style={{ perspective: 1000 }}
      data-cursor-hover
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { mx.set(0); my.set(0); setHovered(false) }}
      onClick={() => setFlipped((f) => !f)}
    >
      <motion.div
        style={{
          rotateY: flipped ? 180 : 0,
          transformStyle: 'preserve-3d',
        }}
        transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
        className="w-full h-full relative"
      >
        {/* FRONT */}
        <div
          className="relative overflow-hidden border p-8 md:p-10 h-full min-h-[320px] flex flex-col justify-between"
          style={{
            borderColor: `${win.color}30`,
            background: `radial-gradient(ellipse at 30% 40%, ${win.color}10 0%, transparent 60%), #080d14`,
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Sweep bg (hover) */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: hovered ? 1 : 0 }}
            style={{ background: `linear-gradient(120deg, ${win.color}08 0%, transparent 70%)` }}
            transition={{ duration: 0.35 }}
          />
          {/* ribbon removed */}

          {/* Giant ghost badge */}
          <div
            className="absolute right-6 bottom-4 font-display leading-none select-none pointer-events-none"
            style={{ fontSize: 'clamp(5rem, 12vw, 10rem)', color: `${win.color}${hovered ? '12' : '08'}` }}
          >
            {win.badge}
          </div>

          {/* Animated corner accent */}
          <motion.div
            className="absolute bottom-0 left-0 h-[3px]"
            style={{ background: `linear-gradient(to right, ${win.color}, transparent)` }}
            initial={{ width: 0 }}
            animate={inView ? { width: hovered ? '100%' : '70%' } : {}}
            transition={{ delay: 0.5, duration: 1 }}
          />

          {/* Corner brackets (hover emphasis) */}
          <motion.div
            className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2"
            style={{ borderColor: win.color }}
            animate={{ opacity: hovered ? 1 : 0.3 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2"
            style={{ borderColor: win.color }}
            animate={{ opacity: hovered ? 1 : 0.3 }}
            transition={{ duration: 0.25 }}
          />

          <div>
            <span className="font-mono text-[0.6rem] tracking-[0.35em] uppercase" style={{ color: win.color }}>
              {win.icon} {win.sub}
            </span>
            <h3 className="font-display mt-2 text-[clamp(2.5rem,5vw,4.5rem)] leading-none">
              {win.label}
            </h3>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div
                className="font-display leading-none"
                style={{ fontSize: 'clamp(3rem,7vw,6rem)', color: win.color }}
              >
                {win.badge}
              </div>
              <p className="font-mono text-[0.72rem] text-muted mt-1">{win.detail}</p>
            </div>
            <RadialRing value={win.ring} color={win.color} size={90} />
          </div>

          <p className="font-mono text-[0.6rem] text-muted/40 mt-4 tracking-widest">
            click to flip ↩
          </p>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center border"
          style={{
            borderColor: `${win.color}30`,
            background: `${win.color}0d`,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="font-display text-[6rem] leading-none" style={{ color: win.color }}>
            {win.icon}
          </div>
          <div className="font-display text-[3rem] mt-3" style={{ color: win.color }}>
            {win.badge}
          </div>
          <p className="font-body font-bold text-xl mt-2">{win.label}</p>
          <p className="font-mono text-[0.75rem] text-muted mt-2 leading-relaxed max-w-[280px]">
            {win.detail}
          </p>
          <div
            className="mt-6 px-4 py-2 font-mono text-[0.65rem] tracking-widest uppercase border"
            style={{ borderColor: `${win.color}40`, color: win.color }}
          >
            {win.ring.toFixed(2)}% percentile
          </div>
          <p className="font-mono text-[0.6rem] text-muted/40 mt-6 tracking-widest">
            click to flip ↩
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   WIDE CARD
───────────────────────────────────────── */
function WideCard({ win, index }: { win: typeof WINS[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.07, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="md:col-span-2 relative overflow-hidden border p-6 flex items-center gap-6 cursor-none group"
      style={{ borderColor: `${win.color}20`, background: '#080d14' }}
      data-cursor-hover
    >
      {/* Sweep bg */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        style={{ background: `linear-gradient(120deg, ${win.color}08 0%, transparent 70%)` }}
        transition={{ duration: 0.4 }}
      />

      {/* Vertical left bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: win.color }}
        initial={{ scaleY: 0, originY: '100%' }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ delay: index * 0.07 + 0.3, duration: 0.6 }}
      />

      {/* Ring */}
      <div className="relative flex-shrink-0">
        <RadialRing value={win.ring} color={win.color} size={70} />
        <div
          className="absolute inset-0 flex items-center justify-center font-mono text-[0.55rem]"
          style={{ color: win.color }}
        >
          {win.icon}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <span className="font-mono text-[0.58rem] tracking-[0.25em] uppercase" style={{ color: win.color }}>
          {win.sub}
        </span>
        <h3 className="font-display text-[1.8rem] md:text-[2.4rem] leading-none mt-1 group-hover:text-white transition-colors">
          {win.label}
        </h3>
        <p className="font-mono text-[0.7rem] text-muted mt-1">{win.detail}</p>
      </div>

      {/* Badge */}
      <div
        className="flex-shrink-0 font-display text-[2rem] md:text-[2.8rem] leading-none text-right"
        style={{ color: win.color }}
      >
        {win.badge}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   MEDIUM CARD
───────────────────────────────────────── */
function MediumCard({ win, index }: { win: typeof WINS[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ delay: index * 0.08, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (win.id === 'leetcode') window.open('https://leetcode.com/u/JVCodesABit/', '_blank')
      }}
      onKeyDown={(e: any) => {
        if (e.key === 'Enter' && win.id === 'leetcode') window.open('https://leetcode.com/u/JVCodesABit/', '_blank')
      }}
      role={win.id === 'leetcode' ? 'link' : undefined}
      tabIndex={win.id === 'leetcode' ? 0 : undefined}
      className="relative overflow-hidden border p-6 flex flex-col justify-between min-h-[200px] cursor-none group"
      style={{ borderColor: `${win.color}20`, background: '#080d14' }}
      data-cursor-hover
    >
      {/* Ghost huge number bg */}
      <div
        className="absolute -right-4 -bottom-4 font-display leading-none select-none pointer-events-none transition-opacity duration-500"
        style={{
          fontSize: '8rem',
          color: `${win.color}${hovered ? '12' : '06'}`,
        }}
      >
        {win.badge.replace(/[^0-9.+]/g, '') || win.badge}
      </div>

      {/* Animated corner bracket */}
      <motion.div
        className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2"
        style={{ borderColor: win.color }}
        animate={{ opacity: hovered ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2"
        style={{ borderColor: win.color }}
        animate={{ opacity: hovered ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between relative z-10">
        <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: win.color }}>
          {win.icon} {win.sub}
        </span>
        <RadialRing value={win.ring} color={win.color} size={48} />
      </div>

      {/* Bottom content */}
      <div className="relative z-10">
        <div
          className="font-display leading-none"
          style={{ fontSize: 'clamp(2rem,4vw,3rem)', color: win.color }}
        >
          {win.badge}
        </div>
        <h3 className="font-display text-xl md:text-2xl mt-1 group-hover:text-white transition-colors duration-300">
          {win.label}
        </h3>
        <p className="font-mono text-[0.68rem] text-muted mt-1">{win.detail}</p>
      </div>

      {/* Bottom animated line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px]"
        style={{ background: `linear-gradient(to right, ${win.color}, transparent)` }}
        animate={{ width: hovered ? '100%' : '30%' }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   SMALL CARD
───────────────────────────────────────── */
function SmallCard({ win, index }: { win: typeof WINS[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ delay: index * 0.09, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      className="relative overflow-hidden border p-5 flex flex-col gap-3 cursor-none group"
      style={{ borderColor: `${win.color}18`, background: '#080d14' }}
      data-cursor-hover
      whileHover={{ scale: 1.02, borderColor: `${win.color}50` } as any}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, ${win.color}0c 0%, transparent 70%)` }}
      />

      <div className="flex items-center justify-between relative z-10">
        <span className="text-2xl">{win.icon}</span>
        <RadialRing value={win.ring} color={win.color} size={40} />
      </div>

      <div className="relative z-10">
        <div className="font-display text-2xl" style={{ color: win.color }}>{win.badge}</div>
        <div className="font-display text-lg leading-tight mt-0.5 group-hover:text-white transition-colors">{win.label}</div>
        <p className="font-mono text-[0.62rem] text-muted mt-1 leading-relaxed">{win.detail}</p>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   TICKER — scrolling achievements bar
───────────────────────────────────────── */
function AchievementTicker() {
  const items = WINS.map(w => `${w.icon} ${w.label} · ${w.badge}`)
  const doubled = [...items, ...items]

  return (
    <div className="overflow-hidden border-y border-accent/[0.06] py-3 bg-surface/30 mb-12">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-muted/60 flex-shrink-0">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function Achievements() {
  const hero = WINS.find(w => w.size === 'hero')!
  const mediums = WINS.filter(w => w.size === 'medium')
  const wide = WINS.find(w => w.size === 'wide')!
  const smalls = WINS.filter(w => w.size === 'small')

  return (
    <section id="achievements" className="py-24 md:py-32 border-t border-accent/[0.06] overflow-hidden">

      {/* Header */}
      <div className="px-8 md:px-16 max-w-screen-xl mx-auto mb-12">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-accent text-[0.7rem] tracking-[0.35em] uppercase mb-3"
        >
          // 04 — Wins
        </motion.p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="font-display text-[clamp(3.5rem,9vw,10rem)] leading-[0.88]"
          >
            HALL OF<br />
            <span className="text-accent">FAME</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="font-mono text-[0.75rem] leading-[1.9] text-muted/120 max-w-[260px] text-right hidden md:block"
          >
            Every rank earned,<br />
            every problem solved,<br />
            every percent conquered.
          </motion.p>
        </div>

        {/* Animated rule */}
        <motion.div
          className="mt-8 h-px bg-gradient-to-r from-accent/40 via-accent3/20 to-transparent"
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
        />
      </div>


      {/* BENTO GRID */}
      <div className="px-8 md:px-16 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 auto-rows-auto">

          {/* Row 1: Hero (2x2) + 2 mediums */}
          <HeroCard win={hero} />
          {mediums.slice(0, 2).map((w, i) => (
            <MediumCard key={w.id} win={w} index={i} />
          ))}

          {/* Row 2: Wide (2-col) + 2 smalls */}
          <WideCard win={wide} index={3} />
          {smalls.map((w, i) => (
            <SmallCard key={w.id} win={w} index={i + 4} />
          ))}

          {/* Row 3: Remaining medium */}
          {mediums.slice(2).map((w, i) => (
            <MediumCard key={w.id} win={w} index={i + 6} />
          ))}
        </div>
      </div>
    </section>
  )
}
