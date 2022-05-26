varying vec2 vUv;
varying vec3 vNormal;
uniform vec3 u_color;
uniform sampler2D u_buffer;
uniform sampler2D tReflectionMap;
varying vec4 vCoord;
uniform vec2 u_resolution;

void main() {
	vec4 tex = texture2D(u_buffer, vUv);
	// gl_FragColor = vec4(vUv, 0., 1.);
	gl_FragColor = tex + 0.1;
	// gl_FragColor.xyz = vNormal;
	// calculate final uv coords
	vec3 coord = vCoord.xyz / vCoord.w;
	vec2 uv = coord.xy + coord.z;// * vNormal.xz * 0.5;
	vec4 texR = texture2D(tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );
	gl_FragColor = vec4(u_color, 1.) * texR;

	// vec4 fragcolour = vec4(0.);

	// vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
	// vec2 sampleR = gl_FragCoord.xy / u_resolution.xy;

	// float distortion;
	// distortion = 0.; ///////////
	// // vec4 reflections = renderPass(uv, distortion);

	// vec4 c = texture2D(u_texture, uv*1.5+distortion).rbra;
	// fragcolour = c * c * c * .4;
	// // fragcolour *= fragcolour; 
	// fragcolour += (texture2D(u_buffer, sampleR+.03).x)*.1 - .1;
	// // fragcolour += reflections*.7;

	// gl_FragColor = fragcolour ;
}