varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float core = pow(1.0 - d, 2.2);
  gl_FragColor = vec4(vColor * core, 1.0);
  #include <colorspace_fragment>
}
