import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { WEB_RADIUS } from '../physics/WebCollision.js'

const ELEVATION = THREE.MathUtils.degToRad(24) // slightly elevated, cinematic
const FIT_HALF_HEIGHT = 5.4 // world units the web occupies above/below its centre on screen

/**
 * Keeps the camera almost static: it frames the whole web for any aspect ratio
 * and adds a barely perceptible drift. (Unchanged from Stage 1.)
 */
export default function Camera() {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const target = useMemo(() => new THREE.Vector3(0, 0.35, 0), [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const aspect = size.width / size.height
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5)

    const distW = WEB_RADIUS / (0.9 * tanV * aspect)
    const distH = FIT_HALF_HEIGHT / (0.9 * tanV)
    const d = Math.max(distW, distH)

    const az = Math.sin(t * 0.07) * 0.035
    const el = ELEVATION + Math.sin(t * 0.05 + 1.0) * 0.012
    const flat = d * Math.cos(el)

    camera.position.set(Math.sin(az) * flat, Math.sin(el) * d, Math.cos(az) * flat)
    camera.lookAt(target)
  })

  return null
}
