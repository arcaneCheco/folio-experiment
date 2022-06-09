import {
  WebGLRenderTarget,
  LinearFilter,
  RGBAFormat,
  FloatType,
  HalfFloatType,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
  Vector2,
  Vector3,
  Scene,
  NearestMipMapNearestFilter,
  NearestFilter,
} from "three";
import World from "./app2";
import vertexShader from "./shaders/waterRipples/vertex.glsl";
import fragmentShader from "./shaders/waterRipples/fragment.glsl";

export default class WaterRippleBuffer {
  constructor() {
    this.world = new World();
    this.renderer = this.world.renderer;
    this.camera = this.world.camera;
    this.masterScene = this.world.scene;
    this.uniform = { value: null };
    this.tMap = { value: null };
    this.scene = new Scene();
    this.textureLoader = this.world.textureLoader;
    this.mouse = new Vector3();
    this.needsUpdate = false;
    this.mask = {
      read: null,
      write: null,

      swap: () => {
        let temp = this.mask.read;
        this.mask.read = this.mask.write;
        this.mask.write = temp;
        this.uniform.value = this.mask.read.texture;
      },
    };
    this.setRenderTargets(256);
    this.setMesh();
    this.resize();
  }

  setRenderTargets(size) {
    const options = {
      // minFilter: NearestMipMapNearestFilter,
      minFilter: LinearFilter,
      type: FloatType,
      magFilter: LinearFilter,
      format: RGBAFormat,
      generateMipmaps: false,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this.mask.read = new WebGLRenderTarget(size, size, options);
    this.mask.write = new WebGLRenderTarget(size, size, options);
    this.mask.swap();

    // this.rtTexture = new WebGLRenderTarget(size, size, options);
    // this.rtTexture2 = new WebGLRenderTarget(size, size, options);
  }

  setMesh() {
    const geometry = new PlaneGeometry(2, 2);

    this.uniforms = {
      u_time: { value: 1.0 },
      u_resolution: {
        value: new Vector2(window.innerWidth, window.innerHeight),
      },
      u_noise: { value: this.textureLoader.load("noise.png") },
      u_buffer: this.uniform,
      u_mouse: { value: new Vector3() },
      u_frame: { value: -1 },
    };

    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
    });
    material.extensions.derivatives = true;

    this.mesh = new Mesh(geometry, material);
    // this.masterScene.add(this.mesh);
    this.scene.add(this.mesh);
  }

  onPointermove(uv) {
    this.needsUpdate = true;
    this.uniforms.u_mouse.value.z = 1;
    this.mouse.x = uv.x;
    this.mouse.y = uv.y;
  }

  onMousedown() {
    this.uniforms.u_mouse.value.z = 1;
  }
  onMouseup() {
    this.uniforms.u_mouse.value.z = 0;
  }

  resize(w, h) {
    this.uniforms.u_resolution.value.x = window.innerWidth;
    this.uniforms.u_resolution.value.y = window.innerHeight;

    this.uniforms.u_frame.value = -1;

    // this.mask.read.setSize(w, h);
    // this.mask.write.setSize(w, h);
  }

  updateValues(delta) {
    this.uniforms.u_frame.value++;
    let beta = Math.random() * -1000;
    this.uniforms.u_time.value = beta + delta * 0.0005;

    // if (!this.needsUpdate) {
    //   this.uniforms.u_mouse.value.set(-100, -100, -100);
    // }
    // this.needsUpdate = false;
    // this.uniforms.u_mouse.value.z = 0;
    this.uniforms.u_mouse.value.x +=
      this.mouse.x - this.uniforms.u_mouse.value.x;
    this.uniforms.u_mouse.value.y +=
      this.mouse.y - this.uniforms.u_mouse.value.y;
  }

  update() {
    const currentRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.mask.write);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(currentRenderTarget);
    this.renderer.clear();
    this.mask.swap();
    this.uniforms.u_mouse.value.z = 0;
  }
}
