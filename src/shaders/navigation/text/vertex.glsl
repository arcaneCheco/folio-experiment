varying vec2 vUv;

void main() {
    gl_Position = modelMatrix * vec4(position, 1.);
    // gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    vUv = uv;
}