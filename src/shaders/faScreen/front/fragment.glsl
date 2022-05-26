varying vec2 vUv;

void main() {
    vec2 nUv = vUv - vec2(0.5);
    float ratio =  16. / 9.;
    // nUv.y *= ratio;

    vec3 image = vec3(1., 0., 1.);
    vec3 frameCol = vec3(1., 1., 1.);

    // u;
    float frameX = step(0.4, abs(nUv.x));
    vec3 col = mix(image, frameCol, frameX);
    // v;
    float frameY = step(0.4, abs(nUv.y));
    col = mix(col, frameCol, frameY);

    
    gl_FragColor = vec4(col, 1.);
}