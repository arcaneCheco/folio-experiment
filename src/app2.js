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
import FaScreen from "./FaScreen";
import ScreenTitles from "./ScreenTitles";
import ProjectDetail from "./ProjectDetail";
import Navigation from "./Navigation";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
// import * as POST from "postprocessing";
// import { BloomEffect, EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect } from "postprocessing";

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
    this.pane = new Pane();
    this.pane.containerElem_.style.zIndex = 2;
    this.pane
      .addButton({ title: "show/hide" })
      .on("click", () => (this.debug.hidden = !this.debug.hidden));
    this.debug = this.pane.addFolder({ title: "debug", hidden: false });
    this.raycaster = new THREE.Raycaster();
    this.setSettings();

    this.setRenderer();
    this.setCamera();
    this.setLight();
    // this.addRandomObjects();
    this.setFixedAspectScreen();

    this.setSky();
    this.setWater();
    this.setScreenTitles();
    this.resources = new Resources();
    this.onResize();
    this.setPost();
    this.addListeners();
    this.render();
  }

  setPost() {
    this.renderScene = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    this.bloomPass.threshold = 0.21;
    this.bloomPass.strength = 0.6;
    this.bloomPass.radius = 1.95;
    this.bloomPass.renderToScreen = true;

    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(window.innerWidth, window.innerHeight);

    this.composer.addPass(this.renderScene);
    this.composer.addPass(this.bloomPass);

    // this.camera.layers.enable(1);
    // this.faScreen.mesh.layers.enable(1);

    this.uniform = { value: null };
    this.mask = {
      read: null,
      write: null,

      swap: () => {
        let temp = this.mask.read;
        this.mask.read = this.mask.write;
        this.mask.write = temp;
        this.uniform.value = this.mask.read.texture;
      },
    };
    this.mask.read = new THREE.WebGLRenderTarget(1024, 1024, {
      minFilter: THREE.LinearFilter,
      type: THREE.FloatType,
      magFilter: THREE.LinearFilter,
      // format: THREE.RGBAFormat,
      // generateMipmaps: false,
      // stencilBuffer: false,
    });
    this.mask.write = new THREE.WebGLRenderTarget(1024, 1024, {
      minFilter: THREE.LinearFilter,
      type: THREE.FloatType,
      magFilter: THREE.LinearFilter,
      // format: THREE.RGBAFormat,
      // generateMipmaps: false,
      // stencilBuffer: false,
    });
    this.lumMat = new THREE.ShaderMaterial({
      vertexShader: `
      varying vec2 vUv;
      void main() {
        gl_Position = vec4(position, 1.);
        vUv = uv;
      }
      `,
      fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D tDiffuse;
      void main() {
        gl_FragColor = texture2D(tDiffuse, vUv);
        gl_FragColor.r = texture2D(tDiffuse, vUv + vec2(0.1, 0.)).r;
      }
      `,
      uniforms: {
        tDiffuse: this.uniform,
      },
    });
    this.mask.swap();
    this.lumPP = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.lumMat);
  }

  onPreloaded() {
    this.isPreloaded = true;
    this.cameraWrapper.onPreloaded();
    this.faScreen && this.faScreen.onPreloaded();
    this.screenTitles && this.screenTitles.onPreloaded();
    this.setNavigation();
    // this.addListeners();
    console.log(window.location);
    this.onChange({
      url:
        window.location.pathname === "/"
          ? window.location.pathname
          : window.location.pathname.slice(0, -1),
    });
  }

  onChange({ url, push = true }) {
    if (url == this.template) return;

    // console.log(url);

    this.previousTemplate = this.template;
    this.template = url;

    if (push) {
      window.history.pushState({}, "", `${url}`);
    }

    if (this.template === "/") {
      this.screenTitles.toHome();
      this.faScreen.toHome();
    } else if (this.template === "/projects") {
      console.log("To projects?");
      console.log("HERERE");
      this.screenTitles.toProjects();
      this.faScreen.toProjects();
    } else if (this.template.includes("/projects/d")) {
      console.log("NOT HEREER");
      this.screenTitles.toProjectDetail();
      this.faScreen.toProjectDetail();
    } else if (this.template === "/about") {
      this.screenTitles.toAbout();
      this.faScreen.toAbout();
    }
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
    const resizeDebug = this.debug.addFolder({
      title: "resizeHelper",
      expanded: false,
    });
    resizeDebug
      .addInput(this.settings, "environmentSize", {
        min: 20,
        max: 400,
        step: 0.1,
      })
      .on("change", () => this.onResize());
    resizeDebug
      .addInput(this.settings, "cameraZ", {
        min: -100,
        max: 200,
        step: 0.1,
      })
      .on("change", () => this.onResize());
    resizeDebug
      .addInput(this.settings, "cameraY", {
        min: -10,
        max: 120,
        step: 0.1,
      })
      .on("change", () => this.onResize());
    resizeDebug
      .addInput(this.settings, "cameraFOV", {
        min: 25,
        max: 90,
        step: 0.1,
      })
      .on("change", () => this.onResize());
    resizeDebug
      .addInput(this.settings, "screenPosZ", {
        min: -100,
        max: 100,
        step: 0.1,
      })
      .on("change", () => this.onResize());
    resizeDebug
      .addInput(this.settings, "screenPosY", {
        min: -10,
        max: 100,
        step: 0.1,
      })
      .on("change", () => this.onResize());
    resizeDebug
      .addInput(this.settings, "screenScale", {
        min: 0,
        max: 30,
        step: 0.1,
      })
      .on("change", () => this.onResize());
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

  setNavigation() {
    this.navigation = new Navigation();
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

      this.water && this.water.onPointermove(uv);

      const pos = intersect[0].point;
      this.lights.pointerLight.position.copy(pos);
      this.lights.pointerLight.position.z += 0.5;
    }
    this.faScreen && this.faScreen.onPointermove();
    this.screenTitles && this.screenTitles.onPointermove();
  }

  onMousedown() {
    this.water.buffer.onMousedown();
    this.faScreen && this.faScreen.onPointerdown();
    this.screenTitles && this.screenTitles.onPointerdown();
  }
  onMouseup() {
    this.water.buffer.onMouseup();
  }
  onWheel(event) {
    this.screenTitles && this.screenTitles.onWheel(event.deltaY);
  }

  onResize() {
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
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("pointermove", this.onMousemove.bind(this));
    window.addEventListener("pointerdown", this.onMousedown.bind(this));
    window.addEventListener("pointerup", this.onMouseup.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this));
    window.addEventListener("popstate", this.onPopState.bind(this));
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: false,
    });
  }

  update(delta) {
    // this.sky && this.sky.update();

    this.faScreen && this.faScreen.update();
    this.water && this.water.update(delta);
    this.screenTitles && this.screenTitles.update();

    // this.updateRandonObjects();

    this.cameraWrapper.update();
  }

  render() {
    let delta = 0.01633;
    this.time += delta;
    this.update(delta);
    this.renderer.render(this.scene, this.camera);

    // this.update(delta);
    // this.composer.render();

    // this.renderer.setRenderTarget(this.mask.write);
    // this.update(delta);
    // this.renderer.render(this.scene, this.camera);
    // this.renderer.setRenderTarget(null);
    // this.mask.swap();
    // this.renderer.clear();
    // this.screenTitles && this.screenTitles.update();
    // this.renderer.render(this.lumPP, this.camera);

    // this.camera.layers.set(1);
    // this.composer.render();

    // this.renderer.clearDepth();
    // this.camera.layers.set(0);
    // this.update(delta);
    // this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
