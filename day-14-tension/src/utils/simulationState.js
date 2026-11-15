// Module-level simulation singletons. The lil-gui panel lives in the DOM,
// outside the <Canvas> reconciler, so shared state is a plain mutable store
// (no React state, no per-frame re-renders).
import { WebSurface } from '../components/physics/WebCollision.js'
import { PhysicsEngine } from '../components/physics/PhysicsEngine.js'

export const DEFAULTS = {
  mass: 1.5,
  size: 1,
  throwStrength: 22,
  gravity: 9.8,
  elasticity: 0.72,
  deformStrength: 1,
  recoverySpeed: 1,
  particleIntensity: 1,
  particleLifetime: 1.4,
  particleSize: 1,
}

export const settings = { ...DEFAULTS }
export const surface = new WebSurface()
export const engine = new PhysicsEngine(surface, settings)

// Filled in by components that own the needed context (e.g. the camera).
export const actions = {
  spawnBall: () => {},
  clearBalls: () => engine.clear(),
}
