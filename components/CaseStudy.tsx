'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { stage } from '@/lib/engine'
import { PROJECTS } from '@/lib/data'

/**
 * The shape grows to fill the viewport and this content appears on top of it.
 * Back, Esc and the close button all reverse the same morph.
 */
export function CaseStudy() {
  const [id, setId] = useState<string | null>(null)
  const [shown, setShown] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const timers = useRef<number[]>([])

  const clear = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  const finishClose = useCallback(() => {
    clear()
    setShown(false)
    document.documentElement.classList.remove('case-open')
    stage.closeCase()
    stage.lenis?.start()
    timers.current.push(window.setTimeout(() => setId(null), 350))
    opener.current?.focus({ preventScroll: true })
  }, [])

  const open = useCallback((next: string) => {
    clear()
    setId(next)
    stage.openCase(next)
    stage.lenis?.stop()
    document.documentElement.classList.add('case-open')
    timers.current.push(window.setTimeout(() => {
      setShown(true)
      closeBtn.current?.focus({ preventScroll: true })
    }, 480))
  }, [])

  useEffect(() => {
    // Back closes the overlay. Without this the browser also rewinds the page beneath it.
    history.scrollRestoration = 'manual'
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-case]')
      if (!btn) return
      opener.current = btn
      history.pushState({ case: btn.dataset.case }, '')
      open(btn.dataset.case!)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.documentElement.classList.contains('case-open')) history.back()
    }
    const onPop = () => finishClose()
    document.addEventListener('click', onClick)
    addEventListener('keydown', onKey)
    addEventListener('popstate', onPop)
    return () => {
      document.removeEventListener('click', onClick)
      removeEventListener('keydown', onKey)
      removeEventListener('popstate', onPop)
    }
  }, [open, finishClose])

  const goNext = (nextId: string) => {
    setShown(false)
    timers.current.push(window.setTimeout(() => {
      const el = document.getElementById(nextId)
      // Move the page underneath while the shape covers it, so closing lands on this project.
      stage.lenis?.start()
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'instant' })
      stage.lenis?.stop()
      opener.current = el?.querySelector<HTMLElement>('[data-case]') ?? null
      setId(nextId)
      stage.openCase(nextId)
      scroller.current?.scrollTo(0, 0)
      timers.current.push(window.setTimeout(() => setShown(true), 260))
    }, 280))
  }

  const p = PROJECTS.find((x) => x.id === id)
  if (!p) return null
  const nextP = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length]

  return (
    <div
      ref={scroller}
      className={`case ${shown ? 'shown' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${p.name.join('')} case study`}
      data-lenis-prevent
      style={{ '--fg': p.caseFg, '--accent': p.caseAccent } as React.CSSProperties}
    >
      <button ref={closeBtn} className="mono case-close" onClick={() => history.back()}>Close ✕</button>
      <div className="case-body">
        <p className="mono eyebrow case-a">{p.index} · {p.kind} · {p.when}</p>
        <h2 className="case-name case-a">{p.name.join('')}</h2>
        <p className="case-problem case-a">{p.problem}</p>

        <ul className="project-stats case-stats case-a">
          {p.stats.map((st) => (
            <li key={st.l}><strong>{st.n}</strong><span className="mono">{st.l}</span></li>
          ))}
        </ul>

        <div className="case-grid case-a">
          {p.built.map((b) => (
            <article key={b.h}>
              <h3>{b.h}</h3>
              <p>{b.p}</p>
            </article>
          ))}
        </div>

        {p.shots.length > 0 && (
          <div className="case-shots case-a">
            {p.video && (
              <video
                key={p.video}
                src={p.video}
                poster={p.shots[0]}
                muted
                loop
                playsInline
                preload="metadata"
                autoPlay={!matchMedia('(prefers-reduced-motion: reduce)').matches}
                controls={matchMedia('(prefers-reduced-motion: reduce)').matches}
                aria-label={`A recording of ${p.name.join('')} in use`}
              />
            )}
            {p.shots.map((s) => (
              <Image key={s} src={s} alt={`${p.name.join('')} screenshot`} width={1440} height={900} sizes="(max-width: 860px) 92vw, 80vw" />
            ))}
          </div>
        )}

        <div className="case-foot case-a">
          <ul className="mono case-stack">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
          <div className="project-cta">
            {p.live && <a className="pill solid" href={p.live} target="_blank" rel="noreferrer">Visit live ↗</a>}
            {p.code && <a className="pill" href={p.code} target="_blank" rel="noreferrer">Read the code ↗</a>}
          </div>
        </div>

        <button className="case-next case-a" onClick={() => goNext(nextP.id)}>
          <span className="mono">Next project</span>
          {nextP.name.join('')} →
        </button>
      </div>
    </div>
  )
}
