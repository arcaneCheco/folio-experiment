import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";
import { Water } from "./Water";
import GSAP from "gsap";
import { Sky } from "three/examples/jsm/objects/Sky";
import skyVertex from "./shaders/sky/vertex.glsl";
import skyFragment from "./shaders/sky/fragment.glsl";

const projects = [
  {
    title: "project number 1",
    media: "projects/army.jpeg",
  },
  {
    title: "project number 2",
    media: "projects/blue-moon.png",
  },
  {
    title: "project number 3",
    media: "projects/kitten.png",
  },
  {
    title: "project number 4",
    media: "projects/piplup-thumb.png",
  },
  {
    title: "project number 5",
    media: "projects/snorlax-thumb.png",
  },
  {
    title: "project number 6",
    media: "projects/whale.jpeg",
  },
];

class World {
  constructor() {
    this.time = 0;
    this.container = document.querySelector("#canvas");
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.Fog(0xdfe9f3, 4, 16);
    // this.scene.fog = new THREE.FogExp2(0xdfe9f3, 0.05);
    this.camera = new THREE.PerspectiveCamera(
      85,
      this.width / this.height,
      0.1,
      2000
    );
    // this.scene.position.set(0, -7.5, -18);
    // this.camera.lookAt(0, -7.5, -18);
    this.camera.position.set(0, 7, 23);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // this.renderer.setClearColor(0x444444);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.container.appendChild(this.renderer.domElement);
    this.isFullscreen = false;
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enabled = false;
    this.debug = new Pane();
    this.cameraTarget = new THREE.Vector2();
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
    // this.setSkyBox();
    // this.setExpSky();
    this.setSky();
    // this.setPointerParticles();
    this.setScreen();
    this.resize();
    this.render();
    this.addListeners();
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

    this.sun4 = new THREE.SpotLight(0x0040c0, 5, 100, 3, 1, 0);
    this.sun4.position.set(0, 15, -100);
    this.sun4.castShadow = true;
    // this.scene.add(new THREE.CameraHelper(this.sun4.shadow.camera));
    const helper4 = new THREE.SpotLightHelper(this.sun4);
    // this.scene.add(helper4);
    this.scene.add(this.sun4);

    this.ambinet = new THREE.AmbientLight(0x222222, 0.01);
    this.scene.add(this.ambinet);

    this.pointerLight = new THREE.PointLight(0xccff22, 1);
    this.scene.add(this.pointerLight);
  }

  addRandomObjects() {
    const sphereGeo = new THREE.SphereGeometry(3);
    const sphereMat = new THREE.MeshStandardMaterial();
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.castShadow = true;
    sphere.position.set(10, 8, 9);
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
    // this.scene.add(this.torus);
    const icoGeo = new THREE.IcosahedronGeometry(2, 0);
    const icoMat = new THREE.MeshStandardMaterial();
    this.ico = new THREE.Mesh(icoGeo, icoMat);
    this.ico.position.set(10, 6.5, -12);
    this.ico.castShadow = true;
    this.scene.add(this.ico);

    // this.plane = new THREE.Mesh(
    //   new THREE.PlaneGeometry(250, 250),
    //   new THREE.MeshStandardMaterial()
    // );
    // this.plane.rotation.x = -Math.PI / 2;
    // this.plane.position.y += 1.5;
    // this.scene.add(this.plane);

    // const oboxGeo = new THREE.SphereGeometry(99);
    // const oboxMat = new THREE.MeshPhongMaterial({
    //   side: THREE.BackSide,
    //   transparent: true,
    //   opacity: 0.8,
    // });
    // this.obox = new THREE.Mesh(oboxGeo, oboxMat);
    // // this.obox.position.set(-7, 4, 8);
    // this.obox.castShadow = true;
    // this.scene.add(this.obox);
  }

