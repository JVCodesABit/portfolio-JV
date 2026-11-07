'use client'
import { useEffect, useRef, useState } from 'react'
import { stage } from '@/lib/engine'

const WORD = 'jvcodes.tech'
const DOT = WORD.indexOf('.')
const BONE = '#EFEBE1'
const EMBER = '#FF5B26'

/**
 * The showreel. First the story, as title cards on black, each on screen just long
 * enough to read. Then a speed ramp of projects and interests through the letters.
 */
interface Cut {
  dur: number
  label: string
  big?: string
  sub?: string
  color?: string
  src?: string
  pos?: string
  tint?: string
}
const REEL: Cut[] = [
  { big: '97.6%', sub: 'School topper, CBSE XII', label: 'School', color: BONE, dur: 0.36 },
  { big: 'AIR 3942', sub: 'JEE Mains', label: 'Entrance exams', color: '#FF5B26', dur: 0.32 },
  { big: 'AIR 4065', sub: 'JEE Advanced', label: 'Entrance exams', color: '#14D8C4', dur: 0.3 },
  { big: 'RANK 2', sub: 'Department, NSUT · University rank 9', label: 'NSUT', color: '#EDF03C', dur: 0.32 },
  { big: '9.41', sub: 'CGPA', label: 'NSUT', color: '#FFB8D9', dur: 0.26 },
  { big: '1ST', sub: 'Delhi AI Grind 2026', label: 'Hackathons', color: '#FF5B26', dur: 0.28 },
  { big: '3RD', sub: 'SAU Smart Campus Hackathon 2026', label: 'Hackathons', color: '#8F7BFF', dur: 0.26 },
  { big: '550+', sub: 'LeetCode problems solved', label: 'Competitive programming', color: '#14D8C4', dur: 0.26 },
  { big: 'INTERN', sub: 'at GS', label: 'Work', color: BONE, dur: 0.3 },
  { src: '/work/orbis-0.webp', label: 'Orbis', dur: 0.17, pos: '50% 30%', tint: '#FF5B26' },
  { src: '/work/tmf-1-crop.webp', label: 'TakeMeForward', dur: 0.15, pos: '50% 50%' },
  { src: '/work/gaming.webp', label: 'Online games', dur: 0.13, pos: '50% 35%', tint: '#5B3DF5' },
  { src: '/work/geo.webp', label: 'Geopolitics', dur: 0.11, pos: '50% 50%' },
  { src: '/work/mba-1-crop.webp', label: 'MBAEdge', dur: 0.09, pos: '30% 70%' },
  { src: '/work/video.webp', label: 'Video editing', dur: 0.07, pos: '60% 50%' },
  { src: '/work/goto-0.webp', label: 'GoTogethr', dur: 0.06, pos: '50% 50%', tint: '#14D8C4' },
]
const CUT_AT = 0.12
const STOPS = REEL.reduce<number[]>((a, r) => [...a, a[a.length - 1] + r.dur], [CUT_AT])
const GROW_AT = STOPS[REEL.findIndex((r) => r.src)]
const SOLID_AT = STOPS[STOPS.length - 1]
const SNAP_AT = SOLID_AT + 0.08
const SNAP = 0.5
const POP_AT = SNAP_AT + 0.4
const DIVE_AT = POP_AT + 0.42
const DIVE = 0.6

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const expoOut = (k: number) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k))
const expoInOut = (k: number) =>
  k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2
const back = (k: number) => { const c = 2.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2) }
const recoil = (t: number) => (t < 0 ? 0 : Math.exp(-7 * t) * Math.sin(24 * t))

