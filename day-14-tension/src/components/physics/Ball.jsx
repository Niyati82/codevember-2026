import { useLayoutEffect, useRef } from 'react'

/**
 * Renders one ball. The physics engine owns the body and moves the mesh
 * directly each frame; React is only involved when a ball appears/disappears.
 */
export default function Ball({ body, geometry, material }) {
  const ref = useRef()

  useLayoutEffect(() => {
    const mesh = ref.current
    mesh.position.set(body.x, body.y, body.z)
    mesh.scale.setScalar(body.radius)
    body.mesh = mesh
    return () => {
      body.mesh = null
    }
  }, [body])

  return <mesh ref={ref} geometry={geometry} material={material} frustumCulled={false} />
}
