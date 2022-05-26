import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import fragmentShader from "./fragment.glsl";
// import fragmentShader from "./fragmentRayMarchStarter.glsl";
import vertexShader from "./vertex.glsl";
import heightmapFragment from "./shaders/heighmap/fragment.glsl";
import waterVertex from "./shaders/water/vertex.glsl";
import { Heightmaptest } from "./heightmaptest";

// Texture width for simulation
const WIDTH = 128;

// Water size in system units
const BOUNDS = 512;
const BOUNDS_HALF = BOUNDS * 0.5;
class World {
  constructor() {
    this.time = 0;
    this.container = document.querySelector("#canvas");
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.1,
      2000
    );
    this.camera.position.set(0, 200, 350);
    this.camera.lookAt(0, 0, 0);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // this.renderer.setClearColor(0x000000);
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.debug = new Pane();
    this.mouse = new THREE.Vector2();
    this.mouseMoved = false;
    this.waterNormal = new THREE.Vector3();
    this.textureLoader = new THREE.TextureLoader();
    this.raycaster = new THREE.Raycaster();
    // this.setLight();
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("mousemove", this.onMousemove.bind(this));

    this.addObject();
    this.renderer.autoClear = false;
    // this.heightmaptest = new Heightmaptest({
    //   renderer: this.renderer,
    //   camera: this.camera,
    // });
    // this.initWater();
    this.resize();
    this.render();
  }

  addObject() {
    this.geometry = new THREE.PlaneGeometry(1, 1);

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: this.width / this.height },
      },
      transparent: true,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(8, 8, 1);
    this.mesh.rotation.x = -Math.PI / 4;
    this.scene.add(this.mesh);
  }

  setLight() {
    this.sun = new THREE.DirectionalLight(0xffffff, 1.0);
    this.sun.position.set(300, 400, 175);
    this.scene.add(this.sun);

    this.sun2 = new THREE.DirectionalLight(0x40a040, 0.6);
    this.sun2.position.set(-100, 350, -200);
    this.scene.add(this.sun2);
  }

  initWater() {
    const materialColor = 0x0040c0;

    const geometry = new THREE.PlaneGeometry(
      BOUNDS,
      BOUNDS,
      WIDTH - 1,
      WIDTH - 1
    );

    // material: make a THREE.ShaderMaterial clone of THREE.MeshPhongMaterial, with customized vertex shader
    const material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.ShaderLib["phong"].uniforms,
        {
          heightmap: { value: null },
        },
      ]),
      vertexShader: waterVertex,
      fragmentShader: THREE.ShaderChunk["meshphong_frag"],
    });

    material.lights = true;

    // Material attributes from THREE.MeshPhongMaterial
    material.color = new THREE.Color(materialColor);
    material.specular = new THREE.Color(0x111111);
    material.shininess = 50;

    // Sets the uniforms with the material values
    material.uniforms["diffuse"].value = material.color;
    material.uniforms["specular"].value = material.specular;
    material.uniforms["shininess"].value = Math.max(material.shininess, 1e-4);
    material.uniforms["opacity"].value = material.opacity;

    // Defines
    material.defines.WIDTH = WIDTH.toFixed(1);
    material.defines.BOUNDS = BOUNDS.toFixed(1);

    this.waterUniforms = material.uniforms;

    this.waterMesh = new THREE.Mesh(geometry, material);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.matrixAutoUpdate = false;
    this.waterMesh.updateMatrix();

    this.scene.add(this.waterMesh);

    // THREE.Mesh just for mouse raycasting
    const geometryRay = new THREE.PlaneGeometry(BOUNDS, BOUNDS, 1, 1);
    this.meshRay = new THREE.Mesh(
      geometryRay,
      new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
    );
    this.meshRay.rotation.x = -Math.PI / 2;
    this.meshRay.matrixAutoUpdate = false;
    this.meshRay.updateMatrix();
    this.scene.add(this.meshRay);

    console.log(material);
  }

  onMousemove(event) {
    this.mouse.x = (2 * event.clientX) / this.width - 1;
    this.mouse.y = (-2 * event.clientY) / this.height + 1;

    this.heightmaptest.onMousemove(this.mouse.x, this.mouse.y);

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersect = this.raycaster.intersectObject(this.mesh);
    if (intersect.length) {
      // console.log(intersect);
    }
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    /** fullscreen */
    // this.camera.fov =
    //   (360 / Math.PI) * Math.atan(this.height / (2 * this.camera.position.z));
    // this.mesh.scale.set(this.width, this.height, 1);

    this.camera.updateProjectionMatrix();

    this.material.uniforms.uAspect.value = this.width / this.height;
  }

  update() {}

  render() {
    this.time += 0.01633;
    this.update();
    // this.heightmaptest.update();
    this.material.uniforms.uTime.value = this.time;
    // this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
