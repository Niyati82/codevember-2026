import Camera from "./Camera.jsx";
import Web from "./Web.jsx";
import PhysicsWorld from "../physics/PhysicsWorld.jsx";
import ImpactParticles from "../particles/ImpactParticles.jsx";
import CosmicBackground from "../background/CosmicBackground.jsx";

export default function Scene() {
  return (
    <>
      {/* <color attach="background" args={["#030507"]} /> */}
      <Camera />
      <Web />
      <PhysicsWorld />
      <ImpactParticles />
      <CosmicBackground />
    </>
  );
}
