import { useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function CameraLight() {
  const { camera } = useThree();

  const lightRef = useRef();
  const targetRef = useRef();

  const direction = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!lightRef.current || !targetRef.current) return;

    // Follow camera position
    lightRef.current.position.copy(camera.position);

    // Get camera direction
    camera.getWorldDirection(direction.current);

    // Move spotlight target ahead of camera
    targetRef.current.position
      .copy(camera.position)
      .add(direction.current.clone().multiplyScalar(10));

    // Set target
    lightRef.current.target = targetRef.current;

    // Update target matrix
    targetRef.current.updateMatrixWorld();
  });

  return (
    <>
      <spotLight
        ref={lightRef}
        color="#ff6a00"
        intensity={50}
        angle={Math.PI / 5}
        penumbra={0.5}
        distance={30}
        decay={2}
        castShadow
      />

      <object3D ref={targetRef} />
    </>
  );
}

export default CameraLight;
