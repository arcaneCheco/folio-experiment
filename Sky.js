import * as THREE from "three";
import skyVertex from "./shaders/sky/vertex.glsl";
import skyFragment from "./shaders/sky/fragment.glsl";
import World from "./app2";

export default class Sky {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.textureLoader = this.world.textureLoader;

    // const g = new THREE.BoxGeometry(1, 1, 1);
    const geometry = new THREE.SphereGeometry(1);
    // const g = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      uniforms: {
        uGreyNoise: { value: this.textureLoader.load("greyNoise.png") },
        uTime: { value: 0 },
      },
      transparent: true,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
  }

  onResize() {
    this.mesh.scale.setScalar((this.world.viewport.x / 2) * 1);
  }

  update() {
    this.material.uniforms.uTime.value = this.world.time;
  }
}
