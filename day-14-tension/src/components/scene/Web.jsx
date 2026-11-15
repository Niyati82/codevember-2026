import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildWebGeometry } from "../../utils/buildWebGeometry.js";
import { useWebDeformation } from "../../hooks/useWebDeformation.js";
import { WEB_RADIUS } from "../physics/WebCollision.js";
import common from "../../shaders/web/webCommon.glsl?raw";
import lineVertex from "../../shaders/web/webVertex.glsl?raw";
import lineFragment from "../../shaders/web/webFragment.glsl?raw";
import pointVertex from "../../shaders/web/webPointVertex.glsl?raw";
import pointFragment from "../../shaders/web/webPointFragment.glsl?raw";

/** The Stage 1 gravitational web, now also driven by impact/load deformation uniforms. */
export default function Web() {
  const { lineGeometry, pointGeometry } = useMemo(() => buildWebGeometry(), []);
  const deformation = useWebDeformation();

  // one uniform set shared by both materials
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRadius: { value: WEB_RADIUS },
      uPixelRatio: { value: 1 },
      uIntensity: { value: 0.85 },
      uGold: { value: new THREE.Color("#e17a19") },
      uAmber: { value: new THREE.Color("#fba23c") },
      uBlue: { value: new THREE.Color("#315BBD") },
      ...deformation,
    }),
    [deformation]
  );

  const { lineMaterial, pointMaterial } = useMemo(() => {
    const base = {
      uniforms,
      transparent: true,
      depthTest: true, // balls occlude the lines behind them
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    };
    return {
      lineMaterial: new THREE.ShaderMaterial({
        ...base,
        vertexShader: `${common}\n${lineVertex}`,
        fragmentShader: lineFragment,
      }),
      pointMaterial: new THREE.ShaderMaterial({
        ...base,
        vertexShader: `${common}\n${pointVertex}`,
        fragmentShader: pointFragment,
      }),
    };
  }, [uniforms]);

  useEffect(
    () => () => {
      lineGeometry.dispose();
      pointGeometry.dispose();
      lineMaterial.dispose();
      pointMaterial.dispose();
    },
    [lineGeometry, pointGeometry, lineMaterial, pointMaterial]
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPixelRatio.value = state.viewport.dpr;
  });

  return (
    <group>
      <lineSegments
        geometry={lineGeometry}
        material={lineMaterial}
        frustumCulled={false}
      />
      <points
        geometry={pointGeometry}
        material={pointMaterial}
        frustumCulled={false}
      />
    </group>
  );
}
