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



#define OCTAVES 1

uniform float uTime;
uniform sampler2D uGreyNoise;
uniform sampler2D uMatcap;
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

/*********/
// float spike( float x ) { // spike(0)=0, spike(0.5)=1, spike(1)=0
//     return 0.5 * abs( mod( 4. * x - 2., 4. ) - 2. );
// }
// float trees0( float x ) {
//     float f0 = spike( x + .7 ) - .8;
//     float f1 = spike( 2. * x + .2 ) - .68;
//     float f2 = spike( 3. * x + .55 ) - .73;
//     float f3 = spike( 2. * x + .4 ) - .76;
//     float f4 = spike( 3. * x + .85 ) - .79;
//     float f5 = spike( 2. * x + .55 ) - .79;
//     float f6 = spike( 3. * x + .3 ) - .82;
//     return .5 * max( 0., max( f0, max( f1, max( f2, max( f3, max( f4, max( f5, f6 ) ) ) ) ) ) );
// }
// float yTree = trees0(vUv.x * 3.);
// if (yTree > y) {
//   gl_FragColor.rbg =  vec3( 0.);
/*********/
// mountains
#pragma glslify: snoise = require(../partials/simplex3d.glsl)
float FBM2( vec2 uv, float z )
{
	float lacunarity = 2.0;
	float gain = 0.25;
    float amplitude = 1.0;
    float frequency = 1.0;
    float sum = 0.0;
    for(int i = 0; i < 4; ++i)
    {
        sum += amplitude * snoise(vec3( uv * frequency, z ));
        amplitude *= gain;
        frequency *= lacunarity;
    }
    return sum;
}
// color *= clamp( (uv.y*3.0-FBM(uv * 10.0, 0.) * .2) * 50.0 - 10.0, 0.0, 1.0 );
/*********/
// https://www.shadertoy.com/view/sdB3Dz
float random2f(in vec2 q)
{
    return fract(cos(dot(q,vec2(143.543,56.32131)))*46231.56432);
}

float noiseagain(vec2 st)
{
    vec2 i = floor(st);
    vec2 f = fract(st);
    
    float a = random2f(i);
    float b = random2f(i + vec2(1.,0.));
    float c = random2f(i + vec2(0., 1.));
    float d = random2f(i + vec2(1., 1.));
    
    vec2 u = f * f * (3. - 2. * f);
    
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// From Inigo Quilez
float value_noise(in vec2 uv)
{
    float f = 0.;
    uv *= 8.0;
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    f  = 0.5000*noiseagain( uv ); uv = m*uv;
    f += 0.2500*noiseagain( uv ); uv = m*uv;
    f += 0.1250*noiseagain( uv ); uv = m*uv;
    f += 0.0625*noiseagain( uv ); uv = m*uv;
    return f;
}
/********/

void main() {
    vec2 nUv = vUv - vec2(0.5);
    // nUv = vWorldPosition.xz;
    float t = uTime * .2;
    nUv = rotUv(nUv, 0.1 * t);
    nUv *= 0.9 * (sin(t)) + 3.;
    nUv.x -= 0.2 * t;

    vec2 q = vec2(0.5);
    vec2 r = vec2(0.);

    float c = 3. * abs(pattern(nUv, t, q, r));
    vec3 col = vec3(c);
    float uC = 0.9;
    // col.r -= dot(q, r) * 5. * uC;
    // col.g -= dot(q, r) * 5. * 0.3;
    // col.b += dot(q, r) * 10. * (1. - uC);
    // col.b -= dot(q, r) * 1. * (uC);

    float strength = smoothstep(1., 0.0, 1.5*distance(vUv, vec2(0.5)));
    col = mix(vec3(0.), col, strength);

    float scale = 0.01;
    scale = 1./150.;
    scale = 1./75.;
    // scale = 1.;
    float x = vWorldPosition.x * scale;
    float y = vWorldPosition.y * scale;
    vec3 sky = vec3(0.0,0.05,0.1)*1.4;
    sky += 0.2*pow(1.0-max(0.0, y),2.0);

    vec3 skyCol = vec3(0.);
    skyCol += 0.1*pow(clamp(1.0-abs(y),0.0,1.0),9.0);
    // skyCol = mix( skyCol, sky, smoothstep(0.0,0.1, y) );

    // vec3 horizon = vec3(smoothstep(0.,1.0,pow(19.,-abs(y)-abs(x)*.4)));
    // sky += horizon;




    skyCol = mix( sky, col, smoothstep(0.0,0.1, y) );
    gl_FragColor = vec4(skyCol, 1.);
    // gl_FragColor *= 2.3;


    // float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;
    vec3 posOffset = vec3(30., 10., -75.);
    // posOffset = vec3(40., 0., 0.);
    vec3 target = vec3(0., -15., 70.);
    vec3 vSunDirection = normalize(target - posOffset);
    posOffset -= vSunDirection * 90.;

    vec3 direction = normalize( (vWorldPosition - posOffset));
    // vec3 vSunDirection = vec3(0., 0., 1);
    float cosTheta = dot( direction, vSunDirection );
    // float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
    // sundisk = step(moonSize, cosTheta);
    float moonSize = 0.99;
    // float sundisk = smoothstep(moonSize, moonSize * 1.010, cosTheta) * step(vWorldPosition.z, 0.);
    float sundisk = smoothstep(moonSize, moonSize * 1.010, cosTheta);
    // sundisk = smoothstep(moonSize, moonSize + 0.01000001, cosTheta);
    // gl_FragColor.rgb = mix( gl_FragColor.rgb, vec3(2.), sundisk - 0.);
    // gl_FragColor += 0.2;


    float jacked_time = 5.5*uTime;
    const vec2 scaleHeat = vec2(.5);
    vec2 nXY = vec2(x, y) + 0.11*sin(scaleHeat*jacked_time + length( vec2(x, y) )*10.0);

    gl_FragColor = vec4(sky, c*7.);
    gl_FragColor = vec4(sky, 1.);
    // gl_FragColor = vec4(nXY, 0.5, 1.);
    // gl_FragColor = texture2D(uMatcap, vMatcapUv);
    gl_FragColor.rgb = mix( gl_FragColor.rgb, vec3(1.), sundisk - 0.);
    // gl_FragColor.a = c*4.;

  //mountains
    float color = clamp( (y*2.5-FBM2(vec2(x*.3,y*0.3) * 10.0, 0.) * .15) * 50.0 - 10.0, 0.0, 1.0 );
    gl_FragColor.rgb *= color;

    //
    float cloudss = smoothstep(0.95,0.,1.-y);
    vec3 cloudcol = vec3(0.);
    vec3 suncol1 = vec3(0.5, 0.5, 0.) * 0.;
    vec3 cloudcolor = mix(cloudcol, suncol1, 0.7*(1.-y+0.));
    
    float cloud_val1 = (value_noise(vec2(x, y)*vec2(1.,7.)+vec2(1.,0.)*-uTime*0.010));
    float cloud_val2 = (value_noise(vec2(x, y)*vec2(2.,8.)+vec2(2.,.2)*-(uTime)*0.02));
    float cloud_val3 = (value_noise(vec2(x, y)*vec2(1.,5.)+vec2(1.,0.)*-(uTime)*0.005));
    float cloud_val = sqrt(cloud_val2*cloud_val1);
    cloud_val = sqrt(cloud_val3*cloud_val);
    
    // Hard(er)-edged clouds
    cloud_val = smoothstep(0.48,0.5,cloud_val);

    gl_FragColor.rgb = mix(gl_FragColor.rgb, cloudcolor, cloud_val*cloudss);
    gl_FragColor.a = 1.;

}