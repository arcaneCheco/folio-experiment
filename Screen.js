import * as THREE from "three";
import World from "./app2";
import vertexShader from "./shaders/screen/vertex.glsl";
import fragmentShader from "./shaders/screen/fragment.glsl";

export default class Screen {
  constructor() {
    this.world = new World();
    this.width = this.world.width;
    this.height = this.world.height;
    this.scene = this.world.scene;
    this.resources = this.world.resources;
    const g = new THREE.PlaneGeometry(1, 1, 100, 100);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: this.resources.projects[0].texture },
      },
      vertexShader,
      fragmentShader,
    });

    this.mesh = new THREE.Mesh(g, this.material);
    this.mesh.position.y = 12;
    this.scene.add(this.mesh);
  }

  onResize() {
    this.width = this.world.width;
    this.height = this.world.height;
    this.mesh.scale.set(45, 45 / (this.width / this.height), 1);
  }
}
