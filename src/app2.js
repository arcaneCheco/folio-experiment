import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils";
import { Pane } from "tweakpane";
import { Water } from "./Water";
import GSAP from "gsap";
// import { Sky } from "three/examples/jsm/objects/Sky";
import Sky from "./Sky";
import Screen from "./Screen";
import Resources from "./Resources";
import Lights from "./Lights";
import Camera from "./Camera";
import RendererWrapper from "./RendererWrapper";
import AllTitles from "./AllTitles";
import FaScreen from "./FaScreen";
import ScreenTitles from "./ScreenTitles";
import ProjectDetail from "./ProjectDetail";
import Physics from "./Physics";

export default class World {
  static instance;
  constructor() {
    if (World.instance) {
      return World.instance;
    }
    World.instance = this;
    this.init();
    this.resources.once("finsished loading", this.onPreloaded.bind(this));
  }

  init() {
    this.time = 0;
    this.template = "";
    this.container = document.querySelector("#canvas");
    this.resolutionX = this.container.offsetWidth;
    this.resolutionY = this.container.offsetHeight;
    this.scene = new THREE.Scene();
    this.mouse = new THREE.Vector2();
    this.textureLoader = new THREE.TextureLoader();
    this.isPreloaded = false;
    this.debug = new Pane();
    this.raycaster = new THREE.Raycaster();
    this.setSettings();

    this.setRenderer();
    this.setCamera();
    this.setLight();
    this.addRandomObjects();
    this.setFixedAspectScreen();

    this.setWater();
    this.setSky();
    this.setScreenTitles();
    this.resources = new Resources();
    this.resize();
    // this.addListeners();
    this.render();
  }

  onPreloaded() {
    this.cameraWrapper.onPreloaded();
    this.faScreen && this.faScreen.onPreloaded();
    this.screenTitles && this.screenTitles.onPreloaded();
    this.addListeners();
    this.isPreloaded = true;
    this.onChange(window.location.pathname);
    // this.resize();
  }

  setSettings() {
    this.settings = {
      cameraZ: 70,
      cameraY: 10,
      cameraFOV: 40,
      preoloadFOV: 20,
      environmentSize: 150,
      baselineFOV: 45,
      screenPosZ: 20,
      screenPosY: 10,
      screenScale: 16,
      route: "/",
      duringPreload: {
        cameraZ: 70,
        cameraY: 10,
        cameraFOV: 40,
        screenPosZ: 20,
        screenPosY: 10,
      },
    };
    const resizeDebug = this.debug.addFolder({ title: "resizeHelper" });
    resizeDebug
      .addInput(this.settings, "environmentSize", {
        min: 20,
        max: 400,
        step: 0.1,
      })
      .on("change", () => this.resize());
    resizeDebug
      .addInput(this.settings, "cameraZ", {
        min: -100,
        max: 200,
        step: 0.1,
      })
      .on("change", () => this.resize());
    resizeDebug
      .addInput(this.settings, "cameraY", {
        min: -10,
        max: 120,
        step: 0.1,
      })
      .on("change", () => this.resize());
    resizeDebug
      .addInput(this.settings, "cameraFOV", {
        min: 25,
        max: 90,
        step: 0.1,
      })
      .on("change", () => this.resize());
    resizeDebug
      .addInput(this.settings, "screenPosZ", {
        min: -100,
        max: 100,
        step: 0.1,
      })
      .on("change", () => this.resize());
    resizeDebug
      .addInput(this.settings, "screenPosY", {
        min: -10,
        max: 100,
        step: 0.1,
      })
      .on("change", () => this.resize());
    resizeDebug
      .addInput(this.settings, "screenScale", {
        min: 0,
        max: 30,
        step: 0.1,
      })
      .on("change", () => this.resize());
    const routeDebug = this.debug.addFolder({ title: "route" });
    routeDebug
      .addBlade({
        view: "list",
        label: "route",
        options: [
          { text: "home", value: "/" },
          { text: "works", value: "/works" },
          { text: "elasticMesh", value: "/works/elastic-mesh" },
        ],
        value: this.template,
      })
      .on("change", ({ value }) => {
        this.onChange(value);
      });
  }

  setRenderer() {
    this.rendererWrapper = new RendererWrapper();
    this.renderer = this.rendererWrapper.instance;
  }

  setCamera() {
    this.cameraWrapper = new Camera();
    this.camera = this.cameraWrapper.instance;
  }

  setLight() {
    this.lights = new Lights();
  }

  setProjectDetail() {
    this.projectDetail = new ProjectDetail();
  }

  setWater() {
    this.water = new Water();
  }

