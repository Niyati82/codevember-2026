import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ParticleSystem } from './ParticleSystem.js'
import { emitImpactBurst } from '../../utils/particleUtils.js'
import { engine, settings } from '../../utils/simulationState.js'
import vertexShader from '../../shaders/particles/particleVertex.glsl?raw'
import fragmentShader from '../../shaders/particles/particleFragment.glsl?raw'

export default function ImpactParticles() {
  const system = useMemo(() => new ParticleSystem(8000), [])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uSizeScale: { value: 1 },
          uGravity: { value: 4 },
          uGold: { value: new THREE.Color('#E8B85A') },
          uAmber: { value: new THREE.Color('#E0782A') },
          uBlue: { value: new THREE.Color('#315BBD') },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  )

  useEffect(
    () => () => {
      system.dispose()
      material.dispose()
    },
    [system, material]
  )

  useFrame((state) => {
    const u = material.uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uPixelRatio.value = state.viewport.dpr
    u.uSizeScale.value = settings.particleSize
    u.uGravity.value = settings.gravity * 0.45

    // bursts come only from real collision events queued by the physics engine
    const events = engine.events
    for (let i = 0; i < events.length; i++) emitImpactBurst(system, events[i], settings)
    events.length = 0
    system.flush()
  })

  return <points geometry={system.geometry} material={material} frustumCulled={false} />
}
