// varying vec3 vWorldPosition;
// varying vec2 vUv;
// uniform sampler2D uGreyNoise;
// uniform float uTime;

// float fbm( vec2 p )
// {
//     return 0.5000*texture2D( uGreyNoise, p*1.00 ).x + 
//            0.2500*texture2D( uGreyNoise, p*2.02 ).x + 
//            0.1250*texture2D( uGreyNoise, p*4.03 ).x + 
//            0.0625*texture2D( uGreyNoise, p*8.04 ).x;
// }

// void main() {
//     float scale = 0.01;
//     float x = vWorldPosition.x * scale;
//     float y = vWorldPosition.y * scale;
//     // x = abs(x);
//     // y = abs(y);
//     // x = vUv.x;
//     // y = vUv.y * 2.;
//     vec3 col = vec3(0., 0., 0.);
//     // vec3 sky = vec3(0.0,0.05,0.1)*1.4;
//     vec3 sky = vec3(0.0,0.05,0.1)*4.4;
//     sky += 0.2*pow(1.0-max(0.0, y),2.0);

//     // //stars
//     // sky += 0.5*smoothstep( 0.95,1.00,texture2D( uGreyNoise, 0.25*vec2(x,y) ).x);
//     // sky += 0.5*smoothstep( 0.85,1.0,texture2D( uGreyNoise, 0.25*vec2(x,y) ).x);

//     // // clouds
//     // float f = fbm( 0.002*vec2(x,1.0)/y );
//     // vec3 cloud = vec3(0.3,0.4,0.5)*0.7*(1.0-0.85*smoothstep(0.4,1.0,f));
//     // sky = mix( sky, cloud, 0.95*smoothstep( 0.4, 0.6, f ) );
//     // sky = mix( sky, vec3(0.33,0.34,0.35), pow(1.0-max(0.0,y),2.0) );
//     // // horizon
//     col += 0.1*pow(clamp(1.0-abs(y),0.0,1.0),9.0);

//     col = mix( col, sky, smoothstep(0.0,0.1, y) );

//     gl_FragColor = vec4(col, 1.);
// }



#define OCTAVES 2

uniform float uTime;
uniform sampler2D uGreyNoise;
varying vec3 vWorldPosition;
varying vec2 vMatcapUv;

varying vec2 vUv;

vec2 rotUv(vec2 uv, float a) {
    float c = cos(a);
    float s = sin(a);
    mat2 m = mat2(c,s,-s,c);
    return m * uv;
}

vec2 random2(vec2 st){
      vec2 t = vec2(texture2D(uGreyNoise, st/1023.).x, texture2D(uGreyNoise, st/1023.+.5).x);
      return t*t*4.;
    }

// value noise: https://www.shadertoy.com/view/lsf3WH
float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);

        vec2 u = f*f*(3.0-2.0*f);

        return mix( mix( dot( random2(i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                         dot( random2(i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                    mix( dot( random2(i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                         dot( random2(i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
    }

float fbm(in vec2 _st) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      for (int i = 0; i < OCTAVES; ++i) {
          v += a * noise(_st);
        _st = rotUv(_st, 0.5) * 2. + shift;
        a *= 0.4;
      }
      return v;
    }

float pattern(vec2 uv, float time, inout vec2 q, inout vec2 r) {
      q = vec2(fbm(uv * .4), fbm(uv + vec2(5.2, 1.3)));

      r = vec2(fbm(uv * .1 + 4.0 * q + vec2(1.7 - time / 2.,9.2)), fbm(uv + 4.0 * q + vec2(8.3 - time / 2., 2.8)));

      vec2 s = vec2(fbm(uv + 5.0 * r + vec2(21.7 - time / 2., 90.2)), fbm( uv * .05 + 5.0 * r + vec2(80.3 - time / 2., 20.8))) * .35;

      return fbm(uv * .05 + 4.0 * s);
    }

// pattern adapted from: https://www.shadertoy.com/view/wttXz8
void main() {
    vec2 nUv = vUv - vec2(0.5);
    float t = uTime * 0.1;
    nUv = rotUv(nUv, 0.1 * t);
    nUv *= 0.9 * (sin(t)) + 3.;
    nUv.x -= 0.2 * t;

    vec2 q = vec2(0.);
    vec2 r = vec2(0.);

    float c = 3. * abs(pattern(nUv, t, q, r));
    vec3 col = vec3(c);
    float uC = 0.9;
    col.r -= dot(q, r) * 5. * uC;
    col.g -= dot(q, r) * 5. * 0.3;
    // col.b += dot(q, r) * 10. * (1. - uC);
    col.b += dot(q, r) * 10. * (uC);

    float strength = smoothstep(1., 0.0, 1.5*distance(vUv, vec2(0.5)));
    col = mix(vec3(0.), col, strength);

    float scale = 0.01;
    float x = vWorldPosition.x * scale;
    float y = vWorldPosition.y * scale;
    vec3 sky = vec3(0.0,0.05,0.1)*1.4;
    sky += 0.2*pow(1.0-max(0.0, y),2.0);

    vec3 skyCol = vec3(0.);
    skyCol += 0.1*pow(clamp(1.0-abs(y),0.0,1.0),9.0);
    // skyCol = mix( skyCol, sky, smoothstep(0.0,0.1, y) );




    skyCol = mix( sky, col, smoothstep(0.0,0.1, y) );
    gl_FragColor = vec4(skyCol, 1.) * 1.3;


    float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;
    vec3 posOffset = vec3(0., 1., 0.);
    vec3 direction = normalize( (vWorldPosition - posOffset) - vec3(0., 5, 23) );
    vec3 vSunDirection = vec3(0., 0., -1);
    float cosTheta = dot( direction, vSunDirection );
    float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
    float moonSize = 0.995;
    sundisk = step(moonSize, cosTheta);
    sundisk = smoothstep(moonSize, moonSize * 1.005, cosTheta);
    gl_FragColor.rgb = mix( gl_FragColor.rgb, vec3(1.), sundisk - 0.);
    // gl_FragColor += sundisk;
}