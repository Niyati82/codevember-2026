#define MAX_IMPACTS 24
#define MAX_LOADS 16

uniform float uTime;
uniform float uRadius;
uniform float uPixelRatio;
uniform float uIntensity;
uniform vec3  uGold;
uniform vec3  uAmber;
uniform vec3  uBlue;

// Impact dents (x, z, t0, amplitude) / (sigma, tau, dirX, dirZ) and ball loads (x, z, depth, sigma).
// The same maths lives in components/physics/WebCollision.js - keep them in sync.
uniform vec4 uImpactA[MAX_IMPACTS];
uniform vec4 uImpactB[MAX_IMPACTS];
uniform vec4 uLoads[MAX_LOADS];

attribute vec2  aPolar;   // x: normalised radius 0..1, y: angle
attribute float aSeed;    // per-vertex random brightness

// Static membrane profile: shallow central depression, soft golden rim,
// outer edge curving gently upward.
float profile(float r) {
  float a = r / 0.36;
  float b = (r - 0.60) / 0.20;
  return -0.55 * exp(-a * a) + 0.20 * exp(-b * b) + 0.50 * r * r * r;
}

// Vertical displacement caused by ball impacts and ball weight (world units).
float webDeformation(vec2 p) {
  float d = 0.0;
  for (int i = 0; i < MAX_IMPACTS; i++) {
    vec4 A = uImpactA[i];
    float amp = A.w;
    if (amp == 0.0) continue;
    float age = uTime - A.z;
    if (age < 0.0) continue;
    vec4 B = uImpactB[i];
    float s = length(B.zw);
    vec2 u = s > 1e-4 ? B.zw / s : vec2(1.0, 0.0);
    vec2 r = p - A.xy;
    float sg = B.x * (1.0 + 0.35 * (1.0 - exp(-age * 1.2)));
    vec2 q = r - u * s * 0.5 * sg;
    float al = dot(q, u) / (1.0 + s);
    float ac = (q.x * u.y - q.y * u.x) * (1.0 + 0.35 * s);
    float g = exp(-(al * al + ac * ac) / (sg * sg));
    float attack = 1.0 - exp(-age / 0.12);
    float decay = exp(-age / B.y);
    float rho = length(r);
    float front = rho - 5.5 * age;
    float ring = exp(-front * front / 2.25);
    float ripple = 0.18 * ring * cos(2.4 * front) * exp(-age / (B.y * 0.8)) / (1.0 + 0.25 * rho);
    d += amp * attack * (-g * decay + ripple);
  }
  for (int i = 0; i < MAX_LOADS; i++) {
    vec4 L = uLoads[i];
    if (L.z == 0.0) continue;
    vec2 dl = p - L.xy;
    d -= L.z * exp(-dot(dl, dl) / (L.w * L.w));
  }
  return d;
}

vec3 webPosition(vec2 pol, out float heat) {
  float r0 = pol.x;
  float th = pol.y;
  float t  = uTime;

  // the membrane subtly stretches and contracts radially
  float stretch = 1.0 + 0.020 * sin(t * 0.42 + r0 * 4.5 + 1.3 * sin(th * 2.0 + t * 0.15));
  float r = r0 * stretch;

  float h = profile(r0);

  // breathing: centre and outer rim move with different amplitude / phase
  float c = r0 / 0.45;
  float centre = exp(-c * c);
  float outer  = smoothstep(0.35, 1.0, r0);
  h += 0.10 * sin(t * 0.50)       * centre;
  h += 0.09 * sin(t * 0.50 + 1.9) * outer;

  // very soft travelling ripple for an organic feel
  h += 0.018 * sin(r0 * 8.0 - t * 0.60 + th * 2.0) * smoothstep(0.15, 0.70, r0);

  float R = uRadius * r;
  vec2 xz = vec2(cos(th), sin(th)) * R;
  float def = webDeformation(xz);
  heat = clamp(abs(def) * 0.55, 0.0, 1.5);
  return vec3(xz.x, h * uRadius * 0.35 + def, xz.y);
}

vec3 webColor(float r0, float seed, float heat) {
  float a = (r0 - 0.58) / 0.17;
  float ring = exp(-a * a);                       // golden band around the centre

  vec3 c = mix(uBlue, uAmber, (1.0 - smoothstep(0.52, 0.98, r0)));
  c = mix(c, uGold, ring);
  c = mix(c, uGold, clamp(heat, 0.0, 1.0));       // energy from impacts warms the lines

  float inner = 1.0 - smoothstep(0.0, 0.45, r0);  // dimmer, warmer core
  float I = 0.32 + 0.95 * ring + 0.18 * (1.0 - smoothstep(0.5, 0.9, r0));
  I *= 1.0 - 0.45 * inner;
  I *= 1.0 - 0.60 * smoothstep(0.85, 1.0, r0);    // fade out at the rim
  I *= 0.55 + 0.90 * seed;
  I *= 1.0 + 1.1 * heat;
  return c * I * uIntensity;
}
