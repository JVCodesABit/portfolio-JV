/**
 * Every shape on the site is the same closed loop of N points. Shapes are
 * authored as SVG paths in a 1000-unit box, resampled by arc length, normalised
 * and rotated so that vertex 0 of any shape sits near vertex 0 of any other.
 * That alignment is what stops morphs from twisting.
 */
export const N = 280

export type ShapeName =
  | 'blob' | 'circle' | 'flower' | 'scallop' | 'star' | 'square'
  | 'J' | 'V' | 'arrow' | 'down' | 'pin' | 'stairs' | 'twin' | 'play' | 'plus'
  | 'bubble' | 'hex' | 'page' | 'envelope' | 'wave' | 'crown' | 'podium' | 'shield'

const PATHS: Partial<Record<ShapeName, [d: string, smooth: number]>> = {
  J: ['M560 90 H810 V640 C810 830 680 920 500 920 C320 920 200 820 170 650 L400 610 C412 685 440 715 495 715 C540 715 560 685 560 630 Z', 3],
  V: ['M110 90 H370 L500 640 L630 90 H890 L640 910 H360 Z', 3],
  arrow: ['M80 360 H490 V110 L930 500 L490 890 V640 H80 Z', 10],
  down: ['M360 70 H640 V500 H920 L500 930 L80 500 H360 Z', 10],
  pin: ['M500 50 C730 50 860 230 860 410 C860 630 620 810 500 960 C380 810 140 630 140 410 C140 230 270 50 500 50 Z', 2],
  stairs: ['M70 930 V650 H340 V400 H620 V80 H930 V930 Z', 9],
  twin: ['M500 300 A 270 270 0 1 1 500 700 A 270 270 0 1 1 500 300 Z', 6],
  play: ['M210 80 L890 500 L210 920 Z', 14],
  plus: ['M360 80 H640 V360 H920 V640 H640 V920 H360 V640 H80 V360 H360 Z', 8],
  bubble: ['M160 130 H840 C890 130 920 160 920 210 V640 C920 690 890 720 840 720 H440 L240 900 V720 H160 C110 720 80 690 80 640 V210 C80 160 110 130 160 130 Z', 3],
  hex: ['M500 60 L890 285 V715 L500 940 L110 715 V285 Z', 8],
  page: ['M180 60 H640 L830 250 V940 H180 Z', 6],
  envelope: ['M80 220 L500 500 L920 220 V790 H80 Z', 6],
  wave: ['M70 420 C220 230 360 230 500 420 C640 610 780 610 930 420 V790 H70 Z', 5],
  crown: ['M110 830 L60 240 L310 480 L500 120 L690 480 L940 240 L890 830 Z', 7],
  podium: ['M50 910 V560 H350 V270 H650 V650 H950 V910 Z', 8],
  shield: ['M500 60 L890 195 V500 C890 720 720 870 500 950 C280 870 110 720 110 500 V195 Z', 4],
  square: ['M0 0 H1000 V1000 H0 Z', 0],
}

type Polar = (a: number) => number
const POLAR: Partial<Record<ShapeName, Polar>> = {
  circle: () => 1,
  blob: (a) => 1 + 0.055 * Math.sin(2 * a + 0.6) + 0.04 * Math.sin(3 * a - 1.1) + 0.02 * Math.sin(5 * a + 2.1),
  flower: (a) => 0.76 + 0.24 * Math.cos(6 * a),
  scallop: (a) => 0.92 + 0.08 * Math.cos(14 * a),
  star: (a) => {
    const k = (Math.PI * 2) / 5
    const m = ((a + Math.PI / 2) % k + k) % k
    const u = Math.abs(m / k - 0.5) * 2
    return 0.52 + 0.48 * Math.pow(u, 1.35)
  },
}

export interface Shape {
  /** interleaved x,y — fits inside [-0.5, 0.5], centred on its bounding box */
  pts: Float32Array
  w: number
  h: number
}

function samplePath(d: string): Float32Array {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  el.setAttribute('d', d)
  const len = el.getTotalLength()
  const out = new Float32Array(N * 2)
  for (let i = 0; i < N; i++) {
    const p = el.getPointAtLength((i / N) * len)
    out[i * 2] = p.x
    out[i * 2 + 1] = p.y
  }
  return out
}

function samplePolar(fn: Polar): Float32Array {
  const out = new Float32Array(N * 2)
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2
    const r = fn(a)
    out[i * 2] = Math.cos(a) * r
    out[i * 2 + 1] = Math.sin(a) * r
  }
  return out
}

/** Laplacian passes round the hard corners so springs have something soft to hold. */
function relax(p: Float32Array, passes: number) {
  for (let k = 0; k < passes; k++) {
    const c = p.slice()
    for (let i = 0; i < N; i++) {
      const a = (i + N - 1) % N
      const b = (i + 1) % N
      p[i * 2] = (c[a * 2] + 2 * c[i * 2] + c[b * 2]) / 4
      p[i * 2 + 1] = (c[a * 2 + 1] + 2 * c[i * 2 + 1] + c[b * 2 + 1]) / 4
    }
  }
}

function normalise(p: Float32Array) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
  for (let i = 0; i < N; i++) {
    x0 = Math.min(x0, p[i * 2]); x1 = Math.max(x1, p[i * 2])
    y0 = Math.min(y0, p[i * 2 + 1]); y1 = Math.max(y1, p[i * 2 + 1])
  }
  const s = 1 / Math.max(x1 - x0, y1 - y0)
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  for (let i = 0; i < N; i++) {
    p[i * 2] = (p[i * 2] - cx) * s
    p[i * 2 + 1] = (p[i * 2 + 1] - cy) * s
  }
  return { w: (x1 - x0) * s, h: (y1 - y0) * s }
}

function orient(p: Float32Array) {
  let area = 0
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N
    area += p[i * 2] * p[j * 2 + 1] - p[j * 2] * p[i * 2 + 1]
  }
  if (area >= 0) return p
  const r = new Float32Array(N * 2)
  for (let i = 0; i < N; i++) {
    r[i * 2] = p[(N - 1 - i) * 2]
    r[i * 2 + 1] = p[(N - 1 - i) * 2 + 1]
  }
  return r
}

function align(p: Float32Array, ref: Float32Array) {
  let best = 0
  let bestD = Infinity
  for (let o = 0; o < N; o++) {
    let d = 0
    for (let i = 0; i < N; i++) {
      const j = (i + o) % N
      const dx = p[j * 2] - ref[i * 2]
      const dy = p[j * 2 + 1] - ref[i * 2 + 1]
      d += dx * dx + dy * dy
    }
    if (d < bestD) { bestD = d; best = o }
  }
  const r = new Float32Array(N * 2)
  for (let i = 0; i < N; i++) {
    const j = (i + best) % N
    r[i * 2] = p[j * 2]
    r[i * 2 + 1] = p[j * 2 + 1]
  }
  return r
}

export function buildShapes(): Record<ShapeName, Shape> {
  const ref = samplePolar(() => 0.5)
  const out = {} as Record<ShapeName, Shape>
  const names = [...Object.keys(PATHS), ...Object.keys(POLAR)] as ShapeName[]
  for (const name of names) {
    const def = PATHS[name]
    const raw = def ? samplePath(def[0]) : samplePolar(POLAR[name]!)
    if (def) relax(raw, def[1])
    const { w, h } = normalise(raw)
    out[name] = { pts: align(orient(raw), ref), w, h }
  }
  return out
}
