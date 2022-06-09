import World from "./app2";
import * as THREE from "three";
import vertexFront from "./shaders/faScreen/front/vertex.glsl";
import fragmentFront from "./shaders/faScreen/front/fragment.glsl";
import preVertexShader from "./shaders/preloader/vertex.glsl";
import preFragmentShader from "./shaders/preloader/fragment.glsl";
import { degToRad, clamp } from "three/src/math/MathUtils";
import GSAP from "gsap";

export default class FaScreen {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;
    this.hover = false;
    this.init();
  }

  init() {
    this.setGeometry();
    this.setMaterial();
    this.setMesh();
    this.setHomeMaterial();
    this.setProjectsMaterial();
    this.setAboutMaterial();
    this.onResize = this.onResizeLoading;
    this.update = this.updateLoading;
    this.scene.add(this.mesh);
  }

  onPreloaded() {
    this.onResize = this.onResizeLoaded;

    console.log(this.world.resources.projectsData);

    this.projectTextures = this.world.resources.projectsData.map(
      (project) => project.texture
    );
    console.log(this.projectTextures);
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  setMaterial() {
    ///

    const glowV = `
    uniform vec3 viewVector;
    uniform float c;
    uniform float p;
    varying float intensity;
    void main() 
    {
        vec3 vNormal = normalize( normalMatrix * normal );
      vec3 vNormel = normalize( normalMatrix * viewVector );
      intensity = pow( c - dot(vNormal, vNormel), p );
      
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
    `;
    const glowF = `
    uniform vec3 glowColor;
    varying float intensity;
    void main() 
    {
      vec3 glow = glowColor * intensity;
        gl_FragColor = vec4( glow, 1.0 );
    }
    `;
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.5 },
        p: { value: 4 },
        glowColor: { value: new THREE.Color(0xffffff) },
        viewVector: { value: this.world.camera.position },
      },
      vertexShader: glowV,
      fragmentShader: glowF,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    const glowMesh = new THREE.Mesh(this.geometry, glowMat);
    glowMesh.scale.multiplyScalar(12);
    glowMesh.position.set(
      0,
      this.world.settings.screenPosY,
      this.world.settings.screenPosZ
    );
    // this.scene.add(glowMesh);
    ////
    this.defaultMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(1., 0., 0., 1.);
        }
      `,
    });
    this.material = [
      this.defaultMaterial,
      this.defaultMaterial,
      this.defaultMaterial,
      this.defaultMaterial,
      this.defaultMaterial,
      this.defaultMaterial,
    ];
  }

  setHomeMaterial() {
    this.homeMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0., 1., 0., 1.);
        }
      `,
    });
  }

  setProjectsMaterial() {
    this.projectsMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;

        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        varying vec2 vUv;

        void main() {
          vec4 image = texture2D(uTexture, vUv);
          gl_FragColor = image;
        }
      `,
      uniforms: {
        uTexture: {
          value: null,
        },
      },
    });
  }

  setAboutMaterial() {
    this.aboutMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(1., 1., 1., 1.);
        }
      `,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    console.log(this.mesh.material);
  }

  setMaterialTemp() {
    this.sideMaterial = new THREE.MeshBasicMaterial();
    this.backMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.frontMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexFront,
      fragmentShader: fragmentFront,
    });
    this.material = [
      this.sideMaterial,
      this.sideMaterial,
      this.sideMaterial,
      this.sideMaterial,
      this.frontMaterial,
      this.backMaterial,
    ];
  }

  onPointermove() {
    if (this.world.template !== "/" && this.world.template !== "/projects")
      return;
    const intersect = this.raycaster.intersectObject(this.mesh);
    if (intersect.length) {
      this.hover = true;
    } else {
      this.hover = false;
    }
  }

  onPointerdown() {
    if (this.hover) {
      const currentRoute = this.world.template;
      console.log("efhefe", currentRoute);
      if (currentRoute === "/") {
        console.log("LETSGO");
        this.world.onChange({ url: "/projects" });
      } else if (currentRoute === "/projects") {
        console.log("NOPE");
        const path =
          this.world.screenTitles.paths[this.world.screenTitles.activeProject];
        this.world.onChange({ url: path });
      }
    }
  }

  onChange() {
    // const template = this.world.template;
    // if (template === "/") {
    // }
  }

  onResizeLoading() {
    this.mesh.position.set(
      0,
      this.world.settings.screenPosY,
      this.world.settings.screenPosZ
    );
    this.mesh.scale.set(10, 10, 10);
  }

  onResizeLoaded() {
    this.objectAspect = 16 / 9;
    this.screenAspect = this.world.resolutionX / this.world.resolutionY;

    this.mesh.position.set(
      0,
      this.world.settings.screenPosY,
      this.world.settings.screenPosZ
    );
    this.mesh.scale.set(
      this.world.settings.screenScale,
      this.world.settings.screenScale * this.objectAspect,
      this.world.settings.screenScale
    );
  }

  onResize() {}

  updateCommon() {
    this.time = this.world.time;
  }

  updateLoading() {
    this.updateCommon();
    this.mesh.rotation.y = Math.sin(this.time % (Math.PI * 2));
    this.mesh.rotation.x = Math.cos(this.time % (Math.PI * 2));
    this.mesh.position.y = 8 + 4 * Math.sin((this.time * 2) % Math.PI);
    if (this.mesh.position.y < 8.2)
      this.world.water.onPointermove({ x: 0.5, y: 0.37 });
  }

  updateHome() {
    // this.mesh.rotation.y += 0.01;
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += Math.sin(this.time * 0.001);
  }

  updateProjects() {}

  updateProjectDetail() {}

  updateAbout() {}

  update() {}

  updateLoaded() {}

  updateActiveProject(index) {
    this.projectsMaterial.uniforms.uTexture.value = this.projectTextures[index];
  }
  // navigation stuff

  toHome() {
    GSAP.to(this.mesh.rotation, {
      x: 0.25 * Math.PI,
      y: 2.25 * Math.PI,
      duration: 1,
    });
    GSAP.to(this.mesh.scale, {
      x: 10,
      y: 10,
      z: 10,
      duration: 1,
    });
    this.update = this.updateHome;
    this.material[4] = this.homeMaterial;
  }

  toProjects() {
    GSAP.to(this.mesh.rotation, {
      x: 0,
      y: 0,
      duration: 1,
    });
    GSAP.to(this.mesh.scale, {
      x: (20 * 16) / 9,
      y: 20,
      z: 3,
      duration: 1,
    });
    this.update = this.updateProjects;
    this.material[4] = this.projectsMaterial;
  }

  toProjectDetail() {
    this.update = this.updateProjectDetail;
  }

  toAbout() {
    GSAP.to(this.mesh.rotation, {
      x: 0.25 * Math.PI,
      y: 2.25 * Math.PI,
      duration: 1,
    });
    GSAP.to(this.mesh.scale, {
      x: 10,
      y: 10,
      z: 10,
      duration: 1,
    });
    this.update = this.updateAbout;
    this.material[4] = this.aboutMaterial;
  }
}
