#define PI 3.1415

uniform float uContact;
uniform float uContactMade;
uniform vec2 uMouse;
uniform vec2 uViewport;
uniform float uLength;
uniform float uRelease;
uniform float uTime;
uniform float uReleaseTime;

void main() {
    vec3 newPos = position;

    // float phase = PI * 5.;
    // float dist = position.x - uContact;
    // float influence = sin(dist * phase) / (dist * phase);
    
    // float scaleY = 3.; // line width from uniforms;
    // float ampY = uMouse.y * uViewport.y * 0.5 / scaleY;
    // float distortionY = influence * ampY;

    // float scaleX = 600.;
    // float ampX = (uMouse.x - uContact) * uViewport.x * 0.5 / scaleX;
    // float distortionX = influence * ampX;

    // if (uRelease > 0.5) {
    //     float timeElapsed = uTime - uReleaseTime;
    //     float decay = exp(-6.5 * timeElapsed) * sin(uTime * 100.);
    //     distortionX *= decay;
    //     distortionY *= decay;
    // }

    // newPos.y += distortionY;
    // newPos.x += distortionX;

    gl_Position = modelMatrix * vec4(newPos, 1.);
}