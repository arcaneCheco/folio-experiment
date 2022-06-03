import World from "./app2";
import * as THREE from "three";
import vertexShader from "./shaders/projectDetail/vertex.glsl";
import fragmentShader from "./shaders/projectDetail/fragment.glsl";

export default class ProjectDetail {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  show() {
    this.scene.add(this.mesh);
  }

  hide() {
    this.scene.remove(this.mesh);
  }

  onChange() {
    const template = this.world.template;
    if (template.includes("/works/")) {
      this.show();
    } else {
      this.remove();
    }
  }
}
