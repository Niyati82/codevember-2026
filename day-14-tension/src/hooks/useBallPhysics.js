import { useEffect, useState } from 'react'
import { engine } from '../utils/simulationState.js'

/**
 * Subscribes React to the *list* of balls only (spawn / clear / removal).
 * Per-frame positions never touch React state: the engine writes them
 * straight into each ball's mesh.
 */
export function useBallPhysics() {
  const [balls, setBalls] = useState(() => engine.balls.slice())

  useEffect(() => {
    const sync = () => setBalls(engine.balls.slice())
    sync()
    return engine.subscribe(sync)
  }, [])

  return balls
}
