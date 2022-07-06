import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils";
import { FolderApi, Pane } from "tweakpane";
import { Water } from "./Water";
import GSAP from "gsap";
// import { Sky } from "three/examples/jsm/objects/Sky";
import Sky from "./Sky";
// import Screen from "./Screen"; // go back to to figure out image in different aspect ratios
import Resources from "./Resources";
import Lights from "./Lights";
import Camera from "./Camera";
import RendererWrapper from "./RendererWrapper";
import FaScreen from "./FaScreen";
import ScreenTitles from "./ScreenTitles";
import ProjectDetail from "./ProjectDetail";
import Navigation from "./Navigation";
import SelectiveBloom from "./SelectiveBloom";
import Particles from "./Particles";
import About from "./About";
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

export enum Template {
  Home = "Home",
  Projects = "Projects",
  About = "About",
  ProjectDetail = "ProjectDetail",
}
const urlToTemplateMap: { [url: string]: Template } = {
  "/": Template.Home,
  "/projects": Template.Projects,
  "/projects/": Template.Projects,
  "/about": Template.About,
};

const templateToURLMap: { [template: string]: string } = {
  Home: "/",
  Projects: "/projects",
  About: "/about",
};

const projectDetailPathToIndexMap: { [path: string]: number } = {
  "/projects/hello-world": 0,
  "/projects/infinite-tunnel": 1,
  "/projects/mandelbrot-explorer": 2,
  "/projects/elastic-mesh": 3,
};

export default class World {
  static instance: World;
  time = 0;
  template: Template;
  previousTemplate: Template;
  container: HTMLDivElement = document.querySelector("#canvas");
  resolutionX = this.container.offsetWidth;
  resolutionY = this.container.offsetHeight;
  scene = new THREE.Scene();
  mouse = new THREE.Vector2();
  textureLoader = new THREE.TextureLoader();
  isPreloaded = false;
  // pane = new Pane({ container: document.querySelector("#debug") });
  pane = new Pane();
  debug: FolderApi;
  raycaster = new THREE.Raycaster();
  settings: any;
  resources: Resources;
  selectiveBloom: SelectiveBloom;
  cameraWrapper: any;
  camera: THREE.PerspectiveCamera;
  faScreen: FaScreen;
  screenTitles: ScreenTitles;
  projectDetail: ProjectDetail;
  about: About;
  rendererWrapper: any;
  renderer: THREE.WebGLRenderer;
  lights: any;
  navigation: Navigation;
  water: any;
  sky: any;
  particles: Particles;
  finalEffect: any;
  bloomComposer: any;
  finalComposer: any;
  bloomLayer: any;
  renderPass: any;
  bloomPass: any;
  exposure: any;
  constructor() {
    if (World.instance) {
      return World.instance;
    }
    World.instance = this;
    this.init();
    this.resources.projectsData.map((projectEntry: any, index: number) => {
      templateToURLMap[index] = projectEntry.path;
      urlToTemplateMap[projectEntry.path] = Template.ProjectDetail;
    });
    this.resources.once("finsished loading", this.onPreloaded.bind(this));
  }

  init() {
    // this.pane.containerElem_.style.zIndex = 2;
    // this.pane.hidden = true;
    this.pane
      .addButton({ title: "show/hide" })
      .on("click", () => (this.debug.hidden = !this.debug.hidden));
    this.debug = this.pane.addFolder({ title: "debug", hidden: false });
    this.setSettings();

    this.setRenderer();
    this.setCamera();
    this.setLight();
    // this.addRandomObjects();
    this.setFixedAspectScreen();

    this.setSky();
    this.setWater();
    this.setNavigation();
    this.setScreenTitles();
    this.resources = new Resources();
    // this.setParticles();
    this.onResize();
    // this.setPost();
    // this.setGodrays();
    this.setSelectiveBloom();
    // this.addListeners();
    this.render();
  }

  setSelectiveBloom() {
    this.selectiveBloom = new SelectiveBloom();
  }

