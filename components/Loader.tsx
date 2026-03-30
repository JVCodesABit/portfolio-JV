'use client'

import { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/'
const TARGET = 'jvcodes.tech'
const GRID_COLS = 14
const GRID_ROWS = 9

function useScramble(target: string, active: boolean) {
  const [text, setText] = useState(Array(target.length).fill('_').join(''))
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    let iteration = 0
    const totalFrames = target.length * 8

    function animate() {
      iteration++
      const revealed = Math.floor(iteration / 5)
      setText(
        target
          .split('')
          .map((char, i) => {
            if (char === '.') return char
            if (i < revealed) return char
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join('')
      )
      if (iteration < totalFrames + 8) {
        raf.current = requestAnimationFrame(animate)
      } else {
        setText(target)
      }
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [active, target])

  return text
}

async function playBootSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Resume is required — browsers suspend AudioContext until a user gesture
    await ctx.resume()

    const master = ctx.createGain()
    master.gain.setValueAtTime(0.0, ctx.currentTime)
    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01)
    master.connect(ctx.destination)

    // Arrow fn avoids "function declaration inside block" strict-mode error
    const beep = (freq: number, start: number, duration: number, vol = 1.0, type: OscillatorType = 'square') => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
      gain.gain.setValueAtTime(0, ctx.currentTime + start)
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.005)
      gain.gain.setValueAtTime(vol, ctx.currentTime + start + duration - 0.01)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration)
      osc.connect(gain)
      gain.connect(master)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    }

    // ── Phase 1: rapid ascending numerical trill ──
    const trillNotes = [220, 277, 330, 392, 466, 554, 659, 784]
    trillNotes.forEach((freq, i) => {
      beep(freq, i * 0.045, 0.04, 0.5, 'square')
    })

    // ── Phase 2: rising confirmation chord ──
    const phase2Start = trillNotes.length * 0.045 + 0.02
    beep(880,  phase2Start,        0.22, 0.55, 'square')
    beep(1108, phase2Start + 0.04, 0.18, 0.4,  'square')
    beep(1320, phase2Start + 0.08, 0.22, 0.35, 'sawtooth')

    // ── Phase 3: low confirmation thud ──
    const phase3Start = phase2Start + 0.28
    beep(110, phase3Start, 0.12, 0.4,  'sine')
    beep(220, phase3Start, 0.1,  0.25, 'sine')

    const totalDuration = phase3Start + 0.2
    setTimeout(() => ctx.close(), totalDuration * 1000 + 200)
  } catch (e) {
    // Audio not available — fail silently
  }
}

