// CPU-side description of the web surface.
//
// This module mirrors, line for line, the surface computed in
// shaders/web/webCommon.glsl. Every vertex of the wireframe lies on
// y = surface(x, z, t), so querying this function IS querying the rendered
// web (base profile + breathing + radial stretch + impact dents + ball loads).
// If you change the shader maths, change it here too.

export const WEB_RADIUS = 10
export const HEIGHT_SCALE = 0.35
export const MAX_IMPACTS = 24
export const MAX_LOADS = 16

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1)
  return t * t * (3 - 2 * t)
}

function profile(r) {
  const a = r / 0.36
  const b = (r - 0.6) / 0.2
  return -0.55 * Math.exp(-a * a) + 0.2 * Math.exp(-b * b) + 0.5 * r * r * r
}

function stretchAt(r0, th, t) {
  return 1 + 0.02 * Math.sin(t * 0.42 + r0 * 4.5 + 1.3 * Math.sin(th * 2 + t * 0.15))
}

/** Undeformed (animated) height of the web at world x,z. NaN outside the web. */
export function baseHeight(x, z, t) {
  const R = Math.hypot(x, z)
  const th = Math.atan2(z, x)
  let r0 = R / WEB_RADIUS
  // the shader displaces radius by r0*stretch; invert it by fixed-point iteration
  for (let i = 0; i < 3; i++) r0 = R / (WEB_RADIUS * stretchAt(r0, th, t))
  if (r0 > 1) return NaN

  const c = r0 / 0.45
  const centre = Math.exp(-c * c)
  const outer = smooth(0.35, 1.0, r0)
  let h = profile(r0)
  h += 0.1 * Math.sin(t * 0.5) * centre
  h += 0.09 * Math.sin(t * 0.5 + 1.9) * outer
  h += 0.018 * Math.sin(r0 * 8 - t * 0.6 + th * 2) * smooth(0.15, 0.7, r0)
  return h * WEB_RADIUS * HEIGHT_SCALE
}

export class WebSurface {
  constructor() {
    // Typed arrays double as the shader uniform arrays (uploaded as-is).
    this.impactA = new Float32Array(MAX_IMPACTS * 4) // x, z, t0, amplitude
    this.impactB = new Float32Array(MAX_IMPACTS * 4) // sigma, tau, dirX, dirZ
    this.loads = new Float32Array(MAX_LOADS * 4) // x, z, depth, sigma
    this.nextImpact = 0
    this.maxLift = 2.6 // conservative upper bound of the surface height
  }

  addImpact(x, z, t0, amp, sigma, tau, dirX, dirZ) {
    const o = this.nextImpact * 4
    this.nextImpact = (this.nextImpact + 1) % MAX_IMPACTS
    this.impactA[o] = x
    this.impactA[o + 1] = z
    this.impactA[o + 2] = t0
    this.impactA[o + 3] = amp
    this.impactB[o] = sigma
    this.impactB[o + 1] = tau
    this.impactB[o + 2] = dirX
    this.impactB[o + 3] = dirZ
    this.maxLift = Math.max(this.maxLift, 2.6 + 0.3 * amp)
  }

  setLoad(i, x, z, depth, sigma) {
    const o = i * 4
    this.loads[o] = x
    this.loads[o + 1] = z
    this.loads[o + 2] = depth
    this.loads[o + 3] = sigma
  }

  clearLoads() {
    this.loads.fill(0)
  }

  clearImpacts() {
    this.impactA.fill(0)
    this.impactB.fill(0)
    this.nextImpact = 0
    this.maxLift = 2.6
  }

  /** Retire impacts that have fully recovered (keeps the shader loop cheap). */
  prune(t) {
    let amax = 0
    for (let i = 0; i < MAX_IMPACTS; i++) {
      const o = i * 4
      const amp = this.impactA[o + 3]
      if (amp === 0) continue
      if (t - this.impactA[o + 2] > 8 * this.impactB[o + 1]) {
        this.impactA[o + 3] = 0
      } else if (amp > amax) amax = amp
    }
    this.maxLift = 2.6 + 0.3 * amax
  }

