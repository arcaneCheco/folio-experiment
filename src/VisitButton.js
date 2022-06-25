import * as THREE from "three";
import World from "./app2";
import font from "./text/Audiowide-Regular.json";
import TextGeometryOGL from "./text/TextGeometryOGL";

export default class VisitButton {
  constructor() {
    this.world = new World();
    this.textureLoader = this.world.textureLoader;
    this.scene = this.world.scene;

    this.geometry = new TextGeometryOGL();
    this.geometry.setText({
      font,
      text: "Visit site",
      size: 1,
      letterSpacing: 0,
      align: "center",
      lineHeight: 1,
      lineWidth: 100,
      wordBreak: false,
    });

    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;

        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          vUv = uv;
        }
      `,
      fragmentShader: `
        /****msdf*****/
        float median(float r, float g, float b) {
          return max(min(r, g), min(max(r, g), b));
        }

        float msdf(sampler2D tMap, vec2 uv) {
            vec3 font = texture2D(tMap, uv).rgb;
            float signedDist = median(font.r, font.g, font.b) - 0.5;

            float d = fwidth(signedDist);
            // float fill = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
            float alpha = smoothstep(-d, d, signedDist);
            if (alpha < 0.01) discard;
            return alpha;
        }

        float strokemsdf(sampler2D tMap, vec2 uv, float stroke, float padding) {
            vec3 font = texture2D(tMap, uv).rgb;
            float signedDist = median(font.r, font.g, font.b) - 0.5;
            float t = stroke;
            float alpha = smoothstep(-t, -t + padding, signedDist) * smoothstep(t, t - padding, signedDist);
            return alpha;
        }
        /****msdf*****/

        uniform sampler2D tMap;

        varying vec2 vUv;

        void main() {
          float fill = msdf(tMap, vUv);
          gl_FragColor = vec4(vec3(1.), fill);
        }
      `,
      transparent: true,
      uniforms: {
        tMap: { value: this.textureLoader.load("Audiowide-Regular.ttf.png") },
      },
      side: THREE.DoubleSide,
    });
    // this.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
}