  addRandomObjects() {
    const sphereGeo = new THREE.SphereGeometry(3);
    const sphereMat = new THREE.MeshStandardMaterial();
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.castShadow = true;
    sphere.position.set(10, 8, 9);
    this.scene.add(sphere);
    const boxGeo = new THREE.BoxGeometry(3, 3, 5);
    const boxMat = new THREE.MeshStandardMaterial();
    this.box = new THREE.Mesh(boxGeo, boxMat);
    this.box.position.set(-7, 4, 8);
    this.box.castShadow = true;
    this.scene.add(this.box);
    const torusGeo = new THREE.TorusGeometry(2, 1, 30, 30);
    const torusMat = new THREE.MeshStandardMaterial();
    this.torus = new THREE.Mesh(torusGeo, torusMat);
    this.torus.position.set(5, 4, 8);
    this.torus.castShadow = true;
    // this.scene.add(this.torus);
    const icoGeo = new THREE.IcosahedronGeometry(2, 0);
    const icoMat = new THREE.MeshStandardMaterial();
    this.ico = new THREE.Mesh(icoGeo, icoMat);
    this.ico.position.set(10, 6.5, -12);
    this.ico.castShadow = true;
    this.scene.add(this.ico);

    // this.plane = new THREE.Mesh(
    //   new THREE.PlaneGeometry(250, 250),
    //   new THREE.MeshStandardMaterial()
    // );
    // this.plane.rotation.x = -Math.PI / 2;
    // this.plane.position.y += 1.5;
    // this.scene.add(this.plane);

    // const oboxGeo = new THREE.SphereGeometry(99);
    // const oboxMat = new THREE.MeshPhongMaterial({
    //   side: THREE.BackSide,
    //   transparent: true,
    //   opacity: 0.8,
    // });
    // this.obox = new THREE.Mesh(oboxGeo, oboxMat);
    // // this.obox.position.set(-7, 4, 8);
    // this.obox.castShadow = true;
    // this.scene.add(this.obox);

    this.updateRandonObjects = () => {
      this.torus.rotation.x += 0.01;
      this.torus.position.x -= Math.sin(this.time) * 0.05;
      this.torus.position.z -= Math.sin(this.time) * 0.1;
      this.torus.position.y += Math.sin(this.time) * 0.02;
      this.box.rotation.x += 0.01;
      this.box.rotation.y += 0.01;
      this.ico.rotation.y += 0.01;
    };
  }

  setSky() {
    this.sky = new Sky();
  }

  setProjectTitles() {
    this.AllTitles = new AllTitles();
  }

  setScreen() {
    this.screen = new Screen();
  }

  setFixedAspectScreen() {
    this.faScreen = new FaScreen();
  }

  setScreenTitles() {
    this.screenTitles = new ScreenTitles();
  }

  onMousemove(event) {
    this.mouse.x = (2 * event.clientX) / this.resolutionX - 1;
    this.mouse.y = (-2 * event.clientY) / this.resolutionY + 1;
    // this.ppPostMesh.material.uniforms.uPointer.value.copy(this.mouse);

    this.cameraWrapper.onPointermove();

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersect = this.raycaster.intersectObject(this.water.t);
    if (intersect.length) {
      const uv = intersect[0].uv;
      //   console.log(uv);
      this.mouse.x = uv.x - 0.5;
      this.mouse.y = uv.y - 0.5;
      this.water.buffer.onMousemove(uv.x, uv.y);

      const pos = intersect[0].point;
      this.lights.pointerLight.position.copy(pos);
      this.lights.pointerLight.position.z += 0.5;
      //   this.ppMesh.material.uniforms.uPointer.value.copy(
      //     this.pointerLight.position
      //   );
    }
    this.allTitles && this.AllTitles.onPointerover();
    this.faScreen && this.faScreen.onPointermove();
    this.screenTitles && this.screenTitles.onPointermove();
  }

  onMousedown() {
    this.water.buffer.onMousedown();
    // this.fullScreenTransition();
    this.faScreen && this.faScreen.onPointerdown();
    this.screenTitles && this.screenTitles.onPointerdown();
  }
  onMouseup() {
    this.water.buffer.onMouseup();
  }
  onWheel(event) {
    this.allTitles && this.AllTitles.onWheel(event.deltaY);
    this.screenTitles && this.screenTitles.onWheel(event.deltaY);
  }

  resize() {
    this.resolutionX = this.container.offsetWidth;
    this.resolutionY = this.container.offsetHeight;
    // this.dominantSize = Math.max(this.resolutionX, this.resolutionY);
    this.rendererWrapper.onResize();
    this.cameraWrapper.onResize();
    this.water && this.water.onResize();
    this.sky && this.sky.onResize();

    this.faScreen && this.faScreen.onResize();
    this.screenTitles && this.screenTitles.onResize();
    this.screen && this.screen.onResize();
  }

  addListeners() {
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("pointermove", this.onMousemove.bind(this));
    window.addEventListener("pointerdown", this.onMousedown.bind(this));
    window.addEventListener("pointerup", this.onMouseup.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this));
  }

  onChange(url) {
    if (url == this.template) return;

    this.previousTemplate = this.template;
    this.template = url;
    window.history.pushState({}, "", `${url}`);

    if (this.previousTemplate === "/" && this.template === "/works") {
      this.fromToRoute = "homeToWorks";
    } else if (this.previousTemplate === "/works" && this.template === "/") {
      this.fromToRoute = "worksToHome";
    }

    console.log(this.previousTemplate, this.template);

    this.cameraWrapper.onChange();
    this.faScreen && this.faScreen.onChange();
    this.screenTitles && this.screenTitles.onChange();
    this.projectDetail && this.projectDetail.onChange();
  }

  update(delta) {
    // this.sky && this.sky.update();

    this.faScreen && this.faScreen.update();
    this.water && this.water.update(delta);
    // this.screenTitles && this.screenTitles.update();

    // this.updateRandonObjects();

    this.cameraWrapper.update();
  }

  render() {
    let delta = 0.01633;
    this.time += delta;
    this.update(delta);
    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();