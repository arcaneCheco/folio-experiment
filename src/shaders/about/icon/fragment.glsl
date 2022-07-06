uniform sampler2D uIcon;

varying vec2 vUv;

void main() {
    vec4 icon = texture2D(uIcon, vUv);
    vec3 col = mix(vec3(1.), vec3(0.), icon.b);
    gl_FragColor = vec4(vec3(1.), icon.a);
}