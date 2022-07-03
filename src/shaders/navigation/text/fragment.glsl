uniform sampler2D tMap;
uniform vec2 uViewport;
uniform vec2 uCenter;
uniform float uAspect;
uniform float uRadiusClosed;
uniform float uRadiusOpen;
uniform float uIsActive;

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

float createMask() {
    vec2 viewportUv = gl_FragCoord.xy / (uViewport)/1.;
    float radius = mix(uRadiusClosed, uRadiusOpen, uIsActive);
    radius = max(0., radius/uViewport.x);
    vec2 shapeUv = viewportUv - uCenter;
    shapeUv /= vec2(1., uAspect);
    shapeUv += uCenter;
    float dist = distance(shapeUv, uCenter);
    dist = smoothstep(radius, radius + 0.001, dist);
    return dist;
}

void main() {
    float fill = msdf(tMap, vUv);
    float mask = 1. - createMask();
    float alpha = fill * mask;
    gl_FragColor = vec4(vec3(1.), alpha);
}