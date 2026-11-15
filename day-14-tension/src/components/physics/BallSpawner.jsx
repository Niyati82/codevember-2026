import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { actions, engine, settings } from '../../utils/simulationState.js'
import { clamp, massToRadius, solveLaunch } from '../../utils/physicsUtils.js'
import { WEB_RADIUS } from './WebCollision.js'

const SPAWN_DISTANCE = 4.5 // in front of the camera, along its view axis
const AIM_PLANE_Y = -0.4 // pointer rays are aimed at this height of the web
const MAX_AIM_RADIUS = WEB_RADIUS * 0.9 // keep targets inside the web
const PREVIEW_POINTS = 42

/**
 * Click (or touch) to pick where the ball appears, drag to aim at a point on
 * the web, release to throw. Drag distance sets power between 55% and 100% of
 * the "Throw Strength" setting. The launch velocity is solved ballistically so
 * the ball really travels to the aimed point.
 */
export default function BallSpawner({ geometry, material }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const heldRef = useRef()

  const w = useMemo(
    () => ({
      active: false,
      pointerId: -1,
      startNdc: new THREE.Vector2(),
      ndc: new THREE.Vector2(),
      startPx: new THREE.Vector2(),
      px: new THREE.Vector2(),
      origin: new THREE.Vector3(),
      target: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      raycaster: new THREE.Raycaster(),
      plane: new THREE.Plane(new THREE.Vector3(0, 1, 0), -AIM_PLANE_Y),
      launch: { vx: 0, vy: 0, vz: 0 },
    }),
    []
  )

  // dotted-free, minimal trajectory preview line (shown only while aiming)
  const preview = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PREVIEW_POINTS * 3), 3))
    const mat = new THREE.LineBasicMaterial({
      color: '#E8B85A',
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const line = new THREE.Line(geo, mat)
    line.frustumCulled = false
    line.visible = false
    return line
  }, [])

  useEffect(
    () => () => {
      preview.geometry.dispose()
      preview.material.dispose()
    },
    [preview]
  )

  useEffect(() => {
    const el = gl.domElement

    const setOrigin = () => {
      w.raycaster.setFromCamera(w.startNdc, camera)
      camera.getWorldDirection(w.forward)
      const ray = w.raycaster.ray
      const t = SPAWN_DISTANCE / Math.max(ray.direction.dot(w.forward), 0.2)
      w.origin.copy(ray.origin).addScaledVector(ray.direction, t)
    }

    const setTarget = (ndc) => {
      w.raycaster.setFromCamera(ndc, camera)
      const hit = w.raycaster.ray.intersectPlane(w.plane, w.target)
      if (!hit) w.target.set(0, AIM_PLANE_Y, 0)
      const r = Math.hypot(w.target.x, w.target.z)
      if (r > MAX_AIM_RADIUS) {
        w.target.x *= MAX_AIM_RADIUS / r
        w.target.z *= MAX_AIM_RADIUS / r
      }
    }

    const power = () => {
      const rect = el.getBoundingClientRect()
      const drag = w.px.distanceTo(w.startPx)
      return clamp(drag / (0.4 * Math.min(rect.width, rect.height)), 0, 1)
    }

    const solve = (speedFactor) =>
      solveLaunch(
        w.origin.x, w.origin.y, w.origin.z,
        w.target.x, w.target.y, w.target.z,
        settings.throwStrength * speedFactor,
        settings.gravity,
        w.launch
      )

    const spawn = () => {
      const mass = settings.mass
      engine.spawn({
        x: w.origin.x, y: w.origin.y, z: w.origin.z,
        vx: w.launch.vx, vy: w.launch.vy, vz: w.launch.vz,
        mass,
        radius: massToRadius(mass, settings.size),
      })
    }

    const toNdc = (e, out) => {
      const r = el.getBoundingClientRect()
      out.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    }

    const onDown = (e) => {
      if (w.active || (e.pointerType === 'mouse' && e.button !== 0)) return
      w.active = true
      w.pointerId = e.pointerId
      el.setPointerCapture?.(e.pointerId)
      toNdc(e, w.startNdc)
      w.ndc.copy(w.startNdc)
      w.startPx.set(e.clientX, e.clientY)
      w.px.copy(w.startPx)
    }

    const onMove = (e) => {
      if (!w.active || e.pointerId !== w.pointerId) return
      toNdc(e, w.ndc)
      w.px.set(e.clientX, e.clientY)
    }

    const end = (e, doThrow) => {
      if (!w.active || e.pointerId !== w.pointerId) return
      w.active = false
      el.releasePointerCapture?.(e.pointerId)
      if (!doThrow) return
      setOrigin()
      setTarget(w.ndc)
      solve(0.55 + 0.45 * power())
      spawn()
    }
    const onUp = (e) => end(e, true)
    const onCancel = (e) => end(e, false)

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onCancel)

    // GUI "Spawn Ball": a default throw into the web from in front of the camera
    actions.spawnBall = () => {
      w.startNdc.set((Math.random() - 0.5) * 0.3, -0.75)
      setOrigin()
      w.target.set((Math.random() - 0.5) * 6, AIM_PLANE_Y, (Math.random() - 0.5) * 6)
      solve(0.8)
      spawn()
    }

    // per-frame helpers used by useFrame below
    w.refresh = () => {
      setOrigin()
      setTarget(w.ndc)
      solve(0.55 + 0.45 * power())
    }

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onCancel)
      actions.spawnBall = () => {}
    }
  }, [gl, camera, w])

  useFrame(() => {
    const held = heldRef.current
    if (!w.active || !w.refresh) {
      held.visible = false
      preview.visible = false
      return
    }
    w.refresh()

    held.visible = true
    held.position.copy(w.origin)
    held.scale.setScalar(massToRadius(settings.mass, settings.size))

    // trajectory preview: same ballistics as the engine, ending at the aim point
    const { vx, vy, vz } = w.launch
    const horiz = Math.hypot(vx, vz)
    const flight = horiz > 1e-3 ? Math.hypot(w.target.x - w.origin.x, w.target.z - w.origin.z) / horiz : 1
    const pos = preview.geometry.attributes.position
    for (let i = 0; i < PREVIEW_POINTS; i++) {
      const t = (i / (PREVIEW_POINTS - 1)) * flight
      pos.setXYZ(
        i,
        w.origin.x + vx * t,
        w.origin.y + vy * t - 0.5 * settings.gravity * t * t,
        w.origin.z + vz * t
      )
    }
    pos.needsUpdate = true
    preview.visible = true
  })

  return (
    <>
      <mesh ref={heldRef} geometry={geometry} material={material} visible={false} frustumCulled={false} />
      <primitive object={preview} />
    </>
  )
}
