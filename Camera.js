import * as THREE from "three";
import World from "./app2";

export default class Camera {
  constructor() {
    this.world = new World();
    this.resolutionX = this.world.resolutionX;
    this.resolutionY = this.world.resolutionY;

    this.instance = new THREE.PerspectiveCamera(
      30,
      this.resolutionX / this.resolutionY,
      0.1,
      2000
    );
    this.originalPosition = new THREE.Vector3(0, 7, 63);
    this.instance.position.set(...this.originalPosition);
  }

  onResize() {
    this.resolutionX = this.world.resolutionX;
    this.resolutionY = this.world.resolutionY;
    this.instance.aspect = this.resolutionX / this.resolutionY;
    this.instance.updateProjectionMatrix();
  }
}
