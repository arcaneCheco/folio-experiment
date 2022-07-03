uniform sampler2D uIcon;

varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(uIcon, vUv);
}