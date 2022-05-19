uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
    vec4 image = texture2D(uTexture, vUv);
    gl_FragColor = vec4(vUv, 0., 1.);
    gl_FragColor = image;
}