// Dark polished metallic glass. No textures: the "studio" the sphere reflects
// is analytic - an electric-blue softbox on one side, a golden-orange one on
// the opposite side, a faint warm bounce from the web below.
uniform vec3 uBlue;
uniform vec3 uGold;

varying vec3 vNormalW;
varying vec3 vPosW;

vec3 environment(vec3 R) {
  vec3 col = vec3(0.004, 0.006, 0.011) + vec3(0.0, 0.004, 0.012) * (R.y * 0.5 + 0.5);

  vec3 keyBlue = normalize(vec3(-0.78, 0.52, 0.34));
  vec3 keyGold = normalize(vec3(0.82, -0.22, 0.18));
  float b = dot(R, keyBlue);
  float g = dot(R, keyGold);

  col += uBlue * 5.0 * smoothstep(0.45, 0.98, b);
  col += vec3(0.55, 0.80, 1.00) * 2.2 * smoothstep(0.965, 0.995, b);   // sharp blue highlight
  col += uGold * 4.5 * smoothstep(0.45, 0.98, g);
  col += vec3(1.00, 0.75, 0.40) * 2.0 * smoothstep(0.965, 0.995, g);   // sharp golden highlight

  col += uGold * 0.8 * (1.0 - smoothstep(-0.85, 0.0, R.y));                     // web glow from below
  col += uBlue * 1.2 * smoothstep(0.6, 1.0, R.y);                       // cool rim from above
  return col;
}

void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 R = reflect(-V, N);
  float NV = clamp(dot(N, V), 0.0, 1.0);

  float F = 0.12 + 0.88 * pow(1.0 - NV, 4.0);       // Schlick-style fresnel
  vec3 body = vec3(0.004, 0.005, 0.008);            // deep black base
  vec3 refl = environment(R) * F * 1.6;

  // subtle emissive accents
  vec3 emis = uGold * 0.10 * (1.0 - smoothstep(-0.9, 0.1, N.y))
            + uBlue * 0.35 * pow(1.0 - NV, 3.0) * smoothstep(-0.2, 0.8, N.y);

  vec3 col = body + refl + emis;
  col = 1.0 - exp(-col * 1.25);                     // soft shoulder, no harsh clipping
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
