attribute vec3 aOpenPosition;

uniform float uIsActive;

void main() {
    vec3 newPos = mix(position, aOpenPosition, uIsActive);
    gl_Position = modelMatrix * vec4(newPos, 1.);
}