import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import backgroundVertexShader from "../../shaders/background/cosmicBackgroundVertex.glsl?raw";
import backgroundFragmentShader from "../../shaders/background/cosmicBackgroundFragment.glsl?raw";

import starsVertexShader from "../../shaders/background/starsVertex.glsl?raw";
import starsFragmentShader from "../../shaders/background/starsFragment.glsl?raw";

const STAR_COUNT = 700;

const STAR_COLORS = [
  new THREE.Color("#3185ff"),
  new THREE.Color("#ff4b36"),
  new THREE.Color("#ff9a36"),
  new THREE.Color("#8d78ff"),
  new THREE.Color("#a8caff"),
];

export default function CosmicBackground() {
  console.log("inside cosmic");

  const groupRef = useRef();
  const backgroundMaterialRef = useRef();
  const starsMaterialRef = useRef();

  const { camera, gl } = useThree();

  const backgroundGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(180, 110);
  }, []);

  const starGeometry = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const phases = new Float32Array(STAR_COUNT);
    const colors = new Float32Array(STAR_COUNT * 3);

    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;

      // Spread stars throughout the background
      positions[i3] = (Math.random() - 0.5) * 150;
      positions[i3 + 1] = (Math.random() - 0.5) * 85;

      // Keep stars behind the main web
      positions[i3 + 2] = Math.random() * 6 + 1;

      // Vary star sizes
      const random = Math.random();

      // Most stars are tiny, with a few larger glowing stars
      sizes[i] = Math.random() * 20.5 + 10.4;

      // Different twinkle phases
      phases[i] = Math.random() * Math.PI * 2;

      // Randomly choose blue, red, amber, or violet
      const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    return geometry;
  }, []);

  const backgroundUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  );

  const starsUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
    }),
    [gl]
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (groupRef.current) {
      // Keep the background centered on the camera
      groupRef.current.position.copy(camera.position);

      groupRef.current.quaternion.copy(camera.quaternion);

      // Move the entire background behind the scene
      groupRef.current.translateZ(-60);
    }

    if (backgroundMaterialRef.current) {
      backgroundMaterialRef.current.uniforms.uTime.value = time;
    }

    if (starsMaterialRef.current) {
      starsMaterialRef.current.uniforms.uTime.value = time;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Procedural cosmic nebula */}
      <mesh
        geometry={backgroundGeometry}
        position={[0, 0, 0]}
        renderOrder={-1000}
      >
        <shaderMaterial
          ref={backgroundMaterialRef}
          vertexShader={backgroundVertexShader}
          fragmentShader={backgroundFragmentShader}
          uniforms={backgroundUniforms}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Floating stars and glowing particles */}
      <points geometry={starGeometry} renderOrder={-999}>
        <shaderMaterial
          ref={starsMaterialRef}
          vertexShader={starsVertexShader}
          fragmentShader={starsFragmentShader}
          uniforms={starsUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
