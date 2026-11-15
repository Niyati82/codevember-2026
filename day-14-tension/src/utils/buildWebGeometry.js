import * as THREE from 'three'

const TAU = Math.PI * 2

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * One layer of the web: a polar grid (rings x segments) whose vertices are
 * jittered and domain-warped so the mesh feels organic rather than mechanical.
 * Only normalised polar coordinates (r in 0..1, theta) are stored; the actual
 * 3D shape and animation are computed in the vertex shader.
 */
function buildLayer(cfg) {
  const { rings, segs, jitter, seed, rotate, brightness, diag, rMin } = cfg
  const rand = mulberry32(seed)
  const randLine = mulberry32(seed + 101)

  const count = (rings + 1) * segs
  const polar = new Float32Array(count * 2)
  const seeds = new Float32Array(count)
  const rBaseOf = new Float32Array(rings + 1)

  const dTheta = TAU / segs
  const dR = (1 - rMin) / rings
  const idx = (i, j) => i * segs + ((j % segs) + segs) % segs

  for (let i = 0; i <= rings; i++) {
    const u = i / rings
    const rBase = rMin + (1 - rMin) * Math.pow(u, 0.92)
    rBaseOf[i] = rBase
    for (let j = 0; j < segs; j++) {
      let r = rBase + (rand() - 0.5) * jitter * dR
      let th = j * dTheta + rotate + (rand() - 0.5) * jitter * dTheta * 0.8

      // gentle, periodic domain warp -> curved, woven look
      th += 0.05 * Math.sin(r * 9.0 + th * 3.0)
      r += 0.006 * Math.sin(th * 5.0 + r * 7.0)
      r = Math.min(Math.max(r, 0.004), 1.0)

      const v = idx(i, j)
      polar[v * 2] = r
      polar[v * 2 + 1] = th
      seeds[v] = rand() * brightness
    }
  }

  // radial/diagonal lines are thinned near the centre to avoid a hot spot
  const stepFor = (r) => (r < 0.12 ? 8 : r < 0.24 ? 4 : r < 0.4 ? 2 : 1)

  const lines = []
  for (let i = 0; i <= rings; i++) {
    const k = stepFor(rBaseOf[i])
    for (let j = 0; j < segs; j++) {
      // ring segment
      lines.push(idx(i, j), idx(i, j + 1))
      if (i < rings && j % k === 0) {
        // radial segment
        lines.push(idx(i, j), idx(i + 1, j))
        // occasional diagonal for a web-like weave
        if (randLine() < diag) {
          const dir = randLine() < 0.5 ? 1 : -1
          lines.push(idx(i, j), idx(i + 1, j + dir))
        }
      }
    }
  }

  // glowing intersections: sparse inside, denser toward the outer rim
  const pts = []
  for (let v = 0; v < count; v++) {
    const r = polar[v * 2]
    const p = r < 0.4 ? 0.08 : r < 0.8 ? 0.3 : 0.55
    if (randLine() < p) pts.push(v)
  }

  return { count, polar, seeds, lines, pts }
}

const LAYERS = [
  { rings: 96, segs: 288, jitter: 0.5, seed: 7, rotate: 0.0, brightness: 1.0, diag: 0.35, rMin: 0.012 },
  { rings: 60, segs: 168, jitter: 0.9, seed: 31, rotate: 0.0111, brightness: 0.75, diag: 0.5, rMin: 0.02 },
]

export function buildWebGeometry() {
  const built = LAYERS.map(buildLayer)
  const total = built.reduce((n, l) => n + l.count, 0)

  const polar = new Float32Array(total * 2)
  const seeds = new Float32Array(total)
  const lineIdx = []
  const pointIdx = []

  let offset = 0
  for (const l of built) {
    polar.set(l.polar, offset * 2)
    seeds.set(l.seeds, offset)
    for (const a of l.lines) lineIdx.push(a + offset)
    for (const a of l.pts) pointIdx.push(a + offset)
    offset += l.count
  }

  const shared = {
    position: new THREE.BufferAttribute(new Float32Array(total * 3), 3), // placeholder, real position is in the shader
    aPolar: new THREE.BufferAttribute(polar, 2),
    aSeed: new THREE.BufferAttribute(seeds, 1),
  }

  const lineGeometry = new THREE.BufferGeometry()
  const pointGeometry = new THREE.BufferGeometry()
  for (const [name, attr] of Object.entries(shared)) {
    lineGeometry.setAttribute(name, attr)
    pointGeometry.setAttribute(name, attr)
  }
  lineGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(lineIdx), 1))
  pointGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(pointIdx), 1))

  return { lineGeometry, pointGeometry }
}
