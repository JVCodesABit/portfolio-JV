'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'

/* ─────────────────────────────────────────
   CODE LINES
───────────────────────────────────────── */
const CODE_LINES = [
  'const jv = {',
  '  role: "Product Oriented Full Stack Dev",',
  '  university: "NSUT",',
  '  cgpa: 9.33,',
  '  deptRank: 2,',
  '  stack: [',
  '    "Next.js", "React",',
  '    "PostgreSQL", "Prisma",',
  '  ],',
  '  passion: "Perfection",',
  '  leetcode: "350+ solved",',
  '  status: "Building...",',
  '};',
]

/* ─────────────────────────────────────────
   HOBBIES DATA
───────────────────────────────────────── */
const HOBBIES = [
  {
    id: 'video-editing',
    title: 'Video\nEditing',
    tag: '01 / Creative',
    color: '#ff2d55',
    accent2: '#ff6b35',
    img: 'videoediting.jpg',
    desc: 'Cutting frames, color grading, motion — translating ideas into visual stories.',
    icon: '🎬',
    keywords: [],
    rotate: -4,
  },
  {
    id: 'geopolitics',
    title: 'Geo\npolitics',
    tag: '02 / Intellect',
    color: '#a259ff',
    accent2: '#6c3fc5',
    img: 'geopolitics.jpg',
    desc: 'Obsessed with world order, power dynamics, and how nations make decisions.',
    icon: '🌍',
    keywords: [],
    rotate: 1,
  },
  {
    id: 'gaming',
    title: 'Online\nGaming',
    tag: '03 / Competitive',
    color: '#00ffe0',
    accent2: '#00b894',
    img: 'gaming.jpeg',
    desc: 'Strategy, reflexes, teamplay — the arena where losers level up.',
    icon: '🎮',
    keywords: [],
    rotate: 3,
  },
]

/* ─────────────────────────────────────────
   TYPEWRITER BOX
───────────────────────────────────────── */
function TypewriterBox() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [displayed, setDisplayed] = useState('')
  const full = CODE_LINES.join('\n')

  useEffect(() => {
    if (!inView) return
    let i = 0
    const iv = setInterval(() => {
      setDisplayed(full.slice(0, i) + '█')
      i++
      if (i > full.length) { setDisplayed(full); clearInterval(iv) }
    }, 25)
    return () => clearInterval(iv)
  }, [inView, full])

  return (
    <div ref={ref} className="relative border border-accent/15 bg-surface/60 backdrop-blur-sm p-6 md:p-8">
      {[
        'top-0 left-0 border-t-2 border-l-2',
        'top-0 right-0 border-t-2 border-r-2',
        'bottom-0 left-0 border-b-2 border-l-2',
        'bottom-0 right-0 border-b-2 border-r-2',
      ].map((cls, i) => (
        <span key={i} className={`absolute w-4 h-4 border-accent ${cls}`} />
      ))}
      <pre className="font-mono text-[0.72rem] md:text-[0.8rem] text-accent/70 leading-[1.9] whitespace-pre-wrap">
        {displayed}
      </pre>
    </div>
  )
}

