'use client'
import { useEffect, useRef, useState } from 'react'
import { stage } from '@/lib/engine'
import { Game as Engine, GAME_SHAPES, type GameState } from '@/lib/game'
import { SoundToggle } from './SoundToggle'

const ICONS: Record<string, React.ReactNode> = {
  circle: <circle cx="12" cy="12" r="9" />,
  play: <path d="M6 3 L21 12 L6 21 Z" />,
  plus: <path d="M8.5 3h7v5.5H21v7h-5.5V21h-7v-5.5H3v-7h5.5z" />,
  star: <path d="M12 2l3 6.8 7.4.7-5.6 4.9 1.700 7.200L12 16.800l-6.500 3.800 1.700-7.200-5.600-4.900 7.400-.7z" />,
}
const LABELS = ['Circle', 'Triangle', 'Cross', 'Star']
const KEYS: Record<string, number> = {
  '1': 0, '2': 1, '3': 2, '4': 3,
  a: 0, s: 1, d: 2, f: 3,
  arrowleft: 0, arrowup: 1, arrowdown: 2, arrowright: 3,
}

/** Hidden behind five presses on the shape, or typing "play" anywhere. */
export function Game() {
  const [ui, setUi] = useState<GameState | null>(null)
  const game = useRef<Engine | null>(null)
  const primary = useRef<HTMLButtonElement>(null)
  const phase = ui?.phase

  useEffect(() => {
    const open = () => {
      if (game.current) return
      document.documentElement.classList.add('game-open')
      stage.lenis?.stop()
      const g = new Engine(setUi, () => {
        stage.endTakeover()
        game.current = null
        setUi(null)
        document.documentElement.classList.remove('game-open')
        stage.lenis?.start()
      })
      game.current = g
      stage.startTakeover(g)
    }
    stage.onSecret = open

    let typed = ''
    const onKey = (e: KeyboardEvent) => {
      const g = game.current
      if (g) {
        if (e.key === 'Escape') { e.preventDefault(); g.close(); return }
        const k = KEYS[e.key.toLowerCase()]
        if (k !== undefined && !e.repeat) {
          e.preventDefault()
          g.morph(k)
        }
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return
      typed = (typed + e.key.toLowerCase()).slice(-4)
      if (typed === 'play') {
        typed = ''
        open()
      }
    }
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('keydown', onKey)
      stage.onSecret = undefined
    }
  }, [])

  useEffect(() => {
    if (phase === 'menu' || phase === 'over') primary.current?.focus({ preventScroll: true })
  }, [phase])

  if (!ui) return null
  const closing = ui.phase === 'closing'

  return (
    <div
      className={`game ${closing ? 'closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Fit, a hidden game"
      style={{ '--gfg': ui.fg } as React.CSSProperties}
    >
      <div className="game-top mono">
        <button className="game-exit" onClick={() => game.current?.close()}>Back to site</button>
        {ui.phase === 'play' && (
          <span className="game-lives" role="img" aria-label={`${ui.lives} lives left`}>
            {[0, 1, 2].map((i) => <i key={i} className={i < ui.lives ? 'on' : ''} />)}
          </span>
        )}
        <SoundToggle />
      </div>

      {ui.phase === 'play' && <p className="game-score">{ui.score}</p>}

      {ui.phase === 'menu' && (
        <div className="game-card game-card-top">
          <h2>You found it.</h2>
          <p>Fit: become the shape before it closes on you.</p>
        </div>
      )}

      {ui.phase === 'over' && (
        <div className="game-card game-card-top" role="status">
          <h2>{ui.score}</h2>
          <p>{ui.isNewBest ? 'A new best.' : `Your best is ${ui.best}.`}</p>
        </div>
      )}

      <div className="game-bottom">
        {(ui.phase === 'menu' || ui.phase === 'over') && (
          <button ref={primary} className="game-go" onClick={() => game.current?.start()}>
            {ui.phase === 'menu' ? 'Start' : 'Play again'}
          </button>
        )}
        <div className="game-shapes">
          {GAME_SHAPES.map((s, i) => (
            <button
              key={s}
              className={ui.current === i ? 'on' : ''}
              aria-label={LABELS[i]}
              aria-pressed={ui.current === i}
              onPointerDown={() => game.current?.morph(i)}
              onClick={(e) => { if (e.detail === 0) game.current?.morph(i) }}
            >
              <svg viewBox="0 0 24 24" aria-hidden>{ICONS[s]}</svg>
              <span className="mono">{i + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
