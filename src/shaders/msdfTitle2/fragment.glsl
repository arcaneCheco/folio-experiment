/****msdf*****/
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

float strokemsdf(sampler2D tMap, vec2 uv, float stroke, float padding) {
    vec3 font = texture2D(tMap, uv).rgb;
    float signedDist = median(font.r, font.g, font.b) - 0.5;
    float t = stroke;
    float alpha = smoothstep(-t, -t + padding, signedDist) * smoothstep(t, t - padding, signedDist);
    return alpha;
}
/****msdf*****/

/****range*****/
float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    float oldRange = oldMax - oldMin;
    float newRange = newMax - newMin;
    return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
}

float crange(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
    return clamp(range(oldValue, oldMin, oldMax, newMin, newMax), min(newMax, newMin), max(newMin, newMax));
}
/****range*****/

/****levelmask*****/
float levelChannel(float inPixel, float inBlack, float inGamma, float inWhite, float outBlack, float outWhite) {
    return (pow(((inPixel * 255.0) - inBlack) / (inWhite - inBlack), inGamma) * (outWhite - outBlack) + outBlack) / 255.0;
}

vec3 levels(vec3 inPixel, float inBlack, float inGamma, float inWhite, float outBlack, float outWhite) {
    vec3 o = vec3(1.0);
    o.r = levelChannel(inPixel.r, inBlack, inGamma, inWhite, outBlack, outWhite);
    o.g = levelChannel(inPixel.g, inBlack, inGamma, inWhite, outBlack, outWhite);
    o.b = levelChannel(inPixel.b, inBlack, inGamma, inWhite, outBlack, outWhite);
    return o;
}

float animateLevels(float inp, float t) {
    float inBlack = 0.0;
    float inGamma = range(t, 0.0, 1.0, 0.0, 3.0);
    float inWhite = range(t, 0.0, 1.0, 20.0, 255.0);
    float outBlack = 0.0;
    float outWhite = 255.0;

    float mask = 1.0 - levels(vec3(inp), inBlack, inGamma, inWhite, outBlack, outWhite).r;
    mask = max(0.0, min(1.0, mask));
    return mask;
}
/****levelmask*****/

/****simplenoise*****/
float getNoise(vec2 uv, float time) {
    float x = uv.x * uv.y * time * 1000.0;
    x = mod(x, 13.0) * mod(x, 123.0);
    float dx = mod(x, 0.01);
    float amount = clamp(0.1 + dx * 100.0, 0.0, 1.0);
    return amount;
}

highp float random(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = dot(co.xy, vec2(a, b));
    highp float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}

float cnoise(vec3 v) {
    float t = v.z * 0.3;
    v.y *= 0.8;
    float noise = 0.0;
    float s = 0.5;
    noise += range(sin(v.x * 0.9 / s + t * 10.0) + sin(v.x * 2.4 / s + t * 15.0) + sin(v.x * -3.5 / s + t * 4.0) + sin(v.x * -2.5 / s + t * 7.1), -1.0, 1.0, -0.3, 0.3);
    noise += range(sin(v.y * -0.3 / s + t * 18.0) + sin(v.y * 1.6 / s + t * 18.0) + sin(v.y * 2.6 / s + t * 8.0) + sin(v.y * -2.6 / s + t * 4.5), -1.0, 1.0, -0.3, 0.3);
    return noise;
}

float cnoise(vec2 v) {
    float t = v.x * 0.3;
    v.y *= 0.8;
    float noise = 0.0;
    float s = 0.5;
    noise += range(sin(v.x * 0.9 / s + t * 10.0) + sin(v.x * 2.4 / s + t * 15.0) + sin(v.x * -3.5 / s + t * 4.0) + sin(v.x * -2.5 / s + t * 7.1), -1.0, 1.0, -0.3, 0.3);
    noise += range(sin(v.y * -0.3 / s + t * 18.0) + sin(v.y * 1.6 / s + t * 18.0) + sin(v.y * 2.6 / s + t * 8.0) + sin(v.y * -2.6 / s + t * 4.5), -1.0, 1.0, -0.3, 0.3);
    return noise;
}
/****simplenoise*****/

uniform sampler2D tMap;
uniform sampler2D tMask;
uniform vec3 uColor;
uniform vec2 uResoultion;
uniform float uHover;
uniform float uTransition;
uniform float uStroke;
uniform float uPadding;
uniform float uTime;

varying vec2 vUv;
varying vec2 pUv;

void main() {
    float fill = msdf(tMap, vUv);
    float stroke = strokemsdf(tMap, vUv, uStroke, uPadding);

    float hover = crange(uHover, 0.0, 1.0, 0.05, 0.9);
    hover *= smoothstep(vUv.x-0.1, vUv.x+0.1, uHover);
    float alpha = mix(stroke, fill, hover);
    alpha *= crange(uHover, 0.0, 1.0, 0.75, 1.0);

    // float uTransition = sin(uTime) + 1.5;
    // // alpha *= animateLevels(texture2D(tMask, (gl_FragCoord.xy / uResoultion) * 3.0).r, uTransition);
    // alpha *= animateLevels(texture2D(tMask, pUv * 1.0).r, uTransition);

    // vec2 screenUV = gl_FragCoord.xy / uResoultion;
    // // screenUV = pUv;
    // float uNoiseScale = 5000.;
    // float uNoiseSpeed = 0.5;
    // float noise = cnoise(vec3(screenUV*uNoiseScale + .4324, uTime*uNoiseSpeed*0.3 + .345));
    // float noise_2 = cnoise(vec3(screenUV*uNoiseScale*0.8, uTime*uNoiseSpeed*0.3));
    // float noiseOver = cnoise(vec3(screenUV*uNoiseScale*10., uTime*uNoiseSpeed*.7)) * uHover;

    // vec3 color = uColor;
    // color = vec3(0.2);
    // // color.b = step(0.5, uHover);

    // vec3 uColor1 = vec3(0.15, .3, .85);
    // vec3 uColor2 = vec3(0.05, .5, .95);
    // color = mix(color, uColor1, clamp(noise, 0., 1.));
    // color = mix(color, uColor2, clamp(noise_2, 0., 1.));
    // color = mix(color, vec3(1.), clamp(noiseOver, 0., 1.));

    gl_FragColor = vec4(vec3(0.5), fill);
    // gl_FragColor = vec4(color, alpha);
    // gl_FragColor = vec4(pUv.x, pUv.y, 0., 1.);
}