import * as THREE from "three";
import World from "./app2";
import {
  Lensflare,
  LensflareElement,
} from "three/examples/jsm/objects/Lensflare";
import lensflare0 from "./lensflareTextures/lensflare0.png";
import lensflare2 from "./lensflareTextures/lensflare2.png";
import lensflare3 from "./lensflareTextures/lensflare3.png";

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

    // this.sun4 = new THREE.SpotLight(0x0040c0, 0.2, 100, 3, 1, 0);
    // this.sun4.position.set(0, 15, -100);
    this.sun4 = new THREE.SpotLight(0xffffff, 1.3, 400, 0.42, 0.45, 1.8);
    this.sun4.position.set(30, 10, -75);
    const dummy = new THREE.Object3D();
    this.scene.add(dummy);
    dummy.position.set(0, -15, 70);
    const dir = new THREE.Vector3()
      .add(this.sun4.position)
      .sub(dummy.position)
      .normalize();
    this.sun4.position.add(dir.multiplyScalar(30));
    this.sun4.target = dummy;
    console.log(this.sun4);
    // this.sun4.castShadow = true;
    // this.scene.add(new THREE.CameraHelper(this.sun4.shadow.camera));
    const helper4 = new THREE.SpotLightHelper(this.sun4);
    window.setTimeout(() => helper4.update(), 200);
    // this.scene.add(helper4);
    // helper4.update();
    this.scene.add(this.sun4);

    // this.textureLoader = this.world.textureLoader;
    // const lensflare = new Lensflare();
    // const textureFlare0 = this.textureLoader.load(lensflare0);
    // const textureFlare3 = this.textureLoader.load(lensflare3);
    // lensflare.addElement(new LensflareElement(textureFlare0, 700, 0));
    // lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
    // lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
    // lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
    // lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
    // lensflare.position.sub(dir.multiplyScalar(3));
    // console.log(lensflare);

    // lensflare.addElement(
    //   new LensflareElement(this.textureLoader.load(lensflare0), 512, 0)
    // );
    // lensflare.addElement(
    //   new LensflareElement(this.textureLoader.load(lensflare2), 512, 0)
    // );
    // lensflare.addElement(
    //   new LensflareElement(this.textureLoader.load(lensflare3), 60, 3.6)
    // );
    // this.sun4.add(lensflare);

    this.ambinet = new THREE.AmbientLight(0x0040c0, 0);
    this.ambinet = new THREE.AmbientLight(0xffffff, 0);
    this.scene.add(this.ambinet);

    this.pointerLight = new THREE.PointLight(0xccff22, 0);
    this.scene.add(this.pointerLight);

    this.debug = this.world.debug.addFolder({
      title: "lights",
      expanded: false,
    });
    this.debug.addInput(this.ambinet, "intensity", {
      min: 0,
      max: 1,
      label: "ambient intensity",
    });
    this.debug.addInput(this.pointerLight, "intensity", {
      min: 0,
      max: 4,
      label: "pointerLight intensity",
    });
    this.moonLightDebug = this.debug.addFolder({
      title: "moonLight",
    });
    this.moonLightDebug.addInput(this.sun4, "intensity", {
      min: 0,
      max: 8,
      step: 0.01,
    });
    this.moonLightDebug
      .addInput(this.sun4, "distance", {
        min: 0,
        max: 300,
        step: 0.01,
      })
      .on("change", () => {
        helper4.update();
      });
    this.moonLightDebug
      .addInput(this.sun4, "angle", {
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", () => {
        helper4.update();
      });
    this.moonLightDebug
      .addInput(this.sun4, "penumbra", {
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", () => {
        helper4.update();
      });
    this.moonLightDebug
      .addInput(this.sun4, "decay", {
        min: 0,
        max: 3,
        step: 0.01,
      })
      .on("change", () => {
        helper4.update();
      });
  }
}
