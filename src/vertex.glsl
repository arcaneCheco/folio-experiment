uniform sampler2D u_buffer;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
uniform mat4 textureMatrix;
uniform float uTime;
varying vec4 vCoord;

#pragma glslify: snoise = require(./shaders/partials/simplex3d.glsl)

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>


float FBM2( vec2 uv, float z )
{
	float lacunarity = 2.0;
	float gain = 0.25;
    float amplitude = 1.0;
    float frequency = 1.0;
    float sum = 0.0;
    for(int i = 0; i < 2; ++i)
    {
        sum += amplitude * snoise(vec3( uv * frequency, z ));
        amplitude *= gain;
        frequency *= lacunarity;
    }
    return sum;
}
float pattern( vec2 uv )
{
	return FBM2( uv, uTime );
}

void main() {
    vCoord = textureMatrix * vec4( position, 1.0 );
    vec2 cellSize = vec2(0.0001);

    vec3 objectNormal = vec3(
					( texture2D( u_buffer, uv + vec2( - cellSize.x, 0 ) ).x - texture2D( u_buffer, uv + vec2( cellSize.x, 0 ) ).x ),
					( texture2D( u_buffer, uv + vec2( 0, - cellSize.y ) ).x - texture2D( u_buffer, uv + vec2( 0, cellSize.y ) ).x ),
					1. );

    vec2 uvfbm = uv * 100.0;
	uvfbm.y += uTime * 2.;
    vec2 disturb = vec2( pattern( uvfbm ), pattern( uvfbm + vec2( 5.2, 1.3 ) ) );
	disturb *= 0.12;

    #include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
    vNormal = normalize(transformedNormal);

    // float dr = 75.*(1.+ (position.y + .5)); 
    // float n = snoise(vec3(position.x * uTime, position.y, uTime));

    float n = 1.;

    float mag = 0.2; // 0.1
    float offset = 0.; // 0.02
    float heightValue = texture2D( u_buffer, uv + offset).x * mag - mag;
    heightValue *= n;
    float l = 2.;
    // heightValue = clamp(heightValue, -l, l);
	vec3 transformed = vec3( position.x, position.y, heightValue);
    transformed += vec3(disturb.x, 0., disturb.y) * normal;

    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>

    vViewPosition = - mvPosition.xyz;
    vUv = uv;

    #include <worldpos_vertex>
    #include <envmap_vertex>
    #include <shadowmap_vertex>
    #include <fog_vertex>


}