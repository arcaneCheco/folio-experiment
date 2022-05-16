varying vec3 vWorldPosition;
varying vec2 vUv;
uniform sampler2D uGreyNoise;
uniform float uTime;

float fbm( vec2 p )
{
    return 0.5000*texture2D( uGreyNoise, p*1.00 ).x + 
           0.2500*texture2D( uGreyNoise, p*2.02 ).x + 
           0.1250*texture2D( uGreyNoise, p*4.03 ).x + 
           0.0625*texture2D( uGreyNoise, p*8.04 ).x;
}

void main() {
    float scale = 0.01;
    float x = vWorldPosition.x * scale;
    float y = vWorldPosition.y * scale;
    // x = abs(x);
    // y = abs(y);
    // x = vUv.x;
    // y = vUv.y * 2.;
    vec3 col = vec3(0., 0., 0.);
    vec3 sky = vec3(0.0,0.05,0.1)*2.4;
    sky += 0.2*pow(1.0-max(0.0, y),2.0);

    // //stars
    // sky += 0.5*smoothstep( 0.95,1.00,texture2D( uGreyNoise, 0.25*vec2(x,y) ).x);
    // sky += 0.5*smoothstep( 0.85,1.0,texture2D( uGreyNoise, 0.25*vec2(x,y) ).x);

    // // clouds
    // float f = fbm( 0.002*vec2(x,1.0)/y );
    // vec3 cloud = vec3(0.3,0.4,0.5)*0.7*(1.0-0.85*smoothstep(0.4,1.0,f));
    // sky = mix( sky, cloud, 0.95*smoothstep( 0.4, 0.6, f ) );
    // sky = mix( sky, vec3(0.33,0.34,0.35), pow(1.0-max(0.0,y),2.0) );
    // // horizon
    col += 0.1*pow(clamp(1.0-abs(y),0.0,1.0),9.0);

    col = mix( col, sky, smoothstep(0.0,0.1, y) );

    gl_FragColor = vec4(col, 1.);
}