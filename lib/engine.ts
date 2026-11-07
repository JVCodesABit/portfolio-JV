import { CHAPTERS, SAHAY_WORDS, type Chapter } from './data'
import { buildShapes, N, type Shape, type ShapeName } from './shapes'
import { sound } from './sound'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (t: number) => t * t * (3 - 2 * t)
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const mix = (a: number[], b: number[], t: number) =>
  `rgb(${a[0] + (b[0] - a[0]) * t | 0},${a[1] + (b[1] - a[1]) * t | 0},${a[2] + (b[2] - a[2]) * t | 0})`

const STIFF = 88
const DAMP = 10.5
const STEP = 1 / 120
const STAGGER = 0.38
const EMBER = hex('#FF5B26')

type Media = HTMLImageElement | HTMLVideoElement
const mediaSize = (m: Media): [number, number] =>
  m instanceof HTMLVideoElement ? [m.videoWidth, m.videoHeight] : [m.naturalWidth, m.naturalHeight]
const mediaReady = (m: Media) =>
  m instanceof HTMLVideoElement ? m.readyState >= 2 && m.videoWidth > 0 : m.complete && m.naturalWidth > 0

/** Lets something else, like the game, drive the shape and paint around it. */
export interface Takeover {
  shape: ShapeName
  x: number
  y: number
  s: number
  fill: string
  /** multiplies spring stiffness, so a player's morphs feel immediate */
  stiffness: number
  shakeX: number
  shakeY: number
  update(dt: number): void
  paintBack(c: CanvasRenderingContext2D, vw: number, vh: number): void
  paintFront(c: CanvasRenderingContext2D): void
}

interface Layer {
  img: Media
  alpha: number
  box: [number, number, number, number]
  focal: [number, number]
}

interface FlexLetter { el: HTMLElement; x: number; y: number; w: number }

/**
 * The stage. One canvas behind the DOM drawing one spring-driven loop of points
 * and the colour flood that pours out of it. Everything is a function of scroll
 * position plus a little physics, so scrolling backwards simply plays it in reverse.
 */
class Stage {
  private canvas!: HTMLCanvasElement
  private ctx!: CanvasRenderingContext2D
  private shapes!: Record<ShapeName, Shape>
  private vw = 0
  private vh = 0
  private dpr = 1
  private mobile = false
  private reduced = false
  private raf = 0
  private mounted = false

  private p = new Float32Array(N * 2)
  private v = new Float32Array(N * 2)
  private target = new Float32Array(N * 2)
  private stiff = new Float32Array(N)

  private chEls: HTMLElement[] = []
  private chInner: (HTMLElement | null)[] = []
  private chTop: number[] = []
  private chH: number[] = []
  private chVis: number[] = []
  private chTargets: Float32Array[] = []
  private colors = CHAPTERS.map((c) => ({ bg: hex(c.bg), fill: hex(c.fill), fg: hex(c.fg) }))

  private focusShape: ShapeName | null = null
  private focusImg: string | null = null
  private focusAmt = 0
  private focusOn = false
  private focusTargets = new Float32Array(N * 2)
  private focusFor = ''

  private caseId: string | null = null
  private caseAmt = 0
  private caseFill: number[] = [0, 0, 0]
  private caseCur: number[] = [0, 0, 0]
  private rectTargets = new Float32Array(N * 2)

  private layers = new Map<string, Layer>()
  private images = new Map<string, Media>()
  private videoOff = false
  private videoFailed = new Set<string>()
  private videoStarting = new Set<HTMLVideoElement>()

  private takeover: Takeover | null = null
  private stiffMul = 1
  private presses: number[] = []
  private speedTick = 0
  private introFill = 0
  private cycleIdx = CHAPTERS.findIndex((c) => c.cycle)
  private cycleStep = -1
  private cycleClock = 0

  private mx = -9999
  private my = -9999
  private mvx = 0
  private mvy = 0
  private hasPointer = false

  private lastT = 0
  private mountedAt = 0
  private acc = 0
  private time = 0
  private lastScroll = 0
  private scrollV = 0
  private intro = 0
  private activeIdx = -1
  private displayFont = 'sans-serif'

  private letters: FlexLetter[] = []
  private letterW = new Map<HTMLElement, number>()

  onActive?: (c: Chapter, i: number) => void
  onSecret?: () => void
  /** set by the Stage component; used for anchor jumps and to freeze scroll in overlays */
  lenis?: { scrollTo: (t: string | HTMLElement | number, o?: Record<string, unknown>) => void; stop: () => void; start: () => void }

