/**
 * Everything is synthesised, so there are no audio files to load. The main voice
 * is filtered noise whose volume follows how fast the shape's points are moving:
 * you hear the morph itself. Off until the visitor turns it on.
 */
const KEY = 'jv-sound'
const SCALE = [0, 3, 5, 7, 10] // minor pentatonic
const ROOT = 196

class Sound {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private airGain: GainNode | null = null
  private airFilter: BiquadFilterNode | null = null
  private bodyGain: GainNode | null = null
  private bodyOsc: OscillatorNode | null = null
  private listeners = new Set<(on: boolean) => void>()
  private visibilityBound = false
  on = false

  subscribe(fn: (on: boolean) => void) {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  /** Must be called from a user gesture: browsers refuse to start audio otherwise. */
  setOn(next: boolean) {
    this.on = next
    try { localStorage.setItem(KEY, next ? '1' : '0') } catch { /* private window */ }
    if (next) {
      this.init()
      this.ctx?.resume()
      this.master?.gain.setTargetAtTime(0.5, this.ctx!.currentTime, 0.08)
      this.note(4, 0.7)
    } else if (this.ctx && this.master) {
      this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04)
      const ctx = this.ctx
      window.setTimeout(() => { if (!this.on) ctx.suspend() }, 250)
    }
    this.listeners.forEach((l) => l(next))
  }

  wantsOn() {
    try { return localStorage.getItem(KEY) === '1' } catch { return false }
  }

  private init() {
    if (this.ctx) return
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    const ctx = new Ctor()
    this.ctx = ctx

    const comp = ctx.createDynamicsCompressor()
    comp.connect(ctx.destination)
    this.master = ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(comp)

    const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = noise
    src.loop = true
    this.airFilter = ctx.createBiquadFilter()
    this.airFilter.type = 'bandpass'
    this.airFilter.frequency.value = 300
    this.airFilter.Q.value = 0.9
    this.airGain = ctx.createGain()
    this.airGain.gain.value = 0
    src.connect(this.airFilter).connect(this.airGain).connect(this.master)
    src.start()

    this.bodyOsc = ctx.createOscillator()
    this.bodyOsc.type = 'sine'
    this.bodyOsc.frequency.value = 65
    this.bodyGain = ctx.createGain()
    this.bodyGain.gain.value = 0
    this.bodyOsc.connect(this.bodyGain).connect(this.master)
    this.bodyOsc.start()

    if (!this.visibilityBound) {
      this.visibilityBound = true
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return
        if (document.hidden) this.ctx.suspend()
        else if (this.on) this.ctx.resume()
      })
    }
  }

  /** speed: average point speed of the shape, in px/s. */
  setSpeed(speed: number) {
    if (!this.on || !this.ctx || !this.airGain) return
    const e = Math.min(1, Math.max(0, (speed - 30) / 950))
    const t = this.ctx.currentTime
    this.airGain.gain.setTargetAtTime(0.16 * Math.pow(e, 1.3), t, 0.07)
    this.airFilter!.frequency.setTargetAtTime(240 + e * 1700, t, 0.07)
    this.bodyGain!.gain.setTargetAtTime(0.14 * e, t, 0.07)
    this.bodyOsc!.frequency.setTargetAtTime(58 + e * 70, t, 0.1)
  }

  /** A soft plucked note. degree walks up the pentatonic scale across octaves. */
  note(degree: number, vel = 1) {
    if (!this.on || !this.ctx || !this.master) return
    const ctx = this.ctx
    const octave = Math.floor(degree / SCALE.length)
    const semi = SCALE[((degree % SCALE.length) + SCALE.length) % SCALE.length] + 12 * octave
    const f = ROOT * Math.pow(2, semi / 12)
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = f
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(3200, t)
    lp.frequency.exponentialRampToValueAtTime(500, t + 0.45)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.24 * vel, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7)
    osc.connect(lp).connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + 0.75)
  }

  /** The dull knock of pressing on the shape. */
  thud() {
    if (!this.on || !this.ctx || !this.master) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.frequency.setValueAtTime(170, t)
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.14)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.42, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
    osc.connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + 0.26)
  }

  /** Low and rough, for a miss. */
  buzz() {
    if (!this.on || !this.ctx || !this.master) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(92, t)
    osc.frequency.exponentialRampToValueAtTime(46, t + 0.3)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 620
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.3, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34)
    osc.connect(lp).connect(g).connect(this.master)
    osc.start(t)
    osc.stop(t + 0.36)
  }
}

export const sound = new Sound()
