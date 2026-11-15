import * as THREE from 'three'

/**
 * Ring buffer of GPU-animated sparks. The CPU only writes a particle once, at
 * birth (origin, velocity, birth time, lifetime, size, colour); the vertex
 * shader evaluates position/fade/size analytically from the current time.
 */
export class ParticleSystem {
  constructor(capacity = 8000) {
    this.capacity = capacity
    this.cursor = 0
    this.written = 0
    this.dirty = false

    this.origin = new Float32Array(capacity * 3)
    this.velocity = new Float32Array(capacity * 3)
    this.data = new Float32Array(capacity * 4)
    for (let i = 0; i < capacity; i++) {
      this.data[i * 4] = -1e4 // born "long ago" -> already dead
      this.data[i * 4 + 1] = 1
    }

    this.geometry = new THREE.BufferGeometry()
    this.attributes = [
      new THREE.BufferAttribute(this.origin, 3).setUsage(THREE.DynamicDrawUsage),
      new THREE.BufferAttribute(this.velocity, 3).setUsage(THREE.DynamicDrawUsage),
      new THREE.BufferAttribute(this.data, 4).setUsage(THREE.DynamicDrawUsage),
    ]
    this.geometry.setAttribute('position', this.attributes[0])
    this.geometry.setAttribute('aVelocity', this.attributes[1])
    this.geometry.setAttribute('aData', this.attributes[2])
    this.geometry.setDrawRange(0, 0)
  }

  emit(ox, oy, oz, vx, vy, vz, birth, life, size, mix) {
    const i = this.cursor
    this.cursor = (i + 1) % this.capacity
    this.written = Math.min(this.written + 1, this.capacity)
    this.origin[i * 3] = ox
    this.origin[i * 3 + 1] = oy
    this.origin[i * 3 + 2] = oz
    this.velocity[i * 3] = vx
    this.velocity[i * 3 + 1] = vy
    this.velocity[i * 3 + 2] = vz
    this.data[i * 4] = birth
    this.data[i * 4 + 1] = life
    this.data[i * 4 + 2] = size
    this.data[i * 4 + 3] = mix
    this.dirty = true
  }

  /** Upload only when a burst actually happened. */
  flush() {
    if (!this.dirty) return
    for (const a of this.attributes) a.needsUpdate = true
    this.geometry.setDrawRange(0, this.written)
    this.dirty = false
  }

  dispose() {
    this.geometry.dispose()
  }
}
