// Framework-free ball simulation: fixed-ish substeps, web + ball collisions,
// load dimples and impact events. React only renders what this class owns.
import { MAX_BALLS, smoothstep } from '../../utils/physicsUtils.js'
import { MAX_LOADS } from './WebCollision.js'
import { resolveBallBall, resolveBallWeb } from './CollisionResponse.js'

const AIR_DRAG = 0.12 // 1/s
const KILL_Y = -25
const KILL_RADIUS = 60

export class PhysicsEngine {
  constructor(surface, settings) {
    this.surface = surface
    this.settings = settings
    this.balls = []
    this.events = [] // impact events, drained by ImpactParticles
    this.listeners = new Set()
    this.nextId = 1
    this.contact = { nx: 0, ny: 1, nz: 0, dist: 0, sx: 0, sz: 0 }
  }

  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  notify() {
    for (const fn of this.listeners) fn()
  }

  spawn({ x, y, z, vx, vy, vz, mass, radius }) {
    const ball = { id: this.nextId++, mass, radius, x, y, z, vx, vy, vz, load: 0, lastImpact: -1, mesh: null }
    this.balls.push(ball)
    while (this.balls.length > MAX_BALLS) this.balls.shift()
    this.notify()
    return ball
  }

  clear() {
    this.balls.length = 0
    this.surface.clearLoads()
    this.notify()
  }

  step(now, delta) {
    const { surface, settings, balls } = this
    surface.prune(now)
    const dt = Math.min(delta, 1 / 20)
    if (!(dt > 0) || balls.length === 0) return

    let vmax = 1
    let rmin = 10
    for (const b of balls) {
      vmax = Math.max(vmax, Math.hypot(b.vx, b.vy, b.vz))
      rmin = Math.min(rmin, b.radius)
    }
    // keep per-substep travel below ~a third of the smallest radius -> no tunnelling
    const steps = Math.min(40, Math.ceil(dt / Math.min(1 / 120, (0.35 * rmin) / vmax)))
    const h = dt / steps
    const t0 = now - dt
    const damp = Math.exp(-AIR_DRAG * h)

    for (let i = 1; i <= steps; i++) {
      const t = t0 + i * h
      for (const b of balls) {
        b.vy -= settings.gravity * h // semi-implicit Euler
        b.vx *= damp
        b.vy *= damp
        b.vz *= damp
        b.x += b.vx * h
        b.y += b.vy * h
        b.z += b.vz * h
      }
      for (const b of balls) resolveBallWeb(b, surface, t, h, settings, this.events, this.contact)
      for (let a = 0; a < balls.length; a++) {
        for (let c = a + 1; c < balls.length; c++) resolveBallBall(balls[a], balls[c], settings.elasticity)
      }
    }

    this.updateLoads(now, dt)
    this.removeEscaped()
  }

  /** Weight dimples: heavier balls pressing on the web sag it further. */
  updateLoads(now, dt) {
    const { surface, settings, balls } = this
    const k = 1 - Math.exp(-dt * 5)
    for (let i = 0; i < MAX_LOADS; i++) {
      const b = balls[i]
      if (!b) {
        surface.setLoad(i, 0, 0, 0, 1)
        continue
      }
      const base = surface.height(b.x, b.z, now, false)
      // 1 when touching / sinking into the web, fading to 0 about one unit above it
      const contactAmount = base === base ? 1 - smoothstep(0, 1.0, b.y - b.radius - base) : 0
      const target = settings.deformStrength * 0.26 * Math.pow(b.mass, 0.6) * contactAmount
      b.load += (target - b.load) * k
      surface.setLoad(i, b.x, b.z, b.load < 1e-3 ? 0 : b.load, 1.2 + 2.0 * b.radius)
    }
  }

  removeEscaped() {
    const before = this.balls.length
    this.balls = this.balls.filter((b) => b.y > KILL_Y && Math.hypot(b.x, b.z) < KILL_RADIUS)
    if (this.balls.length !== before) this.notify()
  }

  /** Push simulated positions into the rendered meshes. */
  syncMeshes() {
    for (const b of this.balls) {
      if (b.mesh) b.mesh.position.set(b.x, b.y, b.z)
    }
  }
}

