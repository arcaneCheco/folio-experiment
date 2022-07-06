uniform sampler2D tMap;

varying vec2 vUv;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

float msdf(sampler2D tMap, vec2 uv) {
    vec3 font = texture2D(tMap, uv).rgb;
    float signedDist = median(font.r, font.g, font.b) - 0.5;

    float d = fwidth(signedDist);
    // float fill = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
    float alpha = smoothstep(-d, d, signedDist);
    if (alpha < 0.01) discard;
    return alpha;
}

void main() {
    float fill = msdf(tMap, vUv);
    gl_FragColor = vec4(vec3(1.), fill);
    // gl_FragColor = vec4(1.);
}