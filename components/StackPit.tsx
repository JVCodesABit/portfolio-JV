'use client'
import { useEffect, useRef } from 'react'
import { STACK } from '@/lib/data'

/** Tools as real rigid bodies. Stays a plain wrapped list when motion is reduced. */
export function StackPit() {
  const pit = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const box = pit.current!
    let cleanup = () => {}
    let started = false

    const start = async () => {
      started = true
      const Matter = (await import('matter-js')).default
      const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint } = Matter
      const engine = Engine.create({ gravity: { x: 0, y: 1.1 } })
      const items = Array.from(box.querySelectorAll<HTMLElement>('li'))
      const sizes = items.map((el) => ({ w: el.offsetWidth, h: el.offsetHeight }))
      box.classList.add('live')

      const W = box.clientWidth
      const H = box.clientHeight
      const t = 200
      const opt = { isStatic: true }
      Composite.add(engine.world, [
        Bodies.rectangle(W / 2, H + t / 2, W + 2 * t, t, opt),
        Bodies.rectangle(-t / 2, H / 2 - 1500, t, H + 3400, opt),
        Bodies.rectangle(W + t / 2, H / 2 - 1500, t, H + 3400, opt),
      ])
      const bodies = items.map((_, i) => {
        const { w, h } = sizes[i]
        return Bodies.rectangle(
          w / 2 + Math.random() * Math.max(1, W - w),
          -80 - i * 62,
          w, h,
          { chamfer: { radius: h / 2 - 0.5 }, restitution: 0.42, friction: 0.28, frictionAir: 0.008, angle: (Math.random() - 0.5) * 0.9 },
        )
      })
      Composite.add(engine.world, bodies)

      const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
      if (fine) {
        const mouse = Mouse.create(box)
        // Matter swallows the wheel by default, which would trap page scroll here.
        const m = mouse as unknown as { element: HTMLElement; mousewheel: EventListener }
        m.element.removeEventListener('wheel', m.mousewheel)
        m.element.removeEventListener('mousewheel', m.mousewheel)
        m.element.removeEventListener('DOMMouseScroll', m.mousewheel)
        Composite.add(engine.world, MouseConstraint.create(engine, {
          mouse,
          constraint: { stiffness: 0.16, damping: 0.1, render: { visible: false } },
        }))
      }
      const onTap = (e: PointerEvent) => {
        if (fine) return
        const r = box.getBoundingClientRect()
        const x = e.clientX - r.left
        const y = e.clientY - r.top
        bodies.forEach((b) => {
          const dx = b.position.x - x
          const dy = b.position.y - y
          const d = Math.hypot(dx, dy)
          if (d < 180) Body.setVelocity(b, { x: (dx / (d || 1)) * 9, y: -11 * (1 - d / 180) - 4 })
        })
      }
      box.addEventListener('pointerdown', onTap)

      let raf = 0
      let last = performance.now()
      let visible = true
      const tick = (now: number) => {
        raf = requestAnimationFrame(tick)
        if (!visible) { last = now; return }
        const dt = Math.min(now - last, 25)
        last = now
        Engine.update(engine, dt || 16.67)
        bodies.forEach((b, i) => {
          const { w, h } = sizes[i]
          items[i].style.transform = `translate(${(b.position.x - w / 2).toFixed(1)}px, ${(b.position.y - h / 2).toFixed(1)}px) rotate(${b.angle.toFixed(3)}rad)`
        })
      }
      raf = requestAnimationFrame(tick)
      const vis = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
      vis.observe(box)

      cleanup = () => {
        cancelAnimationFrame(raf)
        vis.disconnect()
        box.removeEventListener('pointerdown', onTap)
        box.classList.remove('live')
        items.forEach((el) => { el.style.transform = '' })
        Engine.clear(engine)
      }
    }

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { start(); io.disconnect() }
    }, { threshold: 0.35 })
    io.observe(box)

    let w = innerWidth
    const onResize = () => {
      if (innerWidth === w) return
      w = innerWidth
      if (started) { cleanup(); start() }
    }
    addEventListener('resize', onResize)

    return () => { io.disconnect(); cleanup(); removeEventListener('resize', onResize) }
  }, [])

  return (
    <ul ref={pit} className="pit" aria-label="Tools I work with">
      {STACK.flatMap((g) => g.items.map((it) => (
        <li key={it} style={{ background: g.color }} title={g.group}>{it}</li>
      )))}
    </ul>
  )
}