  // setPost() {
  //   this.renderScene = new RenderPass(this.scene, this.camera);
  //   this.bloomPass = new UnrealBloomPass(
  //     new THREE.Vector2(window.innerWidth, window.innerHeight),
  //     1.5,
  //     0.4,
  //     0.85
  //   );
  //   this.bloomPass.threshold = 0.81;
  //   this.bloomPass.strength = 0.6;
  //   this.bloomPass.radius = 1.95;
  //   this.bloomPass.renderToScreen = true;

  //   this.composer = new EffectComposer(this.renderer);
  //   this.composer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.5);

  //   this.composer.addPass(this.renderScene);
  //   this.composer.addPass(this.bloomPass);

  //   this.camera.layers.enable(1);
  //   this.faScreen.mesh.layers.enable(1);

  //   // this.uniform = { value: null };
  //   // this.mask = {
  //   //   read: null,
  //   //   write: null,

  //   //   swap: () => {
  //   //     let temp = this.mask.read;
  //   //     this.mask.read = this.mask.write;
  //   //     this.mask.write = temp;
  //   //     this.uniform.value = this.mask.read.texture;
  //   //   },
  //   // };
  //   // this.mask.read = new THREE.WebGLRenderTarget(1024, 1024, {
  //   //   minFilter: THREE.LinearFilter,
  //   //   type: THREE.FloatType,
  //   //   magFilter: THREE.LinearFilter,
  //   // });
  //   // this.mask.write = new THREE.WebGLRenderTarget(1024, 1024, {
  //   //   minFilter: THREE.LinearFilter,
  //   //   type: THREE.FloatType,
  //   //   magFilter: THREE.LinearFilter,
  //   // });
  //   // this.lumMat = new THREE.ShaderMaterial({
  //   //   vertexShader: `
  //   //   varying vec2 vUv;
  //   //   void main() {
  //   //     gl_Position = vec4(position, 1.);
  //   //     vUv = uv;
  //   //   }
  //   //   `,
  //   //   fragmentShader: `
  //   //   varying vec2 vUv;
  //   //   uniform sampler2D tDiffuse;
  //   //   void main() {
  //   //     gl_FragColor = texture2D(tDiffuse, vUv);
  //   //     gl_FragColor.r = texture2D(tDiffuse, vUv + vec2(0.1, 0.)).r;
  //   //   }
  //   //   `,
  //   //   uniforms: {
  //   //     tDiffuse: this.uniform,
  //   //   },
  //   // });
  //   // this.mask.swap();
  //   // this.lumPP = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.lumMat);
  // }

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

  // setGodrays() {
  //   let renderPass = new RenderPass(this.scene, this.camera);

  //   // let circleGeo = new THREE.CircleGeometry(10, 20);
  //   // let circleMat = new THREE.MeshBasicMaterial({ color: 0xffccaa });
  //   // let circle = new THREE.Mesh(circleGeo, circleMat);
  //   // circle.position.set(35, 14.5, -90);
  //   // this.scene.add(circle);

  //   // let godraysEffect = new GodRaysEffect(this.camera, circle, {
  //   //   resolutionScale: 1,
  //   //   density: 0.8,
  //   //   decay: 0.95,
  //   //   weight: 0.5,
  //   //   samples: 50,
  //   // });

  //   // const godRaysPass = new EffectPass(this.camera, godraysEffect);
  //   // godRaysPass.renderToScreen = true;

  //   this.composer = new EffectComposer(this.renderer);
  //   // this.composer.addPass(renderPass);
  //   // this.composer.addPass(godRaysPass);

  //   const bloomEffect = new SelectiveBloomEffect(this.scene, this.camera, {
  //     intensity: 4,
  //   });
  //   bloomEffect.selection.add(this.faScreen.mesh);
  //   bloomEffect.selection.inverted = true;
  //   bloomEffect.selection.exclusive = false;
  //   bloomEffect.selection.clear();
  //   bloomEffect.selection.toggle(this.faScreen.mesh);
  //   console.log(bloomEffect.selection);
  //   const bloomPass = new EffectPass(this.camera, bloomEffect);
  //   bloomPass.renderToScreen = true;
  //   this.composer.addPass(renderPass);
  //   this.composer.addPass(bloomPass);
  // }

