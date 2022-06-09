import * as THREE from "three";
import { radToDeg } from "three/src/math/MathUtils";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import World from "./app2";
import GSAP from "gsap";

export default class Camera {
  constructor() {
    this.world = new World();
    this.lookAtTarget = new THREE.Vector2();
    this.enableParallax = false;
    this.onResize = this.onResizeLoading;

    this.instance = new THREE.PerspectiveCamera(10, 2, 1, 2000);

    this.controls = new OrbitControls(
      this.instance,
      this.world.renderer.domElement
    );
    this.controls.enabled = false;

    this.parallaxSettings = {
      lerp: 0.1,
      magX: 0.2,
      magY: 0.4,
    };

    this.cameraDebugFolder = this.world.debug.addFolder({
      title: "camera controls",
      expanded: false,
    });
    this.cameraDebugFolder
      .addButton({ title: "toggle orbit" })
      .on("click", () => {
        this.enableParallax = false;
        this.controls.enabled = !this.controls.enabled;
        this.onResize();
        this.instance.rotation.set(0, 0, 0);
      });
    this.cameraDebugFolder
      .addButton({ title: "toggle parallax" })
      .on("click", () => {
        this.controls.enabled = false;
        this.enableParallax = !this.enableParallax;
        this.instance.rotation.set(0, 0, 0);
      });
    this.cameraDebugFolder.addInput(this.parallaxSettings, "lerp", {
      label: "lerp factor",
      min: 0.001,
      max: 1,
      step: 0.001,
    });
    this.cameraDebugFolder.addInput(this.parallaxSettings, "magX", {
      label: "parallax X",
      min: 0.01,
      max: 1,
      step: 0.001,
    });
    this.cameraDebugFolder.addInput(this.parallaxSettings, "magY", {
      label: "parallax Y",
      min: 0.01,
      max: 1,
      step: 0.001,
    });
  }

  onPreloaded() {
    // this.enableParallax = true;
    this.onResize = this.onResizeLoaded;
  }

  onChange() {
    // const template = this.world.template;
    // if (template.includes("/works/")) {
    //   this.enableParallax = false;
    //   this.instance.rotation.set(0, 0, 0);
    // }
  }

  onPointermove() {
    if (!this.enableParallax) return;
    this.lookAtTarget.y = -this.world.mouse.x * this.parallaxSettings.magX;
    this.lookAtTarget.x = this.world.mouse.y * this.parallaxSettings.magY;
  }

  update() {
    if (this.enableParallax) {
      this.instance.rotation.x +=
        (this.lookAtTarget.x - this.instance.rotation.x) *
        this.parallaxSettings.lerp;
      this.instance.rotation.y +=
        (this.lookAtTarget.y - this.instance.rotation.y) *
        this.parallaxSettings.lerp;
    }
  }

  onResizeLoaded() {
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

  onResizeLoading() {
    this.resolutionX = this.world.resolutionX;
    this.resolutionY = this.world.resolutionY;
    this.instance.aspect = this.resolutionX / this.resolutionY;

    this.instance.fov = this.world.settings.duringPreload.cameraFOV;

    this.instance.position.set(
      0,
      this.world.settings.duringPreload.cameraY,
      this.world.settings.duringPreload.cameraZ
    );
    this.instance.updateProjectionMatrix();
  }

  onResize() {}
}
