import * as THREE from "three";
import World from "./app2";
// import vertexShader from "./shaders/msdfTitle/vertex.glsl";
// import fragmentShader from "./shaders/msdfTitle/fragment.glsl";
import TextGeometryOGL from "./text/TextGeometryOGL";
import font from "./text/Audiowide-Regular.json";
import vertexShader from "./shaders/msdfTitle2/vertex.glsl";
import fragmentShader from "./shaders/msdfTitle2/fragment.glsl";

export default class MsdfTitle {
  constructor(text) {
    this.world = new World();
    this.textureLoader = this.world.textureLoader;
    this.scene = this.world.scene;

    this.geometry = new TextGeometryOGL();
    this.geometry.setText({
      font,
      text,
      size: 1,
      letterSpacing: 0,
      align: "center",
      lineHeight: 1,
      lineWidth: 2,
    });

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        uMap: { value: this.textureLoader.load("Audiowide-Regular.ttf.png") },
        uColor: { value: new THREE.Vector3(1, 1, 0) },
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    // const g = new THREE.PlaneGeometry(14, 5);
    // this.material = new THREE.ShaderMaterial({
    //   uniforms: {
    //     uColor: { value: new THREE.Vector2() },
    //   },
    //   vertexShader,
    //   fragmentShader,
    //   transparent: true,
    // });
    // this.mesh = new THREE.Mesh(g, this.material);
  }
}
