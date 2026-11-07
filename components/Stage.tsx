'use client'
import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { stage } from '@/lib/engine'
import { CHAPTERS } from '@/lib/data'

export function Stage() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = new Lenis({ lerp: reduced ? 1 : 0.09, smoothWheel: !reduced, autoRaf: true, anchors: { duration: 1.8 } })
    stage.lenis = lenis as unknown as typeof stage.lenis

    const root = document.documentElement
    stage.onActive = (c, i) => {
      root.style.setProperty('--nav-fg', c.fg)
      root.style.setProperty('--nav-bg', c.bg)
      // Long text sections scroll under the nav, so give it a fade to sit on.
      root.toggleAttribute('data-nav-solid', ['about', 'work', 'more', 'wins', 'stack'].includes(c.id))
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', c.bg)
      const el = document.getElementById('nav-index')
      if (el) el.textContent = `${String(i + 1).padStart(2, '0')}/${CHAPTERS.length} ${c.label}`
    }
    stage.mount(canvas.current!)

    const io = new IntersectionObserver(
      (es) => es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('[data-reveal]').forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <canvas ref={canvas} className="stage" aria-hidden />
      <div className="grain" aria-hidden />
    </>
  )
}
