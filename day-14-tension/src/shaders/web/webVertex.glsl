varying vec3 vColor;

void main() {
  float heat;
  vec3 p = webPosition(aPolar, heat);
  vColor = webColor(aPolar.x, aSeed, heat);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