  setSkyBox() {
    const textures = [
      this.textureLoader.load("cubemap/px.jpeg"),
      this.textureLoader.load("cubemap/nx.jpeg"),
      this.textureLoader.load("cubemap/py.jpeg"),
      this.textureLoader.load("cubemap/ny.jpeg"),
      this.textureLoader.load("cubemap/pz.jpeg"),
      this.textureLoader.load("cubemap/nz.jpeg"),
    ];
    const materials = [];
    textures.forEach((tex) => {
      materials.push(
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide })
      );
    });
    const g = new THREE.BoxGeometry(1, 1, 1);
    const skybox = new THREE.Mesh(g, materials);
    skybox.scale.setScalar(400);
    this.scene.add(skybox);
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
    this.sky.renderOrder = -1000;
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
    // const g = new THREE.BoxGeometry(1, 1, 1);
    const g = new THREE.SphereGeometry(1);
    // const g = new THREE.PlaneGeometry(1, 1);
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      uniforms: {
        uGreyNoise: { value: this.textureLoader.load("greyNoise.png") },
        uTime: { value: this.time },
      },
      transparent: true,
    });
    this.sky = new THREE.Mesh(g, m);
    // this.sky.rotation.y = Math.PI / 2;
    // this.sky.rotation.x = Math.PI / 2.5;
    this.sky.scale.setScalar(100);
    this.scene.add(this.sky);
  }

  setPointerParticles() {
    this.ppG = new THREE.BufferGeometry();
    this.ppCount = 50;
    this.posArray = new Float32Array(this.ppCount * 3);
    for (let i = 0; i < this.ppCount; i++) {
      this.posArray[i * 3] = Math.random() - 0.5;
      this.posArray[i * 3 + 1] = Math.random() - 0.5;
      this.posArray[i * 3 + 2] = Math.random() - 0.5;
    }
    this.ppG.setAttribute(
      "position",
      new THREE.BufferAttribute(this.posArray, 3)
    );
    this.ppM = new THREE.ShaderMaterial({
      uniforms: {
        uPointer: { value: new THREE.Vector3() },
      },
      vertexShader: `
          uniform vec3 uPointer;

          void main() {
              vec3 newPos = position * 5. + uPointer;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
              gl_PointSize = 10.;
          }
          `,
      fragmentShader: `
          void main() {
              gl_FragColor = vec4(1., 1., 0., 1.);
          }
          `,
      transparent: true,
    });
    this.ppMesh = new THREE.Points(this.ppG, this.ppM);

    this.ppScene = new THREE.Scene();
    this.ppScene.add(this.ppMesh);
    this.mask = { read: null, write: null };
    this.mask.read = new THREE.WebGLRenderTarget(this.width, this.height, {
      stencilBuffer: false,
      depthBuffer: false,
      type: THREE.FloatType,
    });
    this.mask.write = new THREE.WebGLRenderTarget(this.width, this.height, {
      stencilBuffer: false,
      depthBuffer: false,
      type: THREE.FloatType,
    });
    // this.ppRT = new THREE.WebGLRenderTarget(this.width, this.height, {
    //   stencilBuffer: false,
    //   depthBuffer: false,
    //   type: THREE.FloatType,
    // });
    // this.ppRTWrite = new THREE.WebGLRenderTarget(this.width, this.height, {
    //   stencilBuffer: false,
    //   depthBuffer: false,
    //   type: THREE.FloatType,
    // });
    this.ppUniform = { value: null };
    this.ppSwap = () => {
      let temp = this.mask.read;
      this.mask.read = this.mask.write;
      this.mask.write = temp;
      this.ppUniform.value = this.mask.read.texture;
    };
    this.ppSwap();
    const ppPostGeo = new THREE.PlaneGeometry(2, 2);
    this.ppPostM = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;

        void main() {
            gl_Position = vec4(position.xy, 0.0, 1.0);
            vUv = uv;
        }
        `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform vec2 uResolution;
        uniform vec2 uPointer;
        uniform float uSamples;
        varying vec2 vUv;
        void main() {
            vec4 screen = texture2D(uTexture, vUv) * 0.98;
            gl_FragColor = screen;
        }
        `,
      uniforms: {
        uTexture: this.ppUniform,
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uSamples: { value: 1 },
        uPointer: { value: new THREE.Vector2() },
      },
      //   transparent: true,
    });
    this.renderer.autoClear = false;
    // this.renderer.autoClearColor = false;
    this.ppPostMesh = new THREE.Mesh(ppPostGeo, this.ppPostM);
    this.ppScene.add(new THREE.Mesh(ppPostGeo, this.ppPostM));

    this.other = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: `
          varying vec2 vUv;
  
          void main() {
              gl_Position = vec4(position.xy, 0.0, 1.0);
              vUv = uv;
          }
          `,
        fragmentShader: `
          uniform sampler2D uTexture;
          uniform vec2 uPointer;
          uniform float uSamples;
          varying vec2 vUv;
          void main() {
              vec4 screen = texture2D(uTexture, vUv);
              float a = screen.r;
              screen.a = a;
              gl_FragColor = screen;
          }
          `,
        uniforms: {
          uTexture: this.ppUniform,
        },
        transparent: true,
      })
    );
    this.scene.add(this.other);

    this.updatePPtrail = () => {
      this.renderer.setRenderTarget(this.mask.write);
      this.renderer.render(this.ppScene, this.camera);
      this.ppSwap();
      this.renderer.setRenderTarget(null);
      this.renderer.clear();
    };
  }

  titleMesh() {
    const g = new THREE.PlaneGeometry(14, 5);
    this.titleMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Vector2() },
      },
      vertexShader: `
                  varying vec2 vUv;
                  void main() {
                      vec3 newPos = position;
                      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
                      vUv = uv;
                  }
              `,
      fragmentShader: `
                  uniform vec2 uColor;
                  varying vec2 vUv;
                  void main() {
                      gl_FragColor = vec4(uColor, 0., .5);
                  }
              `,
      transparent: true,
    });
    this.titleMesh = new THREE.Mesh(g, this.titleMat);
  }

  setScreen() {
    this.activeProject = 0;
    this.titleMesh();
    this.projectTitles = new THREE.Group();
    this.projectTitles.position.set(8, 8, 14);
    this.projectTitles.rotation.y = -0.3;
    this.scene.add(this.projectTitles);
    projects.forEach((project, i) => {
      project.mesh = this.titleMesh.clone();
      project.mesh.projectIndex = i;
      project.mesh.material = this.titleMat.clone();
      project.mesh.material.uniforms.uColor.value.set(
        Math.random(),
        Math.random()
      );
      const yOffset = +i * 6;
      project.mesh.position.y = yOffset;
      this.projectTitles.add(project.mesh);
    });
    projects.forEach((project) => {
      project.texture = this.textureLoader.load(project.media);
    });
    this.onOverTitle = () => {
      const intersectsTitles = this.raycaster.intersectObjects(
        projects.map((project) => project.mesh)
      );
      if (intersectsTitles.length) {
        this.activeProject = intersectsTitles[0].object.projectIndex;
        this.screenMaterial.uniforms.uTexture.value =
          projects[this.activeProject].texture;
        // console.log(projects[this.activeProject].title);
      }
    };
    const w = 45;
    const h = w / (this.width / this.height);
    const g = new THREE.PlaneGeometry(w, h, 100, 100);
    this.screenMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: projects[0].texture },
      },
      vertexShader: `
                varying vec2 vUv;
                void main() {
                    vec3 newPos = position;
                    newPos.z -= sin(uv.x * 3.14) * 5.;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
                    vUv = uv;
                }
            `,
      fragmentShader: `
                uniform sampler2D uTexture;

                varying vec2 vUv;
                void main() {
                    vec4 image = texture2D(uTexture, vUv);
                    gl_FragColor = vec4(vUv, 0., 1.);
                    gl_FragColor = image;
                }
            `,
    });
    this.screen = new THREE.Mesh(g, this.screenMaterial);
    this.screen.position.y = 12;
    this.scene.add(this.screen);
  }

  fullScreenTransition() {
    if (this.isFullscreen) {
      GSAP.to(this.camera.position, {
        y: 7,
        z: 23,
        duration: 1,
      });
    } else {
      GSAP.to(this.camera.position, {
        y: 10,
        z: 8,
        duration: 1,
      });
    }
    this.isFullscreen = !this.isFullscreen;
  }

  parallax() {
    // this.camera.rotation.y = -this.mouse.x * 0.2;
    // this.camera.rotation.x = this.mouse.y * 0.4;
    this.cameraTarget.y = -this.mouse.x * 0.2;
    this.cameraTarget.x = this.mouse.y * 0.4;
  }

  onMousemove(event) {
    this.mouse.x = (2 * event.clientX) / this.width - 1;
    this.mouse.y = (-2 * event.clientY) / this.height + 1;
    // this.ppPostMesh.material.uniforms.uPointer.value.copy(this.mouse);

    this.parallax();

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersect = this.raycaster.intersectObject(this.water.t);
    if (intersect.length) {
      const uv = intersect[0].uv;
      this.mouse.x = uv.x - 0.5;
      this.mouse.y = uv.y - 0.5;
      this.water.buffer.onMousemove(uv.x, uv.y);

      const pos = intersect[0].point;
      this.pointerLight.position.copy(pos);
      this.pointerLight.position.z += 0.5;
      //   this.ppMesh.material.uniforms.uPointer.value.copy(
      //     this.pointerLight.position
      //   );
    }
    this.onOverTitle();
  }

  onMousedown() {
    this.water.buffer.onMousedown();
    this.fullScreenTransition();
  }
  onMouseup() {
    this.water.buffer.onMouseup();
  }
  onWheel(event) {
    this.projectTitles.position.y += event.deltaY * 0.1;
    this.onOverTitle();
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.water.buffer.resize();
  }

  addListeners() {
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("pointermove", this.onMousemove.bind(this));
    window.addEventListener("pointerdown", this.onMousedown.bind(this));
    window.addEventListener("pointerup", this.onMouseup.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this));
  }

  render() {
    let delta = 0.01633;
    this.time += delta;
    this.sky && (this.sky.material.uniforms.uTime.value = this.time);

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

    this.camera.rotation.x +=
      (this.cameraTarget.x - this.camera.rotation.x) * 0.1;
    this.camera.rotation.y +=
      (this.cameraTarget.y - this.camera.rotation.y) * 0.1;

    this.renderer.render(this.scene, this.camera);
    // this.controls.update();

    window.requestAnimationFrame(this.render.bind(this));
  }
}

new World();
