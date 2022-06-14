varying vec2 vUv;
varying vec2 pUv;

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

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
    vUv = uv;
    pUv.x = crange(position.x, 0., 8., 0.0, 1.0);
    pUv.y = crange(position.y, 0., 1., 0.0, 1.0);
    // pUv = position.xy;
}