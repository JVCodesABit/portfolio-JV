'use client'
import { useEffect, useRef } from 'react'

const MORPH = 1.1
const HOLD = 1.9

/** Two stacked words, blurred past each other through an alpha threshold, so they melt instead of fade. */
export function LiquidWords({ words }: { words: string[] }) {
  const a = useRef<HTMLSpanElement>(null)
  const b = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t1 = a.current!
    const t2 = b.current!
    let idx = 0
    let morph = 0
    let hold = HOLD
    let last = performance.now()
    let raf = 0

    const apply = (frac: number) => {
      const set = (el: HTMLElement, f: number) => {
        if (f <= 0.001) { el.style.opacity = '0'; return }
        el.style.filter = `blur(${Math.min(8 / f - 8, 40).toFixed(2)}px)`
        el.style.opacity = `${Math.pow(f, 0.4)}`
      }
      set(t2, frac)
      set(t1, 1 - frac)
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (hold > 0) { hold -= dt; return }
      morph += dt
      const f = Math.min(morph / MORPH, 1)
      apply(f)
      if (f >= 1) {
        idx = (idx + 1) % words.length
        t1.textContent = words[idx]
        t2.textContent = words[(idx + 1) % words.length]
        t1.style.filter = ''
        t1.style.opacity = '1'
        t2.style.opacity = '0'
        morph = 0
        hold = HOLD
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [words])

  const longest = words.reduce((x, y) => (y.length > x.length ? y : x), '')
  return (
    <p className="liquid" aria-label={words.join(', ')}>
      <span className="liquid-ghost" aria-hidden>{longest}</span>
      <span className="liquid-layer" aria-hidden>
        <span ref={a}>{words[0]}</span>
        <span ref={b} style={{ opacity: 0 }}>{words[1]}</span>
      </span>
    </p>
  )
}
