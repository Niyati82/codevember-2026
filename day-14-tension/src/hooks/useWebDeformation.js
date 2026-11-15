import { useMemo } from 'react'
import { surface } from '../utils/simulationState.js'

/**
 * Shader uniforms that carry the live deformation state to the web shaders.
 * The values are the engine's own typed arrays, so a change made by a collision
 * is visible on the GPU on the very next draw with no copying.
 */
export function useWebDeformation() {
  return useMemo(
    () => ({
      uImpactA: { value: surface.impactA },
      uImpactB: { value: surface.impactB },
      uLoads: { value: surface.loads },
    }),
    []
  )
}
