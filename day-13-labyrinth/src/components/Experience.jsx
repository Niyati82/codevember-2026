import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Experience() {
  return (
    <Canvas camera={{ fov: 45, position: [0, 0, 2] }}>
      {/* <Perf position="top-left" /> */}

      <ambientLight intensity={3.5} />
      <directionalLight position={[10, 10, 10]} intensity={3.8} color="white" />

      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="red" />
      </mesh>

      <OrbitControls />
    </Canvas>
  );
}

export default Experience;
