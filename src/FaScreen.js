import World from "./app2";
import * as THREE from "three";
import vertexFront from "./shaders/faScreen/front/vertex.glsl";
import fragmentFront from "./shaders/faScreen/front/fragment.glsl";
import preVertexShader from "./shaders/preloader/vertex.glsl";
import preFragmentShader from "./shaders/preloader/fragment.glsl";
import { degToRad, clamp } from "three/src/math/MathUtils";
import GSAP from "gsap";

export default class FaScreen {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;
    this.hover = false;

    this.setGeometry();
    this.setSidesMaterial();
    this.setPreloaderMaterial();
    // this.setMaterial();
    this.setMesh();
    this.onResize = this.onResizeLoading2;
    this.update = this.updateLoading;
  }

  onPreloaded() {
    this.onResize = this.onResizeLoaded;
    // this.update = this.updateLoaded;

    this.routes = this.world.resources.projectsData.map(({ index, path }) => {
      return {
        index,
        path,
      };
    });
  }

  loadingToHome() {
    const s = this.world.settings.screenScale;
    GSAP.to(this.mesh.scale, {
      x: s,
      y: (s * 16) / 9,
      z: 1,
      duration: 1.5,
    });
    GSAP.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1.5,
    });
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  setSidesMaterial() {
    this.sideMaterial = new THREE.MeshBasicMaterial();
    this.backMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  }

  setPreloaderMaterial() {
    this.preloaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexFront,
      fragmentShader: preFragmentShader,
      uniforms: {
        uResolution: {
          value: new THREE.Vector2(
            this.world.resolutionX,
            this.world.resolutionY
          ),
        },
        uTime: { value: 0 },
      },
    });

    this.material = [
      this.sideMaterial,
      this.sideMaterial,
      this.sideMaterial,
      this.sideMaterial,
      this.preloaderMaterial,
      this.backMaterial,
    ];
  }

  setMaterial() {
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
  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  onPointermove() {
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
      console.log(currentRoute);
      if (currentRoute === "/") {
        this.world.onChange("/works");
      } else if (currentRoute === "/works") {
        const activeProject = this.world.screenTitles.activeProject;
        this.world.onChange(
          this.routes.find(({ index }) => index === activeProject).path
        );
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
      this.world.settings.cameraY,
      this.world.settings.screenPosZ
    );
    const distanceToCam = this.world.camera.position.z - this.mesh.position.z;
    const h = 2 * Math.tan(degToRad(this.world.camera.fov / 2)) * distanceToCam;
    const w = (this.world.resolutionX / this.world.resolutionY) * h;
    this.mesh.scale.set(w, h, 1);
  }

  onResizeLoading2() {
    this.mesh.position.set(
      0,
      this.world.settings.screenPosY,
      this.world.settings.screenPosZ
    );
    this.mesh.scale.set(10, 10, 10);
  }

  updateLoading() {
    this.mesh.rotation.y += 0.01;
    this.mesh.rotation.x += 0.01;
    // this.preloaderMaterial.uniforms.uTime.value += 0.001;
  }

  update() {}

  updateLoaded() {}

  onResize() {}

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
}
