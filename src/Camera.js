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

    this.cameraDebugFolder = this.world.debug.addFolder({
      title: "camera controls",
    });
    this.cameraDebugFolder
      .addButton({ title: "parallax vs orbit" })
      .on("click", () => {
        const isParallaxMode = !this.enableParallax;
        this.controls.enabled = !isParallaxMode;
        this.enableParallax = isParallaxMode;
        this.onResize();
        this.instance.rotation.set(0, 0, 0);
      });
    this.cameraDebugFolder
      .addButton({ title: "toggle parallax" })
      .on("click", () => {
        this.enableParallax = !this.enableParallax;
        this.instance.rotation.set(0, 0, 0);
      });
  }

  onPreloaded() {
    this.enableParallax = true;
    this.onResize = this.onResizeLoaded;
  }

  onChange() {
    const template = this.world.template;
    if (template.includes("/works/")) {
      this.enableParallax = false;
      this.instance.rotation.set(0, 0, 0);
    }
    if (template === "/") {
      // this.loadingToHome();
    }
  }

  loadingToHome() {
    GSAP.to(this.instance, {
      fov: 45,
      duration: 1.5,
      onUpdate: () => this.instance.updateProjectionMatrix(),
    });
  }

  onPointermove() {
    if (!this.enableParallax) return;
    this.lookAtTarget.y = -this.world.mouse.x * 0.2;
    this.lookAtTarget.x = this.world.mouse.y * 0.4;
  }

  update() {
    if (this.enableParallax) {
      this.instance.rotation.x +=
        (this.lookAtTarget.x - this.instance.rotation.x) * 0.1;
      this.instance.rotation.y +=
        (this.lookAtTarget.y - this.instance.rotation.y) * 0.1;
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
