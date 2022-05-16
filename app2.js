import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import { Water } from "./Water";
import { Sky } from "three/examples/jsm/objects/Sky";
import skyVertex from "./shaders/sky/vertex.glsl";
import skyFragment from "./shaders/sky/fragment.glsl";

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
    this.camera.position.set(0, 7.5, 18);
    this.camera.lookAt(0, 0, 0);
    this.renderer = new THREE.WebGLRenderer({ alpha: false });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x444444);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enabled = false;
    this.debug = new Pane();
    this.mouse = new THREE.Vector2();
    this.textureLoader = new THREE.TextureLoader();
    this.raycaster = new THREE.Raycaster();

    // this.renderer.autoClear = false;
    this.water = new Water({
      renderer: this.renderer,
      camera: this.camera,
      scene: this.scene,
    });
    this.setLight();
    this.addRandomObjects();
    this.setExpSky();
    // this.setSky();
    this.resize();
    this.render();
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("mousemove", this.onMousemove.bind(this));
    window.addEventListener("mousedown", this.onMousedown.bind(this));
    window.addEventListener("mouseup", this.onMouseup.bind(this));
  }

  setLight() {
    // this.sun = new THREE.DirectionalLight(0xffffff, 1.0);
    // this.sun.position.set(20, 20, 15);
    // this.scene.add(this.sun);
    // const helper1 = new THREE.DirectionalLightHelper(this.sun);
    // this.scene.add(helper1);

    // this.sun2 = new THREE.DirectionalLight(0x40a040, 0.6);
    // this.sun2.position.set(-20, 20, 15);
    // this.scene.add(this.sun2);

    // this.sun3 = new THREE.DirectionalLight(0xff0000, 2);
    // this.sun3.position.set(0, 20, -20);
    // const helper = new THREE.DirectionalLightHelper(this.sun3);
    // this.scene.add(helper);
    // this.scene.add(this.sun3);

    this.sun4 = new THREE.SpotLight(0x0040c0, 2, 100, 3, 1, 0.8);
    this.sun4.position.set(0, 20, -40);
    this.sun4.castShadow = true;
    console.log(this.sun4.shadow.camera);
    // this.scene.add(new THREE.CameraHelper(this.sun4.shadow.camera));
    const helper4 = new THREE.SpotLightHelper(this.sun4);
    // this.scene.add(helper4);
    this.scene.add(this.sun4);

    this.ambinet = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(this.ambinet);

    this.pointerLight = new THREE.PointLight(0xffff00, 1);
    this.scene.add(this.pointerLight);
  }

  addRandomObjects() {
    const sphereGeo = new THREE.SphereGeometry(3);
    const sphereMat = new THREE.MeshStandardMaterial();
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.castShadow = true;
    sphere.position.set(5, 8, -7);
    this.scene.add(sphere);
    const boxGeo = new THREE.BoxGeometry(3, 3, 5);
    const boxMat = new THREE.MeshStandardMaterial();
    this.box = new THREE.Mesh(boxGeo, boxMat);
    this.box.position.set(-7, 4, 8);
    this.box.castShadow = true;
    this.scene.add(this.box);
    const torusGeo = new THREE.TorusGeometry(2, 1, 30, 30);
    const torusMat = new THREE.MeshStandardMaterial();
    this.torus = new THREE.Mesh(torusGeo, torusMat);
    this.torus.position.set(5, 4, 8);
    this.torus.castShadow = true;
    this.scene.add(this.torus);
    const icoGeo = new THREE.IcosahedronGeometry(2, 0);
    const icoMat = new THREE.MeshStandardMaterial();
    this.ico = new THREE.Mesh(icoGeo, icoMat);
    this.ico.position.set(10, 6.5, -12);
    this.ico.castShadow = true;
    this.scene.add(this.ico);
  }

  setExpSky() {
    this.settings = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      elevation: 2,
      azimuth: 180,
      exposure: 0.5,
    };
    this.sky = new Sky();
    this.sky.scale.setScalar(100);
    const sun = new THREE.Vector3(0, 20, -40);
    const guiChanged = () => {
      const uniforms = this.sky.material.uniforms;
      uniforms["turbidity"].value = this.settings.turbidity;
      uniforms["rayleigh"].value = this.settings.rayleigh;
      uniforms["mieCoefficient"].value = this.settings.mieCoefficient;
      uniforms["mieDirectionalG"].value = this.settings.mieDirectionalG;

      const phi = THREE.MathUtils.degToRad(90 - this.settings.elevation);
      const theta = THREE.MathUtils.degToRad(this.settings.azimuth);

      sun.setFromSphericalCoords(1, phi, theta);

      uniforms["sunPosition"].value.copy(sun);

      this.renderer.toneMappingExposure = this.settings.exposure;
    };
    guiChanged();

    this.scene.add(this.sky);
    this.debug
      .addInput(this.settings, "turbidity", { min: 0, max: 20, step: 0.1 })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "mieCoefficient", {
        min: 0,
        max: 0.1,
        step: 0.001,
      })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "mieDirectionalG", {
        min: 0,
        max: 1,
        step: 0.001,
      })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "elevation", { min: 0, max: 90, step: 0.1 })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "azimuth", { min: -180, max: 180, step: 0.1 })
      .on("change", guiChanged);
    this.debug
      .addInput(this.settings, "exposure", { min: 0, max: 1, step: 0.0001 })
      .on("change", guiChanged);
  }

  setSky() {
    const g = new THREE.BoxGeometry(1, 1, 1);
    // const g = new THREE.SphereGeometry(1);
    // const g = new THREE.PlaneGeometry(1, 1);
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,

      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      uniforms: {
        uGreyNoise: { value: this.textureLoader.load("greyNoise.png") },
        t: { value: this.time },
      },
    });
    this.sky = new THREE.Mesh(g, m);
    this.sky.scale.setScalar(100);
    this.scene.add(this.sky);
  }

  onMousemove(event) {
    this.mouse.x = (2 * event.clientX) / this.width - 1;
    this.mouse.y = (-2 * event.clientY) / this.height + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersect = this.raycaster.intersectObject(this.water.t);
    if (intersect.length) {
      const uv = intersect[0].uv;
      this.mouse.x = uv.x - 0.5;
      this.mouse.y = uv.y - 0.5;
      this.water.buffer.onMousemove(uv.x, uv.y);

      const pos = intersect[0].point;
      this.pointerLight.position.copy(pos);
      this.pointerLight.position.z += 0.3;
    }
  }

  onMousedown() {
    this.water.buffer.onMousedown();
  }
  onMouseup() {
    this.water.buffer.onMouseup();
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.water.buffer.resize();
  }

  render() {
    let delta = 0.01633;
    this.time += delta;
    // this.sky && (this.sky.material.uniforms.t.value = this.time);
    this.water.updateReflector();
    this.water.buffer.updateValues(delta);
    this.water.buffer.update();

    this.torus.rotation.x += 0.01;
    this.torus.position.x -= Math.sin(this.time) * 0.05;
    this.torus.position.z -= Math.sin(this.time) * 0.1;
    this.torus.position.y += Math.sin(this.time) * 0.02;
    this.box.rotation.x += 0.01;
    this.box.rotation.y += 0.01;
    this.ico.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
