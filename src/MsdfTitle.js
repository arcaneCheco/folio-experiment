import * as THREE from "three";
import World from "./app2";
// import vertexShader from "./shaders/msdfTitle/vertex.glsl";
// import fragmentShader from "./shaders/msdfTitle/fragment.glsl";
import TextGeometryOGL from "./text/TextGeometryOGL";
import font from "./text/Audiowide-Regular.json";
// import font from "../fonts/magzetician/MagzeticianRegular.json";
import vertexShader from "./shaders/msdfTitle2/vertex.glsl";
import fragmentShader from "./shaders/msdfTitle2/fragment.glsl";
import glitch3 from "./shaders/ac71v4Th40ry/assets/glitch3.jpeg";

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
      // align: "center",
      lineHeight: 1,
      lineWidth: 8,
      wordBreak: false,
    });

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      // side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        tMap: { value: this.textureLoader.load("Audiowide-Regular.ttf.png") },
        // tMap: { value: this.textureLoader.load("maseticianTest.png") },
        uColor: { value: new THREE.Vector3(1, 1, 0) },
        uTextColor: { value: new THREE.Vector3(0.2, 0.4, 0.8) },
        uAlpha: { value: 0.5 },
        uHover: { value: false },
        uTime: { value: 0 },
        tMask: { value: this.textureLoader.load(glitch3) },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTransition: { value: 5 },
        uStroke: { value: 0.2 },
        uPadding: { value: 0.22 },
      },
      // depthTest: false,
      // depthWrite: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.renderOrder = 10000;
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
