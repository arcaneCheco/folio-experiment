uniform float uBend;
uniform vec2 uvRate1;

varying vec2 vUv;
varying vec2 vUv1;

void main() {
    vUv = uv;
    vec2 _uv = uv - 0.5;
    vUv1 = _uv;
    vUv1 *= uvRate1.xy;
    vUv1 += 0.5;

    vec3 newPos = position;
    newPos.z -= sin(uv.x * 3.14) * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
}