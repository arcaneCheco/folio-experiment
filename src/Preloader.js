import World from "./app2";
import * as THREE from "three";
import vertexShader from "./shaders/preloader/vertex.glsl";
import fragmentShader from "./shaders/preloader/fragment.glsl";

export default class Preloader {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uResolution: {
          value: new THREE.Vector2(
            this.world.resolutionX,
            this.world.resolutionY
          ),
        },
        uTime: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    console.log(this.scene);
  }

  hide() {
    this.scene.remove(this.mesh);
  }

  destroy() {
    // this.mesh.destroy();
  }

  update() {
    this.material.uniforms.uTime.value = this.world.time;
  }
}
