varying vec3 vColor;

void main() {
  float heat;
  vec3 p = webPosition(aPolar, heat);
  vColor = webColor(aPolar.x, aSeed, heat) * 2.0;
  gl_PointSize = (1.5 + 3.0 * pow(aSeed, 4.0)) * uPixelRatio;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
