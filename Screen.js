import * as THREE from "three";
import World from "./app2";
import vertexShader from "./shaders/screen/vertex.glsl";
import fragmentShader from "./shaders/screen/fragment.glsl";
import GSAP from "gsap";

export default class Screen {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.resources = this.world.resources;
    const g = new THREE.PlaneGeometry(1, 1, 100, 100);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: this.resources.projects[0].texture },
        uBend: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });

    this.mesh = new THREE.Mesh(g, this.material);

    this.dummyDirection = new THREE.Vector3(0, 0, 1);

    this.offsetAboveGround = 2;
    // this.mesh.matrixAutoUpdate = false;
    this.mesh.position.x = -4;
    this.mesh.position.y = 12;
    this.mesh.rotateY(Math.PI / 6);
    // this.direction = this.dummyDirection
    //   .clone()
    //   .applyQuaternion(this.mesh.quaternion);
    // console.log(this.direction);
    this.direction = this.dummyDirection.clone().applyEuler(this.mesh.rotation);
    console.log(this.direction);

    // this.mesh.updateMatrix();
    this.scene.add(this.mesh);
  }

  enterFullscreen() {
    GSAP.to(this.material.uniforms.uBend, {
      value: 0,
      duration: 1,
    });
  }
  exitFullscreen() {
    GSAP.to(this.material.uniforms.uBend, {
      value: 5,
      duration: 1,
    });
  }

  onResize() {
    const aspect = this.world.resolutionX / this.world.resolutionY;

    const screenHeight = 45 / aspect;
    this.mesh.scale.set(45, screenHeight, 1);
    // console.log(this.mesh.rotation.toArray());
  }
}
