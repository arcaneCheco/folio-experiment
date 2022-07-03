varying vec2 vUv;
varying vec3 vColor;

void main() {

    // gl_Position = projectionMatrix * viewMatrix * instanceMatrix * vec4(position, 1.);
    // gl_Position = instanceMatrix * vec4(vec3(uv-vec2(0.5), 1.), 1.);
    gl_Position = modelMatrix * instanceMatrix * vec4(position, 1.);
    // gl_Position.x *= gl_Position.w;
    vUv = uv;
    vColor = instanceColor.xyz;
}