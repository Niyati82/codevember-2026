varying vec3 vNormalW;
varying vec3 vPosW;

void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal); // uniform scale only
  gl_Position = projectionMatrix * viewMatrix * wp;
}
