import World, { Template } from "./app2";
import * as THREE from "three";
import vertexFront from "./shaders/faScreen/front/vertex.glsl";
import fragmentFront from "./shaders/faScreen/front/fragment.glsl";
import vertexProjects from "./shaders/faScreen/projectsMaterial/vertex.glsl";
import fragmentProjects from "./shaders/faScreen/projectsMaterial/fragment.glsl";
import { degToRad } from "three/src/math/MathUtils";
import GSAP from "gsap";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
// import hdrSource from "./empty_warehouse_01_2k.hdr";
// import {
//   Lensflare,
//   LensflareElement,
// } from "three/examples/jsm/objects/Lensflare";
// import lensflare0 from "./lensflareTextures/lensflare0.png";
// import lensflare2 from "./lensflareTextures/lensflare2.png";
// import lensflare3 from "./lensflareTextures/lensflare3.png";

export default class FaScreen {
  world;
  scene;
  raycaster;
  hover;
  mesh: any;
  debug: any;
  defaultMaterial: any;
  material: any;
  homeMaterial: any;
  defaultMatOptions: any;
  debugPhysicsMat: any;
  projectTextures: any;
  nScale: any;
  clearcoatNScale: any;
  projectsMaterial: any;
  aboutMaterial: any;
  geometry: any;
  fromMonitorSizes: any;
  objectAspect: any;
  screenAspect: any;
  pixelSize: any;
  distanceToCamera: any;
  heightDepthRatio: any;
  waterLevel: any;
  time: any;
  scaleTarget: any;
  yPositionTarget: any;
  sideMaterial: any;
  backMaterial: any;
  frontMaterial: any;
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;
    this.hover = false;
    this.init();
  }

  init() {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setHomeMaterial();
    this.setProjectsMaterial();
    // this.setPhysicalMat()
    this.setAboutMaterial();
    this.setSizesTemp();
    this.onResize = this.onResizeLoading;
    this.update = this.updateLoading;
    this.scene.add(this.mesh);

    this.debug = this.world.debug.addFolder({
      title: "faScreen",
      expanded: false,
    });
    this.debug.addInput(this.mesh, "position", {
      picker: "inline",
      expanded: true,
      multiline: true,
      x: {
        min: -10,
        max: 50,
      },
      y: {
        min: -10,
        max: 50,
      },
      z: {
        min: -10,
        max: 50,
      },
    });
  }

  onPreloaded() {
    this.onResize = this.onResizeLoaded;

    this.projectTextures = this.world.resources.projectsData.map(
      (project: any) => project.texture
    );
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    // this.geometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.15);
    // this.geometry = new RoundedBoxGeometry(1, 1, 1, 0, 0.2);
    console.log(this.geometry);
  }

  setMaterial() {
    this.defaultMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(1., 1., 1., 1.);
        }
      `,
      wireframe: false,
      transparent: true,
    });
    this.material = this.defaultMaterial;
    this.material = [
      this.defaultMaterial,
      this.defaultMaterial,
      this.defaultMaterial,
      this.defaultMaterial,
      this.defaultMaterial,
      this.defaultMaterial,
    ];
    // this.material = [null, null, null, null, this.defaultMaterial, null];
  }

  setPhysicalMat() {
    const hdrEquirect = new RGBELoader().load(
      "empty_warehouse_01_2k.hdr",
      () => {
        hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
      }
    );
    this.defaultMatOptions = {
      attenuationColor: 0xffffff,
      attenuationDistance: 0,
      clearcoat: 0,
      clearcoatMap: null,
      clearcoatNormalMap: this.world.textureLoader.load("normal.jpg"),
      clearcoatNormalScale: new THREE.Vector2(0.3),
    };
    this.defaultMaterial = new THREE.MeshPhysicalMaterial({
      attenuationColor: this.defaultMatOptions.attenuationColor,
      attenuationDistance: this.defaultMatOptions.attenuationDistance,
      metalness: 0,
      roughness: 0.56,
      transmission: 1,
      envMap: hdrEquirect,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      normalScale: new THREE.Vector2(1),
      normalMap: this.world.textureLoader.load("normal.jpg"),
      clearcoatNormalMap: this.world.textureLoader.load("normal.jpg"),
      clearcoatNormalScale: new THREE.Vector2(0.3),
      reflectivity: 0.5,
      ior: 1.5,
      sheen: 0,
      sheenColor: new THREE.Color(0xffffff),
      sheenRoughness: 0,
      // wireframe: true,
      color: 0xff0000,
      // transparent: true,
      // opacity: 0.9,
    });

    // const updateMat = (value) => this.defaultMaterial

    this.debug = this.world.debug.addFolder({
      title: "faScreen",
      expanded: false,
    });
    this.debugPhysicsMat = this.debug.addFolder({
      title: "physical material",
      expanded: false,
    });
    // this.debugPhysicsMat.on("change", ({ presetKey: property, value }) =>
    //   this.defaultMaterial[property] = value
    // );

    this.debugPhysicsMat.addInput(this.defaultMatOptions, "attenuationColor", {
      view: "color",
    });
    this.debugPhysicsMat.addInput(
      this.defaultMatOptions,
      "attenuationDistance",
      {
        min: 0,
        max: 300,
        step: 0.01,
      }
    );
    this.debugPhysicsMat.addInput(this.defaultMatOptions, "clearcoat", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    // clearcoatmap
    //clearcoatNormalScale

    this.debugPhysicsMat.addInput(this.defaultMaterial, "roughness", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.debugPhysicsMat.addInput(this.defaultMaterial, "transmission", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.debugPhysicsMat.addInput(this.defaultMaterial, "thickness", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.debugPhysicsMat.addInput(this.defaultMaterial, "envMapIntensity", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.debugPhysicsMat.addInput(this.defaultMaterial, "reflectivity", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.debugPhysicsMat.addInput(this.defaultMaterial, "ior", {
      min: 1,
      max: 2.333,
      step: 0.01,
    });
    this.debugPhysicsMat.addInput(this.defaultMaterial, "sheen", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.debugPhysicsMat.addInput(this.defaultMaterial, "sheenRoughness", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    // this.debugPhysicsMat.addInput(this.defaultMaterial, "ior", {
    //   min: 0,
    //   max: 1,
    //   step: 0.01,
    // });
    this.debugPhysicsMat.addInput(this.defaultMaterial, "clearcoat", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.debugPhysicsMat.addInput(this.defaultMaterial, "clearcoatRoughness", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.nScale = 1;
    this.debugPhysicsMat
      .addInput(this, "nScale", {
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", () => {
        this.defaultMaterial.normalScale.set(this.nScale, this.nScale);
      });
    this.clearcoatNScale = 0.3;
    this.debugPhysicsMat
      .addInput(this, "clearcoatNScale", {
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", () => {
        this.defaultMaterial.clearcoatNormalScale.set(
          this.clearcoatNScale,
          this.clearcoatNScale
        );
      });
  }

  setHomeMaterial() {
    this.homeMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0., 1., 0., 1.);
        }
      `,
    });
  }

  setProjectsMaterial() {
    this.projectsMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexProjects,
      fragmentShader: fragmentProjects,
      uniforms: {
        uTexture: {
          value: null,
        },
        uThickness: { value: 0.1 },
        uDarken: { value: 1 },
        uTime: { value: 0 },
      },
      // depthTest: false,
      // depthWrite: false,
      transparent: true,
    });
    // this.projectsMaterial = this.defaultMaterial;
  }

  setAboutMaterial() {
    this.aboutMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(1., 1., 1., 1.);
        }
      `,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.material.depthTest = true;
    this.material.depthWrite = true;
    this.mesh.renderOrder = -1000;

    // const lensflare = new Lensflare();
    // const textureFlare0 = this.world.textureLoader.load(lensflare0);
    // const textureFlare3 = this.world.textureLoader.load(lensflare3);
    // lensflare.addElement(new LensflareElement(textureFlare0, 500, 0));
    // lensflare.addElement(new LensflareElement(textureFlare3, 200, 0.5));
    // this.mesh.add(lensflare);
  }

  setMaterialTemp() {
    this.sideMaterial = new THREE.MeshBasicMaterial();
    this.backMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.frontMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexFront,
      fragmentShader: fragmentFront,
    });
    this.material = [
      this.sideMaterial,
      this.sideMaterial,
      this.sideMaterial,
      this.sideMaterial,
      this.frontMaterial,
      this.backMaterial,
    ];
  }

  onPointermove() {
    if (
      this.world.template !== Template.Home &&
      this.world.template !== Template.Projects
    )
      return;
    const intersect = this.raycaster.intersectObject(this.mesh);
    if (intersect.length) {
      this.hover = true;
    } else {
      this.hover = false;
    }
  }

  onPointerdown() {
    if (this.hover) {
      const currentRoute = this.world.template;
      console.log("efhefe", currentRoute);
      if (currentRoute === Template.Home) {
        this.world.onChange({ template: Template.Projects });
      } else if (currentRoute === Template.Projects) {
        this.world.onChange({ template: Template.ProjectDetail });
      }
    }
  }

  setSizesTemp() {
    this.fromMonitorSizes = {
      loading: {
        default: new THREE.Vector3(
          window.innerWidth * 0.3,
          window.innerWidth * 0.3,
          window.innerWidth * 0.3
        ),
        700: new THREE.Vector3(
          window.innerWidth * 0.5,
          window.innerWidth * 0.5,
          window.innerWidth * 0.5
        ),
      },
      home: {},
      projects: {
        default: new THREE.Vector3(
          window.innerWidth * 0.3,
          window.innerWidth * 0.3 * (9 / 16),
          0.01
        ),
        700: new THREE.Vector3(
          window.innerWidth * 0.5,
          window.innerWidth * 0.5 * (9 / 16),
          0.01
        ),
      },
      projectDetail: {
        default: new THREE.Vector3(
          window.innerWidth,
          window.innerHeight
          // window.innerWidth * 0.75,
          // window.innerWidth * 0.75 * (9 / 16)
        ),
        700: new THREE.Vector3(
          window.innerWidth * 0.9,
          window.innerHeight * 0.9,
          0.001
        ),
        // 700: new THREE.Vector3(window.innerWidth, window.innerHeight, 0.001),
      },
      about: {},
    };
  }

  onResizeLoading() {
    const size = 10;
    this.mesh.position.set(0, size * 0.5 + 2, this.world.settings.screenPosZ);
    this.mesh.scale.set(10, 10, 10);
  }

  onResizeLoaded() {
    this.objectAspect = 16 / 9;
    const size = 20;
    this.screenAspect = this.world.resolutionX / this.world.resolutionY;

    this.mesh.position.set(0, size * 0.5 + 2, this.world.settings.screenPosZ);
    this.mesh.scale.set(
      this.world.settings.screenScale * this.objectAspect,
      size,
      0.1
    );
  }

  onResizeProjects() {
    this.setSizesTemp();
    const monitorSize =
      this.fromMonitorSizes.projects[
        window.innerWidth < 700 ? "700" : "default"
      ];
    this.onResizeCommon();
    this.setDistanceToCamera();
    this.setPixelSize();
    this.mesh.scale.x = this.pixelSize * monitorSize.x;
    this.mesh.scale.y = this.pixelSize * monitorSize.y;
    // mesh is 2 units above water and in the middle of the screen
    let heightAboveWater = 2;
    this.world.camera.position.y = heightAboveWater + this.mesh.scale.y / 2;
    this.mesh.position.y = this.world.camera.position.y;
  }

  onResizeProjectDetails() {
    this.setSizesTemp();
    const monitorSize =
      this.fromMonitorSizes.projectDetail[
        window.innerWidth < 700 ? "700" : "default"
      ];
    this.onResizeCommon();
    this.setDistanceToCamera();
    this.setPixelSize();
    this.mesh.scale.x = this.pixelSize * monitorSize.x;
    this.mesh.scale.y = this.pixelSize * monitorSize.y;
    // mesh is 2 units above water and in the middle of the screen
    let heightAboveWater = -2;
    heightAboveWater = 0;
    this.world.camera.position.y = heightAboveWater + this.mesh.scale.y / 2;
    this.mesh.position.y = this.world.camera.position.y;
  }

  onResizeCommon() {
    this.heightDepthRatio = Math.tan(degToRad(this.world.camera.fov / 2));
    this.waterLevel = this.world.camera.position.y / this.heightDepthRatio;
  }

  setDistanceToCamera() {
    this.distanceToCamera = this.world.camera.position.z - this.mesh.position.z;
  }

  setPixelSize() {
    this.pixelSize =
      (2 * this.heightDepthRatio * this.distanceToCamera) / window.innerHeight;
  }

  onResize() {}

  updateCommon() {
    this.time = this.world.time;
    this.projectsMaterial.uniforms.uTime.value = this.time;
  }

  updateLoading() {
    this.updateCommon();
    this.mesh.rotation.y = Math.sin(this.time % (Math.PI * 2));
    this.mesh.rotation.x = Math.cos(this.time % (Math.PI * 2));
    this.mesh.position.y = 8 + 4 * Math.sin((this.time * 2) % Math.PI);
    if (this.mesh.position.y < 8.2)
      this.world.water && this.world.water.onPointermove({ x: 0.5, y: 0.37 });
  }

  updateHome() {
    // this.mesh.rotation.y += 0.01;
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += Math.sin(this.time * 0.001);
  }

  updateProjects() {
    this.updateCommon();
  }

  updateProjectDetail() {
    this.updateCommon();
  }

  updateAbout() {}

  update() {}

  updateLoaded() {}

  updateActiveProject(index: any) {
    this.projectsMaterial.uniforms.uTexture.value = this.projectTextures[index];
    // this.projectsMaterial.map = this.projectTextures[index];
  }
  // navigation stuff

  toHome() {
    GSAP.to(this.mesh.rotation, {
      x: 0.25 * Math.PI,
      y: 2.25 * Math.PI,
      duration: 1,
    });
    GSAP.to(this.mesh.scale, {
      x: 10,
      y: 10,
      z: 10,
      duration: 1,
    });
    GSAP.to(this.mesh.position, {
      z: 20,
      duration: 1,
    });
    this.update = this.updateHome;
    this.material[4] = this.homeMaterial;
  }

  toProjects() {
    this.updateActiveProject(this.world.screenTitles.activeProject);
    /*********set scale/position targets */
    this.setSizesTemp();
    const monitorSize =
      this.fromMonitorSizes.projects[
        window.innerWidth < 700 ? "700" : "default"
      ];
    this.onResizeCommon();
    this.setDistanceToCamera();
    this.setPixelSize();
    this.scaleTarget = new THREE.Vector3(
      this.pixelSize * monitorSize.x,
      this.pixelSize * monitorSize.y,
      0.001
    );
    // mesh is 2 units above water and in the middle of the screen
    let heightAboveWater = 2;
    this.yPositionTarget = heightAboveWater + this.scaleTarget.y / 2;
    /*************** */
    this.onResize = this.onResizeProjects;
    // this.onResize = this.resizeToFullScreen;
    GSAP.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      duration: 1,
    });
    GSAP.to(this.mesh.scale, {
      x: this.scaleTarget.x,
      y: this.scaleTarget.y,
      z: this.scaleTarget.z,
      duration: 1,
    });
    GSAP.to(this.mesh.position, {
      y: this.yPositionTarget,
      duration: 1,
    });
    GSAP.to(this.world.camera.position, {
      y: this.yPositionTarget,
      duration: 1,
    });
    this.update = this.updateProjects;
    this.material[4] = this.projectsMaterial;
  }

  toProjectDetail() {
    /*********set scale/position targets */
    this.setSizesTemp();
    const monitorSize =
      this.fromMonitorSizes.projectDetail[
        window.innerWidth < 700 ? "700" : "default"
      ];
    this.onResizeCommon();
    this.setDistanceToCamera();
    this.setPixelSize();
    this.scaleTarget = new THREE.Vector3(
      this.pixelSize * monitorSize.x,
      this.pixelSize * monitorSize.y,
      0.001
    );
    // mesh is 2 units above water and in the middle of the screen
    let heightAboveWater = -2;
    this.yPositionTarget = heightAboveWater + this.scaleTarget.y / 2;
    /*************** */
    this.onResize = this.onResizeProjectDetails;
    GSAP.to(this.mesh.position, {
      y: this.yPositionTarget,
      duration: 1,
    });
    GSAP.to(this.world.camera.position, {
      y: this.yPositionTarget,
      duration: 1,
    });
    GSAP.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      duration: 1,
    });
    GSAP.to(this.mesh.scale, {
      ...this.scaleTarget,
      duration: 1,
    });
    this.material[4] = this.projectsMaterial;
    this.update = this.updateProjectDetail;
  }

  toAbout() {
    GSAP.to(this.mesh.rotation, {
      x: 0.25 * Math.PI,
      y: 2.25 * Math.PI,
      duration: 1,
    });
    GSAP.to(this.mesh.scale, {
      x: 10,
      y: 10,
      z: 10,
      duration: 1,
    });
    this.update = this.updateAbout;
    this.material[4] = this.aboutMaterial;
  }
}
