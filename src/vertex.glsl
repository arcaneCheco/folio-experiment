uniform sampler2D u_buffer;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
uniform mat4 textureMatrix;
varying vec4 vCoord;

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

void main() {
    vCoord = textureMatrix * vec4( position, 1.0 );
    vec2 cellSize = vec2(0.0001);
    vec3 objectNormal = vec3(
					( texture2D( u_buffer, uv + vec2( - cellSize.x, 0 ) ).x - texture2D( u_buffer, uv + vec2( cellSize.x, 0 ) ).x ),
					( texture2D( u_buffer, uv + vec2( 0, - cellSize.y ) ).x - texture2D( u_buffer, uv + vec2( 0, cellSize.y ) ).x ),
					1. );
    #include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
    vNormal = normalize(transformedNormal);

    float mag = 0.2; // 0.1
    float offset = 0.; // 0.02
    float heightValue = texture2D( u_buffer, uv + offset).x * mag - mag;
    float l = 2.;
    // heightValue = clamp(heightValue, -l, l);
	vec3 transformed = vec3( position.x, position.y, heightValue);

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