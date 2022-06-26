import * as THREE from "three";
import World from "./app2";
import TextGeometryOGL from "./text/TextGeometryOGL";
import vertexShader from "./shaders/msdfTitle2/vertex.glsl";
import fragmentShader from "./shaders/msdfTitle2/fragment.glsl";

export default class MsdfTitle {
  world;
  textureLoader;
  scene;
  geometry;
  material;
  mesh;
  constructor(text: any) {
    this.world = new World();
    this.textureLoader = this.world.textureLoader;
    this.scene = this.world.scene;

    this.geometry = new TextGeometryOGL();
    this.geometry.setText({
      font: this.world.resources.fontsData.audiowide.data,
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
        tMask: {
          value: this.textureLoader.load("activeTheory/assets/glitch3.jpeg"),
        },
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
