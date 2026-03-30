'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { PROJECTS } from '@/lib/data'

function ExternalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
    </svg>
  )
}

function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 150, damping: 25 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 25 })
  const glowX = useTransform(springX, [-0.5, 0.5], ['0%', '100%'])
  const glowY = useTransform(springY, [-0.5, 0.5], ['0%', '100%'])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current!.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function onMouseLeave() {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="group relative bg-surface border border-accent/[0.06] p-8 md:p-10 overflow-hidden cursor-none hover:border-accent/25 transition-colors duration-500"
      data-cursor-hover
    >
      {/* Dynamic spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(350px circle at ${glowX} ${glowY}, rgba(0,255,224,0.04) 0%, transparent 70%)`,
        }}
      />

      {/* Large number */}
      <motion.div
        className="absolute top-4 right-6 font-display text-[6rem] leading-none text-accent/[0.05] group-hover:text-accent/[0.1] transition-colors duration-500 select-none"
      >
        {project.num}
      </motion.div>

      <p className="font-mono text-[0.65rem] tracking-[0.2em] text-accent uppercase mb-4">
        {project.tag}
      </p>

      <motion.h3
        className="font-display text-[clamp(2rem,3.5vw,3.5rem)] leading-[1.05] mb-2 group-hover:text-accent transition-colors duration-300"
      >
        {project.title}
      </motion.h3>

      <p className="font-mono text-[0.7rem] tracking-wide text-muted mb-5">
        {project.subtitle}
      </p>

      <p className="font-mono text-[0.8rem] leading-[1.85] text-[rgba(232,240,254,0.5)] mb-7">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-7">
        {project.tech.map((t) => (
          <span
            key={t}
            className="font-mono text-[0.65rem] tracking-wide border border-accent/20 text-accent px-2.5 py-1"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="flex gap-5">
        <a
          href={project.live}
          className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest uppercase text-muted hover:text-accent transition-colors duration-300 cursor-none"
        >
          <ExternalIcon /> Live Demo
        </a>
        {project.github && (
          <a
            href={project.github}
            className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest uppercase text-muted hover:text-accent transition-colors duration-300 cursor-none"
          >
            <GithubIcon /> GitHub
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="py-24 md:py-32 px-8 md:px-16 border-t border-accent/[0.06]">
      <div className="max-w-screen-xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-accent text-[0.7rem] tracking-[0.35em] uppercase mb-3"
        >
          // 03 — Work
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="font-display text-[clamp(3rem,7vw,8rem)] leading-[0.9] mb-16"
        >
          SELECTED<br />PROJECTS
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-2">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
