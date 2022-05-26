import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { degToRad } from "three/src/math/MathUtils";
import { Pane } from "tweakpane";
import { Water } from "./Water";
import GSAP from "gsap";
// import { Sky } from "three/examples/jsm/objects/Sky";
import Sky from "./Sky";
import skyVertex from "./shaders/sky/vertex.glsl";
import skyFragment from "./shaders/sky/fragment.glsl";
import Screen from "./Screen";
import Resources from "./Resources";
import MsdfTitle from "./MsdfTitle";
import Lights from "./Lights";
import Camera from "./Camera";
import RendererWrapper from "./RendererWrapper";
import AllTitles from "./AllTitles";
import FaScreen from "./FaScreen";
import ScreenTitles from "./ScreenTitles";

export default class World {
  static instance;
  constructor() {
    if (World.instance) {
      return World.instance;
    }
    World.instance = this;

    this.time = 0;
    this.template = window.location.pathname;
    this.fromToRoute = "";
    this.route = "/";
    this.container = document.querySelector("#canvas");
    this.resolutionX = this.container.offsetWidth;
    this.resolutionY = this.container.offsetHeight;
    this.viewport = new THREE.Vector2();
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.Fog(0xdfe9f3, 4, 16);
    // this.scene.fog = new THREE.FogExp2(0xdfe9f3, 0.05);
    this.debug = new Pane();
    this.setSettings();
    this.setCamera();
    this.setRenderer();
    this.isFullscreen = false;
    this.enableParallax = true;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // console.log(this.controls);
    this.controls.enabled = false;
    this.cameraTarget = new THREE.Vector2();
    this.mouse = new THREE.Vector2();
    this.textureLoader = new THREE.TextureLoader();
    this.resources = new Resources();
    this.raycaster = new THREE.Raycaster();
    this.setLight();
    this.setWater();
    this.addRandomObjects();
    // this.setSkyBox();
    // this.setExpSky();
    this.setSky();
    // this.setPointerParticles();
    // this.setScreen();
    this.setFixedAspectScreen();
    this.setScreenTitles();
    // this.setProjectTitles();
    this.render();
    this.addListeners();
    this.resize();

    this.debug.addButton({ title: "parallax vs orbit" }).on("click", () => {
      const isParallaxMode = !this.enableParallax;
      this.controls.enabled = !isParallaxMode;
      this.enableParallax = isParallaxMode;
      this.resize();
      this.camera.rotation.set(0, 0, 0);
    });
    this.debug.addButton({ title: "toggle parallax" }).on("click", () => {
      this.enableParallax = !this.enableParallax;
      this.camera.rotation.set(0, 0, 0);
    });
  }

  setSettings() {
    this.settings = {
      cameraZ: 90,
      cameraY: 22,
      cameraFOV: 45,
      environmentSize: 200,
      baselineFOV: 45,
      screenPosZ: 20,
      screenPosY: 20,
      screenScale: 16,
      route: "/",
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
        value: "/",
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

  setSkyBox() {
    const textures = [
      this.textureLoader.load("cubemap/px.jpeg"),
      this.textureLoader.load("cubemap/nx.jpeg"),
      this.textureLoader.load("cubemap/py.jpeg"),
      this.textureLoader.load("cubemap/ny.jpeg"),
      this.textureLoader.load("cubemap/pz.jpeg"),
      this.textureLoader.load("cubemap/nz.jpeg"),
    ];
    const materials = [];
    textures.forEach((tex) => {
      materials.push(
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide })
      );
    });
    const g = new THREE.BoxGeometry(1, 1, 1);
    const skybox = new THREE.Mesh(g, materials);
    skybox.scale.setScalar(400);
    this.scene.add(skybox);
  }

