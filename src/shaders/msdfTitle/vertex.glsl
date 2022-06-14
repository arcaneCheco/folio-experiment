// MODE
#define MODE_DEFAULT
// #define MODE_WORK_LIST_ITEM
// #define MODE_WORK_LIST_TEXT_BATCH

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

/****defaultText*****/
#ifdef MODE_DEFAULT
varying vec2 vUv;

uniform vec3 screenPosition;
uniform vec2 scale;

void main() {
    vUv = uv;
    vec3 newPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
}
#endif
/****defaultText*****/

/****workListItem*****/
#ifdef MODE_WORK_LIST_ITEM
uniform vec3 uBoundingMin;
uniform vec3 uBoundingMax;

varying vec2 vUv;
varying vec2 vUv2;

vec2 getBoundingUV() {
    vec2 uv;
    uv.x = crange(position.x, uBoundingMin.x, uBoundingMax.x, 0.0, 1.0);
    uv.y = crange(position.y, uBoundingMin.y, uBoundingMax.y, 0.0, 1.0);
    return uv;
}

void main() {
    vUv = uv;
    vUv2 = getBoundingUV();
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
#endif
/****workListItem*****/

/****workListTextBatch*****/
#ifdef MODE_WORK_LIST_TEXT_BATCH
varying vec2 vUv;
varying vec2 vUv2;
varying vec3 v_uBoundingMin;
varying vec3 v_uBoundingMax;

vec2 getBoundingUV() {
    vec2 uv;
    uv.x = crange(position.x, v_uBoundingMin.x, v_uBoundingMax.x, 0.0, 1.0);
    uv.y = crange(position.y, v_uBoundingMin.y, v_uBoundingMax.y, 0.0, 1.0);
    return uv;
}

void main() {
    vUv = uv;
    vUv2 = getBoundingUV();
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
#endif
/****workListTextBatch*****/
