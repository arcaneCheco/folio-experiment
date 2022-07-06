uniform sampler2D uTextMap;

varying vec2 vUv;

void main() {
    vec4 text = texture2D(uTextMap, vUv);
    float borderWidth = 0.01;
    float topBorder = step(1. - borderWidth, vUv.y);
    float bottomBorder = step(vUv.y, borderWidth);
    gl_FragColor = vec4(vec3(0.2) + text.rgb, 0.5);
    gl_FragColor += topBorder + bottomBorder;
}