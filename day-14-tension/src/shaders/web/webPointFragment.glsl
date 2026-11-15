varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.05, d);
  a *= a;
  gl_FragColor = vec4(vColor * a, 1.0);
  #include <colorspace_fragment>
}
