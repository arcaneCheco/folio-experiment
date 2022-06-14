// MODE
#define MODE_DEFAULT
// #define MODE_WORK_LIST_ITEM
// #define MODE_WORK_LIST_TEXT_BATCH

/****msdf*****/
float msdf(sampler2D tMap, vec2 uv) {
    vec3 tex = texture2D(tMap, uv).rgb;
    float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;

    // TODO: fallback for fwidth for webgl1 (need to enable ext)
    float d = fwidth(signedDist);
    float alpha = smoothstep(-d, d, signedDist);
    if (alpha < 0.01) discard;
    return alpha;
}

float strokemsdf(sampler2D tMap, vec2 uv, float stroke, float padding) {
    vec3 tex = texture2D(tMap, uv).rgb;
    float signedDist = max(min(tex.r, tex.g), min(max(tex.r, tex.g), tex.b)) - 0.5;
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

/****rgb2hsv*****/
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
/****rgb2hsv*****/

/****transformUV*****/
vec2 transformUV(vec2 uv, float a[9]) {

    // Convert UV to vec3 to apply matrices
	vec3 u = vec3(uv, 1.0);

    // Array consists of the following
    // 0 translate.x
    // 1 translate.y
    // 2 skew.x
    // 3 skew.y
    // 4 rotate
    // 5 scale.x
    // 6 scale.y
    // 7 origin.x
    // 8 origin.y

    // Origin before matrix
    mat3 mo1 = mat3(
        1, 0, -a[7],
        0, 1, -a[8],
        0, 0, 1);

    // Origin after matrix
    mat3 mo2 = mat3(
        1, 0, a[7],
        0, 1, a[8],
        0, 0, 1);

    // Translation matrix
    mat3 mt = mat3(
        1, 0, -a[0],
        0, 1, -a[1],
    	0, 0, 1);

    // Skew matrix
    mat3 mh = mat3(
        1, a[2], 0,
        a[3], 1, 0,
    	0, 0, 1);

    // Rotation matrix
    mat3 mr = mat3(
        cos(a[4]), sin(a[4]), 0,
        -sin(a[4]), cos(a[4]), 0,
    	0, 0, 1);

    // Scale matrix
    mat3 ms = mat3(
        1.0 / a[5], 0, 0,
        0, 1.0 / a[6], 0,
    	0, 0, 1);

	// apply translation
   	u = u * mt;

	// apply skew
   	u = u * mh;

    // apply rotation relative to origin
    u = u * mo1;
    u = u * mr;
    u = u * mo2;

    // apply scale relative to origin
    u = u * mo1;
    u = u * ms;
    u = u * mo2;

    // Return vec2 of new UVs
    return u.xy;
}

vec2 rotateUV(vec2 uv, float r, vec2 origin) {
    vec3 u = vec3(uv, 1.0);

    mat3 mo1 = mat3(
        1, 0, -origin.x,
        0, 1, -origin.y,
        0, 0, 1);

    mat3 mo2 = mat3(
        1, 0, origin.x,
        0, 1, origin.y,
        0, 0, 1);

    mat3 mr = mat3(
        cos(r), sin(r), 0,
        -sin(r), cos(r), 0,
        0, 0, 1);

    u = u * mo1;
    u = u * mr;
    u = u * mo2;

    return u.xy;
}

vec2 rotateUV(vec2 uv, float r) {
    return rotateUV(uv, r, vec2(0.5));
}

vec2 translateUV(vec2 uv, vec2 translate) {
    vec3 u = vec3(uv, 1.0);
    mat3 mt = mat3(
        1, 0, -translate.x,
        0, 1, -translate.y,
        0, 0, 1);

    u = u * mt;
    return u.xy;
}

vec2 scaleUV(vec2 uv, vec2 scale, vec2 origin) {
    vec3 u = vec3(uv, 1.0);

    mat3 mo1 = mat3(
        1, 0, -origin.x,
        0, 1, -origin.y,
        0, 0, 1);

    mat3 mo2 = mat3(
        1, 0, origin.x,
        0, 1, origin.y,
        0, 0, 1);

    mat3 ms = mat3(
        1.0 / scale.x, 0, 0,
        0, 1.0 / scale.y, 0,
        0, 0, 1);

    u = u * mo1;
    u = u * ms;
    u = u * mo2;
    return u.xy;
}

vec2 scaleUV(vec2 uv, vec2 scale) {
    return scaleUV(uv, scale, vec2(0.5));
}
/****transformUV*****/

/****defaultText*****/
#ifdef MODE_DEFAULT
uniform sampler2D tMap;
uniform vec3 uColor;
uniform float uAlpha;
uniform float uHover;

varying vec2 vUv;

void main() {
    float alpha = msdf(tMap, vUv);

    gl_FragColor.rgb = uColor;
    gl_FragColor.a = alpha * uAlpha + uHover * 0.5;
}
#endif
/****defaultText*****/

/****workListItem*****/
#ifdef MODE_WORK_LIST_ITEM
uniform sampler2D tMap;
uniform sampler2D tMask;
const float uStroke=0.3; //uniform float uStroke;
const float uPadding=4.2; //uniform float uPadding;
uniform float uHover;
uniform float uTransition;
uniform float uTime;
uniform vec2 uResoultion;
uniform vec3 uTextColor;

varying vec2 vUv;
varying vec2 vUv2;

void main() {
    float time = uTime;
    vec2 resolution = uResoultion;
    vec2 uv = vUv;

    float noise = cnoise(vec3(vUv*400.0, time));
    uv *= 1.0+noise*crange(uHover, 0.0, 0.5, 0.0, 1.0)*crange(uHover, 0.5, 1.0, 1.0, 0.0)*0.002;

    float fill = msdf(tMap, uv);
    float stroke = strokemsdf(tMap, uv, uStroke, uPadding * 0.1);

    float hover = crange(uHover, 0.0, 1.0, 0.05, 0.9);
    // hover *= smoothstep(vUv.x-0.1, vUv.x+0.1, uHover);

    float alpha = mix(stroke, fill, hover);
    alpha *= crange(uHover, 0.0, 1.0, 0.75, 1.0);

    if (uTransition < 2.0) {
        alpha *= animateLevels(texture2D(tMask, (gl_FragCoord.xy / resolution) * 3.0).r, uTransition);
    }

    vec3 color = vec3(uTextColor);

    float flicker = sin(time*10.0)*sin(time*20.0)*sin(time*4.0)*uHover;
    color = rgb2hsv(color);
    color.x += flicker*0.03;
    color.z += flicker*0.03;
    color = hsv2rgb(color);


    gl_FragColor.rgb = color;//vec3(getBoundingUV(), 1.0);
    gl_FragColor.a = alpha;
}
#endif
/****workListItem*****/


/****workListTextBatch*****/
#ifdef MODE_WORK_LIST_TEXT_BATCH
uniform sampler2D tMap;
uniform sampler2D tMask;
uniform float uTime;
uniform vec2 uResoultion;
const float uStroke=0.3; //uniform float uStroke;
const float uPadding=4.2; //uniform float uPadding;
uniform float uHover;
uniform float uTransition;
uniform vec3 uTextColor;

varying vec2 vUv;
varying vec2 vUv2;

void main() {
    float time = uTime;
    vec2 resolution = uResoultion;
    vec2 uv = vUv;

    float noise = cnoise(vec3(vUv*80.0, time));
    float noise2 = cnoise(vec3(vUv*10.0, time*0.5));
    float staticNoise = range(getNoise(vUv * 3., time*0.1), 0.0, 1.0, -1.0, 1.0);

    float hoverBounce = crange(uHover, 0.0, 0.5, 0.0, 1.0)*crange(uHover, 0.5, 1.0, 1.0, 0.0);
    uv *= 1.0+noise*hoverBounce*0.002;
    //uv = scaleUV(uv, vec2(1.0+hoverBounce*0.01));

    float fill = msdf(tMap, uv);
    float stroke = strokemsdf(tMap, uv, uStroke + hoverBounce*0.3, uPadding * 0.09);

    float hover = crange(uHover, 0.0, 1.0, 0.05, 0.9);
    //hover *= smoothstep(vUv.x-0.1, vUv.x+0.1, uHover);

    float alpha = mix(stroke, fill, hover);
    alpha *= crange(uHover, 0.0, 1.0, 0.9, 1.0);

    if (uTransition < 2.0) {
        alpha *= animateLevels(texture2D(tMask, (gl_FragCoord.xy / resolution) * 3.0).r, uTransition);
    }

    vec3 color = vec3(uTextColor);

    float flicker = sin(time*25.0)*sin(time*60.0)*sin(time*4.0)*sin(time*12.0)*uHover;
    color = rgb2hsv(color);
    color.x += flicker*0.05;
    color.z += -0.07+flicker*0.07;
    color = hsv2rgb(color);

    color += staticNoise*hoverBounce*1.2;

    color *= 1.0 + noise2*0.02;


    gl_FragColor.rgb = color;//vec3(getBoundingUV(), 1.0);
    gl_FragColor.a = alpha;
    float uAlpha = 1.;
    float uOpacity = 1.;
    float vTrans = 1.;
    float uFaded = 1.;
   gl_FragColor.a = clamp(alpha * uAlpha * uOpacity * vTrans * uFaded, 0.0, 1.0) * 0.4;
}
#endif
/****workListTextBatch*****/