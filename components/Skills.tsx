'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'

const SKILL_CATEGORIES = [
  {
    id: 'languages',
    label: 'Languages',
    num: '01',
    color: '#00ffe0',
    skills: ['C++', 'Python', 'JavaScript', 'TypeScript', 'SQL'],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    num: '02',
    color: '#a259ff',
    skills: ['React', 'Next.js', 'Redux Toolkit', 'Tailwind CSS', 'Framer Motion', 'Vite'],
  },
  {
    id: 'backend',
    label: 'Backend & DB',
    num: '03',
    color: '#ff2d55',
    skills: ['Node.js', 'REST APIs', 'PostgreSQL', 'Prisma ORM', 'Appwrite', 'NextAuth'],
  },
  {
    id: 'tools',
    label: 'Tools & AI',
    num: '04',
    color: '#ffb830',
    skills: ['Gemini API', 'Git', 'GitHub', 'Vercel', 'VS Code'],
  },
]

const STAT_DATA = [
  {
    num: 4,
    suffix: '',
    label: 'Skill Domains',
    color: '#00ffe0',
    sub: 'Languages · Frontend · Backend · Tools',
    bars: [2, 3, 4, 4, 4],
    ring: 0,
  },
  {
    num: 18,
    suffix: '+',
    label: 'Technologies',
    color: '#a259ff',
    sub: 'Across all 4 domains',
    bars: [8, 12, 15, 17, 18],
    ring: 0,
  },
  {
    num: 2,
    suffix: '',
    label: 'Live Projects',
    color: '#ff2d55',
    sub: 'Deployed & in production',
    bars: [1, 1, 2, 2, 2],
    ring: 0,
  },
  {
    num: 350,
    suffix: '+',
    label: 'LeetCode Solved',
    color: '#ffb830',
    sub: 'DSA · Algorithms · Data Structures',
    bars: [50, 120, 200, 290, 350],
    ring: 0,
  },
]