/* ─────────────────────────────────────────
   HOBBY CARD — tilt + parallax image
───────────────────────────────────────── */
function HobbyCard({
  hobby,
  index,
}: {
  hobby: typeof HOBBIES[0]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 150, damping: 18 })
  const sy = useSpring(my, { stiffness: 150, damping: 18 })

  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10])
  const rotateY = useTransform(sx, [-0.5, 0.5], [-10, 10])
  const imgX = useTransform(sx, [-0.5, 0.5], ['4%', '-4%'])
  const imgY = useTransform(sy, [-0.5, 0.5], ['4%', '-4%'])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = ref.current!.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }
  function onMouseLeave() {
    mx.set(0); my.set(0); setHovered(false)
  }

  const entryVariants = [
    { initial: { opacity: 0, x: -80, rotate: -8 }, whileInView: { opacity: 1, x: 0, rotate: hobby.rotate } },
    { initial: { opacity: 0, y: 80, scale: 0.8 },  whileInView: { opacity: 1, y: 0, scale: 1 } },
    { initial: { opacity: 0, x: 80, rotate: 8 },   whileInView: { opacity: 1, x: 0, rotate: hobby.rotate } },
  ][index]

  return (
    <motion.div
      {...entryVariants}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
      style={{ rotate: hobby.rotate }}
      className="relative cursor-none w-full max-w-[280px]"
      data-cursor-hover
    >
      <motion.div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onMouseLeave}
        style={{
          rotateX: hovered ? rotateX : 0,
          rotateY: hovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
          transformPerspective: 900,
        }}
        animate={{ rotate: hovered ? 0 : hobby.rotate }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden"
      >

        {/* ── Image panel ── */}
        <div
          className="relative overflow-hidden"
          style={{ height: 220, background: `${hobby.color}18` }}
        >
          {!imgError ? (
            <motion.img
              src={hobby.img}
              alt={hobby.title}
              onError={() => setImgError(true)}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                x: hovered ? imgX : 0,
                y: hovered ? imgY : 0,
                scale: 1.12,
              }}
              transition={{ duration: 0.1 }}
            />
          ) : (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${hobby.color}18 0%, ${hobby.accent2}10 100%)`,
              }}
            >
              <motion.span
                className="text-6xl select-none"
                animate={{ scale: hovered ? 1.2 : 1, rotate: hovered ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.4 }}
              >
                {hobby.icon}
              </motion.span>
              <span className="font-mono text-[0.6rem] tracking-[0.25em] uppercase" style={{ color: hobby.color }}>
                add photo →
              </span>
            </div>
          )}

          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 40%, ${hobby.color}40 100%)`,
            }}
          />

          <div
            className="absolute top-3 left-3 font-mono text-[0.55rem] tracking-[0.2em] uppercase px-2 py-1"
            style={{
              background: `${hobby.color}cc`,
              color: '#020408',
              backdropFilter: 'blur(4px)',
            }}
          >
            {hobby.tag}
          </div>

          <AnimatePresence>
            {hovered && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center gap-2 flex-wrap p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {hobby.keywords.map((kw, i) => (
                  <motion.span
                    key={kw}
                    className="font-mono text-[0.58rem] tracking-widest uppercase px-2 py-1 backdrop-blur-sm"
                    style={{ background: `${hobby.color}dd`, color: '#020408' }}
                    initial={{ opacity: 0, scale: 0.5, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                  >
                    {kw}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Polaroid label strip ── */}
        <div
          className="relative px-5 py-4"
          style={{
            background: '#080d14',
            borderLeft: `3px solid ${hobby.color}`,
          }}
        >
          <motion.div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(to right, transparent, ${hobby.color}, transparent)` }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <h3
            className="font-display leading-none whitespace-pre-line"
            style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: hobby.color }}
          >
            {hobby.title}
          </h3>
          <p className="font-mono text-[0.7rem] leading-[1.75] text-muted/130 mt-2">
            {hobby.desc}
          </p>

          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{ background: `linear-gradient(to right, ${hobby.color}, transparent)` }}
            animate={{ width: hovered ? '100%' : '40%' }}
            transition={{ duration: 0.45 }}
          />
        </div>

        <motion.div
          className="absolute -inset-1 pointer-events-none rounded-sm"
          animate={{
            boxShadow: hovered
              ? `0 0 30px ${hobby.color}30, 0 0 60px ${hobby.color}15`
              : '0 0 0px transparent',
          }}
          transition={{ duration: 0.4 }}
        />

      </motion.div>

      <motion.div
        className="absolute -bottom-3 left-4 right-4 h-8 pointer-events-none blur-xl rounded-full"
        style={{ background: hobby.color }}
        animate={{ opacity: hovered ? 0.18 : 0.06 }}
        transition={{ duration: 0.4 }}
      />
    </motion.div>
  )
}

/* ─────────────────────────────────────────
   HOBBIES GRID — centered, full-width
───────────────────────────────────────── */
function HobbiesGrid() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div ref={ref} className="relative mt-24 md:mt-32">

      {/* ── Bold heading ── */}
      <div className="text-center mb-14">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-mono text-[0.65rem] tracking-[0.35em] uppercase text-muted/140 mb-4 flex items-center justify-center gap-3"
        >
          <span className="w-10 h-px bg-muted/40 inline-block" />
          Beyond the terminal
          <span className="w-10 h-px bg-muted/40 inline-block" />
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
        >
          <h2
            className="font-display leading-[0.88] tracking-tight"
            style={{ fontSize: 'clamp(3rem, 7vw, 7rem)' }}
          >
            WHEN I'M NOT{' '}
            <span
              style={{
                WebkitTextStroke: '1.5px rgba(0,255,200,0.6)',
                color: 'transparent',
              }}
            >
              CODING
            </span>
            <span className="text-accent">.</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-mono font-bold text-[0.72rem] text-muted/150 mt-4 tracking-wide"
        >
          The human behind the commits
        </motion.p>
      </div>

      {/* Cards — centered 3-col grid */}
      <div
        className="flex flex-wrap justify-center gap-8 md:gap-10"
        style={{ perspective: 1200 }}
      >
        {HOBBIES.map((h, i) => (
          <HobbyCard key={h.id} hobby={h} index={i} />
        ))}
      </div>

      {/* Instruction hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-muted/30 text-center mt-8"
      >
        hover to explore · click to interact
      </motion.p>
    </div>
  )
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function About() {
  const fadeLeft = {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
  }

  return (
    <section id="about" className="py-32 md:py-40 px-8 md:px-16 relative">
      <div className="max-w-screen-xl mx-auto">

        {/* ── Top: 2-col grid (text + typewriter) ── */}
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">

          {/* Left: text only */}
          <div>
            <motion.p
              {...fadeLeft}
              className="font-mono text-accent text-[0.7rem] tracking-[0.35em] uppercase mb-3"
            >
              // 01 — About Me
            </motion.p>
            <motion.h2
              {...fadeLeft}
              transition={{ ...fadeLeft.transition, delay: 0.1 }}
              className="font-display text-[clamp(3rem,7vw,8rem)] leading-[0.9] mb-8"
            >
              WHO<br />AM I<span className="text-accent">?</span>
            </motion.h2>

            {[
              "I'm a 2nd-year Computer Science (AI) student at NSUT, New Delhi, building with a process-first mindset and long-term thinking. With a CGPA of 9.33, Department Rank 2, and hundreds of DSA problems solved, I focus on mastering fundamentals that scale.",
              "I don't just chase outcomes — I dive deep into the process, understanding systems from the ground up to build solutions that are reliable, scalable, and well thought out.",
              "I don't just write code, I engineer experiences.",
            ].map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.7 }}
                className="font-mono text-[0.85rem] leading-[1.9] text-[rgba(232,240,254,0.55)] mb-4"
              >
                {text}
              </motion.p>
            ))}
          </div>

          {/* Right: typewriter code block */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
            className="mt-8 md:mt-28 lg:mt-36 xl:mt-40"
          >
            <TypewriterBox />
          </motion.div>
        </div>

        {/* ── Hobbies: full-width below both columns, centered ── */}
        <HobbiesGrid />

      </div>
    </section>
  )
}