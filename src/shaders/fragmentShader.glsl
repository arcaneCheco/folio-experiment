uniform vec2 u_resolution;
uniform vec3 u_mouse;
uniform float u_time;
uniform sampler2D u_buffer;
uniform int u_frame;

varying vec2 vUv;

const float PI = 3.141592653589793;

vec4 renderRipples2() {
    vec2 cellSize = 1.0 / u_resolution.xy;
    vec3 e = vec3(cellSize, 0.);
    vec2 mouse = vUv - u_mouse.xy;
    float ratio = u_resolution.x / u_resolution.y;
    mouse.x *= ratio;

    vec4 heightmapValue = texture2D(u_buffer, vUv);

    float t = texture2D(u_buffer, vUv-e.zy, 1.).x;
    float r = texture2D(u_buffer, vUv-e.xz, 1.).x;
    float b = texture2D(u_buffer, vUv+e.xz, 1.).x;
    float l = texture2D(u_buffer, vUv+e.zy, 1.).x;

    // float viscosityConstant = 0.98;
    // float mouseSize = 2.;

    // float newHeight = ( ( t + b + r + l ) * 0.5 - heightmapValue.y ) * viscosityConstant;

    // float mousePhase = clamp( length( mouse * 30. ) * PI / mouseSize, 0.0, PI );
    // newHeight += ( cos( mousePhase ) + 1.0 ) * 0.28;

    // heightmapValue.y = heightmapValue.x;
    // heightmapValue.x = newHeight;

    // return heightmapValue;

    float shade = 0.;

    if(u_mouse.z == 1.) {
        shade = smoothstep(.02 + abs(sin(u_time*10.) * .006), .0, length(mouse)*1.5); 
    }
    // shade = smoothstep(.02 + abs(sin(u_time*10.) * .006), .0, length(mouse)); 

    // random ripples
    // if(mod(u_time, .1) >= .095) {
    //     vec2 hash = hash2(vec2(u_time*2., sin(u_time*10.)))*3.-1.;
    //     shade += smoothstep(.012, .0, length(uv-hash+.5));
    // }

    vec4 texcol = heightmapValue;

    float d = shade * 2.;
    // d = shade;


    d += -(texcol.y-.5)*2. + (t + r + b + l - 2.);
    d *= .99;
    // d *= float(u_frame > 5);
    d = d*.5+.5;

    heightmapValue = vec4(d, texcol.x, 0., 0.);

    return heightmapValue;
}

vec4 heighmapexample() {
    float viscosityConstant = 0.98;
    float mouseSize = 20.;
    float BOUNDS = 512.;
    vec2 mousePos = vec2(u_mouse.x * u_resolution.x, u_mouse.y * u_resolution.y);

    vec2 cellSize = 1.0 / u_resolution.xy;

    vec2 uv = gl_FragCoord.xy * cellSize;

    // heightmapValue.x == height from previous frame
    // heightmapValue.y == height from penultimate frame
    // heightmapValue.z, heightmapValue.w not used
    vec4 heightmapValue = texture2D( u_buffer, uv );

    // Get neighbours
    vec4 north = texture2D( u_buffer, uv + vec2( 0.0, cellSize.y ) );
    vec4 south = texture2D( u_buffer, uv + vec2( 0.0, - cellSize.y ) );
    vec4 east = texture2D( u_buffer, uv + vec2( cellSize.x, 0.0 ) );
    vec4 west = texture2D( u_buffer, uv + vec2( - cellSize.x, 0.0 ) );

    // https://web.archive.org/web/20080618181901/http://freespace.virgin.net/hugo.elias/graphics/x_water.htm

    float newHeight = ( ( north.x + south.x + east.x + west.x ) * 0.5 - heightmapValue.y ) * viscosityConstant;

    // Mouse influence
    float mousePhase = clamp( length( ( uv - vec2( 0.5 ) ) * BOUNDS - vec2( mousePos.x, - mousePos.y ) ) * PI / mouseSize, 0.0, PI );
    mousePhase = clamp( length( ( uv - vec2( 0.5 ) ) - vec2( mousePos.x, - mousePos.y ) ) * PI / mouseSize, 0.0, PI );
    newHeight += ( cos( mousePhase ) + 1.0 ) * 0.28;

    heightmapValue.y = heightmapValue.x;
    heightmapValue.x = newHeight;

    return heightmapValue;
}

void main() {
    gl_FragColor = renderRipples2();
    // gl_FragColor = heighmapexample();
    
}