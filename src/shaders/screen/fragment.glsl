uniform sampler2D uTexture;

varying vec2 vUv;
varying vec2 vUv1;

void main() {
    vec4 image = texture2D(uTexture, vUv1);
    gl_FragColor = image;
}