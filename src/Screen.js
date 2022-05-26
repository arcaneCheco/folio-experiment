import * as THREE from "three";
import World from "./app2";
import vertexShader from "./shaders/screen/vertex.glsl";
import fragmentShader from "./shaders/screen/fragment.glsl";
import GSAP from "gsap";
import { degToRad } from "three/src/math/MathUtils";

export default class Screen {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.resources = this.world.resources;
    this.textureAspect = this.resources.projects[0].imageAspect;
    const g = new THREE.PlaneGeometry(1, 1, 100, 100);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: this.resources.projects[0].texture },
        uBend: { value: 0 },
        uvRate1: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader,
      fragmentShader,
    });

    this.mesh = new THREE.Mesh(g, this.material);

    this.dummyDirection = new THREE.Vector3(0, 0, 1);

    this.offsetAboveGround = 0;
    // this.mesh.rotateY(Math.PI / 10);
    this.direction = this.dummyDirection.clone().applyEuler(this.mesh.rotation);

    this.scene.add(this.mesh);
  }

  enterFullscreen() {
    const aspect = this.world.resolutionX / this.world.resolutionY;
    // const screenHeight = 45 / aspect;
    GSAP.to(this.mesh.scale, {
      x: this.viewportDimensions.x,
      y: this.viewportDimensions.y,
      duration: 0.5,
    });
    GSAP.to(this.mesh.position, {
      x: 0,
      y: this.world.camera.position.y,
      duration: 0.5,
    });
    GSAP.to(this.material.uniforms.uBend, {
      value: 0,
      duration: 0.5,
    });
  }
  exitFullscreen() {
    this.onResize();
    // GSAP.to(this.mesh.scale, {
    //   x: 30,
    //   duration: 1,
    // });
    // GSAP.to(this.material.uniforms.uBend, {
    //   value: 5,
    //   duration: 1,
    // });
  }

  onResize() {
    this.distanceToCamera = this.world.dominantSize * 0.05;
    this.viewportDimensions = new THREE.Vector2();
    const h =
      2 * this.distanceToCamera * Math.tan(degToRad(this.world.camera.fov) / 2);
    const w = h * (this.world.resolutionX / this.world.resolutionY);
    this.viewportDimensions.set(w, h);
    this.mesh.scale.set(
      this.viewportDimensions.x * 0.45,
      this.viewportDimensions.y * 0.45,
      1
    );
    this.mesh.position.y =
      this.viewportDimensions.y * 0.225 + this.world.camera.position.y;
    this.mesh.position.z = this.world.camera.position.z - this.distanceToCamera;
    this.mesh.position.x = -this.viewportDimensions.x * 0.15;

    // this.mesh.lookAt(this.world.camera.position);

    const imageAspect = this.resources.projects[0].imageAspect;
    const meshAspect = this.world.resolutionX / this.world.resolutionY;
    if (meshAspect > imageAspect) {
      this.material.uniforms.uvRate1.value.x = 1;
      this.material.uniforms.uvRate1.value.y = imageAspect / meshAspect;
    } else {
      this.material.uniforms.uvRate1.value.x = meshAspect / imageAspect;
      this.material.uniforms.uvRate1.value.y = 1;
    }
  }
}
