import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import LoadingScreen from "./LoadingScreen";
import { Suspense } from "react";
import Scene from "./Scene";
import { useProgress } from "@react-three/drei";
import MusicButton from "./ui/MusicButton";

function Experience() {
  const { active } = useProgress();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!active) setShowLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showLoading && <LoadingScreen />}
      {!showLoading && <MusicButton />}

      {/* 3D Scene */}
      <Canvas camera={{ fov: 45, position: [0, 7, 7], near: 0.1, far: 100 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </>
  );
}

export default Experience;