  getURLfromTemplate = (template: Template): string => {
    if (template === Template.ProjectDetail) {
      if (this.isPreloaded) {
        console.log(this.screenTitles.activeProject);
        console.log(templateToURLMap);
        return templateToURLMap[this.screenTitles.activeProject];
      } else {
        const path = window.location.pathname;
        const index = projectDetailPathToIndexMap[path];
        this.screenTitles.activeProject = index;
        return templateToURLMap[index];
      }
    }
    return templateToURLMap[template];
  };

  onPreloaded() {
    this.navigation.onPreloaded();
    this.faScreen && this.faScreen.onPreloaded();
    this.setProjectDetail();
    this.setAbout();
    this.onChange({
      template: urlToTemplateMap[window.location.pathname],
    });
    this.isPreloaded = true;
    this.cameraWrapper.onPreloaded();
    this.screenTitles && this.screenTitles.onPreloaded();
    this.screenTitles.group.layers.enable(1);
    this.screenTitles.titles.map((mesh: any) => mesh.layers.enable(1));
    this.addListeners();
    this.debug.expanded = false;
  }

  onChange({ template, push = true }: { template: Template; push?: boolean }) {
    // if (template == this.template) return;

    this.previousTemplate = this.template;
    this.template = template;

    if (push) {
      window.history.pushState({}, "", `${this.getURLfromTemplate(template)}`);
    }

    // this.projectDetail.hide();

    if (this.template === Template.Home) {
      this.screenTitles.toHome();
      this.faScreen.toHome();
      this.navigation.toHome();
    } else if (this.template === Template.Projects) {
      console.log(this.screenTitles.activeProject);
      this.screenTitles.toProjects();
      this.faScreen.toProjects();
      this.navigation.toProjects();
    } else if (this.template == Template.ProjectDetail) {
      this.screenTitles.toProjectDetail();
      this.faScreen.toProjectDetail();
      this.projectDetail.toProjectDetail();
    } else if (this.template === Template.About) {
      this.screenTitles.toAbout();
      this.faScreen.toAbout();
      this.projectDetail.toAbout();
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
      screenScale: 20,
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

  setAbout() {
    this.about = new About();
  }

  setWater() {
    this.water = new Water();
  }

  setParticles() {
    this.particles = new Particles();
  }

  // addRandomObjects() {
  //   const sphereGeo = new THREE.SphereGeometry(3);
  //   const sphereMat = new THREE.MeshStandardMaterial();
  //   const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  //   sphere.castShadow = true;
  //   sphere.position.set(10, 8, 9);
  //   this.scene.add(sphere);
  //   const boxGeo = new THREE.BoxGeometry(3, 3, 5);
  //   const boxMat = new THREE.MeshStandardMaterial();
  //   this.box = new THREE.Mesh(boxGeo, boxMat);
  //   this.box.position.set(-7, 4, 8);
  //   this.box.castShadow = true;
  //   this.scene.add(this.box);
  //   const torusGeo = new THREE.TorusGeometry(2, 1, 30, 30);
  //   const torusMat = new THREE.MeshStandardMaterial();
  //   this.torus = new THREE.Mesh(torusGeo, torusMat);
  //   this.torus.position.set(5, 4, 8);
  //   this.torus.castShadow = true;
  //   // this.scene.add(this.torus);
  //   const icoGeo = new THREE.IcosahedronGeometry(2, 0);
  //   const icoMat = new THREE.MeshStandardMaterial();
  //   this.ico = new THREE.Mesh(icoGeo, icoMat);
  //   this.ico.position.set(10, 6.5, -12);
  //   this.ico.castShadow = true;
  //   this.scene.add(this.ico);

  //   // this.plane = new THREE.Mesh(
  //   //   new THREE.PlaneGeometry(250, 250),
  //   //   new THREE.MeshStandardMaterial()
  //   // );
  //   // this.plane.rotation.x = -Math.PI / 2;
  //   // this.plane.position.y += 1.5;
  //   // this.scene.add(this.plane);

  //   // const oboxGeo = new THREE.SphereGeometry(99);
  //   // const oboxMat = new THREE.MeshPhongMaterial({
  //   //   side: THREE.BackSide,
  //   //   transparent: true,
  //   //   opacity: 0.8,
  //   // });
  //   // this.obox = new THREE.Mesh(oboxGeo, oboxMat);
  //   // // this.obox.position.set(-7, 4, 8);
  //   // this.obox.castShadow = true;
  //   // this.scene.add(this.obox);

  //   this.updateRandonObjects = () => {
  //     this.torus.rotation.x += 0.01;
  //     this.torus.position.x -= Math.sin(this.time) * 0.05;
  //     this.torus.position.z -= Math.sin(this.time) * 0.1;
  //     this.torus.position.y += Math.sin(this.time) * 0.02;
  //     this.box.rotation.x += 0.01;
  //     this.box.rotation.y += 0.01;
  //     this.ico.rotation.y += 0.01;
  //   };
  // }

  setSky() {
    this.sky = new Sky();
  }

  setProjectTitles() {
    // this.AllTitles = new AllTitles();
  }

  setScreen() {
    // this.screen = new Screen();
  }

  setFixedAspectScreen() {
    this.faScreen = new FaScreen();
  }

  setScreenTitles() {
    this.screenTitles = new ScreenTitles();
  }

  onPointermove(event: PointerEvent) {
    this.mouse.x = (2 * event.clientX) / this.resolutionX - 1;
    this.mouse.y = (-2 * event.clientY) / this.resolutionY + 1;
    this.cameraWrapper.onPointermove();
    return;

    this.navigation.onPointermove(this.mouse);
    this.projectDetail.onPointermove(this.mouse);
    // this.projectDetail.onPointermove();

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
    // this.projectDetail &&
    //   this.template === Template.ProjectDetail &&
    //   this.projectDetail.onPointermove();
  }

  onPointerdown() {
    return;
    this.water && this.water.buffer.onMousedown();
    this.faScreen && this.faScreen.onPointerdown();
    this.screenTitles && this.screenTitles.onPointerdown();
    this.template === Template.ProjectDetail &&
      this.projectDetail &&
      this.projectDetail.onPointerdown();
    this.navigation && this.navigation.onPointerdown();
  }
  onPointerup() {
    this.water && this.water.buffer.onMouseup();
  }
  onWheel(event: WheelEvent) {
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
    this.isPreloaded && this.navigation.onResize();
    this.projectDetail && this.projectDetail.onResize();
    this.about && this.about.onResize();
    // this.screen && this.screen.onResize();
  }

  addListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("pointermove", this.onPointermove.bind(this));
    window.addEventListener("pointerdown", this.onPointerdown.bind(this));
    window.addEventListener("pointerup", this.onPointerup.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this));
    window.addEventListener("popstate", this.onPopState.bind(this));
  }

