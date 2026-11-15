import * as THREE from 'three'
import vertexShader from '../../shaders/ball/ballVertex.glsl?raw'
import fragmentShader from '../../shaders/ball/ballFragment.glsl?raw'

/** One material and one geometry are shared by every ball. */
export function createBallMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBlue: { value: new THREE.Color('#315BBD') },
      uGold: { value: new THREE.Color('#E8B85A') },
    },
    vertexShader,
    fragmentShader,
  })
}

export function createBallGeometry() {
  return new THREE.SphereGeometry(1, 64, 48)
}
