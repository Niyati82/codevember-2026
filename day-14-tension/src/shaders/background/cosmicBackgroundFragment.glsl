uniform float uTime;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(
    sin(dot(p, vec2(127.1, 311.7)))
    * 43758.5453
  );
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(
    mix(a, b, f.x),
    mix(c, d, f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += noise(p) * amplitude;

    p *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

void main() {
  vec2 uv = vUv;

  float time = uTime * 0.025;

  // Broad flowing nebula formations
  vec2 blueUV = uv * vec2(3.0, 2.5);
  blueUV += vec2(time, time * 0.4);

  vec2 redUV = uv * vec2(3.2, 2.8);
  redUV += vec2(-time * 0.5, time * 0.3);

  // Organic cloud noise
  float blueNoise = fbm(blueUV);
  float redNoise = fbm(redUV + vec2(3.5, 2.2));

  // Wider, more visible cloud formations
  float blueCloud = smoothstep(
    0.28,
    0.62,
    blueNoise
  );

  float redCloud = smoothstep(
    0.28,
    0.62,
    redNoise
  );

  // Blue nebula on the left
  float blueSide = 1.0 - smoothstep(
    0.35,
    0.78,
    uv.x
  );

  // Red / amber nebula on the right
  float redSide = smoothstep(
    0.22,
    0.65,
    uv.x
  );

  // Gentle vertical atmospheric fade
  float verticalFade = smoothstep(
    0.0,
    0.18,
    uv.y
  ) * (
    1.0 - smoothstep(0.82, 1.0, uv.y)
  );

  // Preserve the dark center, but allow some color
  float centerDistance = length(
    (uv - vec2(0.5)) * vec2(1.1, 0.9)
  );

  float centerMask = mix(
    0.30,
    1.0,
    smoothstep(0.12, 0.48, centerDistance)
  );

  // Deep space base
  vec3 color = vec3(
    0.002,
    0.003,
    0.009
  );

  // Blue cosmic clouds
  color += vec3(
    0.025,
    0.12,
    0.50
  ) * blueCloud
    * blueSide
    * centerMask
    * verticalFade
    * 1.5;

  // Red and amber cosmic clouds
  color += vec3(
    0.50,
    0.075,
    0.025
  ) * redCloud
    * redSide
    * centerMask
    * verticalFade
    * 1.4;

  // Purple transition between the nebula regions
  color += vec3(
    0.12,
    0.025,
    0.22
  ) * blueCloud
    * redCloud
    * centerMask
    * 0.45;

  gl_FragColor = vec4(color, 1.0);
}