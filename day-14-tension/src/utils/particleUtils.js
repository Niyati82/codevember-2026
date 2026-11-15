import { clamp } from './physicsUtils.js'

const TAU = Math.PI * 2

/**
 * Turn one impact event into a radial burst. Count, speed and size scale with
 * impact speed and ball mass; the sparks fan out around the surface normal at
 * the exact contact point and inherit part of the ball's tangential motion.
 */
export function emitImpactBurst(system, ev, s, rand = Math.random) {
  const sf = clamp(ev.speed / 18, 0.12, 1.6)
  const mf = clamp(Math.pow(ev.mass, 0.4) * 0.75, 0.5, 2.0)
  const count = Math.min(420, Math.round((38 + 150 * sf * mf) * s.particleIntensity))
  if (count <= 0) return

  // tangent basis around the contact normal
  const { nx, ny, nz } = ev
  let ax = 0
  let ay = 1
  let az = 0
  if (Math.abs(ny) > 0.9) {
    ax = 1
    ay = 0
  }
  let t1x = ny * az - nz * ay
  let t1y = nz * ax - nx * az
  let t1z = nx * ay - ny * ax
  const tl = Math.hypot(t1x, t1y, t1z) || 1
  t1x /= tl
  t1y /= tl
  t1z /= tl
  const t2x = ny * t1z - nz * t1y
  const t2y = nz * t1x - nx * t1z
  const t2z = nx * t1y - ny * t1x

  // ball motion parallel to the surface, partly inherited by the sparks
  const vn = ev.vx * nx + ev.vy * ny + ev.vz * nz
  const inhX = (ev.vx - nx * vn) * 0.3
  const inhY = (ev.vy - ny * vn) * 0.3
  const inhZ = (ev.vz - nz * vn) * 0.3

  for (let i = 0; i < count; i++) {
    const phi = rand() * TAU
    const radial = 0.7 + rand() * 0.6
    const lift = 0.25 + rand() * rand() * 1.1
    let dx = (t1x * Math.cos(phi) + t2x * Math.sin(phi)) * radial + nx * lift
    let dy = (t1y * Math.cos(phi) + t2y * Math.sin(phi)) * radial + ny * lift
    let dz = (t1z * Math.cos(phi) + t2z * Math.sin(phi)) * radial + nz * lift
    const dl = Math.hypot(dx, dy, dz) || 1
    dx /= dl
    dy /= dl
    dz /= dl

    const speed = (2.5 + Math.pow(rand(), 1.5) * 9) * (0.55 + sf * 0.9) * (0.8 + 0.25 * mf)
    system.emit(
      ev.x,
      ev.y,
      ev.z,
      dx * speed + inhX,
      dy * speed + inhY,
      dz * speed + inhZ,
      ev.time,
      s.particleLifetime * (0.55 + rand() * 0.9),
      (2.2 + Math.pow(rand(), 2.5) * 6) * (0.8 + 0.3 * mf),
      rand()
    )
  }
}
