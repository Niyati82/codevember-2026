import { useEffect } from "react";
import GUI from "lil-gui";
import { actions, settings } from "../../utils/simulationState.js";

/** DOM-only lil-gui panel (top-right). It edits the shared settings object live. */
export default function SimulationGUI() {
  useEffect(() => {
    const gui = new GUI({ title: "Simulation" });

    const balls = gui.addFolder("Ball");
    balls.add(settings, "mass", 0.2, 12, 0.1).name("Ball Mass");
    balls.add(settings, "size", 0.5, 2, 0.05).name("Ball Size");
    balls.add(settings, "throwStrength", 8, 45, 0.5).name("Throw Strength");
    balls.add({ spawn: () => actions.spawnBall() }, "spawn").name("Spawn Ball");
    balls
      .add({ clear: () => actions.clearBalls() }, "clear")
      .name("Clear Balls");
    balls.open();

    const physics = gui.addFolder("Physics");
    physics.add(settings, "gravity", 0, 30, 0.1).name("Gravity");
    physics.add(settings, "elasticity", 0, 1, 0.01).name("Elasticity");
    physics
      .add(settings, "deformStrength", 0, 2.5, 0.05)
      .name("Web Deformation");
    physics.add(settings, "recoverySpeed", 0.2, 3, 0.05).name("Web Recovery");

    const particles = gui.addFolder("Particles");
    particles.add(settings, "particleIntensity", 0, 3, 0.05).name("Intensity");
    particles.add(settings, "particleLifetime", 0.4, 4, 0.05).name("Lifetime");
    particles.add(settings, "particleSize", 0.3, 3, 0.05).name("Size");

    return () => gui.destroy();
  }, []);

  return null;
}
