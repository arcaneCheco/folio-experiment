import * as THREE from "three";
import World from "./app2";
import MsdfTitle from "./MsdfTitle";
import TextGeometryOGL from "./text/TextGeometryOGL";
import font from "./text/Audiowide-Regular.json";
import Text from "./text/Text";
import { degToRad, clamp } from "three/src/math/MathUtils";

export default class ScreenTitles {
  constructor() {
    this.world = new World();
    // this.scene = this.world.scene;
    this.textureLoader = this.world.textureLoader;
    this.renderer = this.world.renderer;
    this.raycaster = this.world.raycaster;
    this.activeProject = 0;
    this.hover = false;
    this.scroll = {
      target: 0,
      current: 0,
    };
    this.onResize = this.onResizeLoading;

    this.init();
  }

  show() {
    this.scene.add(this.group);
  }

  hide() {
    this.scene.remove(this.group);
  }

  init() {
    this.setGroup();
    this.setCamera();
  }

  setCamera() {
    this.scene = new THREE.Scene();
    const width = this.world.resolutionX;
    const height = this.world.resolutionY;
    console.log(width, height);
    this.camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      10
    );
    this.camera.position.z = 2;
  }

  onPreloaded() {
    this.projectsData = this.world.resources.projectsData;
    this.setMesh();
    // this.setTouchPlanes();
    this.onResize = this.onResizeLoaded;
    this.onResize();
    this.show();
  }

  setText() {
    this.text = new Text({
      font,
      text: "hello world",
      align: "center",
      letterSpacing: -0,
      lineWidth: 1,
      lineHeight: 0.9,
    });
  }

  setGeometry(text) {
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(text.buffers["position"], 3)
    );
    this.geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(text.buffers["uv"], 2)
    );
    this.geometry.setAttribute(
      "id",
      new THREE.BufferAttribute(text.buffers["id"], 1)
    );
    this.geometry.setIndex(new THREE.BufferAttribute(text.buffers["index"], 1));
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;

        void main() {
            vec3 newPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
            // gl_Position = vec4(position, 1.);
            vUv = uv;
        }
        `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform vec3 uColor;

        varying vec2 vUv;

        float median(float r, float g, float b) {
            return max(min(r, g), min(max(r, g), b));
        }

        void main() {
            vec3 font = texture2D(uMap, vUv).rgb;
            float sigDist = median(font.r, font.g, font.b) - 0.5;
            float fill = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);
            gl_FragColor = vec4(uColor, fill);
            gl_FragColor = vec4(vec3(vUv, 1.), fill);
            if (gl_FragColor.a < 0.001) discard;
        }
        `,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        uMap: { value: this.textureLoader.load("Audiowide-Regular.ttf.png") },
        uColor: { value: new THREE.Vector3(1, 1, 0) },
      },
    });
  }

  setGroup() {
    this.group = new THREE.Group();
  }

  setMesh() {
    this.titles = [];
    this.projectsData.map((project) => {
      const msdfObject = new MsdfTitle(project.title);
      const mesh = msdfObject.mesh;
      mesh.userData.index = project.index;
      mesh.userData.textWidth = msdfObject.geometry.text.width;
      mesh.userData.textHeight = msdfObject.geometry.text.height;
      this.group.add(mesh);
      this.titles.push(mesh);
    });
    this.nTitles = this.titles.length;
  }

  setTouchPlanes() {
    this.touchPlanes = [];
    const g = new THREE.PlaneGeometry(1, 1);
    const m = new THREE.MeshBasicMaterial({ visible: false });
    const mesh = new THREE.Mesh(g, m);
    this.projectsData.forEach((project) => {
      const touchMesh = mesh.clone();
      touchMesh.index = project.index;
      this.touchPlanes.push(touchMesh);
      touchMesh.position.y -=
        0.5 * (project.msdfTitle.geometry.text.height - 1); // assuming lineheight and size are both one in text
      touchMesh.scale.set(
        project.msdfTitle.geometry.text.width,
        project.msdfTitle.geometry.text.height,
        1
      );
      project.msdfTitle.mesh.add(touchMesh);
    });
  }

  onPointermove() {
    const intersects = this.raycaster.intersectObjects(this.touchPlanes);
    if (intersects.length) {
      this.hover = true;
      const hit = intersects[0];
      this.activeProject = hit.object.index;
    } else {
      this.hover = false;
    }
  }

  onPointerdown() {
    if (this.hover) {
      this.world.onChange(
        this.projectsData.find(
          (project) => project.index === this.activeProject
        ).path
      );
    }
  }

  onChange() {}

  onResizeLoading() {}

  onResize() {}

  onResizeLoaded() {
    // using ortho camera
    this.resolutionX = this.world.resolutionX;
    this.resolutionY = this.world.resolutionY;
    this.halfWidth = this.resolutionX / 2;
    this.halfHeight = this.resolutionY / 2;
    this.camera.left = -this.halfWidth;
    this.camera.right = this.halfWidth;
    this.camera.top = this.halfHeight;
    this.camera.bottom = -this.halfHeight;
    this.camera.updateProjectionMatrix();
    const scale = this.world.settings.textScale;
    const spacing = this.world.settings.textLineSpacing;
    const textHeight = 1;
    this.group.position.x = -this.halfWidth;
    this.group.position.y = this.halfHeight - 0.5 * scale * textHeight;
    this.group.scale.set(scale, scale, 1);

    this.titles.map((mesh) => {
      const initialHeight = mesh.userData.index * (textHeight + spacing);
      console.log(initialHeight);
      mesh.position.y = -initialHeight;
    });
  }

  onWheel(delta) {
    this.scroll.target = clamp(
      this.scroll.target + delta * 0.1,
      -this.totalWidth / 2,
      this.totalWidth / 2
    );
    this.group.children.forEach((mesh) => {
      mesh.position.x = mesh.initialPosition + this.scroll.target;
    });
  }

  update() {
    this.world.renderer.render(this.scene, this.camera);
  }
}
