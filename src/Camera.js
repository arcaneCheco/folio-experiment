import * as THREE from "three";
import { radToDeg } from "three/src/math/MathUtils";
import World from "./app2";

export default class Camera {
  constructor() {
    this.world = new World();
    this.resolutionX = this.world.resolutionX;
    this.resolutionY = this.world.resolutionY;

    this.instance = new THREE.PerspectiveCamera(
      this.world.settings.fov,
      this.resolutionX / this.resolutionY,
      1,
      2000
    );
  }

  onResize() {
    this.resolutionX = this.world.resolutionX;
    this.resolutionY = this.world.resolutionY;
    this.instance.aspect = this.resolutionX / this.resolutionY;

    this.instance.fov = this.world.settings.cameraFOV;

    this.instance.position.set(
      0,
      this.world.settings.cameraY,
      this.world.settings.cameraZ
    );
    this.instance.updateProjectionMatrix();
  }
}
