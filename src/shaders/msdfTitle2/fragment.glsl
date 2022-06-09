uniform sampler2D uMap;
uniform vec3 uColor;
uniform float uActive;

varying vec2 vUv;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

void main() {
    vec3 font = texture2D(uMap, vUv).rgb;
    float sigDist = median(font.r, font.g, font.b) - 0.5;
    float fill = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);

    vec3 color = uColor;
    color.b = step(0.5, uActive);
    gl_FragColor = vec4(color, fill);
    if (gl_FragColor.a < 0.001) discard;
}