  setExpSky() {
    this.settings = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      elevation: 2,
      azimuth: 180,
      exposure: 0.5,
    };
    this.sky = new Sky();
    this.sky.renderOrder = -1000;
    this.sky.scale.setScalar(100);
    const sun = new THREE.Vector3(0, 20, -40);
    const guiChanged = () => {
      const uniforms = this.sky.material.uniforms;
      uniforms["turbidity"].value = this.settings.turbidity;
      uniforms["rayleigh"].value = this.settings.rayleigh;
      uniforms["mieCoefficient"].value = this.settings.mieCoefficient;
      uniforms["mieDirectionalG"].value = this.settings.mieDirectionalG;

      const phi = THREE.MathUtils.degToRad(90 - this.settings.elevation);
      const theta = THREE.MathUtils.degToRad(this.settings.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      uniforms["sunPosition"].value.copy(sun);

      this.renderer.toneMappingExposure = this.settings.exposure;
    };
    guiChanged();

    this.scene.add(this.sky);
    this.debug
      .addInput(this.settings, "turbidity", { min: 0, max: 20, step: 0.1 })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "mieCoefficient", {
        min: 0,
        max: 0.1,
        step: 0.001,
      })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "mieDirectionalG", {
        min: 0,
        max: 1,
        step: 0.001,
      })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "elevation", { min: 0, max: 90, step: 0.1 })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "azimuth", { min: -180, max: 180, step: 0.1 })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "exposure", { min: 0, max: 1, step: 0.0001 })
      .on("change", guiChanged);
  }

  setSky() {
    this.sky = new Sky();
  }

  setPointerParticles() {
    this.ppG = new THREE.BufferGeometry();
    this.ppCount = 50;
    this.posArray = new Float32Array(this.ppCount * 3);
    for (let i = 0; i < this.ppCount; i++) {
      this.posArray[i * 3] = Math.random() - 0.5;
      this.posArray[i * 3 + 1] = Math.random() - 0.5;
      this.posArray[i * 3 + 2] = Math.random() - 0.5;
    }
    this.ppG.setAttribute(
      "position",
      new THREE.BufferAttribute(this.posArray, 3)
    );
    this.ppM = new THREE.ShaderMaterial({
      uniforms: {
        uPointer: { value: new THREE.Vector3() },
      },
      vertexShader: `
          uniform vec3 uPointer;

          void main() {
              vec3 newPos = position * 5. + uPointer;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
              gl_PointSize = 10.;
          }
          `,
      fragmentShader: `
          void main() {
              gl_FragColor = vec4(1., 1., 0., 1.);
          }
          `,
      transparent: true,
    });
    this.ppMesh = new THREE.Points(this.ppG, this.ppM);

    this.ppScene = new THREE.Scene();
    this.ppScene.add(this.ppMesh);
    this.mask = { read: null, write: null };
    this.mask.read = new THREE.WebGLRenderTarget(
      this.resolutionX,
      this.resolutionY,
      {
        stencilBuffer: false,
        depthBuffer: false,
        type: THREE.FloatType,
      }
    );
    this.mask.write = new THREE.WebGLRenderTarget(
      this.resolutionX,
      this.resolutionY,
      {
        stencilBuffer: false,
        depthBuffer: false,
        type: THREE.FloatType,
      }
    );
    // this.ppRT = new THREE.WebGLRenderTarget(this.resolutionX, this.resolutionY, {
    //   stencilBuffer: false,
    //   depthBuffer: false,
    //   type: THREE.FloatType,
    // });
    // this.ppRTWrite = new THREE.WebGLRenderTarget(this.resolutionX, this.resolutionY, {
    //   stencilBuffer: false,
    //   depthBuffer: false,
    //   type: THREE.FloatType,
    // });
    this.ppUniform = { value: null };
    this.ppSwap = () => {
      let temp = this.mask.read;
      this.mask.read = this.mask.write;
      this.mask.write = temp;
      this.ppUniform.value = this.mask.read.texture;
    };
    this.ppSwap();
    const ppPostGeo = new THREE.PlaneGeometry(2, 2);
    this.ppPostM = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;

        void main() {
            gl_Position = vec4(position.xy, 0.0, 1.0);
            vUv = uv;
        }
        `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        uniform vec2 uPointer;
        uniform float uSamples;
        varying vec2 vUv;
        void main() {
            vec4 screen = texture2D(uTexture, vUv) * 0.98;
            gl_FragColor = screen;
        }
        `,
      uniforms: {
        uTexture: this.ppUniform,
        uResolution: {
          value: new THREE.Vector2(this.resolutionX, this.resolutionY),
        },
        uSamples: { value: 1 },
        uPointer: { value: new THREE.Vector2() },
      },
      //   transparent: true,
    });
    this.renderer.autoClear = false;
    // this.renderer.autoClearColor = false;
    this.ppPostMesh = new THREE.Mesh(ppPostGeo, this.ppPostM);
    this.ppScene.add(new THREE.Mesh(ppPostGeo, this.ppPostM));

    this.other = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
  
          void main() {
              gl_Position = vec4(position.xy, 0.0, 1.0);
              vUv = uv;
          }
          `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform vec2 uPointer;
          uniform float uSamples;
          varying vec2 vUv;
          void main() {
              vec4 screen = texture2D(uTexture, vUv);
              float a = screen.r;
              screen.a = a;
              gl_FragColor = screen;
          }
          `,
        uniforms: {
          uTexture: this.ppUniform,
        },
        transparent: true,
      })
    );
    this.scene.add(this.other);

    this.updatePPtrail = () => {
      this.renderer.setRenderTarget(this.mask.write);
      this.renderer.render(this.ppScene, this.camera);
      this.ppSwap();
      this.renderer.setRenderTarget(null);
      this.renderer.clear();
    };
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

  fullScreenTransition() {
    // const h = this.screen.mesh.scale.y;
    // // scale screen width to match aspect ration
    // const alpha = this.camera.fov / 2;
    // const d = (0.5 * h) / Math.tan(degToRad(alpha));

    // const dummy = new THREE.Object3D();
    // dummy.position
    //   .copy(this.screen.mesh.position)
    //   .add(this.screen.direction.clone().multiplyScalar(d));

    if (!this.isFullscreen) {
      //   GSAP.to(this.camera.position, {
      //     ...this.cameraWrapper.originalPosition,
      //     duration: 1,
      //   });
      GSAP.to(this.camera.rotation, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1,
        // onComplete: () => (this.enableParallax = true),
      });
      this.screen && this.screen.enterFullscreen();
      this.enableParallax = false;
    } else {
      this.enableParallax = true;
      //   GSAP.to(this.camera.position, {
      //     ...dummy.position,
      //     duration: 1,
      //   });
      //   GSAP.to(this.camera.rotation, {
      //     x: this.screen.mesh.rotation.x,
      //     y: this.screen.mesh.rotation.y,
      //     z: this.screen.mesh.rotation.z,
      //     duration: 1,
      //   });
      this.screen && this.screen.exitFullscreen();
    }
    this.isFullscreen = !this.isFullscreen;
  }

  parallax() {
    // this.camera.rotation.y = -this.mouse.x * 0.2;
    // this.camera.rotation.x = this.mouse.y * 0.4;
    this.cameraTarget.y = -this.mouse.x * 0.2;
    this.cameraTarget.x = this.mouse.y * 0.4;
  }

  onMousemove(event) {
    this.mouse.x = (2 * event.clientX) / this.resolutionX - 1;
    this.mouse.y = (-2 * event.clientY) / this.resolutionY + 1;
    // this.ppPostMesh.material.uniforms.uPointer.value.copy(this.mouse);

    this.enableParallax && this.parallax();

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
  }

  onMousedown() {
    this.water.buffer.onMousedown();
    // this.fullScreenTransition();
    this.faScreen && this.faScreen.onPointerdown();
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
    this.dominantSize = Math.max(this.resolutionX, this.resolutionY);
    const h =
      2 *
      Math.abs(this.camera.position.z) *
      Math.tan(degToRad(this.camera.fov) / 2);
    const w = h * (this.resolutionX / this.resolutionY);
    this.viewport.set(Math.abs(w), Math.abs(h));
    this.rendererWrapper.onResize();
    this.cameraWrapper.onResize();
    this.water.onResize();
    this.sky.onResize();

    this.screen && this.screen.onResize();
    this.faScreen && this.faScreen.onResize();
    this.allTitles && this.AllTitles.onResize();
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

    this.faScreen && this.faScreen.onChange();
    this.screenTitles && this.screenTitles.onChange();
  }

  render() {
    let delta = 0.01633;
    this.time += delta;
    this.sky.update();

    this.water.update(delta);
    // this.water.updateReflector();
    // this.water.buffer.updateValues(delta);
    // this.water.buffer.update();
    this.screenTitles && this.screenTitles.update();

    this.updateRandonObjects();

    if (this.enableParallax) {
      this.camera.rotation.x +=
        (this.cameraTarget.x - this.camera.rotation.x) * 0.1;
      this.camera.rotation.y +=
        (this.cameraTarget.y - this.camera.rotation.y) * 0.1;
    }

    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
