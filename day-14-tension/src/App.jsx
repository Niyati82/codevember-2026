import { Canvas } from "@react-three/fiber";
import Scene from "./components/scene/Scene.jsx";
import SimulationGUI from "./components/gui/SimulationGUI.jsx";
import MagneticCursor from "./utils/MagneticCursor.jsx";
import UIManager from "./components/ui/UIManager.jsx";
import BackgroundMusic from "./components/background/BackgroundMusic.jsx";

export default function App() {
  return (
    <>
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 38, near: 0.1, far: 200, position: [0, 8, 17] }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <Scene />
      </Canvas>

      <MagneticCursor />

      <BackgroundMusic />

      <UIManager />

      <SimulationGUI />
    </>
  );
}
