import * as THREE from "three";
import World from "./app2";

export default class RendererWrapper {
  constructor() {
    this.world = new World();
    this.container = this.world.container;
    this.instance = new THREE.WebGLRenderer({
      alpha: true,
      powerPreference: "high-performance",
    });
    this.instance.setPixelRatio(1);
    // this.instance.setClearColor(0x444444);
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
    this.instance.outputEncoding = THREE.sRGBEncoding;
    // this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    // this.instance.toneMappingExposure = 1;
    this.instance.toneMapping = THREE.ReinhardToneMapping;
    this.instance.toneMappingExposure = 1;
    this.container.appendChild(this.instance.domElement);
    this.instance.autoClear = false;
  }

  onResize() {
    this.instance.setSize(this.world.resolutionX, this.world.resolutionY);
  }
}
