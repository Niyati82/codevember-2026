import React from "react";

import { EffectComposer, Bloom } from "@react-three/postprocessing";

import Floor from "./Floor";

import CameraFly from "./CameraFly";
import CameraLight from "./CameraLight";
import { Preload } from "@react-three/drei";

function Scene() {
  return (
    <>
      <fog attach="fog" args={["#030303", 3, 15]} />

      <color attach="background" args={["#030303"]} />

      <pointLight
        position={[0, 3, 0]}
        color="#ff5d23"
        intensity={20}
        distance={20}
        decay={2}
      />

      {/* Cinematic flying camera */}
      <CameraFly size={7} speed={0.6} />

      <CameraLight />

      <Floor row={2} col={2} size={50} />

      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.2} />
      </EffectComposer>

      <Preload all />
    </>
  );
}

export default Scene;
