'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

const letterVariants = {
  hidden: { opacity: 0, y: 80, rotateX: -90 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      delay: 0.6 + i * 0.07,
      duration: 0.75,
      ease: [0.33, 1, 0.68, 1],
    },
  }),
}

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.33, 1, 0.68, 1] },
})

function GlitchName() {
  const name = 'JAGRAT'
  return (
    <div
      className="relative font-display leading-none tracking-tight"
      style={{ fontSize: 'clamp(5rem, 14vw, 16rem)' }}
    >
      {/* Glitch ghost layers */}
      <span
        className="absolute inset-0 font-display glitch-before pointer-events-none select-none"
        style={{ color: '#ff2d55', clipPath: 'polygon(0 30%, 100% 30%, 100% 50%, 0 50%)' }}
        aria-hidden
      >
        {name}
      </span>
      <span
        className="absolute inset-0 font-display glitch-after pointer-events-none select-none"
        style={{ color: '#a259ff', clipPath: 'polygon(0 60%, 100% 60%, 100% 75%, 0 75%)' }}
        aria-hidden
      >
        {name}
      </span>

      {/* Animated letters */}
      <span className="inline-flex overflow-hidden" style={{ perspective: 800 }}>
        {name.split('').map((letter, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={letterVariants}
            initial="hidden"
            animate="visible"
            style={{ display: 'inline-block', transformOrigin: 'bottom' }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </div>
  )
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      let x = ((e.clientX - left) / width) * 100;
      let y = ((e.clientY - top) / height) * 100;
      // Clamp to [0,100] to avoid invalid or out-of-bounds values
      x = Math.min(100, Math.max(0, x));
      y = Math.min(100, Math.max(0, y));
      container.style.setProperty('--x', `${x}%`);
      container.style.setProperty('--y', `${y}%`);
    };

    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col md:flex-row items-center md:items-start justify-between px-8 md:px-16 pt-24 relative overflow-hidden gap-8 md:gap-0"
    >
      <div className="w-full md:w-1/2">
        {/* Accent glow */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        <motion.p {...fadeUp(0.4)} className="font-mono text-accent text-xs tracking-[0.35em] uppercase mb-6">
          ↳ CS @ NSUT · AI Specialization · Full-Stack
        </motion.p>

        <GlitchName />

        <motion.h2
          {...fadeUp(1.2)}
          className="font-display leading-none tracking-wide text-muted mt-1"
          style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}
        >
          VARSHNEY
        </motion.h2>

        <motion.p
          {...fadeUp(1.4)}
          className="font-mono text-sm leading-loose text-[rgba(232,240,254,0.5)] mt-8 max-w-[500px]"
        >
          Obsessed with turning 'what if' into 'what's next'.
          <br />
          I build things that users remember.
          <br />
          Currently: turning ideas into experiences, one commit at a time.
        </motion.p>

        <motion.div {...fadeUp(1.6)} className="flex gap-4 mt-10 flex-wrap">
          <a
            href="#projects"
            className="btn-clip inline-flex items-center gap-2 px-8 py-3 font-mono text-xs tracking-widest uppercase bg-accent text-bg border border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-none"
          >
            View Projects ↗
          </a>
          <a
            href="#contact"
            className="btn-clip inline-flex items-center gap-2 px-8 py-3 font-mono text-xs tracking-widest uppercase border border-accent/40 text-accent hover:bg-accent hover:text-bg transition-all duration-300 cursor-none"
          >
            Get In Touch
          </a>
        </motion.div>
      </div>
      <div
        ref={containerRef}
        className="hero-image-container w-full md:w-1/2 h-64 md:h-full mt-8 md:mt-0"
        style={{
          maskImage: 'radial-gradient(ellipse 75% 80% at 55% 45%, black 35%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 80% at 55% 45%, black 35%, transparent 100%)',
        }}
      >
        <div className="hero-image" />
      </div>
    </section>
  )
}