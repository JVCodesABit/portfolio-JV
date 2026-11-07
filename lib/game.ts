import { BONE, INK } from './data'
import type { ShapeName } from './shapes'
import { sound } from './sound'
import { stage, type Takeover } from './engine'

export const GAME_SHAPES: ShapeName[] = ['circle', 'play', 'plus', 'star']

const PALETTE: [bg: string, fg: string][] = [
  ['#FF5B26', INK], ['#5B3DF5', BONE], ['#14D8C4', INK], ['#EDF03C', INK],
  ['#0E4D3A', BONE], ['#FFB8D9', INK], ['#1E3BFF', BONE], [INK, BONE],
]
const BEST_KEY = 'jv-fit-best'
const LIVES = 3

export type Phase = 'menu' | 'play' | 'over' | 'closing'
export interface GameState {
  phase: Phase
  score: number
  best: number
  lives: number
  current: number
  fg: string
  isNewBest: boolean
}

interface Gate { shape: number; t: number; dur: number; spin: number }
interface Ghost { shape: number; t: number; hit: boolean }

/**
 * Fit: an outline closes in on you and you have to become that shape before it
 * lands. The player is the site's own spring-driven loop, driven as a takeover of
 * the stage, and every fit pours in a new colour with the same flood as the site.
 */
export class Game implements Takeover {
  shape: ShapeName = 'circle'
  x = 0.5
  y = 0.47
  s = 0.36
  fill = BONE
  stiffness = 2.5
  shakeX = 0
  shakeY = 0

  private phase: Phase = 'menu'
  private score = 0
  private lives = LIVES
  private best = 0
  private isNewBest = false
  private current = 0
  private gate: Gate | null = null
  private ghosts: Ghost[] = []
  private wait = 0
  private shake = 0
  private colour = 0
  private fg = BONE
  private from: string
  private to: string
  private floodT = 0
  private time = 0
  private reduced = false

  constructor(private onChange: (s: GameState) => void, private onClosed: () => void) {
    this.from = stage.activeBg()
    this.colour = 0
    this.to = PALETTE[0][0]
    this.fg = PALETTE[0][1]
    this.fill = this.fg
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (innerWidth < 860) this.s = 0.5
    try { this.best = Number(localStorage.getItem(BEST_KEY)) || 0 } catch { /* private window */ }
    this.emit()
  }

  private emit() {
    this.onChange({
      phase: this.phase, score: this.score, best: this.best, lives: this.lives,
      current: this.current, fg: this.fg, isNewBest: this.isNewBest,
    })
  }

  start() {
    this.score = 0
    this.lives = LIVES
    this.isNewBest = false
    this.phase = 'play'
    this.ghosts = []
    this.wait = 0.35
    this.gate = null
    this.emit()
  }

  /** Become shape i. */
  morph(i: number) {
    if (this.phase === 'closing' || i === this.current) return
    this.current = i
    this.shape = GAME_SHAPES[i]
    sound.note(i + 2, 0.45)
    this.emit()
  }

  close() {
    if (this.phase === 'closing') return
    this.phase = 'closing'
    this.gate = null
    this.from = this.to
    this.to = stage.activeBg()
    this.fill = stage.activeFill()
    this.floodT = 0
    this.stiffness = 1
    this.emit()
  }

  private nextColour() {
    this.colour = (this.colour + 1) % PALETTE.length
    this.from = this.to
    this.to = PALETTE[this.colour][0]
    this.fg = PALETTE[this.colour][1]
    this.floodT = 0
  }

  private spawn() {
    // Never ask for the shape you're already holding, or there's nothing to do.
    const others = GAME_SHAPES.map((_, n) => n).filter((n) => n !== this.current)
    const shape = others[Math.floor(Math.random() * others.length)]
    this.gate = {
      shape,
      t: 0,
      dur: Math.max(0.72, 2.05 - this.score * 0.062),
      spin: this.score >= 12 ? (Math.random() < 0.5 ? -1 : 1) * 0.9 : 0,
    }
  }

