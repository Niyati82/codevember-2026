import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import Ball from './Ball.jsx'
import BallSpawner from './BallSpawner.jsx'
import { createBallGeometry, createBallMaterial } from './ballMaterial.js'
import { useBallPhysics } from '../../hooks/useBallPhysics.js'
import { engine } from '../../utils/simulationState.js'

/** Steps the simulation once per frame and renders the live balls. */
export default function PhysicsWorld() {
  const balls = useBallPhysics()
  const geometry = useMemo(createBallGeometry, [])
  const material = useMemo(createBallMaterial, [])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  useFrame((state, delta) => {
    engine.step(state.clock.elapsedTime, delta)
    engine.syncMeshes()
  })

  return (
    <group>
      <BallSpawner geometry={geometry} material={material} />
      {balls.map((b) => (
        <Ball key={b.id} body={b} geometry={geometry} material={material} />
      ))}
    </group>
  )
}
