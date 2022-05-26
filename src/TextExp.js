import * as THREE from "three";
import World from "./app2";
import createTextGeometry from "./text/TextGeometry";
import font from "./text/Audiowide-Regular.json";
import vertexShader from "./shaders/msdfTitle2/vertex.glsl";
import fragmentShader from "./shaders/msdfTitle2/fragment.glsl";

export default class TextExp {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.textureLoader = this.world.textureLoader;
    this.geometry = createTextGeometry({
      text: "aA",
      font,
      align: "center",
      //   lineHeight: 10,
    });

    console.log(this.geometry);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        uMap: { value: this.textureLoader.load("Audiowide-Regular.ttf.png") },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    // this.mesh.scale.multiplyScalar(1 / 41);
    const aspect = this.world.resolutionX / this.world.resolutionY;
    this.mesh.scale.set(
      (45 * (41 / 512)) / aspect,
      (45 * (41 / 512)) / aspect,
      1
    );
    this.mesh.position.set(0, 12, 0);
    console.log(this.mesh);
  }
}
