uniform vec2 uColor;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(uColor, 0., .5);
}