  /** Vertical displacement from impacts (+ optionally ball loads). */
  deformation(x, z, t, withLoads = true) {
    let d = 0
    const A = this.impactA
    const B = this.impactB
    for (let i = 0; i < MAX_IMPACTS; i++) {
      const o = i * 4
      const amp = A[o + 3]
      if (amp === 0) continue
      const age = t - A[o + 2]
      if (age < 0) continue
      const tau = B[o + 1]
      const s = Math.hypot(B[o + 2], B[o + 3])
      let ux = 1
      let uz = 0
      if (s > 1e-4) {
        ux = B[o + 2] / s
        uz = B[o + 3] / s
      }
      const rx = x - A[o]
      const rz = z - A[o + 1]
      const sg = B[o] * (1 + 0.35 * (1 - Math.exp(-age * 1.2)))
      const qx = rx - ux * s * 0.5 * sg
      const qz = rz - uz * s * 0.5 * sg
      const al = (qx * ux + qz * uz) / (1 + s)
      const ac = (qx * uz - qz * ux) * (1 + 0.35 * s)
      const g = Math.exp(-(al * al + ac * ac) / (sg * sg))
      const attack = 1 - Math.exp(-age / 0.12)
      const decay = Math.exp(-age / tau)
      const rho = Math.hypot(rx, rz)
      const front = rho - 5.5 * age
      const ring = Math.exp((-front * front) / 2.25)
      const ripple = (0.18 * ring * Math.cos(2.4 * front) * Math.exp(-age / (tau * 0.8))) / (1 + 0.25 * rho)
      d += amp * attack * (-g * decay + ripple)
    }
    if (withLoads) {
      const L = this.loads
      for (let i = 0; i < MAX_LOADS; i++) {
        const o = i * 4
        const depth = L[o + 2]
        if (depth === 0) continue
        const dx = x - L[o]
        const dz = z - L[o + 1]
        const sg = L[o + 3]
        d -= depth * Math.exp(-(dx * dx + dz * dz) / (sg * sg))
      }
    }
    return d
  }

  /** Full surface height at world x,z (NaN outside the web). */
  height(x, z, t, withLoads = true) {
    const b = baseHeight(x, z, t)
    if (b !== b) return NaN
    return b + this.deformation(x, z, t, withLoads)
  }

  /**
   * Closest-point query between a sphere (centre p, radius R) and the surface.
   * Iterates a foot-point on the heightfield along the local normal, which
   * stays accurate on slopes. Writes into `out`:
   *   nx,ny,nz  surface normal at the foot point
   *   dist      signed distance from the sphere centre to the surface
   *   sx,sz     foot point (world x,z)
   * Returns false when the sphere is outside the web footprint.
   */
  contact(px, py, pz, R, t, out) {
    let sx = px
    let sz = pz
    const e = 0.08
    for (let it = 0; it < 4; it++) {
      const h = this.height(sx, sz, t)
      if (h !== h) return false
      let hx1 = this.height(sx + e, sz, t)
      let hx0 = this.height(sx - e, sz, t)
      let hz1 = this.height(sx, sz + e, t)
      let hz0 = this.height(sx, sz - e, t)
      if (hx1 !== hx1) hx1 = h
      if (hx0 !== hx0) hx0 = h
      if (hz1 !== hz1) hz1 = h
      if (hz0 !== hz0) hz0 = h
      const gx = (hx1 - hx0) / (2 * e)
      const gz = (hz1 - hz0) / (2 * e)
      const inv = 1 / Math.sqrt(1 + gx * gx + gz * gz)
      const nx = -gx * inv
      const ny = inv
      const nz = -gz * inv
      const d = (px - sx) * nx + (py - h) * ny + (pz - sz) * nz
      out.nx = nx
      out.ny = ny
      out.nz = nz
      out.dist = d
      out.sx = sx
      out.sz = sz
      if (it < 3) {
        sx = px - nx * d
        sz = pz - nz * d
      }
    }
    return true
  }
}
