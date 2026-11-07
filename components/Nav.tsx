'use client'
import { useEffect, useState } from 'react'
import { stage } from '@/lib/engine'
import { CHAPTERS } from '@/lib/data'
import { SoundToggle } from './SoundToggle'

export function Nav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) stage.lenis?.stop(); else stage.lenis?.start()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    setOpen(false)
    stage.lenis?.start()
    const el = document.getElementById(id)
    if (el) stage.lenis?.scrollTo(el, { duration: 2, force: true })
  }

  return (
    <>
      <header className="nav">
        <a className="nav-mark" href="#hero" onClick={(e) => go(e, 'hero')} aria-label="Back to top">JV</a>
        <span id="nav-index" className="mono nav-index" aria-hidden>01/{CHAPTERS.length} Hello</span>
        <div className="nav-right">
          <SoundToggle />
          <button className="mono nav-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu">
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>
      <nav id="menu" className={`menu ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Sections">
        <ol>
          {CHAPTERS.map((c, i) => (
            <li key={c.id} style={{ transitionDelay: open ? `${80 + i * 28}ms` : '0ms' }}>
              <a href={`#${c.id}`} tabIndex={open ? 0 : -1} onClick={(e) => go(e, c.id)}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                {c.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
