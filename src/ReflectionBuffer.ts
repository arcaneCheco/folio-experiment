import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector";
import World from "./app2";

export default class ReflectionBuffer {
  world;
  camera;
  waterMesh;
  waterMaterial;
  renderer;
  scene;
  reflector;
  output;
  textureMatrix;
  constructor(geometry: any, waterMaterial: any, waterMesh: any) {
    this.world = new World();
    this.camera = this.world.camera;
    this.waterMesh = waterMesh;
    this.waterMaterial = waterMaterial;
    this.renderer = this.world.renderer;
    this.scene = this.world.scene;
    this.reflector = new Reflector(geometry, {
      textureHeight: 512,
      textureWidth: 512,
      color: new THREE.Color(0xffffff),
      clipBias: 0.05,
    });
    this.reflector.matrixAutoUpdate = false;
    this.reflector.updateMatrix();
    // this.scene.add(this.reflector);
    this.output = this.reflector.getRenderTarget().texture;
    // this.mat.uniforms.tReflectionMap.value =
    //   this.reflector.getRenderTarget().texture;

    this.textureMatrix = new THREE.Matrix4();
    // this.mat.uniforms["textureMatrix"].value = textureMatrix;
  }

  update() {
    // prettier-ignore
    this.textureMatrix.set(
        0.5, 0.0, 0.0, 0.5,
        0.0, 0.5, 0.0, 0.5,
        0.0, 0.0, 0.5, 0.5,
        0.0, 0.0, 0.0, 1.0
      );

    this.textureMatrix.multiply(this.camera.projectionMatrix);
    this.textureMatrix.multiply(this.camera.matrixWorldInverse);
    this.textureMatrix.multiply(this.waterMesh.matrixWorld);

    //   this.waterMesh.visible = false;
    this.waterMaterial.uniforms["textureMatrix"].value = this.textureMatrix;
    this.reflector.matrixWorld.copy(this.waterMesh.matrixWorld);

    this.world.navigation.group.visible = false;
    this.world.about.group.visible = false;
    this.reflector.onBeforeRender(
      this.renderer,
      this.scene,
      this.camera,
      null,
      null,
      null
    );
    this.world.navigation.group.visible = true;
    this.world.about.group.visible = true;
    //   this.waterMesh.visible = true;
  }

  onResize(s: any) {
    this.reflector.scale.setScalar(s);
  }
}
