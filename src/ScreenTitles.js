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
    // this.scene = this.world.scene;
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
    this.setCamera();
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

  setCamera() {
    this.scene = new THREE.Scene();
    // this.scene = this.world.scene;
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
    this.setTouchPlanes();
    this.onResize();
    // this.show();

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
  }

  setGroup() {
    this.group = new THREE.Group();
  }

  setMesh() {
    this.titles = [];
    this.materials = [];
    this.paths = [];
    this.projectsData.map((project) => {
      console.log(project);
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
    this.materials[this.activeProject].uniforms.uActive.value = false;
    this.activeProject = index;
    this.materials[this.activeProject].uniforms.uActive.value = true;
    this.world.faScreen.updateActiveProject(index);
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
    // this.scroll.target = clamp(
    //   this.scroll.target + delta * 0.5,
    //   0,
    //   this.scroll.limit
    // );
    this.scroll.target = this.scroll.target + delta * 0.5;

    this.checkIntersect();

    //
    this.zeroMagnet = false;
    this.overlayTop.style.visibility = "hidden";
    if (this.scroll.target < 0) {
      this.overlayTop.style.visibility = "visible";
      this.zeroMagnet = true;
    }
    this.limitMagnet = false;
    this.overlayBottom.style.visibility = "hidden";
    if (this.scroll.target > this.scroll.limit) {
      this.overlayBottom.style.visibility = "visible";
      this.limitMagnet = true;
    }
  }

  handleScrollOverflowTop() {
    if (!this.zeroMagnet) return;

    this.scroll.target = lerp(this.scroll.target, 0, 0.2);
  }

  handleScrollOverflowBottom() {
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

  onChange() {
    // const template = this.world.template;
    // if (template === "/works") {
    //   this.show();
    // } else {
    //   this.hide();
    // }
  }

  onResize() {
    if (!this.world.isPreloaded) return;

    // using ortho camera
    this.resolutionX = this.world.resolutionX;
    this.resolutionY = this.world.resolutionY;
    this.halfWidth = this.resolutionX / 2;
    this.halfHeight = this.resolutionY / 2;

    // resize camera
    this.camera.left = -this.halfWidth;
    this.camera.right = this.halfWidth;
    this.camera.top = this.halfHeight;
    this.camera.bottom = -this.halfHeight;
    this.camera.updateProjectionMatrix();

    // resize group
    const spacing = this.settings.spacing;
    const lineheight = 1;
    const linewidth = 8;
    this.scale = (this.resolutionX * this.settings.scale) / linewidth;
    this.group.position.x =
      -this.halfWidth + this.settings.marginLeft * this.scale;
    this.group.initialPosition =
      this.halfHeight - 0.5 * this.scale * lineheight;
    this.group.position.y = this.group.initialPosition;
    this.group.scale.set(this.scale, this.scale, 1);

    // set title positions inside group
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

    this.scroll.limit = this.totalHeight * this.scale - this.resolutionY;

    this.titles.map((mesh) => {
      // set scroll-position
      let target = mesh.initialPosition - mesh.userData.textHeight * 0.5;
      target = Math.abs(target) * this.scale - this.resolutionY / 2;
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
    this.world.renderer.render(this.scene, this.camera);
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
    this.hide();
  }
}
