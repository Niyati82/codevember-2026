// Impulse-based collision response for ball↔web and ball↔ball.
import { clamp } from '../../utils/physicsUtils.js'

const REST_SPEED = 1.1 // below this normal speed a contact is "resting": no bounce
const IMPACT_MIN = 2.4 // minimum normal impact speed that deforms the web / emits sparks
const COOLDOWN = 0.12 // s, per-ball debounce for impact events
const FRICTION = 0.1 // Coulomb coefficient against the membrane
const ROLL_DAMP = 0.7 // 1/s, rolling resistance while in resting contact
const MAX_ELASTICITY = 0.92 // elasticity 1.0 is capped so bounces always decay
const MAX_DENT = 3.8 // world units, deepest total impact dent at one spot
const RIDE_WINDOW = 0.3 // s after a hit during which the ball follows the opening dent
const RIDE_GAP = 0.35 // max gap (world units) for that

/**
 * Right after a soft hit the dent opens under the ball. A ball that is not
 * bouncing away is carried down with the membrane instead of free-falling
 * into the gap (which would re-trigger an impact and pump energy).
 */
function ride(ball, surface, t, h, c, gap) {
  if (gap > RIDE_GAP || t - ball.lastImpact > RIDE_WINDOW) return
  let sy = (surface.height(c.sx, c.sz, t) - surface.height(c.sx, c.sz, t - h)) / h
  if (!(sy < 0)) return
  sy = Math.max(sy, -25)
  const vnb = ball.vx * c.nx + ball.vy * c.ny + ball.vz * c.nz
  if (vnb < 1.5 && vnb > sy) {
    const dv = (sy - vnb) * 0.9
    ball.vx += c.nx * dv
    ball.vy += c.ny * dv
    ball.vz += c.nz * dv
  }
}

/**
 * Resolve a ball against the deforming web. Returns true while in contact.
 * `events` receives an object for every real bounce (used by the particles).
 */
export function resolveBallWeb(ball, surface, t, h, s, events, c) {
  if (ball.y - ball.radius > surface.maxLift) return false
  if (!surface.contact(ball.x, ball.y, ball.z, ball.radius, t, c)) return false

  const pen = ball.radius - c.dist
  if (pen <= 0) {
    ride(ball, surface, t, h, c, -pen)
    return false
  }

  // 1. positional correction: never let the ball sit inside the web
  ball.x += c.nx * pen
  ball.y += c.ny * pen
  ball.z += c.nz * pen
  const cx = ball.x - c.nx * ball.radius
  const cy = ball.y - c.ny * ball.radius
  const cz = ball.z - c.nz * ball.radius

  // 2. velocity of the surface itself (breathing, ripples, recoil)
  let sy = (surface.height(c.sx, c.sz, t) - surface.height(c.sx, c.sz, t - h)) / h
  sy = sy === sy ? clamp(sy, -25, 25) : 0

  const rvx = ball.vx
  const rvy = ball.vy - sy
  const rvz = ball.vz
  const vn = rvx * c.nx + rvy * c.ny + rvz * c.nz
  if (vn >= 0) return true // already separating

  const impactSpeed = -vn

  // 3. restitution: elasticity, softened for heavy balls (the web yields more)
  const eBase = Math.min(s.elasticity, MAX_ELASTICITY)
  const e = impactSpeed < REST_SPEED ? 0 : eBase / (1 + 0.06 * ball.mass)
  const jn = -(1 + e) * vn

  // tangential slip, measured before the normal impulse is applied
  const tx = rvx - vn * c.nx
  const ty = rvy - vn * c.ny
  const tz = rvz - vn * c.nz
  const ts = Math.hypot(tx, ty, tz)

  ball.vx += c.nx * jn
  ball.vy += c.ny * jn
  ball.vz += c.nz * jn

  if (ts > 1e-6) {
    const f = Math.min(ts, FRICTION * jn) / ts
    ball.vx -= tx * f
    ball.vy -= ty * f
    ball.vz -= tz * f
  }

  if (impactSpeed < REST_SPEED) {
    const rr = Math.exp(-ROLL_DAMP * h)
    ball.vx *= rr
    ball.vy *= rr
    ball.vz *= rr
  }

  // 4. a real bounce: dent the web and report it
  if (impactSpeed > IMPACT_MIN && t - ball.lastImpact > COOLDOWN) {
    ball.lastImpact = t
    // depth grows with momentum above a small threshold, and is capped so
    // repeated hits at the same spot cannot dig an ever-deeper hole
    const existing = Math.max(0, -surface.deformation(cx, cz, t, false))
    const wanted = s.deformStrength * 0.22 * Math.pow(ball.mass * (impactSpeed - 1.5), 0.55)
    // a dent may never be deeper than the ball's own impact energy could dig:
    // falling back into it then always arrives slower than the last hit
    const energyCap = (0.28 * impactSpeed * impactSpeed) / Math.max(s.gravity, 0.5)
    const amp = clamp(Math.min(wanted, MAX_DENT - existing, energyCap), 0, MAX_DENT)
    if (amp > 0.02) {
      const tsx = Math.hypot(tx, tz)
      const shear = Math.min(0.8, tsx / (impactSpeed + tsx + 1e-3))
      const dirX = tsx > 1e-4 ? (tx / tsx) * shear : 0
      const dirZ = tsx > 1e-4 ? (tz / tsx) * shear : 0
      surface.addImpact(cx, cz, t, amp, 1.2 + 2.2 * ball.radius, 1.7 / s.recoverySpeed, dirX, dirZ)
    }
    events.push({
      x: cx,
      y: cy,
      z: cz,
      nx: c.nx,
      ny: c.ny,
      nz: c.nz,
      vx: ball.vx - c.nx * jn,
      vy: ball.vy - c.ny * jn,
      vz: ball.vz - c.nz * jn,
      speed: impactSpeed,
      mass: ball.mass,
      radius: ball.radius,
      time: t,
    })
  }
  return true
}

/** Elastic-ish sphere↔sphere impulse with mass-weighted separation. */
export function resolveBallBall(a, b, elasticity) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  const minD = a.radius + b.radius
  const d2 = dx * dx + dy * dy + dz * dz
  if (d2 >= minD * minD || d2 < 1e-12) return
  const d = Math.sqrt(d2)
  const nx = dx / d
  const ny = dy / d
  const nz = dz / d
  const pen = minD - d
  const total = a.mass + b.mass
  const wa = b.mass / total
  const wb = a.mass / total
  a.x -= nx * pen * wa
  a.y -= ny * pen * wa
  a.z -= nz * pen * wa
  b.x += nx * pen * wb
  b.y += ny * pen * wb
  b.z += nz * pen * wb

  const rvn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny + (b.vz - a.vz) * nz
  if (rvn >= 0) return
  const e = Math.min(elasticity, MAX_ELASTICITY) * 0.85
  const j = (-(1 + e) * rvn) / (1 / a.mass + 1 / b.mass)
  a.vx -= (j / a.mass) * nx
  a.vy -= (j / a.mass) * ny
  a.vz -= (j / a.mass) * nz
  b.vx += (j / b.mass) * nx
  b.vy += (j / b.mass) * ny
  b.vz += (j / b.mass) * nz
}
