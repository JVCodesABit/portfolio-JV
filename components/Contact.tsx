'use client'

import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import { CONTACT_LINKS } from '@/lib/data'

/* ─────────────────────────────────────────
   ICONS — inline SVG so no extra dep needed
───────────────────────────────────────── */
const ICONS: Record<string, React.ReactNode> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  leetcode: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  ),
}

function getIcon(label: string) {
  const key = label.toLowerCase()
  for (const k of Object.keys(ICONS)) {
    if (key.includes(k)) return ICONS[k]
  }
  return ICONS.default
}

/* ─────────────────────────────────────────
   CONTACT ROW — terminal-style
───────────────────────────────────────── */
const ROW_COLORS: Record<number, string> = {
  0: '#00ffe0',   // cyan
  1: '#a259ff',   // purple
  2: '#ff2d55',   // red
  3: '#ffbe0b',   // amber
  4: '#3a86ff',   // blue
}

function ContactRow({
  href,
  label,
  value,
  index,
}: {
  href: string
  label: string
  value: string
  index: number
}) {
  const [hovered, setHovered] = useState(false)
  const color = ROW_COLORS[index % Object.keys(ROW_COLORS).length]

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex items-center gap-5 py-5 px-6 border-b border-accent/[0.07] cursor-none overflow-hidden"
      data-cursor-hover
    >
      {/* Hover bg fill */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ background: `linear-gradient(90deg, ${color}0d 0%, transparent 100%)` }}
      />

      {/* Left border glow */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        animate={{ opacity: hovered ? 1 : 0, scaleY: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: color, transformOrigin: 'bottom' }}
      />

      {/* Index */}
      <span className="font-mono text-[0.55rem] tracking-[0.2em] text-muted/30 w-6 shrink-0 select-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Icon */}
      <motion.div
        className="shrink-0 flex items-center justify-center w-9 h-9 border"
        animate={{
          borderColor: hovered ? color : 'rgba(232,240,254,0.08)',
          color: hovered ? color : 'rgba(232,240,254,0.3)',
          boxShadow: hovered ? `0 0 12px ${color}40` : '0 0 0px transparent',
        }}
        transition={{ duration: 0.3 }}
      >
        {getIcon(label)}
      </motion.div>

      {/* Label + value */}
      <div className="flex-1 min-w-0">
        <motion.p
          className="font-mono text-[0.62rem] tracking-[0.25em] uppercase mb-0.5"
          animate={{ color: hovered ? color : 'rgba(232,240,254,0.3)' }}
          transition={{ duration: 0.25 }}
        >
          {label}
        </motion.p>
        <p className="font-mono text-[0.82rem] text-[rgba(232,240,254,0.65)] group-hover:text-[rgba(232,240,254,0.92)] transition-colors duration-300 truncate">
          {value}
        </p>
      </div>

      {/* Arrow */}
      <motion.span
        className="font-mono text-[0.75rem] shrink-0"
        animate={{
          x: hovered ? 4 : 0,
          color: hovered ? color : 'rgba(232,240,254,0.15)',
        }}
        transition={{ duration: 0.25 }}
      >
        ↗
      </motion.span>

      {/* Scanline shimmer on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${color}18 50%, transparent 100%)`,
              width: '60%',
            }}
          />
        )}
      </AnimatePresence>
    </motion.a>
  )
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function Contact() {
  return (
    <section
      id="contact"
      className="py-32 md:py-48 px-8 md:px-16 border-t border-accent/[0.06] relative overflow-hidden"
    >
      {/* Background noise grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,255,200,0.5) 39px, rgba(0,255,200,0.5) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,255,200,0.5) 39px, rgba(0,255,200,0.5) 40px)`,
        }}
      />

      {/* Ambient glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-[#a259ff]/[0.04] blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-start">

          {/* ── LEFT: heading block ── */}
          <div className="md:sticky md:top-24">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-mono text-accent text-[0.7rem] tracking-[0.35em] uppercase mb-4"
            >
              // 05 — Contact
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="font-display leading-[0.88] mb-8"
              style={{ fontSize: 'clamp(4rem, 9vw, 10rem)' }}
            >
              LET'S<br />
              <span
                style={{
                  WebkitTextStroke: '1.5px rgba(0,255,200,0.5)',
                  color: 'transparent',
                }}
              >
                BUILD
              </span>
              <br />
              <span className="text-accent">SMTH.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="font-mono text-[0.8rem] leading-[1.9] text-muted/120 max-w-[340px] mb-10"
            >
              Got a wild idea? Want to build something insane together?
              Or just want to nerd out on tech? I'm always down.
            </motion.p>

            {/* CTA */}
            <motion.a
              href="mailto:jagratkumar09@gmail.com"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="inline-flex items-center gap-3 px-8 py-4 font-mono text-[0.75rem] tracking-widest uppercase bg-accent text-bg hover:bg-transparent hover:text-accent border border-accent transition-all duration-300 cursor-none"
              data-cursor-hover
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Send Me An Email ↗
            </motion.a>

            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 mt-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-accent/60">
                Available for opportunities
              </span>
            </motion.div>
          </div>

          {/* ── RIGHT: contact rows ── */}
          <div>
            {/* Terminal header bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05, duration: 0.6 }}
              className="flex items-center gap-2 px-6 py-3 border border-accent/10 border-b-0 bg-accent/[0.03]"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff2d55]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbe0b]/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#00ffe0]/60" />
              <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase text-muted/30 ml-3">
                ~/contact --list-all
              </span>
            </motion.div>

            {/* Rows */}
            <div className="border border-accent/10">
              {CONTACT_LINKS.map((link, i) => (
                <ContactRow key={link.label} {...link} index={i} />
              ))}

              {/* Footer line */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="px-6 py-3 flex items-center gap-2"
              >
                <span className="font-mono text-[0.58rem] tracking-[0.15em] text-muted/20">
                  {CONTACT_LINKS.length} connections found · response time &lt; 24h
                </span>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}