/**
 * A showreel seen through the wordmark. The film is a full-screen layer, and a black
 * matte with white letters multiplies over it, so the letters are windows onto one
 * continuous picture. Then the word stops on white, slams into place, takes the dot,
 * and the camera dives through that dot into the site.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'on' | 'out' | 'gone'>('on')

  useEffect(() => {
    const html = document.documentElement
    if (html.classList.contains('no-intro') || html.classList.contains('ready')) {
      setState('gone')
      return
    }
    const box = root.current!
    const film = box.querySelector<HTMLElement>('.ix-film')!
    const matte = box.querySelector<HTMLElement>('.ix-matte')!
    const mark = box.querySelector<HTMLElement>('.ix-mark')!
    const dot = box.querySelector<HTMLElement>('.ix-dot')!
    const hud = box.querySelector<HTMLElement>('.ix-hud')!
    const label = box.querySelector<HTMLElement>('.ix-label')!
    const time = box.querySelector<HTMLElement>('.ix-time')!
    const head = box.querySelector<HTMLElement>('.ix-head')!
    const letters = Array.from(box.querySelectorAll<HTMLElement>('.ix-l'))
    const card = box.querySelector<HTMLElement>('.ix-card')!
    const cardBig = box.querySelector<HTMLElement>('.ix-big')!
    const cardSub = box.querySelector<HTMLElement>('.ix-sub')!

    let raf = 0
    let ended = false
    let released = false
    const events = ['wheel', 'touchmove', 'keydown', 'pointerdown'] as const
    const off = () => events.forEach((e) => removeEventListener(e, skip))
    const release = (x: number, y: number, d: number) => {
      if (released) return
      released = true
      stage.releaseIntro(x, y, d)
    }
    let dotAt: [number, number, number] | null = null

    const skip = () => {
      ended = true
      off()
      cancelAnimationFrame(raf)
      if (dotAt) release(...dotAt)
      else release(innerWidth / 2, innerHeight / 2, 20)
      setState('out')
      window.setTimeout(() => setState('gone'), 300)
    }
    events.forEach((e) => addEventListener(e, skip, { passive: true }))

    const start = () => {
      if (ended) return
      // Fit the word to the screen now that the real font metrics exist.
      box.style.fontSize = `${Math.min((parseFloat(getComputedStyle(box).fontSize) * innerWidth * 0.94) / mark.offsetWidth, innerHeight * 0.42)}px`
      const fs = parseFloat(getComputedStyle(box).fontSize)
      const dr = dot.getBoundingClientRect()
      const cx = dr.left + dr.width / 2
      const cy = dr.top + dr.height / 2
      dotAt = [cx, cy, dr.width]
      const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy))

      const m = mark.getBoundingClientRect()
      mark.style.transformOrigin = `${cx - m.left}px ${cy - m.top}px`
      const zoom = (far * 1.08) / (dr.width / 2)
      const tall = (innerHeight * (innerWidth < 860 ? 0.6 : 0.84)) / (fs * 0.72)

      const dist = letters.map((l) => { const r = l.getBoundingClientRect(); return Math.abs(r.left + r.width / 2 - cx) })
      const order = [...dist].sort((a, b) => a - b)
      const rank = dist.map((d) => order.indexOf(d))
      const side = letters.map((l) => (l.getBoundingClientRect().left < cx ? -1 : 1))
      letters.forEach((l) => { l.style.transformOrigin = '50% 60%' })

      // Every card's number is sized to fill the screen, whatever its length.
      const sizes = REEL.map((r) => {
        if (!r.big) return 0
        cardBig.style.fontSize = '100px'
        cardBig.textContent = r.big
        return Math.min((100 * innerWidth * 0.9) / cardBig.offsetWidth, innerHeight * 0.5)
      })
      dot.style.transform = 'scale(0)'
      box.classList.add('live')

      const t0 = performance.now()
      let cut = -1
      let solid = false

      const tick = (now: number) => {
        if (ended) return
        raf = requestAnimationFrame(tick)
        const t = (now - t0) / 1000

        // Which cut are we on, and how far into it?
        let beat = 0
        while (beat < REEL.length - 1 && t >= STOPS[beat + 1]) beat++
        const into = Math.max(0, t - STOPS[beat])

        if (t < SOLID_AT) {
          const r = REEL[beat]
          if (beat !== cut) {
            cut = beat
            if (r.big) {
              card.style.display = 'grid'
              card.style.color = r.color!
              cardBig.textContent = r.big
              cardBig.style.fontSize = `${sizes[beat]}px`
              cardSub.textContent = r.sub!
            } else {
              card.style.display = 'none'
              film.style.backgroundImage = `url(${r.src})`
              film.style.backgroundPosition = r.pos!
              // Dark screenshots would read as a black frame, so their blacks take the project's colour.
              film.style.backgroundColor = r.tint ?? '#000'
              film.style.backgroundBlendMode = r.tint ? 'screen' : 'normal'
            }
            label.textContent = `${String(beat + 1).padStart(2, '0')}  ${r.label}`
          }
          // Every cut starts pushed in and settles, so stills read as moving footage.
          if (r.big) cardBig.style.transform = `scale(${(1.09 - 0.09 * expoOut(into / 0.28)).toFixed(4)})`
          else film.style.transform = `scale(${(1.16 - 0.16 * expoOut(into / 0.4)).toFixed(4)})`
        } else if (!solid) {
          solid = true
          film.style.backgroundImage = 'none'
          film.style.background = '#fff'
          film.style.transform = 'none'
          letters.forEach((l) => { l.style.color = BONE })
          hud.style.opacity = '0'
        }

        // The timecode runs at 24 frames a second, and the playhead tracks the reel.
        if (!solid) {
          const f = Math.floor(t * 24)
          time.textContent = `00:00:${String(Math.floor(f / 24)).padStart(2, '0')}:${String(f % 24).padStart(2, '0')}`
          head.style.transform = `scaleX(${clamp(t / SOLID_AT).toFixed(4)})`
        }

        // Letters: bars grow in, kick on every cut, slam down, then recoil from the dot.
        const kick = t < SOLID_AT && t >= GROW_AT ? Math.exp(-13 * into) : 0
        letters.forEach((l, i) => {
          const grow = expoOut(clamp((t - GROW_AT - rank[i] * 0.016) / 0.4))
          const snap = expoInOut(clamp((t - SNAP_AT - rank[i] * 0.016) / SNAP))
          const height = grow * tall * (1 + kick * 0.05)
          const sy = height - (height - 1) * snap
          const hit = recoil(t - POP_AT - 0.12 - rank[i] * 0.024)
          const near = 1 / (1 + rank[i] * 0.2)
          l.style.transform = `translate(${(hit * side[i] * 9 * near).toFixed(2)}%,${(hit * 8).toFixed(2)}%) rotate(${(hit * side[i] * 4 * near).toFixed(2)}deg) scaleY(${sy.toFixed(3)})`
        })

        // The dot lands last.
        const pop = clamp((t - POP_AT) / 0.4)
        if (t < DIVE_AT) dot.style.transform = `scale(${(pop ? back(pop) : 0).toFixed(3)})`
        else dot.style.transform = 'none'

        // The dive through it, at a constant rate of zoom so it keeps accelerating.
        const dive = clamp((t - DIVE_AT) / DIVE)
        if (dive > 0) mark.style.transform = `scale(${Math.exp(Math.pow(dive, 2.6) * Math.log(zoom)).toFixed(3)})`

        if (dive >= 1) {
          cancelAnimationFrame(raf)
          film.style.display = 'none'
          matte.style.display = 'none'
          box.style.background = EMBER
          release(cx, cy, dr.width)

          // Out of the orange and into the site, through a hole opening at the dot.
          const o0 = performance.now()
          const open = (n: number) => {
            if (ended) return
            const k = clamp((n - o0) / 620)
            const r = expoInOut(k) * far * 1.05 + dr.width * 0.5
            const mask = `radial-gradient(circle at ${cx}px ${cy}px, transparent ${r.toFixed(1)}px, #000 ${(r + 1).toFixed(1)}px)`
            box.style.maskImage = mask
            box.style.setProperty('-webkit-mask-image', mask)
            if (k < 1) raf = requestAnimationFrame(open)
            else { off(); setState('gone') }
          }
          raf = requestAnimationFrame(open)
        }
      }
      raf = requestAnimationFrame(tick)
    }

    let started = false
    const begin = () => { if (!started) { started = true; start() } }
    // A cut to a picture that hasn't loaded would be a black frame, so decode them first.
    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      ...REEL.filter((r) => r.src).map((r) => { const i = new Image(); i.src = r.src!; return i.decode().catch(() => {}) }),
    ]).then(begin)
    const cap = window.setTimeout(begin, 1200)

    return () => {
      ended = true
      clearTimeout(cap)
      cancelAnimationFrame(raf)
      off()
    }
  }, [])

  if (state === 'gone') return null

  return (
    <div ref={root} className={`ix ${state === 'out' ? 'out' : ''}`} aria-hidden>
      <div className="ix-film" />
      <div className="ix-matte">
        <div className="ix-mark">
          {Array.from(WORD).map((ch, i) =>
            i === DOT ? <i key={i} className="ix-dot" /> : <span key={i} className="ix-l">{ch}</span>,
          )}
        </div>
      </div>
      <div className="ix-card"><span className="ix-big" /><span className="ix-sub" /></div>
      <div className="ix-hud mono">
        <span className="ix-reel">Showreel</span>
        <span className="ix-time">00:00:00:00</span>
        <span className="ix-label" />
        <span className="ix-bar"><i className="ix-head" /></span>
      </div>
    </div>
  )
}
