uniform sampler2D uTexture;
uniform float uThickness;
uniform float uDarken;
uniform float uTime;
varying vec2 vUv;
const vec2 uAspect = vec2(16., 9.);

float border(vec2 uv, float thickness) {
    float padding = 0.3;
    float left = smoothstep(thickness*(1.0+padding)*uAspect.x, thickness*uAspect.x, uv.x) * smoothstep(0.0, thickness*padding*uAspect.x, uv.x);
    float right = smoothstep(1.0-thickness*(1.0+padding)*uAspect.x, 1.0-thickness*uAspect.x, uv.x) * smoothstep(1.0, 1.0-thickness*padding*uAspect.x, uv.x);
    float bottom = smoothstep(1.0-thickness*(1.0+padding)*uAspect.y, 1.0-thickness*uAspect.y, uv.y) * smoothstep(1.0, 1.0-thickness*padding*uAspect.y, uv.y);
    float top = smoothstep(thickness*(1.0+padding)*uAspect.y, thickness*uAspect.y, uv.y) * smoothstep(0.0, thickness*padding*uAspect.y, uv.y);

    // Fade overlaps
    left *= smoothstep(0.0, thickness*(1.0)*uAspect.y, uv.y) * smoothstep(1.0, 1.0-thickness*(1.0)*uAspect.y, uv.y);
    right *= smoothstep(0.0, thickness*(1.0)*uAspect.y, uv.y) * smoothstep(1.0, 1.0-thickness*(1.0)*uAspect.y, uv.y);
    bottom *= smoothstep(0.0, thickness*(1.0)*uAspect.x, uv.x) * smoothstep(1.0, 1.0-thickness*(1.0)*uAspect.x, uv.x);
    top *= smoothstep(0.0, thickness*(1.0)*uAspect.x, uv.x) * smoothstep(1.0, 1.0-thickness*(1.0)*uAspect.x, uv.x);

    float lines = left+right+bottom+top;
    return clamp(lines, 0.0, 1.0);
}

float edgeFactor(vec2 p){
    // vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p) / uThickness;
    vec2 cUv = p - vec2(0.5);
    // cUv = p - vec2(0.5, 0.);
    vec2 grid = abs(fract(cUv) - 0.5) / fwidth(p) / (uThickness * 100.);
    // vec2 grid = abs(fract(cUv) - 0.5) / vec2(0.01) / (uThickness * 100.);
    return min(grid.x, grid.y);
}

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

/****tv static*****/
const float e = 2.7182818284590452353602874713527;

float tvNoise(vec2 texCoord)
{
    float G = e + (uTime * 2.1);
    vec2 r = (G * sin(G * texCoord.xy));
    return fract(r.x * r.y * (1.0 + texCoord.x));
}
/****tv static*****/

/****simplex2d*****/
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    // First corner
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    
    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    
    // Permutations
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                     + i.x + vec3(0.0, i1.x, 1.0 ));
    
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    
    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
    
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    
    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    
    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}
/****simplex2d*****/

vec4 getBadTV(sampler2D image, vec2 uv, float time, float distortion, float distortion2, float speed, float rollSpeed) {
    vec2 p = uv;
    float ty = time * speed;
    float yt = p.y - ty;
    // Smooth distortion
    float offset = snoise(vec2(yt * 3.0, 0.0)) * 0.2;
    // Boost distortion
    offset = offset * distortion * offset * distortion * offset;
    // Add fine grain distortion
    offset += snoise(vec2(yt * 50.0, 0.0)) * distortion2 * 0.001;
    // Combine distortion on X with roll on Y
    return texture(image, vec2(fract(p.x + offset), fract(p.y - time * rollSpeed)));
}


/****aces film****/
#define saturate2(a) clamp( a, 0.0, 1.0 )

vec3 RRTAndODTFit2( vec3 v ) {
    vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
    vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
    return a / b;
}

vec3 ACESFilmicToneMapping2( vec3 color ) {
// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
    const mat3 ACESInputMat = mat3(
        vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
        vec3( 0.35458, 0.90834, 0.13383 ),
        vec3( 0.04823, 0.01566, 0.83777 )
    );

// ODT_SAT => XYZ => D60_2_D65 => sRGB
    const mat3 ACESOutputMat = mat3(
        vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
        vec3( -0.53108,  1.10813, -0.07276 ),
        vec3( -0.07367, -0.00605,  1.07602 )
    );

    color = ACESInputMat * color;

// Apply RRT and ODT
    color = RRTAndODTFit2( color );

    color = ACESOutputMat * color;

// Clamp to [0, 1]
    return saturate2( color );
}
/****aces film****/

void main() {
    float a = edgeFactor(vUv);
    float alpha = border(vUv, 0.1);
    vec4 image = texture2D(uTexture, vUv);
    vec3 edgeCol = mix(image.rgb, vec3(0.), a);
    gl_FragColor = vec4(image.rgb + edgeCol, 1.);
    gl_FragColor = image;
    gl_FragColor.a = alpha;
    
    vec3 col = image.rgb;

    // tvStativ
    // float tvStatic = tvNoise(vUv);
    // col = mix(col, vec3(0.), tvStatic);
    // col = mix(col, vec3(tvStatic), 0.15);

    // badTV
    // vec4 badTV = getBadTV(uTexture, vUv, uTime, 0., 1., 0.5, 0.0);
    // col = mix(col, badTV.rgb, 1.);

    // aces film
    float exposure = 0.5;
    vec3 aces =  ACESFilmicToneMapping2( col * exposure / 0.6);
    // col = mix(col, aces, 0.4);
    col = aces;


    vec2 uBorder = vec2(0.02);
    float borderAlpha = 0.0;
    // vec2 vUv2 = vec2(vUv.x * 16., vUv.y*9.);
    vec2 vUv2 = vUv;
    // vUv2.x *= 16./9.;
    borderAlpha = mix(borderAlpha, 1.0, crange(vUv2.x, uBorder.x, uBorder.x+0.0001, 1.0, 0.0));
    borderAlpha = mix(borderAlpha, 1.0, crange(vUv2.x, 1.0-uBorder.x, 1.0-uBorder.x+0.001, 0.0, 1.0));
    borderAlpha = mix(borderAlpha, 1.0, crange(vUv2.y, uBorder.y, uBorder.y+0.0001, 1.0, 0.0));
    borderAlpha = mix(borderAlpha, 1.0, crange(vUv2.y, 1.0-uBorder.y, 1.0-uBorder.y+0.001, 0.0, 1.0));
    vec3 borderCol = normalize(col);
    // vec3 borderCol = mix(col, vec3(vUv, 1.), 0.8);
    vec3 border = borderCol*borderAlpha;
    col *= uDarken;
    col += border;
    // col += border*(0.25+sin(uTime*2.4)*0.25);
    gl_FragColor = vec4(col, 0.75);

    // float tvStatic = tvNoise(vUv);
    // gl_FragColor = mix(gl_FragColor, vec4(0.), tvStatic);
    // gl_FragColor = vec4(tvStatic);

    

}