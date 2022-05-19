import * as THREE from "three";
import World from "./app2";
import vertexShader from "./shaders/msdfTitle/vertex.glsl";
import fragmentShader from "./shaders/msdfTitle/fragment.glsl";

export default class MsdfTitle {
  constructor() {
    this.world = new World();

    const g = new THREE.PlaneGeometry(14, 5);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Vector2() },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    this.mesh = new THREE.Mesh(g, this.material);
  }
}
