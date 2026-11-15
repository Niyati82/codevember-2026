varying vec3 vColor;
varying float vOpacity;
varying float vGlow;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);

  float d = length(uv);

  if (d > 0.5) {
    discard;
  }

  // Soft outer halo
  float halo = exp(-d * d * 35.0);

  // Bright inner core
  float core = exp(-d * d * 180.0);

  // Very subtle center sparkle
  float sparkle = exp(-d * d * 450.0);

  vec3 color = vColor * (
    halo * 0.8 +
    core * 1.5 +
    sparkle * 1.8
  );

  float alpha = (
    halo * 0.35 +
    core * 0.65 +
    sparkle * 0.4
  ) * vOpacity * vGlow;

  gl_FragColor = vec4(color, alpha);
}