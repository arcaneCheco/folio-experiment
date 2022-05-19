varying vec2 vUv;

void main() {
    vec3 newPos = position;
    newPos.z -= sin(uv.x * 3.14) * 5.;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
    vUv = uv;
}