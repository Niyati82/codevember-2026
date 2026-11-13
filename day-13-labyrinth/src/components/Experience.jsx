import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Floor from "./Floor";

function Experience() {
  return (
    <Canvas camera={{ fov: 45, position: [0, 3, 7], near: 0.1, far: 100 }}>
      {/* <Perf position="top-left" /> */}

      <ambientLight intensity={3.5} />
      <directionalLight position={[10, 10, 10]} intensity={3.8} color="white" />

      <Floor row={2} col={2} size={5} />

      <OrbitControls />
    </Canvas>
  );
}

export default Experience;
