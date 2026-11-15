uniform float uTime;
uniform float uPixelRatio;

attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;

varying vec3 vColor;
varying float vOpacity;
varying float vGlow;

void main() {
  vec3 pos = position;

  // Slow floating motion
  pos.x += sin(uTime * 0.12 + aPhase) * 0.18;
  pos.y += cos(uTime * 0.10 + aPhase) * 0.15;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mvPosition;

  // Preserve the individual size of every star
  gl_PointSize = aSize * uPixelRatio;

  // Different twinkle rates and intensities
  float twinkle = sin(uTime * (1.0 + aPhase * 0.4) + aPhase);

  vOpacity = 0.45 + 0.55 * (twinkle * 0.5 + 0.5);

  // Some stars glow more intensely than others
  vGlow = 0.6 + 0.4 * sin(uTime * 0.8 + aPhase);

  vColor = aColor;
}