import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function CameraFly({ size, speed }) {
  const { camera } = useThree();

  const progress = useRef(0);

  const curve = useMemo(() => {
    const points = [];
    const segments = 100;

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;

      const x = Math.cos(t) * size;
      const z = Math.sin(t) * size;

      const y = 3 + Math.sin(t * 2) * 1.2 + Math.cos(t * 3) * 0.5;

      points.push(new THREE.Vector3(x, y, z));
    }

    return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.5);
  }, [size]);

  useFrame(() => {
    progress.current += speed * 0.001;

    if (progress.current >= 1) {
      progress.current = 0;
    }

    const position = curve.getPointAt(progress.current);

    const lookAt = new THREE.Vector3(
      Math.cos(progress.current * Math.PI * 2) * size * 0.2,
      0,
      Math.sin(progress.current * Math.PI * 2) * size * 0.2
    );

    camera.position.copy(position);
    camera.lookAt(lookAt);
  });

  return null;
}

export default CameraFly;
