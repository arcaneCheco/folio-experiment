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
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
// import * as POST from "postprocessing";
// import { BloomEffect, EffectComposer, EffectPass, RenderPass, SelectiveBloomEffect } from "postprocessing";
// import {
//   GodRaysEffect,
//   EffectPass,
//   SelectiveBloomEffect,
//   BloomEffect,
//   RenderPass,
//   EffectComposer,
// } from "postprocessing";

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
    // this.setPost();
    // this.setGodrays();
    this.setSelectiveBloom();
    this.addListeners();
    this.render();
  }

  setSelectiveBloom() {
    this.materials = {};
    this.darkMaterial = new THREE.MeshBasicMaterial({ color: "black" });
    const BLOOM_SCENE = 1;
    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(BLOOM_SCENE);
    this.faScreen.mesh.layers.enable(BLOOM_SCENE);

    // render-pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    // bloom
    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(this.renderPass);
    const res = 1;
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth * res, window.innerHeight * res),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = 0;
    bloomPass.strength = 5;
    bloomPass.radius = 0;
    this.exposure = 0;
    this.bloomComposer.addPass(bloomPass);

    this.debug.addInput(bloomPass, "strength", {
      min: 0,
      max: 3,
      step: 0.01,
    });
    this.debug.addInput(bloomPass, "threshold", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.debug.addInput(bloomPass, "radius", {
      min: 0,
      max: 50,
      step: 0.01,
    });
    this.debug
      .addInput(this, "exposure", {
        min: 0.1,
        max: 6,
        step: 0.001,
      })
      .on(
        "change",
        () => (this.renderer.toneMappingExposure = Math.pow(this.exposure, 4.0))
      );

    // final
    this.finalComposer = new EffectComposer(this.renderer);
    this.finalComposer.addPass(this.renderPass);

    this.finalEffect = new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
      },
      vertexShader: `
      varying vec2 vUv;

    		void main() {

    			vUv = uv;

    			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    		}`,
      fragmentShader: `
            uniform sampler2D baseTexture;
    		uniform sampler2D bloomTexture;

    		varying vec2 vUv;

    		void main() {

    			gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) );
    		}`,
      defines: {},
    });

    const finalPass = new ShaderPass(this.finalEffect, "baseTexture");
    finalPass.needsSwap = true;
    this.finalComposer.addPass(finalPass);
  }

  setPost() {
    this.renderScene = new RenderPass(this.scene, this.camera);
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    this.bloomPass.threshold = 0.81;
    this.bloomPass.strength = 0.6;
    this.bloomPass.radius = 1.95;
    this.bloomPass.renderToScreen = true;

    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);

    this.composer.addPass(this.renderScene);
    this.composer.addPass(this.bloomPass);

    this.camera.layers.enable(1);
    this.faScreen.mesh.layers.enable(1);

    // this.uniform = { value: null };
    // this.mask = {
    //   read: null,
    //   write: null,

    //   swap: () => {
    //     let temp = this.mask.read;
    //     this.mask.read = this.mask.write;
    //     this.mask.write = temp;
    //     this.uniform.value = this.mask.read.texture;
    //   },
    // };
    // this.mask.read = new THREE.WebGLRenderTarget(1024, 1024, {
    //   minFilter: THREE.LinearFilter,
    //   type: THREE.FloatType,
    //   magFilter: THREE.LinearFilter,
    // });
    // this.mask.write = new THREE.WebGLRenderTarget(1024, 1024, {
    //   minFilter: THREE.LinearFilter,
    //   type: THREE.FloatType,
    //   magFilter: THREE.LinearFilter,
    // });
    // this.lumMat = new THREE.ShaderMaterial({
    //   vertexShader: `
    //   varying vec2 vUv;
    //   void main() {
    //     gl_Position = vec4(position, 1.);
    //     vUv = uv;
    //   }
    //   `,
    //   fragmentShader: `
    //   varying vec2 vUv;
    //   uniform sampler2D tDiffuse;
    //   void main() {
    //     gl_FragColor = texture2D(tDiffuse, vUv);
    //     gl_FragColor.r = texture2D(tDiffuse, vUv + vec2(0.1, 0.)).r;
    //   }
    //   `,
    //   uniforms: {
    //     tDiffuse: this.uniform,
    //   },
    // });
    // this.mask.swap();
    // this.lumPP = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.lumMat);
  }

  // setGodrays() {
  //   const OCCLUSION_LAYER = 1;
  //   const geometry = new THREE.SphereBufferGeometry( 1, 16, 16 );
  //   const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
  //   this.lightSphere = new THREE.Mesh( geometry, material );
  //   this.lightSphere.layers.set( OCCLUSION_LAYER );
  //   this.scene.add( this.lightSphere );

  //    // the all black second box that is used to create the occlusion
  //    const material2 = new THREE.MeshBasicMaterial( { color:0x000000 } );
  //    occlusionBox = new THREE.Mesh( geometry, material);
  //    occlusionBox.position.z = 2;
  //    occlusionBox.layers.set( OCCLUSION_LAYER );
  //    scene.add( occlusionBox );
  // }

  setGodrays() {
    let renderPass = new RenderPass(this.scene, this.camera);

    // let circleGeo = new THREE.CircleGeometry(10, 20);
    // let circleMat = new THREE.MeshBasicMaterial({ color: 0xffccaa });
    // let circle = new THREE.Mesh(circleGeo, circleMat);
    // circle.position.set(35, 14.5, -90);
    // this.scene.add(circle);

    // let godraysEffect = new GodRaysEffect(this.camera, circle, {
    //   resolutionScale: 1,
    //   density: 0.8,
    //   decay: 0.95,
    //   weight: 0.5,
    //   samples: 50,
    // });

    // const godRaysPass = new EffectPass(this.camera, godraysEffect);
    // godRaysPass.renderToScreen = true;

    this.composer = new EffectComposer(this.renderer);
    // this.composer.addPass(renderPass);
    // this.composer.addPass(godRaysPass);

    const bloomEffect = new SelectiveBloomEffect(this.scene, this.camera, {
      intensity: 4,
    });
    bloomEffect.selection.add(this.faScreen.mesh);
    bloomEffect.selection.inverted = true;
    bloomEffect.selection.exclusive = false;
    bloomEffect.selection.clear();
    bloomEffect.selection.toggle(this.faScreen.mesh);
    console.log(bloomEffect.selection);
    const bloomPass = new EffectPass(this.camera, bloomEffect);
    bloomPass.renderToScreen = true;
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
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

    this.previousTemplate = this.template;
    this.template = url;
    console.log("TEMPLATE", this.template);

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
    } else if (this.template.includes("/projects/")) {
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
    if (this.water) {
      const intersect = this.raycaster.intersectObject(this.water.t);
      if (intersect.length) {
        const uv = intersect[0].uv;

        this.water && this.water.onPointermove(uv);

        const pos = intersect[0].point;
        this.lights.pointerLight.position.copy(pos);
        this.lights.pointerLight.position.z += 0.5;
      }
    }
    this.faScreen && this.faScreen.onPointermove();
    this.screenTitles && this.screenTitles.onPointermove();
  }

  onMousedown() {
    this.water && this.water.buffer.onMousedown();
    this.faScreen && this.faScreen.onPointerdown();
    this.screenTitles && this.screenTitles.onPointerdown();
  }
  onMouseup() {
    this.water && this.water.buffer.onMouseup();
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
    // this.screen && this.screen.onResize();
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
    this.water && this.water.update(delta);
    this.sky && this.sky.update();
    this.screenTitles && this.screenTitles.update();
    this.faScreen && this.faScreen.update();
    this.cameraWrapper.update();

    // this.updateRandonObjects();
  }

  renderBloom() {
    this.camera.layers.set(1);
    this.bloomComposer.render();
    this.camera.layers.set(0);
    this.finalComposer.render();
  }

  render() {
    let delta = 0.01633;
    this.time += delta;
    this.update(delta);
    this.renderer.render(this.scene, this.camera);
    // this.renderBloom();

    // this.renderer.setRenderTarget(this.mask.write);
    // this.update(delta);
    // this.renderer.render(this.scene, this.camera);
    // this.renderer.setRenderTarget(null);
    // this.mask.swap();
    // this.renderer.clear();
    // this.screenTitles && this.screenTitles.update();
    // this.renderer.render(this.lumPP, this.camera);

    // this.camera.layers.set(0);
    // this.update(delta);
    // this.renderer.render(this.scene, this.camera);
    // this.camera.layers.set(1);
    // // this.renderer.setClearColor(0x000000);
    // // this.composer.render();

    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
