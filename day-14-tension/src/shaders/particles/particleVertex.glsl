uniform float uTime;
uniform float uPixelRatio;
uniform float uSizeScale;
uniform float uGravity;
uniform vec3  uGold;
uniform vec3  uAmber;
uniform vec3  uBlue;

attribute vec3 aVelocity;
attribute vec4 aData;      // birth time, lifetime, size (px), colour mix

varying vec3 vColor;

const float DRAG = 2.4;

void main() {
  float age = uTime - aData.x;
  float life = aData.y;
  if (age < 0.0 || age >= life) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    gl_PointSize = 0.0;
    vColor = vec3(0.0);
    return;
  }
  float k = age / life;

  // analytic motion: exponential drag + gravity (nothing is simulated per frame on the CPU)
  vec3 p = position + aVelocity * (1.0 - exp(-DRAG * age)) / DRAG;
  p.y -= 0.5 * uGravity * age * age;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float fade = pow(1.0 - k, 1.5);
  float flick = 0.8 + 0.2 * sin(age * 38.0 + aData.x * 91.0 + aData.w * 40.0);

  vec3 base = aData.w < 0.3
    ? uBlue * 2.4 + vec3(0.02, 0.05, 0.12)
    : mix(uAmber, uGold, aData.w);
  base = mix(base, vec3(1.0, 0.72, 0.38), pow(1.0 - k, 6.0) * 0.5); // hot at birth

  vColor = base * fade * flick * 2.2;

  float size = aData.z * uSizeScale * uPixelRatio * (17.0 / max(-mv.z, 0.1)) * (0.35 + 0.65 * (1.0 - k));
  gl_PointSize = clamp(size, 1.0, 64.0);
}