  mount(canvas: HTMLCanvasElement) {
    if (this.mounted) return
    this.mounted = true
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: false })!
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    this.hasPointer = matchMedia('(hover: hover) and (pointer: fine)').matches
    this.shapes = buildShapes()
    for (let i = 0; i < N; i++) this.stiff[i] = STIFF * (1 + 0.08 * Math.sin((i / N) * Math.PI * 6))
    this.displayFont = getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim() || 'sans-serif'

    this.chEls = CHAPTERS.map((c) => document.getElementById(c.id)!)
    this.chInner = this.chEls.map((e) => e?.querySelector<HTMLElement>('[data-vis]') ?? null)
    this.chVis = CHAPTERS.map(() => -1)

    this.measure()
    this.preload()

    const skipIntro = this.reduced || window.scrollY > 80
    this.intro = skipIntro ? 2 : 0
    this.seed(skipIntro)
    if (skipIntro) document.documentElement.classList.add('ready', 'no-intro')

    addEventListener('resize', this.onResize)
    addEventListener('pointermove', this.onMove, { passive: true })
    addEventListener('pointerdown', this.onDown, { passive: true })
    document.addEventListener('pointerover', this.onHover, { passive: true })
    document.addEventListener('focusin', this.onHover)
    document.addEventListener('focusout', this.onOut)
    if (document.fonts?.ready) document.fonts.ready.then(() => { this.measure(); this.measureLetters() })

    const ro = new ResizeObserver(() => this.measure())
    ro.observe(document.body)

    this.lastT = performance.now()
    this.mountedAt = this.lastT
    this.lastScroll = window.scrollY
    this.raf = requestAnimationFrame(this.frame)
  }

  openCase(id: string) {
    const c = CHAPTERS.find((x) => x.id === id)
    if (!c) return
    this.caseFill = hex(c.fill)
    if (!this.caseId) this.caseCur = this.caseFill
    this.caseId = id
    this.focusOn = false
  }
  closeCase() { this.caseId = null }

  /** The wordmark's dot becomes the shape: same place, same size, same colour. */
  releaseIntro(x: number, y: number, diameter: number) {
    if (this.intro === 2) return
    const c = this.shapes.circle.pts
    for (let i = 0; i < N * 2; i += 2) {
      this.p[i] = x + c[i] * diameter
      this.p[i + 1] = y + c[i + 1] * diameter
    }
    this.v.fill(0)
    this.intro = 2
    this.introFill = 1
    document.documentElement.classList.add('ready')
    this.measureLetters()
  }

  startTakeover(t: Takeover) {
    this.takeover = t
    this.focusOn = false
  }
  endTakeover() {
    this.takeover = null
    this.stiffMul = 1
  }
  activeBg() { return CHAPTERS[Math.max(0, this.activeIdx)].bg }
  activeFill() { return CHAPTERS[Math.max(0, this.activeIdx)].fill }
  shapePoints(name: ShapeName) { return this.shapes[name].pts }
  sizeFor(s: number) { return s * this.base() }
  centre(x: number, y: number): [number, number] { return [x * this.vw, y * this.vh] }

  /** Sends a ripple through the shape from a point. */
  ripple(x: number, y: number, force = 1500) {
    if (this.reduced) return
    for (let i = 0; i < N; i++) {
      const dx = this.p[i * 2] - x
      const dy = this.p[i * 2 + 1] - y
      const d = Math.hypot(dx, dy) || 1
      const f = force * Math.exp(-d / 240)
      this.v[i * 2] += (dx / d) * f
      this.v[i * 2 + 1] += (dy / d) * f
    }
  }

  /* ───────────── setup ───────────── */

  private preload() {
    const urls = new Set<string>()
    CHAPTERS.forEach((c) => c.images?.forEach((u) => urls.add(u)))
    document.querySelectorAll<HTMLElement>('[data-morph-img]').forEach((e) => urls.add(e.dataset.morphImg!))
    urls.forEach((u) => {
      const img = new Image()
      img.decoding = 'async'
      img.src = u
      this.images.set(u, img)
    })

    const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection
    this.videoOff = this.reduced || !!conn?.saveData
    if (this.videoOff) return
    // Kept in the DOM because some mobile browsers won't decode a detached video.
    const holder = document.createElement('div')
    holder.setAttribute('aria-hidden', 'true')
    holder.style.cssText = 'position:fixed;left:0;top:0;width:2px;height:2px;opacity:0;pointer-events:none;overflow:hidden;z-index:-2'
    document.body.appendChild(holder)
    CHAPTERS.forEach((c) => {
      if (!c.video) return
      const v = document.createElement('video')
      v.muted = true
      v.loop = true
      v.playsInline = true
      v.preload = 'none'
      v.setAttribute('muted', '')
      v.setAttribute('playsinline', '')
      v.addEventListener('error', () => this.videoFailed.add(c.video!))
      holder.appendChild(v)
      this.images.set(c.video, v)
    })
  }

  private seed(atHero: boolean) {
    const src = atHero ? this.currentTargets() : this.place('circle', { x: 0.5, y: 0.5, s: 0.01 })
    this.p.set(src)
    this.v.fill(0)
  }

  private currentTargets() {
    const { i } = this.progress()
    return this.chTargets[i] ?? this.chTargets[0]
  }

  private placeOf(c: Chapter) { return this.mobile ? c.placeM : c.place }

  /** Desktop shapes live in the right 60% of the page; size against that, not the whole width. */
  private base() { return this.mobile ? Math.min(this.vw, this.vh) : Math.min(this.vw * 0.6, this.vh) }

  private place(name: ShapeName, pl: { x: number; y: number; s: number }, out: Float32Array = new Float32Array(N * 2)) {
    const shape = this.shapes[name].pts
    const size = pl.s * this.base()
    const cx = pl.x * this.vw
    const cy = pl.y * this.vh
    for (let i = 0; i < N * 2; i += 2) {
      out[i] = cx + shape[i] * size
      out[i + 1] = cy + shape[i + 1] * size
    }
    return out
  }

  private boxOf(name: ShapeName, pl: { x: number; y: number; s: number }): Layer['box'] {
    const s = this.shapes[name]
    const size = pl.s * this.base()
    const w = s.w * size
    const h = s.h * size
    return [pl.x * this.vw - w / 2, pl.y * this.vh - h / 2, w, h]
  }

  private onResize = () => {
    const nextW = innerWidth
    const nextH = innerHeight
    // Ignore the mobile URL bar collapsing: it would rescale everything mid-scroll.
    if (!this.hasPointer && nextW === this.vw && Math.abs(nextH - this.vh) < 140) return
    this.measure()
    this.measureLetters()
    this.focusFor = ''
  }

  private measure() {
    const w = innerWidth
    const h = innerHeight
    const sizeChanged = w !== this.vw || h !== this.vh
    this.vw = w
    this.vh = h
    this.mobile = w < 860
    if (sizeChanged) {
      this.dpr = Math.min(devicePixelRatio || 1, this.mobile ? 1.5 : 2)
      this.canvas.width = Math.round(w * this.dpr)
      this.canvas.height = Math.round(h * this.dpr)
      this.chTargets = CHAPTERS.map((c) => this.place(c.shape, this.placeOf(c)))
      this.cycleStep = -1
      const sq = this.shapes.square.pts
      for (let i = 0; i < N * 2; i += 2) {
        this.rectTargets[i] = w / 2 + sq[i] * (w + 160)
        this.rectTargets[i + 1] = h / 2 + sq[i + 1] * (h + 160)
      }
    }
    const y = window.scrollY
    this.chTop = this.chEls.map((e) => e.getBoundingClientRect().top + y)
    this.chH = this.chEls.map((e) => e.offsetHeight)
  }

  /* ───────────── input ───────────── */

  private onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    this.mvx = e.clientX - this.mx
    this.mvy = e.clientY - this.my
    this.mx = e.clientX
    this.my = e.clientY
  }

  /** A press sends a ripple through the shape. */
  private onDown = (e: PointerEvent) => {
    if (this.caseId || this.takeover) return
    const target = e.target as HTMLElement | null
    const onControl = target?.closest?.('a, button, .pit, .morph-word, .menu')
    if (onControl) return
    if (this.intro === 2) this.countPress(e.clientX, e.clientY)
    sound.thud()
    this.ripple(e.clientX, e.clientY)
  }

  /** Five quick presses on the shape opens the hidden game. */
  private countPress(x: number, y: number) {
    const c = this.ctx
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.tracePath(c)
    if (!c.isPointInPath(x * this.dpr, y * this.dpr)) { this.presses = []; return }
    const now = performance.now()
    this.presses = this.presses.filter((t) => now - t < 2600)
    this.presses.push(now)
    if (this.presses.length >= 5) {
      this.presses = []
      this.onSecret?.()
    }
  }

  private onHover = (e: Event) => {
    const el = (e.target as HTMLElement)?.closest?.('[data-morph]') as HTMLElement | null
    if (el) {
      if (!this.focusOn || this.focusShape !== el.dataset.morph) sound.note(7 + (el.dataset.morph!.length % 5), 0.3)
      this.focusShape = el.dataset.morph as ShapeName
      this.focusImg = el.dataset.morphImg ?? null
      this.focusOn = true
      this.focusFor = ''
    } else if (e.type === 'pointerover') {
      this.focusOn = false
    }
  }
  private onOut = (e: FocusEvent) => {
    if ((e.target as HTMLElement)?.closest?.('[data-morph]')) this.focusOn = false
  }

  /* ───────────── letters that swell under the cursor ───────────── */

  measureLetters() {
    if (this.reduced || !this.hasPointer) return
    const y = scrollY
    this.letters = Array.from(document.querySelectorAll<HTMLElement>('[data-flex] .ltr')).map((el) => {
      const r = el.parentElement!.getBoundingClientRect()
      return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 + y, w: r.height }
    })
  }

  private flexLetters(dt: number, scroll: number) {
    if (!this.letters.length) return
    const k = 1 - Math.exp(-dt * 12)
    for (const l of this.letters) {
      const sy = l.y - scroll
      if (sy < -300 || sy > this.vh + 300) continue
      const reach = l.w * 1.5
      const d = Math.hypot(this.mx - l.x, this.my - sy)
      const q = smooth(clamp(1 - d / reach))
      const target = 780 - q * 580
      const cur = this.letterW.get(l.el) ?? 780
      const next = cur + (target - cur) * k
      if (Math.abs(next - cur) > 0.4) {
        l.el.style.fontVariationSettings = `"wght" ${next.toFixed(0)}, "wdth" ${(78 + q * 22).toFixed(1)}, "opsz" 96`
        this.letterW.set(l.el, next)
      }
    }
  }

  /* ───────────── main loop ───────────── */

  /** Flood progress from chapter i to i+1 is read straight from layout. */
  private progress(scroll = window.scrollY) {
    let i = 0
    let t = 0
    const n = CHAPTERS.length
    for (let j = 0; j < n - 1; j++) {
      const top = this.chTop[j + 1] - scroll
      const tj = clamp((0.92 * this.vh - top) / (0.6 * this.vh))
      if (tj >= 1) { i = j + 1; t = 0 } else { i = j; t = tj; break }
    }
    return { i, t }
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame)
    const dt = Math.min((now - this.lastT) / 1000, 0.05)
    this.lastT = now
    this.time += dt

    const scroll = window.scrollY
    this.scrollV += ((scroll - this.lastScroll) / Math.max(dt, 0.001) - this.scrollV) * (1 - Math.exp(-dt * 10))
    this.lastScroll = scroll

    const { i, t } = this.progress(scroll)
    const next = Math.min(i + 1, CHAPTERS.length - 1)
    const active = t > 0.5 ? next : i

    this.updateVisibility(i, t, scroll)
    if (active !== this.activeIdx) {
      if (this.activeIdx >= 0) sound.note(active, 0.55)
      this.activeIdx = active
      this.onActive?.(CHAPTERS[active], active)
    }
    this.syncVideos(active)

    if (this.takeover) {
      this.frameTakeover(this.takeover, dt)
      return
    }

    this.focusAmt += ((this.focusOn ? 1 : 0) - this.focusAmt) * (1 - Math.exp(-dt * 9))
    this.caseAmt += ((this.caseId ? 1 : 0) - this.caseAmt) * (1 - Math.exp(-dt * 5.5))

    this.updateCycle(active, dt)
    this.composeTargets(i, next, t, active)
    this.simulate(dt)
    this.flexLetters(dt, scroll)
    this.draw(dt, i, next, t, active, scroll)

    this.mvx *= 0.8
    this.mvy *= 0.8
  }

  /** Steps the closing section's shape through its list while it is on screen. */
  private updateCycle(active: number, dt: number) {
    const c = CHAPTERS[this.cycleIdx]
    if (!c?.cycle) return
    const last = c.cycle.length - 1
    let step = this.reduced ? last : 0
    if (!this.reduced && active === this.cycleIdx) {
      this.cycleClock += dt
      const hold = this.cycleStep === last ? 3.6 : 1.55
      if (this.cycleClock >= hold) {
        this.cycleClock = 0
        step = (Math.max(this.cycleStep, 0) + 1) % c.cycle.length
        sound.note(step + 6, 0.3)
      } else {
        step = Math.max(this.cycleStep, 0)
      }
    } else {
      this.cycleClock = 0
    }
    if (step !== this.cycleStep) {
      this.cycleStep = step
      this.place(c.cycle[step].shape, this.placeOf(c), this.chTargets[this.cycleIdx])
    }
  }

  private drawCycleLabel(c: CanvasRenderingContext2D, i: number, next: number, t: number) {
    const ch = CHAPTERS[this.cycleIdx]
    if (!ch?.cycle || this.cycleStep < 0) return
    const inView = i === this.cycleIdx ? 1 : next === this.cycleIdx ? clamp((t - 0.65) / 0.35) : 0
    if (inView <= 0) return
    const hold = this.cycleStep === ch.cycle.length - 1 ? 3.6 : 1.55
    // The word appears once the morph has settled and leaves just before the next one.
    const fade = this.reduced ? 1 : Math.min(clamp((this.cycleClock - 0.3) / 0.25), clamp((hold - this.cycleClock) / 0.16))
    if (fade <= 0) return
    const item = ch.cycle[this.cycleStep]
    const pl = this.placeOf(ch)
    const size = pl.s * this.base()
    c.save()
    c.globalAlpha = inView * fade
    c.fillStyle = ch.bg
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    const isLast = this.cycleStep === ch.cycle.length - 1
    let fs = size * (isLast ? 0.25 : 0.17)
    c.font = `760 ${fs}px ${this.displayFont}`
    const room = size * (item.fit ?? 0.8)
    const w = c.measureText(item.label).width
    if (w > room) {
      fs *= room / w
      c.font = `760 ${fs}px ${this.displayFont}`
    }
    c.fillText(item.label, pl.x * this.vw + (item.dx ?? 0) * size, pl.y * this.vh + (item.dy ?? 0) * size + (1 - fade) * 10)
    c.restore()
  }

  private frameTakeover(t: Takeover, dt: number) {
    t.update(dt)
    if (this.takeover !== t) return
    this.stiffMul = t.stiffness
    this.place(t.shape, { x: t.x, y: t.y, s: t.s }, this.target)
    this.simulate(dt)
    const c = this.ctx
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    c.translate(t.shakeX, t.shakeY)
    t.paintBack(c, this.vw, this.vh)
    c.fillStyle = t.fill
    this.tracePath(c)
    c.fill()
    t.paintFront(c)
  }

  /** Only the chapter on screen plays; its neighbours buffer ahead of time. */
  private syncVideos(active: number) {
    if (this.videoOff) return
    CHAPTERS.forEach((c, idx) => {
      if (!c.video || this.videoFailed.has(c.video)) return
      const v = this.images.get(c.video) as HTMLVideoElement | undefined
      if (!v) return
      if (Math.abs(idx - active) <= 1 && !v.getAttribute('src')) {
        v.preload = 'auto'
        v.src = c.video
      }
      const play = idx === active && !this.caseId && !this.takeover && !document.hidden
      if (play && v.paused && v.getAttribute('src') && !this.videoStarting.has(v)) {
        this.videoStarting.add(v)
        v.play()
          .catch(() => this.videoFailed.add(c.video!))
          .finally(() => this.videoStarting.delete(v))
      } else if (!play && !v.paused) {
        v.pause()
      }
    })
  }

  private updateVisibility(i: number, t: number, scroll: number) {
    const n = CHAPTERS.length
    for (let j = 0; j < n; j++) {
      const el = this.chInner[j]
      if (!el) continue
      const tIn = j === 0 ? 1 : this.tOf(j - 1, scroll)
      const tOut = j === n - 1 ? 0 : this.tOf(j, scroll)
      const vis = Math.min(clamp((tIn - 0.5) / 0.38), clamp(1 - tOut / 0.42))
      if (Math.abs(vis - this.chVis[j]) > 0.004) {
        this.chVis[j] = vis
        el.style.opacity = vis >= 0.995 ? '1' : vis.toFixed(3)
        el.style.visibility = vis <= 0.004 ? 'hidden' : 'visible'
      }
    }
  }

  private tOf(j: number, scroll: number) {
    const top = this.chTop[j + 1] - scroll
    return clamp((0.92 * this.vh - top) / (0.6 * this.vh))
  }

  private composeTargets(i: number, next: number, t: number, active: number) {
    const A = this.chTargets[i]
    const B = this.chTargets[next]
    const out = this.target
    const chA = CHAPTERS[i]
    const chB = CHAPTERS[next]
    const plA = this.placeOf(chA)
    const plB = this.placeOf(chB)
    const ax = plA.x * this.vw, ay = plA.y * this.vh
    const bx = plB.x * this.vw, by = plB.y * this.vh
    const rotA = (chA.spin ?? 0) * this.time
    const rotB = (chB.spin ?? 0) * this.time
    const ca = Math.cos(rotA), sa = Math.sin(rotA), cb = Math.cos(rotB), sb = Math.sin(rotB)

    if (this.focusOn && this.focusShape && this.focusFor !== this.focusShape + active) {
      this.focusFor = this.focusShape + active
      this.place(this.focusShape, this.placeOf(CHAPTERS[active]), this.focusTargets)
    }
    const fe = this.focusAmt < 0.001 ? 0 : smooth(clamp(this.focusAmt))
    const ce = this.caseAmt < 0.001 ? 0 : smooth(clamp(this.caseAmt * 1.03))
    const tgtPl = this.placeOf(CHAPTERS[active])
    const fcx = tgtPl.x * this.vw, fcy = tgtPl.y * this.vh

    const stretch = this.reduced ? 0 : clamp(this.scrollV / 5000, -0.16, 0.16)
    const breathe = this.reduced ? 0 : this.mobile ? 2.5 : 4
    const tm = this.time

    // Held still until the wordmark hands over its dot. The timeout is only a safety net.
    let introPts: Float32Array | null = null
    if (this.intro < 2) {
      if (performance.now() - this.mountedAt > 6000) this.releaseIntro(this.vw / 2, this.vh / 2, 20)
      else introPts = this.p
    }

    for (let v = 0; v < N; v++) {
      const k = v * 2
      const phase = v / N
      const local = this.reduced ? t : smooth(clamp(t * (1 + STAGGER) - STAGGER * phase))

      let x0 = A[k], y0 = A[k + 1]
      if (rotA) { const dx = x0 - ax, dy = y0 - ay; x0 = ax + dx * ca - dy * sa; y0 = ay + dx * sa + dy * ca }
      let x1 = B[k], y1 = B[k + 1]
      if (rotB) { const dx = x1 - bx, dy = y1 - by; x1 = bx + dx * cb - dy * sb; y1 = by + dx * sb + dy * cb }

      let x = x0 + (x1 - x0) * local
      let y = y0 + (y1 - y0) * local

      if (fe) {
        x += (this.focusTargets[k] - x) * fe
        y += (this.focusTargets[k + 1] - y) * fe
      }

      const nx = x - fcx, ny = y - fcy
      const nl = Math.hypot(nx, ny) || 1
      if (breathe && !ce) {
        const w = Math.sin(tm * 1.1 + phase * Math.PI * 6) + 0.6 * Math.sin(tm * 0.7 - phase * Math.PI * 10)
        x += (nx / nl) * w * breathe
        y += (ny / nl) * w * breathe
      }
      if (stretch) {
        x -= nx * Math.abs(stretch) * 0.45
        y += ny * Math.abs(stretch)
      }
      if (ce) {
        x += (this.rectTargets[k] - x) * ce
        y += (this.rectTargets[k + 1] - y) * ce
      }
      if (introPts) { x = introPts[k]; y = introPts[k + 1] }

      out[k] = x
      out[k + 1] = y
    }
  }

  private simulate(dt: number) {
    const { p, v, target } = this
    if (this.reduced) { p.set(target); return }

    if (this.hasPointer && !this.caseId && !this.takeover) {
      const R = 150
      const push = Math.min(Math.hypot(this.mvx, this.mvy), 60)
      for (let i = 0; i < N; i++) {
        const k = i * 2
        const dx = p[k] - this.mx
        const dy = p[k + 1] - this.my
        const d = Math.hypot(dx, dy)
        if (d < R && d > 0.001) {
          const q = 1 - d / R
          const f = q * q * (260 + push * 26) * dt * 60
          v[k] += (dx / d) * f * 0.25
          v[k + 1] += (dy / d) * f * 0.25
        }
      }
    }

    const damp = DAMP * Math.sqrt(this.stiffMul)
    this.acc += dt
    let steps = 0
    while (this.acc >= STEP && steps < 8) {
      for (let i = 0; i < N; i++) {
        const k = i * 2
        const s = this.stiff[i] * this.stiffMul
        v[k] += ((target[k] - p[k]) * s - v[k] * damp) * STEP
        v[k + 1] += ((target[k + 1] - p[k + 1]) * s - v[k + 1] * damp) * STEP
        p[k] += v[k] * STEP
        p[k + 1] += v[k + 1] * STEP
      }
      this.acc -= STEP
      steps++
    }
    if (steps === 8) this.acc = 0

    if (sound.on && ++this.speedTick % 3 === 0) {
      let sum = 0
      for (let i = 0; i < N; i += 7) sum += Math.abs(v[i * 2]) + Math.abs(v[i * 2 + 1])
      sound.setSpeed(sum / (N / 7))
    }
  }

  /* ───────────── drawing ───────────── */

  private tracePath(c: CanvasRenderingContext2D) {
    const p = this.p
    c.beginPath()
    let px = (p[(N - 1) * 2] + p[0]) / 2
    let py = (p[(N - 1) * 2 + 1] + p[1]) / 2
    c.moveTo(px, py)
    for (let i = 0; i < N; i++) {
      const k = i * 2
      const j = (i + 1) % N
      px = (p[k] + p[j * 2]) / 2
      py = (p[k + 1] + p[j * 2 + 1]) / 2
      c.quadraticCurveTo(p[k], p[k + 1], px, py)
    }
    c.closePath()
  }

  private centroid() {
    let x = 0, y = 0
    for (let i = 0; i < N; i++) { x += this.p[i * 2]; y += this.p[i * 2 + 1] }
    return [x / N, y / N]
  }

  private draw(dt: number, i: number, next: number, t: number, active: number, scroll: number) {
    const c = this.ctx
    const { vw, vh } = this
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)

    const a = this.colors[i]
    const b = this.colors[next]
    c.fillStyle = `rgb(${a.bg[0]},${a.bg[1]},${a.bg[2]})`
    c.fillRect(0, 0, vw, vh)
    if (this.intro < 2) return

    const [cx, cy] = this.centroid()

    // The flood pours out of the shape's centre.
    if (t > 0 && next !== i) {
      c.fillStyle = `rgb(${b.bg[0]},${b.bg[1]},${b.bg[2]})`
      if (this.reduced) {
        c.globalAlpha = t
        c.fillRect(0, 0, vw, vh)
        c.globalAlpha = 1
      } else {
        const far = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) * 1.14
        const r = smooth(t) * far
        c.beginPath()
        const steps = 90
        for (let s = 0; s <= steps; s++) {
          const ang = (s / steps) * Math.PI * 2
          const w = 1 + 0.035 * Math.sin(ang * 3 + this.time * 1.4) + 0.02 * Math.sin(ang * 7 - this.time)
          const x = cx + Math.cos(ang) * r * w
          const y = cy + Math.sin(ang) * r * w
          if (s) c.lineTo(x, y); else c.moveTo(x, y)
        }
        c.closePath()
        c.fill()
      }
    }

    // Orbits behind nothing: only Orbis has them.
    const orbitAmt = (CHAPTERS[i].orbit ? 1 - clamp(t / 0.3) : 0) + (CHAPTERS[next].orbit ? clamp((t - 0.7) / 0.3) : 0)

    // Shape
    const fm = smooth(clamp((t - 0.25) / 0.5))
    let fillStyle = mix(a.fill, b.fill, fm)
    if (this.caseAmt > 0.002) {
      const m = smooth(clamp(this.caseAmt * 1.4))
      const r = a.fill.map((v, x) => v + (b.fill[x] - v) * fm)
      this.caseCur = this.caseCur.map((v, x) => v + (this.caseFill[x] - v) * (1 - Math.exp(-dt * 8)))
      fillStyle = mix(r, this.caseCur, m)
    }
    if (this.introFill > 0) {
      fillStyle = mix(EMBER, a.fill, smooth(1 - this.introFill))
      this.introFill = Math.max(0, this.introFill - dt * 1.7)
    }
    c.fillStyle = fillStyle
    this.tracePath(c)
    c.fill()
    if (this.caseAmt > 0.985) c.fillRect(0, 0, vw, vh)

    // Images inside
    const key = this.activeImage(active, scroll)
    this.updateLayers(key, active, dt)
    const kinetic = (CHAPTERS[i].kinetic ? 1 - clamp(t / 0.35) : 0) + (CHAPTERS[next].kinetic ? clamp((t - 0.65) / 0.35) : 0)
    let anyLayer = kinetic > 0.01 && this.caseAmt < 0.5
    this.layers.forEach((l) => { if (l.alpha > 0.01) anyLayer = true })

    if (anyLayer) {
      c.save()
      this.tracePath(c)
      c.clip()
      this.layers.forEach((l) => {
        if (l.alpha <= 0.01 || !mediaReady(l.img)) return
        c.globalAlpha = l.alpha
        this.drawCover(c, l)
      })
      c.globalAlpha = 1
      if (kinetic > 0.01 && this.caseAmt < 0.5) this.drawKinetic(c, active, kinetic * (1 - this.caseAmt * 2))
      c.restore()
    }

    this.drawCycleLabel(c, i, next, t)

    if (orbitAmt > 0.01 && this.caseAmt < 0.3) this.drawOrbit(c, this.placeOf(CHAPTERS[2]), orbitAmt * (1 - this.caseAmt * 3.3), CHAPTERS[2].fg)
  }

  private activeImage(active: number, scroll: number): string | null {
    if (this.caseId) return null
    if (this.focusOn && this.focusImg) return this.focusImg
    const ch = CHAPTERS[active]
    if (!ch.images?.length) return null
    if (this.focusOn && this.focusShape) return null
    if (ch.video && !this.videoOff && !this.videoFailed.has(ch.video)) {
      const v = this.images.get(ch.video) as HTMLVideoElement | undefined
      if (v && mediaReady(v) && !v.paused) return ch.video
    }
    if (ch.images.length === 1) return ch.images[0]
    const span = Math.max(1, this.chH[active] - this.vh)
    const p = clamp((scroll - this.chTop[active]) / span)
    return ch.images[Math.min(ch.images.length - 1, Math.floor(p * ch.images.length))]
  }

  private updateLayers(key: string | null, active: number, dt: number) {
    if (key && !this.layers.has(key)) {
      const img = this.images.get(key)
      if (img) this.layers.set(key, { img, alpha: 0, box: [0, 0, 1, 1], focal: [0.5, 0.5] })
    }
    const ch = CHAPTERS[active]
    const pl = this.placeOf(ch)
    const k = 1 - Math.exp(-dt * (this.intro < 2 ? 0 : 6.5))
    this.layers.forEach((l, name) => {
      const on = name === key
      if (on) {
        const isVideo = name === ch.video
        const isOwn = isVideo || ch.images?.includes(name)
        const shape = this.focusOn && this.focusShape && !isOwn ? this.focusShape : ch.shape
        l.box = this.boxOf(shape, pl)
        l.focal = isVideo ? ch.videoFocal ?? [0.5, 0.5] : isOwn ? ch.focal ?? [0.5, 0.5] : [0.5, 0.5]
      }
      l.alpha += ((on ? 1 : 0) - l.alpha) * k
      if (!on && l.alpha < 0.005) this.layers.delete(name)
    })
  }

  private drawCover(c: CanvasRenderingContext2D, l: Layer) {
    // Bleed past the shape's resting edge, so a wobble never uncovers the fill behind.
    const bleedX = l.box[2] * 0.14
    const bleedY = l.box[3] * 0.14
    const bx = l.box[0] - bleedX
    const by = l.box[1] - bleedY
    const bw = l.box[2] + bleedX * 2
    const bh = l.box[3] + bleedY * 2
    const pad = 1.08
    const [iw, ih] = mediaSize(l.img)
    const s = Math.max((bw * pad) / iw, (bh * pad) / ih)
    const w = iw * s
    const h = ih * s
    const px = this.hasPointer && this.mx > -999 ? ((this.mx / this.vw) - 0.5) * -14 : 0
    const py = this.hasPointer && this.my > -999 ? ((this.my / this.vh) - 0.5) * -14 : 0
    const x = clamp(bx + bw / 2 - w * l.focal[0] + px, bx + bw - w, bx)
    const y = clamp(by + bh / 2 - h * l.focal[1] + py, by + bh - h, by)
    c.drawImage(l.img, x, y, w, h)
  }

  private drawKinetic(c: CanvasRenderingContext2D, active: number, alpha: number) {
    const sahay = CHAPTERS.find((x) => x.kinetic)!
    const pl = this.placeOf(sahay)
    const size = pl.s * this.base()
    const fs = size * 0.105
    const cx = pl.x * this.vw
    const cy = pl.y * this.vh
    c.save()
    c.globalAlpha = alpha
    c.fillStyle = '#15130F'
    c.textAlign = 'center'
    c.textBaseline = 'middle'
    c.font = `720 ${fs}px ${this.displayFont}`
    const lh = fs * 1.14
    const total = SAHAY_WORDS.length * lh
    const off = (this.time * (this.reduced ? 0 : 16)) % total
    for (let r = -1; r < 2; r++) {
      SAHAY_WORDS.forEach((w, n) => {
        const y = cy - total / 2 + n * lh + r * total - off + lh
        if (y > cy - size && y < cy + size) c.fillText(w, cx, y)
      })
    }
    c.restore()
  }

  private drawOrbit(c: CanvasRenderingContext2D, pl: { x: number; y: number; s: number }, alpha: number, color: string) {
    const size = pl.s * this.base()
    const cx = pl.x * this.vw
    const cy = pl.y * this.vh
    const rot = -0.32
    const rings = [[0.6, 0.18, 0.34, 3.6], [0.66, 0.27, -0.21, 2.4]] as const
    c.save()
    c.translate(cx, cy)
    c.rotate(rot)
    c.globalAlpha = alpha
    c.strokeStyle = color
    c.fillStyle = color
    c.lineWidth = 1.25
    rings.forEach(([rx, ry, speed, r], n) => {
      c.beginPath()
      c.ellipse(0, 0, size * rx, size * ry, 0, 0, Math.PI * 2)
      c.stroke()
      const ang = this.time * speed * (this.reduced ? 0 : 1) + n * 2
      c.beginPath()
      c.arc(Math.cos(ang) * size * rx, Math.sin(ang) * size * ry, r * 2.4, 0, Math.PI * 2)
      c.fill()
    })
    c.restore()
  }
}

export const stage = new Stage()
