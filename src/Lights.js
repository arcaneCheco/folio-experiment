import * as THREE from "three";
import World from "./app2";

export default class Lights {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;

    // this.sun = new THREE.DirectionalLight(0xffffff, 1.0);
    // this.sun.position.set(20, 20, 15);
    // this.scene.add(this.sun);
    // const helper1 = new THREE.DirectionalLightHelper(this.sun);
    // this.scene.add(helper1);

    // this.sun2 = new THREE.DirectionalLight(0x40a040, 0.6);
    // this.sun2.position.set(-20, 20, 15);
    // this.scene.add(this.sun2);

    // this.sun3 = new THREE.DirectionalLight(0xff0000, 2);
    // this.sun3.position.set(0, 20, -20);
    // const helper = new THREE.DirectionalLightHelper(this.sun3);
    // this.scene.add(helper);
    // this.scene.add(this.sun3);

    this.sun4 = new THREE.SpotLight(0x0040c0, 5, 100, 3, 1, 0);
    this.sun4.position.set(0, 15, -100);
    this.sun4.castShadow = true;
    // this.scene.add(new THREE.CameraHelper(this.sun4.shadow.camera));
    const helper4 = new THREE.SpotLightHelper(this.sun4);
    // this.scene.add(helper4);
    this.scene.add(this.sun4);

    this.ambinet = new THREE.AmbientLight(0x222222, 0.01);
    this.scene.add(this.ambinet);

    this.pointerLight = new THREE.PointLight(0xccff22, 1);
    this.scene.add(this.pointerLight);
  }
}
