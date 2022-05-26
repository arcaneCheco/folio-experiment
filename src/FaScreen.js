import World from "./app2";
import * as THREE from "three";
import vertexFront from "./shaders/faScreen/front/vertex.glsl";
import fragmentFront from "./shaders/faScreen/front/fragment.glsl";

export default class FaScreen {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;
    this.hover = false;
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.onResize();
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  setMaterial() {
    this.sideMaterial = new THREE.MeshBasicMaterial();
    this.backMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.frontMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexFront,
      fragmentShader: fragmentFront,
    });
    this.material = [
      this.sideMaterial,
      this.sideMaterial,
      this.sideMaterial,
      this.sideMaterial,
      this.frontMaterial,
      this.backMaterial,
    ];
  }
  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  onPointermove() {
    const intersect = this.raycaster.intersectObject(this.mesh);
    if (intersect.length) {
      this.hover = true;
    } else {
      this.hover = false;
    }
  }

  onPointerdown() {
    if (this.hover) {
      this.world.onChange("/works");
    }
  }

  onChange() {}

  onResize() {
    this.objectAspect = 16 / 9;
    this.screenAspect = this.world.resolutionX / this.world.resolutionY;

    this.mesh.position.set(
      0,
      this.world.settings.screenPosY,
      this.world.settings.screenPosZ
    );
    this.mesh.scale.set(
      this.world.settings.screenScale,
      this.world.settings.screenScale * this.objectAspect,
      this.world.settings.screenScale
    );
  }
}
