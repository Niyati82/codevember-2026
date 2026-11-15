// Small pure helpers shared by the physics modules (no three.js dependency).

export const BALL_RADIUS_AT_UNIT_MASS = 0.46 // world units
export const MAX_BALLS = 16

export const clamp = (x, a, b) => Math.min(Math.max(x, a), b)
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/**
 * Constant-density spheres: volume ∝ mass, so radius ∝ ∛mass.
 * `sizeScale` is the GUI "Ball Size" multiplier on top of that relationship.
 */
export function massToRadius(mass, sizeScale = 1) {
  return BALL_RADIUS_AT_UNIT_MASS * Math.cbrt(mass) * sizeScale
}

/**
 * Ballistic launch solver: velocity that takes a projectile from `o` to `t`
 * under gravity `g` using the flatter of the two possible arcs.
 * The speed is raised to the minimum needed to reach the target, so a throw
 * always arrives at the web. Result is written to `out` ({vx, vy, vz}).
 */
export function solveLaunch(ox, oy, oz, tx, ty, tz, speed, g, out) {
  const dx = tx - ox
  const dz = tz - oz
  const h = ty - oy
  const L = Math.hypot(dx, dz)
  const dist = Math.hypot(L, h)

  if (g < 0.05 || L < 1e-3) {
    const s = Math.max(speed, 1) / Math.max(dist, 1e-6)
    out.vx = dx * s
    out.vy = h * s
    out.vz = dz * s
    return out
  }

  const vMin = Math.sqrt(g * (h + dist))
  const v = Math.max(speed, vMin * 1.03)
  const a = (g * L * L) / (2 * v * v)
  const disc = Math.max(L * L - 4 * a * (h + a), 0)
  const u = (L - Math.sqrt(disc)) / (2 * a) // tan(launch angle)
  const c = 1 / Math.sqrt(1 + u * u)
  out.vx = (v * c * dx) / L
  out.vz = (v * c * dz) / L
  out.vy = v * c * u
  return out
}
