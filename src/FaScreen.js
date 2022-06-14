import World from "./app2";
import * as THREE from "three";
import vertexFront from "./shaders/faScreen/front/vertex.glsl";
import fragmentFront from "./shaders/faScreen/front/fragment.glsl";
import preVertexShader from "./shaders/preloader/vertex.glsl";
import preFragmentShader from "./shaders/preloader/fragment.glsl";
import { degToRad, clamp } from "three/src/math/MathUtils";
import GSAP from "gsap";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
// import hdrSource from "./empty_warehouse_01_2k.hdr";
import normalIng from "./normal.jpg";
import {
  Lensflare,
  LensflareElement,
} from "three/examples/jsm/objects/Lensflare";
import lensflare0 from "./lensflareTextures/lensflare0.png";
import lensflare2 from "./lensflareTextures/lensflare2.png";
import lensflare3 from "./lensflareTextures/lensflare3.png";

export default class FaScreen {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;
    this.hover = false;
    this.init();

    this.world.debug
      .addButton({ title: "test" })
      .on("click", () => this.updateActiveProject(3));
  }

  init() {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setHomeMaterial();
    this.setProjectsMaterial();
    // this.setPhysicalMat()
    this.setAboutMaterial();
    this.onResize = this.onResizeLoading;
    this.update = this.updateLoading;
    this.scene.add(this.mesh);
  }

  onPreloaded() {
    this.onResize = this.onResizeLoaded;

    console.log(this.world.resources.projectsData);

    this.projectTextures = this.world.resources.projectsData.map(
      (project) => project.texture
    );
    console.log(this.projectTextures);
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    // this.geometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.15);
    // this.geometry = new RoundedBoxGeometry(1, 1, 1, 0, 0.2);
    console.log(this.geometry);
  }

  setMaterial() {
    ///

    const glowV = `
    uniform vec3 viewVector;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() 
    {
        vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( c - dot(vNormal, vNormel), p );
      
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `;
    const glowF = `
    uniform vec3 glowColor;
    varying float intensity;
    void main() 
    {
      vec3 glow = glowColor * intensity;
        gl_FragColor = vec4( glow, 1.0 );
    }
    `;
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.5 },
        p: { value: 4 },
        glowColor: { value: new THREE.Color(0xffffff) },
        viewVector: { value: this.world.camera.position },
      },
      vertexShader: glowV,
      fragmentShader: glowF,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const glowMesh = new THREE.Mesh(this.geometry, glowMat);
    glowMesh.scale.multiplyScalar(12);
    glowMesh.position.set(
      0,
      this.world.settings.screenPosY,
      this.world.settings.screenPosZ
    );
    // this.scene.add(glowMesh);
    ////

    this.defaultMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0., 0., 0., 0.);
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
      clearcoatNormalMap: this.world.textureLoader.load(normalIng),
      clearcoatNormalScale: new THREE.Vector2(0.3),
    };
    this.defaultMaterial = new THREE.MeshPhysicalMaterial({
      attenuationColor: this.defaultMatOptions.attenuationColor,
      attenuationDistance: this.defaultMatOptions.attenuationDistance,
      metalness: 0,
      roughness: 0.56,
      transmission: 1,
      thickness: 0.5,
      envMap: hdrEquirect,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      normalScale: new THREE.Vector2(1),
      normalMap: this.world.textureLoader.load(normalIng),
      clearcoatNormalMap: this.world.textureLoader.load(normalIng),
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

    this.debug = this.world.debug.addFolder({ title: "faScreen" });
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
      vertexShader: `
        varying vec2 vUv;

        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uThickness;
        varying vec2 vUv;
        const vec2 uAspect = vec2(16., 9.);

        float border(vec2 uv, float thickness) {
          float padding = 0.3;
          float left = smoothstep(thickness*(1.0+padding)*uAspect.x, thickness*uAspect.x, uv.x) * smoothstep(0.0, thickness*padding*uAspect.x, uv.x);
          float right = smoothstep(1.0-thickness*(1.0+padding)*uAspect.x, 1.0-thickness*uAspect.x, uv.x) * smoothstep(1.0, 1.0-thickness*padding*uAspect.x, uv.x);
          float bottom = smoothstep(1.0-thickness*(1.0+padding)*uAspect.y, 1.0-thickness*uAspect.y, uv.y) * smoothstep(1.0, 1.0-thickness*padding*uAspect.y, uv.y);
          float top = smoothstep(thickness*(1.0+padding)*uAspect.y, thickness*uAspect.y, uv.y) * smoothstep(0.0, thickness*padding*uAspect.y, uv.y);
      
          // Fade overlaps
          left *= smoothstep(0.0, thickness*(1.0)*uAspect.y, uv.y) * smoothstep(1.0, 1.0-thickness*(1.0)*uAspect.y, uv.y);
          right *= smoothstep(0.0, thickness*(1.0)*uAspect.y, uv.y) * smoothstep(1.0, 1.0-thickness*(1.0)*uAspect.y, uv.y);
          bottom *= smoothstep(0.0, thickness*(1.0)*uAspect.x, uv.x) * smoothstep(1.0, 1.0-thickness*(1.0)*uAspect.x, uv.x);
          top *= smoothstep(0.0, thickness*(1.0)*uAspect.x, uv.x) * smoothstep(1.0, 1.0-thickness*(1.0)*uAspect.x, uv.x);
      
          float lines = left+right+bottom+top;
          return clamp(lines, 0.0, 1.0);
      }

        float edgeFactor(vec2 p){
          // vec2 grid = abs(fract(p - 0.5) - 0.5) / fwidth(p) / uThickness;
          vec2 cUv = p - vec2(0.5);
          // cUv = p - vec2(0.5, 0.);
          vec2 grid = abs(fract(cUv) - 0.5) / fwidth(p) / (uThickness * 100.);
          // vec2 grid = abs(fract(cUv) - 0.5) / vec2(0.01) / (uThickness * 100.);
          return min(grid.x, grid.y);
        }

        void main() {
          float a = edgeFactor(vUv);
          float alpha = border(vUv, 0.1);
          vec4 image = texture2D(uTexture, vUv);
          vec3 edgeCol = mix(image.rgb, vec3(0.), a);
          gl_FragColor = vec4(image.rgb + edgeCol, 1.);
          gl_FragColor = image;
          gl_FragColor.a = alpha;
        }
      `,
      uniforms: {
        uTexture: {
          value: null,
        },
        uThickness: { value: 0.1 },
      },
      // depthTest: false,
      // depthWrite: false,
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
    if (this.world.template !== "/" && this.world.template !== "/projects")
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
      if (currentRoute === "/") {
        console.log("LETSGO");
        this.world.onChange({ url: "/projects" });
      } else if (currentRoute === "/projects") {
        console.log("NOPE");
        const path =
          this.world.screenTitles.paths[this.world.screenTitles.activeProject];
        this.world.onChange({ url: path });
      }
    }
  }

  onChange() {
    // const template = this.world.template;
    // if (template === "/") {
    // }
  }

  onResizeLoading() {
    this.mesh.position.set(
      0,
      this.world.settings.screenPosY,
      this.world.settings.screenPosZ
    );
    this.mesh.scale.set(10, 10, 10);
  }

  onResizeLoaded() {
    this.objectAspect = 16 / 9;
    this.screenAspect = this.world.resolutionX / this.world.resolutionY;

    this.mesh.position.set(
      0,
      this.world.settings.screenPosY,
      this.world.settings.screenPosZ
    );
    this.mesh.scale.set(
      this.world.settings.screenScale,
      this.world.settings.screenScale * this.objectAspect,
      this.world.settings.screenScale
    );
  }

  onResize() {}

  updateCommon() {
    this.time = this.world.time;
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

  updateProjects() {}

  updateProjectDetail() {}

  updateAbout() {}

  update() {}

  updateLoaded() {}

  updateActiveProject(index) {
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
    GSAP.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      duration: 1,
    });
    GSAP.to(this.mesh.scale, {
      x: (20 * 16) / 9,
      y: 20,
      z: 3,
      duration: 1,
    });
    GSAP.to(this.mesh.position, {
      z: 0,
      duration: 1,
    });
    this.update = this.updateProjects;
    this.material[4] = this.projectsMaterial;
  }

  toProjectDetail() {
    GSAP.to(this.mesh.position, {
      z: 20,
      duration: 1,
    });
    GSAP.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      duration: 1,
    });
    GSAP.to(this.mesh.scale, {
      x: (20 * 16) / 9,
      y: 20,
      z: 3,
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
