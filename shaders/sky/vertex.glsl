varying vec3 vWorldPosition;
varying vec2 vUv;
void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_Position.z = gl_Position.w; // set z to camera.far;
    vUv = uv;// - vec2(0.5);
}