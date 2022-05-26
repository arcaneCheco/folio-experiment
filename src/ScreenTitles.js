import * as THREE from "three";
import World from "./app2";
import MsdfTitle from "./MsdfTitle";
import TextGeometryOGL from "./text/TextGeometryOGL";
import font from "./text/Audiowide-Regular.json";
import Text from "./text/Text";

export default class ScreenTitles {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.textureLoader = this.world.textureLoader;
    this.renderer = this.world.renderer;

    // this.setText();
    // this.setGeometry();
    // this.setMaterial();
    this.setGroup();
    this.setMesh();
    this.onResize();
  }

  show() {
    this.scene.add(this.group);
  }
  hide() {
    this.scene.remove(this.group);
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
    console.log(this.text.width);
    console.log(this.text.height);
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
    // this.group.lookAt(this.world.camera.position);
  }

  setMesh() {
    this.titles = [];
    this.titles.push(new MsdfTitle("hello world"));
    this.titles.push(new MsdfTitle("infinite tunnel"));
    this.titles.push(new MsdfTitle("mandelbrot explorer"));
    this.titles.push(new MsdfTitle("elastic mesh"));

    this.titles.forEach((title) => {
      const mesh = title.mesh;
      this.group.add(mesh);
    });
  }

  onChange() {
    if (this.world.fromToRoute === "homeToWorks") {
      this.show();
    } else if (this.world.fromToRoute === "worksToHome") {
      this.hide();
    }
  }

  onResize() {
    this.group.position.set(0, 13, 55);
    const s = 6;
    this.group.scale.set(s, s, 1);

    let totalWidth = 0;
    let spacing = 0.5;

    this.titles.forEach((title, i) => {
      const mesh = title.mesh;
      const width = title.geometry.text.width;
      mesh.position.x = totalWidth + width / 2;
      totalWidth += width + spacing;
    });
    this.titles.forEach((title, i) => {
      title.mesh.position.x -= totalWidth / 2;
    });
    // this.group.position.x -= (s * totalWidth) / 2;
    this.totalWidth = totalWidth;
  }

  onWheel(delta) {
    this.group.children.forEach((mesh) => {
      mesh.position.x += delta * 0.1;
    });
  }

  update() {
    // this.group.lookAt(this.world.camera.position);
  }
}