  private resolve(g: Gate) {
    const hit = g.shape === this.current
    this.ghosts.push({ shape: g.shape, t: 0, hit })
    this.gate = null
    const c = stage.centre(this.x, this.y)
    if (hit) {
      this.score++
      if (this.score > this.best) {
        this.best = this.score
        this.isNewBest = true
        try { localStorage.setItem(BEST_KEY, String(this.best)) } catch { /* private window */ }
      }
      this.nextColour()
      stage.ripple(c[0], c[1], 900)
      sound.note(4 + this.score % 15, 0.9)
      this.wait = 0.16
    } else {
      this.lives--
      this.shake = this.reduced ? 0 : 1
      sound.buzz()
      this.wait = 0.5
      if (this.lives <= 0) {
        this.phase = 'over'
        this.wait = 0
      }
    }
    this.emit()
  }

  update(dt: number) {
    this.time += dt
    if (this.floodT < 1) {
      this.floodT = Math.min(1, this.floodT + dt / (this.phase === 'closing' ? 0.7 : 0.5))
      if (this.phase !== 'closing' && this.floodT > 0.35) this.fill = this.fg
      if (this.phase === 'closing' && this.floodT >= 1) {
        this.onClosed()
        return
      }
    }
    this.shake = Math.max(0, this.shake - dt * 2.8)
    const m = this.shake * this.shake * 16
    this.shakeX = Math.sin(this.time * 71) * m
    this.shakeY = Math.cos(this.time * 53) * m

    this.ghosts = this.ghosts.filter((g) => (g.t += dt * 2.1) < 1)

    if (this.phase === 'play') {
      if (this.wait > 0) this.wait -= dt
      else if (!this.gate) this.spawn()
      else {
        this.gate.t += dt
        if (this.gate.t >= this.gate.dur) this.resolve(this.gate)
      }
    }
  }

  private tracePts(c: CanvasRenderingContext2D, shape: number, scale: number, rot: number) {
    const pts = stage.shapePoints(GAME_SHAPES[shape])
    const size = stage.sizeFor(this.s) * scale
    const [cx, cy] = stage.centre(this.x, this.y)
    const cos = Math.cos(rot), sin = Math.sin(rot)
    c.beginPath()
    for (let i = 0; i < pts.length; i += 2) {
      const px = pts[i] * size
      const py = pts[i + 1] * size
      const x = cx + px * cos - py * sin
      const y = cy + px * sin + py * cos
      if (i) c.lineTo(x, y); else c.moveTo(x, y)
    }
    c.closePath()
  }

  paintBack(c: CanvasRenderingContext2D, vw: number, vh: number) {
    c.fillStyle = this.from
    c.fillRect(-40, -40, vw + 80, vh + 80)
    if (this.floodT <= 0) return
    c.fillStyle = this.to
    if (this.floodT >= 1 || this.reduced) {
      c.globalAlpha = this.floodT
      c.fillRect(-40, -40, vw + 80, vh + 80)
      c.globalAlpha = 1
      return
    }
    const [cx, cy] = stage.centre(this.x, this.y)
    const far = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) * 1.14
    const k = this.floodT
    const r = k * k * (3 - 2 * k) * far
    c.beginPath()
    for (let s = 0; s <= 72; s++) {
      const a = (s / 72) * Math.PI * 2
      const w = 1 + 0.035 * Math.sin(a * 3 + this.time * 2) + 0.02 * Math.sin(a * 7 - this.time)
      const x = cx + Math.cos(a) * r * w
      const y = cy + Math.sin(a) * r * w
      if (s) c.lineTo(x, y); else c.moveTo(x, y)
    }
    c.closePath()
    c.fill()
  }

  paintFront(c: CanvasRenderingContext2D) {
    c.lineJoin = 'round'
    c.strokeStyle = this.fg
    for (const g of this.ghosts) {
      this.tracePts(c, g.shape, g.hit ? 1 + g.t * 0.75 : 1 + g.t * 0.1, 0)
      c.globalAlpha = (1 - g.t) * (g.hit ? 0.9 : 0.5)
      c.lineWidth = g.hit ? 3 + 10 * (1 - g.t) : 3
      if (!g.hit) c.setLineDash([12, 12])
      c.stroke()
      c.setLineDash([])
    }
    c.globalAlpha = 1
    const gate = this.gate
    if (gate) {
      const k = Math.min(1, gate.t / gate.dur)
      const scale = 1.02 + 2.5 * Math.pow(1 - k, 1.25)
      this.tracePts(c, gate.shape, scale, gate.spin * (1 - k) * 2.4)
      c.globalAlpha = Math.min(1, k * 7)
      c.lineWidth = 3 + 6 * k
      c.stroke()
      c.globalAlpha = 1
    }
  }
}