export default function Loader() {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [scrambleActive, setScrambleActive] = useState(false)
  const [exiting, setExiting] = useState(false)
  const scrambled = useScramble(TARGET, scrambleActive)
  const soundPlayedRef = useRef(false)

  // ── Unlock AudioContext on first user interaction ──
  // Browsers require a gesture before audio can play.
  // mousemove is included so it fires as soon as the user lands on the page.
  useEffect(() => {
    const unlock = () => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      ctx.resume().then(() => ctx.close())
      window.removeEventListener('click', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('mousemove', unlock)
    }
    window.addEventListener('click', unlock)
    window.addEventListener('keydown', unlock)
    window.addEventListener('touchstart', unlock)
    window.addEventListener('mousemove', unlock)
    return () => {
      window.removeEventListener('click', unlock)
      window.removeEventListener('keydown', unlock)
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('mousemove', unlock)
    }
  }, [])

  // Try to autoplay sound on mount; browsers may block this, so fail silently
  useEffect(() => {
    if (soundPlayedRef.current) return
    ;(async () => {
      try {
        await playBootSound()
        soundPlayedRef.current = true
      } catch (e) {
        // Autoplay blocked by browser — keep gesture-based unlock as fallback
      }
    })()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setScrambleActive(true), 300)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let p = 0
    let iv: number | null = null
    let finalIv: number | null = null

    // Random-progress phase until we hit the final threshold
    iv = window.setInterval(() => {
      p += Math.random() * 8 + 1.5

      // When we reach the final threshold, switch to a smooth 2s finish
      if (p >= 98) {
        p = Math.min(p, 98)
        if (iv) {
          clearInterval(iv)
          iv = null
        }

        // Play sound once at the start of the final 2s phase
        if (!soundPlayedRef.current) {
          soundPlayedRef.current = true
          playBootSound()
        }

        const duration = 1000 // final phase duration in ms (1s)
        const steps = 40
        let step = 0
        const startP = p
        const stepTime = Math.max(1, Math.floor(duration / steps))

        finalIv = window.setInterval(() => {
          step++
          const next = startP + (step / steps) * (100 - startP)
          if (step >= steps) {
            p = 100
            setProgress(100)
            if (finalIv) {
              clearInterval(finalIv)
              finalIv = null
            }

            // proceed with exit animation after a short delay
            setTimeout(() => {
              setExiting(true)
              setTimeout(() => setDone(true), 900)
            }, 300)
          } else {
            p = next
            setProgress(Math.min(p, 100))
          }
        }, stepTime)
      } else {
        setProgress(Math.min(p, 100))
      }
    }, 100)

    return () => {
      if (iv) clearInterval(iv)
      if (finalIv) clearInterval(finalIv)
    }
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-bg flex flex-col items-center justify-center overflow-hidden"
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >

          {/* ── Tile-shatter exit ── */}
          {exiting && (
            <div
              className="absolute inset-0 z-20 pointer-events-none"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              }}
            >
              {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
                const col = i % GRID_COLS
                const row = Math.floor(i / GRID_COLS)
                const dist = Math.sqrt((col - GRID_COLS / 2) ** 2 + (row - GRID_ROWS / 2) ** 2)
                return (
                  <motion.div
                    key={i}
                    className="bg-bg"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    style={{ originY: '0%' }}
                    transition={{
                      delay: dist * 0.035,
                      duration: 0.32,
                      ease: [0.76, 0, 0.24, 1],
                    }}
                  />
                )
              })}
            </div>
          )}

          {/* ── CRT scanlines ── */}
          <div
            className="absolute inset-0 pointer-events-none z-[1] opacity-[0.035]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, #00ffe0 0px, transparent 1px, transparent 4px)',
            }}
          />

          {/* ── Animated grid dots background ── */}
          <div
            className="absolute inset-0 pointer-events-none z-[1] opacity-[0.06]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #00ffe0 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* ── Corner brackets ── */}
          {[
            'top-8 left-8 border-t-2 border-l-2',
            'top-8 right-8 border-t-2 border-r-2',
            'bottom-8 left-8 border-b-2 border-l-2',
            'bottom-8 right-8 border-b-2 border-r-2',
          ].map((cls, i) => (
            <motion.div
              key={i}
              className={`absolute w-12 h-12 border-accent/50 ${cls}`}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 + i * 0.06, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
            />
          ))}

          {/* ── Horizontal scan line ── */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-accent/20 z-[2]"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
          />

          {/* ── Core content ── */}
          <div className="relative z-10 flex flex-col items-center gap-10 select-none">

            {/* Label */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.8em' }}
              animate={{ opacity: 1, letterSpacing: '0.5em' }}
              transition={{ delay: 0.15, duration: 0.8 }}
              className="font-mono text-[0.6rem] uppercase text-muted"
            >
              portfolio
            </motion.p>

            {/* Domain scramble */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
              className="relative"
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full blur-3xl"
                style={{ background: 'rgba(0,255,224,0.15)', transform: 'scale(2)' }}
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Domain text */}
              <div className="relative flex items-baseline gap-0">
                <span
                  className="font-mono text-accent"
                  style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', letterSpacing: '0.1em' }}
                >
                  {scrambled}
                </span>
                {/* Blinking cursor */}
                <motion.span
                  className="font-mono text-accent/70 ml-1"
                  style={{ fontSize: 'clamp(2rem, 6vw, 4rem)' }}
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                >
                  ▋
                </motion.span>
              </div>

              {/* Underline that draws in */}
              <motion.div
                className="absolute bottom-0 left-0 h-px bg-accent"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.6, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              />
            </motion.div>

            {/* Progress bar — segmented */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col items-center gap-3 w-[320px]"
            >
              <div className="flex gap-[4px] w-full">
                {Array.from({ length: 24 }).map((_, i) => {
                  const filled = (progress / 100) * 24 > i
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 h-[3px] rounded-sm"
                      animate={{
                        backgroundColor: filled
                          ? '#00ffe0'
                          : 'rgba(0,255,224,0.1)',
                        boxShadow: filled
                          ? '0 0 6px rgba(0,255,224,0.6)'
                          : 'none',
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  )
                })}
              </div>

              <div className="flex justify-between w-full items-center">
                <motion.span
                  className="font-mono text-[0.6rem] tracking-[0.3em] uppercase text-muted"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  initializing
                </motion.span>
                <span className="font-mono text-[0.7rem] text-accent tabular-nums">
                  {Math.floor(progress).toString().padStart(3, '0')}
                  <span className="text-muted">%</span>
                </span>
              </div>
            </motion.div>

            {/* Stack tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              className="flex gap-5"
            >
              {['next.js', 'r3f', 'framer'].map((item, i) => (
                <motion.span
                  key={item}
                  className="font-mono text-[0.55rem] tracking-[0.25em] uppercase text-accent/25"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  )
}