/* ─────────────────────────────────────────
   SKILL BADGE
───────────────────────────────────────── */
function SkillBadge({ skill, color, index }: { skill: string; color: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
      whileHover={{ scale: 1.08, y: -4 }}
      className="group relative cursor-none"
      data-cursor-hover
    >
      <div
        className="relative px-4 py-2 font-mono text-[0.75rem] tracking-wide border transition-all duration-300"
        style={{ borderColor: `${color}22`, background: `${color}08` }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `${color}18` }}
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-[2px] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom"
          style={{ background: color }}
        />
        <span
          className="relative z-10 transition-colors duration-300"
          style={{ color: `${color}99` }}
        >
          {skill}
        </span>
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   CATEGORY CARD
───────────────────────────────────────── */
function CategoryCard({ cat, index }: { cat: typeof SKILL_CATEGORIES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springMx = useSpring(mx, { stiffness: 120, damping: 20 })
  const springMy = useSpring(my, { stiffness: 120, damping: 20 })
  const glowX = useTransform(springMx, [-0.5, 0.5], ['0%', '100%'])
  const glowY = useTransform(springMy, [-0.5, 0.5], ['0%', '100%'])
  const rotateX = useTransform(springMy, [-0.5, 0.5], [6, -6])
  const rotateY = useTransform(springMx, [-0.5, 0.5], [-6, 6])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function onMouseLeave() {
    mx.set(0); my.set(0); setHovered(false)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 1000 }}
      className="relative border border-white/[0.06] bg-surface/40 backdrop-blur-sm p-6 md:p-8 overflow-hidden"
    >
      {/* Gradient spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${glowX} ${glowY}, ${cat.color}0f 0%, transparent 70%)`,
        }}
      />

      {/* Animated border on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ border: `1px solid ${cat.color}40`, boxShadow: `inset 0 0 40px ${cat.color}08` }}
          />
        )}
      </AnimatePresence>

      {/* Top row: number + label */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <motion.p
            className="font-mono text-[0.6rem] tracking-[0.3em] uppercase mb-1"
            style={{ color: cat.color }}
          >
            {cat.num} —
          </motion.p>
          <h3
            className="font-display text-[2.2rem] md:text-[2.8rem] leading-none"
            style={{ color: cat.color }}
          >
            {cat.label}
          </h3>
        </div>

        {/* Animated ring */}
        <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
          <motion.div
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `${cat.color}30` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-[6px] rounded-full border border-dashed"
            style={{ borderColor: `${cat.color}20` }}
            animate={{ rotate: -360 }}
            transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
          />
          <span className="font-mono text-[0.65rem]" style={{ color: cat.color }}>
            {cat.skills.length}
          </span>
        </div>
      </div>

      {/* Divider */}
      <motion.div
        className="mb-6 h-px"
        style={{ background: `linear-gradient(to right, ${cat.color}40, transparent)` }}
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.12 + 0.3, duration: 0.8 }}
      />

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {cat.skills.map((skill, i) => (
          <SkillBadge key={skill} skill={skill} color={cat.color} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   ANIMATED STAT CARD
───────────────────────────────────────── */
function StatCard({
  num,
  suffix,
  label,
  color,
  sub,
  bars,
  ring,
}: {
  num: number
  suffix: string
  label: string
  color: string
  sub: string
  bars: number[]
  ring: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [animated, setAnimated] = useState(false)
  const [count, setCount] = useState(0)
  const [hovered, setHovered] = useState(false)
  const CIRCUMFERENCE = 100.53 // 2π × 16

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setAnimated(true)
          // Count-up animation
          const duration = 1200
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - t, 3)
            setCount(Math.round(ease * num))
            if (t < 1) requestAnimationFrame(tick)
            else setCount(num)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [animated, num])

  const maxBar = Math.max(...bars)
  const ringOffset = animated
    ? CIRCUMFERENCE - (CIRCUMFERENCE * ring) / 100
    : CIRCUMFERENCE

  return (
    <div
      ref={ref}
      className="relative px-6 py-5 overflow-hidden transition-colors duration-300"
      style={{ background: hovered ? `${color}06` : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Progress ring — top right */}
      <svg
        className="absolute top-4 right-4"
        width="36"
        height="36"
        viewBox="0 0 40 40"
      >
        <circle
          cx="20" cy="20" r="16"
          fill="none"
          stroke={`${color}20`}
          strokeWidth="3"
        />
        <circle
          cx="20" cy="20" r="16"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={ringOffset}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </svg>

      {/* Mini sparkline bars */}
      <div className="flex items-end gap-[3px] h-7 mb-3">
        {bars.map((v, i) => {
          const h = Math.round((v / maxBar) * 100)
          return (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background: i === bars.length - 1 ? color : `${color}44`,
                transform: animated ? 'scaleY(1)' : 'scaleY(0)',
                transformOrigin: 'bottom',
                transition: `transform 0.5s cubic-bezier(0.4,0,0.2,1) ${100 + i * 80}ms`,
              }}
            />
          )
        })}
      </div>

      {/* Number */}
      <div className="flex items-baseline gap-0.5 mb-1">
        <span
          className="font-display leading-none"
          style={{ fontSize: 'clamp(1.8rem,3vw,2.4rem)', color }}
        >
          {count}
        </span>
        {suffix && (
          <span
            className="font-display text-xl leading-none"
            style={{ color }}
          >
            {suffix}
          </span>
        )}
      </div>

      {/* Label */}
      <p className="font-mono text-[0.6rem] tracking-[0.22em] uppercase text-muted/120">
        {label}
      </p>

      {/* Sub — slides up on hover */}
      <div
        className="font-mono text-[0.62rem] leading-[1.6] mt-2 transition-all duration-200"
        style={{
          color: `${color}70`,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(5px)',
        }}
      >
        {sub}
      </div>

      {/* Bottom accent line sweeps in */}
      <div
        className="absolute bottom-0 left-0 h-[2px]"
        style={{
          background: `linear-gradient(to right, ${color}, transparent)`,
          width: animated ? '100%' : '0%',
          transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1) 0.2s',
        }}
      />
    </div>
  )
}

/* ─────────────────────────────────────────
   FLOATING BACKGROUND WORD
───────────────────────────────────────── */
function FloatingWord({
  text, x, y, size, opacity,
}: {
  text: string; x: string; y: string; size: string; opacity: number
}) {
  return (
    <motion.span
      className="absolute font-display text-white pointer-events-none select-none"
      style={{ left: x, top: y, fontSize: size, opacity, lineHeight: 1 }}
      animate={{ y: [0, -8, 0] }}
      transition={{
        duration: 4 + Math.random() * 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: Math.random() * 2,
      }}
    >
      {text}
    </motion.span>
  )
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function Skills() {
  return (
    <section
      id="skills"
      className="py-24 md:py-32 px-8 md:px-16 border-t border-accent/[0.06] relative overflow-hidden"
    >
      {/* Floating background words */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingWord text="REACT" x="5%"  y="10%" size="clamp(3rem,8vw,7rem)"  opacity={0.015} />
        <FloatingWord text="NEXT"  x="60%" y="5%"  size="clamp(3rem,9vw,8rem)"  opacity={0.015} />
        <FloatingWord text="SQL"   x="80%" y="50%" size="clamp(4rem,10vw,9rem)" opacity={0.012} />
        <FloatingWord text="C++"   x="10%" y="65%" size="clamp(3rem,7vw,6rem)"  opacity={0.015} />
        <FloatingWord text="DSA"   x="45%" y="75%" size="clamp(2rem,6vw,5rem)"  opacity={0.012} />
      </div>

      <div className="max-w-screen-xl mx-auto relative z-10">

        {/* Header */}
        <div className="mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-mono text-accent text-[0.7rem] tracking-[0.35em] uppercase mb-3"
          >
            // 02 — Tech Stack
          </motion.p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="font-display text-[clamp(3.5rem,9vw,10rem)] leading-[0.88]"
            >
              MY<br />
              <span className="text-accent">ARSENAL</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="font-mono text-[0.78rem] leading-[1.9] text-muted/120 max-w-[320px] text-right hidden md:block"
            >
              Tools I reach for to
              <br />
              build fast, ship clean,
              <br />
              and break the UI rules.
            </motion.p>
          </div>

          <motion.div
            className="mt-8 h-px bg-gradient-to-r from-accent/40 via-accent3/20 to-transparent"
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 1, ease: [0.33, 1, 0.68, 1] }}
          />
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SKILL_CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>

        {/* Animated stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-6 border border-accent/[0.07] grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-accent/[0.07] overflow-hidden"
        >
          {STAT_DATA.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </motion.div>

      </div>
    </section>
  )
}