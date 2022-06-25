import * as THREE from "three";
import World from "./app2";
import MsdfTitle from "./MsdfTitle";
import TextGeometryOGL from "./text/TextGeometryOGL";
import font from "./text/Audiowide-Regular.json";
import Text from "./text/Text";
import { degToRad, clamp, lerp } from "three/src/math/MathUtils";

export default class ScreenTitles {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.camera = this.world.camera;
    this.textureLoader = this.world.textureLoader;
    this.renderer = this.world.renderer;
    this.raycaster = this.world.raycaster;
    this.overlayTop = document.querySelector(".overlayTop");
    this.overlayBottom = document.querySelector(".overlayBottom");
    this.activeProject = 0;
    this.hover = false;
    this.scroll = {
      target: 0,
      current: 0,
      limit: 0,
      lerp: 0.2,
    };

    this.init();
  }

  init() {
    this.setGroup();
    this.setDebug();
    this.tempSetup();
  }

  setDebug() {
    this.debug = this.world.debug.addFolder({ title: "project titles" });
    this.settings = {
      spacing: 0.6,
      scale: 0.75,
      marginTop: 0.5,
      marginBottom: 0.5,
      marginLeft: 0.2,
    };
  }

  onPreloaded() {
    console.log("hello1");
    if (window.location.pathname.includes("/projects/")) {
      console.log("hello2");
      const [projectName] = window.location.pathname.split("/").slice(-1);
      console.log(projectName);
    }
    this.projectsData = this.world.resources.projectsData;
    this.setMesh();
    this.setTouchPlanes();
    this.onResize();

    this.debug
      .addBlade({
        view: "list",
        label: "scroll To",
        options: this.titles.map((mesh) => {
          return {
            text: String(mesh.userData.index),
            value: mesh.scrollPosition,
          };
        }),
        value: null,
      })
      .on("change", ({ value }) => {
        this.scroll.target = value;
      });
    this.debug.addInput(this.materials[0].uniforms.uStroke, "value", {
      min: 0,
      max: 2,
      label: "stroke",
    });
    this.debug.addInput(this.materials[0].uniforms.uPadding, "value", {
      min: 0,
      max: 1,
      label: "padding",
    });
    this.debug.addInput(this.materials[0].uniforms.uTransition, "value", {
      min: -1,
      max: 5,
      label: "transition",
    });
    //////////
  }

  setGroup() {
    this.group = new THREE.Group();
  }

  setMesh() {
    this.titles = [];
    this.materials = [];
    this.paths = [];
    this.projectsData.map((project) => {
      this.paths.push(project.path);
      const msdfObject = new MsdfTitle(project.title);
      this.materials.push(msdfObject.material);
      const mesh = msdfObject.mesh;
      mesh.userData.index = project.index;
      mesh.userData.textWidth = msdfObject.geometry.text.width;
      mesh.userData.textHeight = msdfObject.geometry.text.height;
      this.group.add(mesh);
      this.titles.push(mesh);
    });
    this.nTitles = this.titles.length;
    this.materials[0].uniforms.uColor.value.z = 1;
  }

  setTouchPlanes() {
    this.touchPlanes = [];
    const g = new THREE.PlaneGeometry(1, 1);
    const m = new THREE.MeshBasicMaterial({ visible: false });
    const mesh = new THREE.Mesh(g, m);
    this.titles.forEach((titleMesh) => {
      const touchMesh = mesh.clone();
      touchMesh.position.x += titleMesh.userData.textWidth * 0.5;
      touchMesh.position.y -= 0.5 * (titleMesh.userData.textHeight - 1);
      titleMesh.add(touchMesh);
      touchMesh.scale.set(
        titleMesh.userData.textWidth,
        titleMesh.userData.textHeight,
        1
      );
      touchMesh.index = titleMesh.userData.index;
      this.touchPlanes.push(touchMesh);
    });
  }

  updateActiveProject(index) {
    if (this.activeProject === index) return;
    this.materials[this.activeProject].uniforms.uHover.value = false;
    this.activeProject = index;
    this.materials[this.activeProject].uniforms.uHover.value = true;
    this.world.faScreen.updateActiveProject(index);
    console.log(this.activeProject, "YOOYOO");
  }

  checkIntersect() {
    const intersects = this.raycaster.intersectObjects(this.touchPlanes);
    if (intersects.length) {
      this.hover = true;
      const hit = intersects[0];
      this.updateActiveProject(hit.object.index);
    } else {
      this.hover = false;
    }
  }

  onPointermove() {
    if (this.world.template !== "/projects") return;
    this.raycaster.setFromCamera(this.world.mouse, this.camera);
    this.checkIntersect();
  }

  onWheel(delta) {
    if (this.world.template !== "/projects") return;
    // this.scroll.target = this.scroll.target + delta * 0.0005;
    this.scroll.target = clamp(
      this.scroll.target + delta * 0.05,
      0,
      this.scroll.limit
    );

    this.checkIntersect();

    //
    // this.zeroMagnet = false;
    // this.overlayTop.style.visibility = "hidden";
    // if (this.scroll.target < 0) {
    //   this.overlayTop.style.visibility = "visible";
    //   this.zeroMagnet = true;
    // }
    // this.limitMagnet = false;
    // this.overlayBottom.style.visibility = "hidden";
    // if (this.scroll.target > this.scroll.limit) {
    //   this.overlayBottom.style.visibility = "visible";
    //   this.limitMagnet = true;
    // }
    //
  }

  handleScrollOverflowTop() {
    return;
    if (!this.zeroMagnet) return;

    this.scroll.target = lerp(this.scroll.target, 0, 0.2);
  }

  handleScrollOverflowBottom() {
    return;
    if (!this.limitMagnet) return;

    this.scroll.target = lerp(this.scroll.target, this.scroll.limit, 0.2);
  }

  onPointerdown() {
    if (this.world.template !== "/projects") return;
    if (this.hover) {
      // this.world.onChange({
      //   url: this.paths[this.activeProject],
      // }); // clicking on btoh the titles and the screen causes problems
    }
  }

  onChange() {}

  onResize() {
    if (!this.world.isPreloaded) return;

    this.group.position.copy(this.world.camera.position);
    const d = 25;
    this.group.position.z -= d;
    this.world.camera.lookAt(this.group.position);
    const screenHeight =
      Math.tan(degToRad(this.world.camera.fov * 0.5)) * d * 2;
    // const scaleW = this.camera.aspect * scaleH;
    const scaleFactor = screenHeight / this.world.resolutionY;
    const linewidth = 8;
    const lineheight = 1;
    const size = (this.world.resolutionX * this.settings.scale) / linewidth;
    const scale = size * scaleFactor;
    this.group.scale.set(scale, scale, 1);
    this.group.position.x =
      -(this.world.resolutionX / 2) * scaleFactor +
      this.settings.marginLeft * scale;
    this.group.initialPosition =
      this.world.camera.position.y +
      0.5 * this.world.resolutionY * scaleFactor -
      0.5 * scale * lineheight;
    this.group.position.y = this.group.initialPosition;

    // set title positions inside group
    const spacing = this.settings.spacing;
    this.totalHeight = this.settings.marginTop;
    this.titles.map((mesh, index) => {
      // assume loop-index is the same as mesh-index
      mesh.initialPosition = -this.totalHeight;
      mesh.position.y = mesh.initialPosition;

      let offset = mesh.userData.textHeight;
      if (index < this.nTitles - 1) {
        offset += spacing;
      } else {
        offset += this.settings.marginBottom;
      }
      this.totalHeight += offset;
    });

    this.scroll.limit =
      this.totalHeight * scale - this.world.resolutionY * scaleFactor;

    this.titles.map((mesh) => {
      // set scroll-position
      let target = mesh.initialPosition - mesh.userData.textHeight * 0.5;
      target =
        Math.abs(target) * scale - (this.world.resolutionY / 2) * scaleFactor;
      target = clamp(target, 0, this.scroll.limit);
      mesh.scrollPosition = target;
    });
  }

  updateScrollPosition() {
    if (Math.abs(this.scroll.target - this.scroll.current) < 1) return;
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.lerp
    );
    this.group.position.y = this.group.initialPosition + this.scroll.current;

    this.handleScrollOverflowTop();
    this.handleScrollOverflowBottom();
  }

  tempSetup() {
    this.rt = new THREE.WebGLRenderTarget(512, 512, {
      minFilter: THREE.LinearFilter,
      type: THREE.FloatType,
      magFilter: THREE.LinearFilter,
    });
  }

  update() {
    if (this.world.template !== "/projects") return;
    this.updateScrollPosition();
    this.materials.map((mat) => (mat.uniforms.uTime.value = this.world.time));
  }

  // nvagitation stuff

  show() {
    this.scene.add(this.group);
  }

  hide() {
    this.scene.remove(this.group);
  }

  toHome() {
    this.hide();
  }

  toAbout() {
    this.hide();
  }

  toProjects() {
    this.show();
  }

  toProjectDetail() {
    console.log("HIDE");
    this.hide();
  }
}
