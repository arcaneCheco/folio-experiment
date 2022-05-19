import vertexShader from "./shaders/screen/vertex.glsl";
import fragmentShader from "./shaders/screen/fragemnt.glsl";

export default class Screen {
  constructor({ width, height }) {
    const w = 45;
    const h = w / (this.width / this.height);
    const g = new THREE.PlaneGeometry(1, 1, 100, 100);

    this.screenMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: projects[0].texture },
      },
      vertexShader,
      fragmentShader,
    });

    this.screen = new THREE.Mesh(g, this.screenMaterial);
    this.screen.position.y = 12;
    this.scene.add(this.screen);
  }
}