  onPopState() {
    this.onChange({
      template: urlToTemplateMap[window.location.pathname],
      push: false,
    });
  }

  update(delta: any) {
    this.cameraWrapper.update();
    this.isPreloaded && this.water && this.water.update(delta);
    this.sky && this.sky.update();
    this.screenTitles && this.screenTitles.update();
    this.faScreen && this.faScreen.update();
    this.particles && this.particles.update();
    this.projectDetail && this.projectDetail.update();

    // this.updateRandonObjects();
  }

  renderBloom() {
    this.finalEffect.uniforms.uTime.value = this.time;
    this.camera.layers.set(1);
    this.faScreen.projectsMaterial.uniforms.uDarken.value = 0;
    this.water.blockBloomDummy.material.visible = true;
    // this.bloomPass.strength = 4;
    this.bloomComposer.render();

    // this.camera.layers.set(2);
    // this.bloomPass.strength = 1;
    // this.bloomComposer.render();

    this.camera.layers.set(0);
    this.faScreen.projectsMaterial.uniforms.uDarken.value = 1;
    this.water.blockBloomDummy.material.visible = false;
    this.finalComposer.render();
  }

  render() {
    let delta = 0.01633;
    this.time += delta;
    this.update(delta);
    // this.renderer.render(this.scene, this.camera);
    this.renderBloom();

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
