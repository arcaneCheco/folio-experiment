import World, { Template } from "./app2";
import * as THREE from "three";
import GSAP from "gsap";
import TextGeometryOGL from "./text/TextGeometryOGL";
import markerVertex from "./shaders/navigation/marker/vertex.glsl";
import markerFragment from "./shaders/navigation/marker/fragment.glsl";
import navButtonVertex from "./shaders/navigation/navButton/vertex.glsl";
import navButtonFragment from "./shaders/navigation/navButton/fragment.glsl";
import textVertex from "./shaders/navigation/text/vertex.glsl";
import textFragment from "./shaders/navigation/text/fragment.glsl";
import buttonIconVertex from "./shaders/navigation/buttonIcon/vertex.glsl";
import buttonIconFragment from "./shaders/navigation/buttonIcon/fragment.glsl";
import markerLineVertex from "./shaders/navigation/markerLine/vertex.glsl";
import markerLineFragment from "./shaders/navigation/markerLine/fragment.glsl";

export default class Navigation {
  world: World;
  screenTitles: any;
  titles: any;
  nTitles: any;
  scroll: any;
  navigationLine: any;
  markers: any;
  homeButton: any;
  aboutButton: any;
  debug: any;
  topoverlay: any;
  bottomoverlay: any;
  group: THREE.Group;
  projectsData: any;
  settings: {
    maxCount: number;
    markerSize: number;
    markerInActive: THREE.Color;
    markerActive: THREE.Color;
    navRadius: number;
    textHeight: number;
    markerLineWidth: number;
    markerLineLength: number;
  };
  markerGeometry: THREE.PlaneGeometry;
  markerMaterial: THREE.ShaderMaterial;
  markersMesh: THREE.InstancedMesh;
  scene: THREE.Scene;
  dummy: THREE.Object3D;
  activeIndex: number;
  raycaster: THREE.Raycaster;
  homeGroup: THREE.Group;
  homeNav: THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial>;
  aboutNav: THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial>;
  isHomeButtonActive: boolean;
  isAboutButtonActive: boolean;
  homeTimeline: GSAPTimeline;
  aboutTimeline: GSAPTimeline;
  textMaterial: THREE.ShaderMaterial;
  homeText: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  aboutText: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  homeButtonIcon: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  aboutButtonIcon: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  aboutGroup: THREE.Group;
  markerLine: THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>;
  widthScreenRatio: number;
  heightScreenRatio: number;
  scrollTargets: any;
  constructor() {
    this.init();
  }

  init() {
    this.world = new World();
    this.scene = this.world.scene;
    this.activeIndex = 0;
    this.isHomeButtonActive = false;
    this.isAboutButtonActive = false;
    this.homeTimeline = GSAP.timeline();
    this.aboutTimeline = GSAP.timeline();
    this.raycaster = this.world.raycaster;
    this.setLayout();
  }

  onPreloaded() {
    this.projectsData = this.world.resources.projectsData;
    this.settings = {
      maxCount: this.projectsData.length,
      markerSize: 50,
      navRadius: 35,
      textHeight: 20,
      markerLineWidth: 5,
      markerLineLength: 40,
      markerInActive: new THREE.Color(0x666666),
      markerActive: new THREE.Color(0xffffff),
    };
    this.setNavMarkers();
    this.initMarkersMesh();
    this.setMarkerLine();
    this.setNavButton();
    this.setButtonIcons();
    this.setText();
    this.setDebug();
    this.onResize();
  }

  setLayout() {
    this.group = new THREE.Group();
    this.group.position.x = 0.9;
    this.scene.add(this.group);

    this.homeGroup = new THREE.Group();
    this.group.add(this.homeGroup);

    this.aboutGroup = new THREE.Group();
    this.group.add(this.aboutGroup);
  }

  setNavMarkers() {
    this.markerGeometry = new THREE.PlaneGeometry(1, 1);
    this.markerMaterial = new THREE.ShaderMaterial({
      vertexShader: markerVertex,
      fragmentShader: markerFragment,
      transparent: true,
    });
    this.markersMesh = new THREE.InstancedMesh(
      this.markerGeometry,
      this.markerMaterial,
      this.settings.maxCount
    );
    this.group.add(this.markersMesh);
  }

  initMarkersMesh() {
    this.markersMesh.userData.height = this.markersMesh.count;
    this.dummy = new THREE.Object3D();
    for (let i = 0; i < this.markersMesh.count; i++) {
      this.dummy.position.y = (this.markersMesh.count - 1) / 2 - i;
      console.log(this.dummy.position.y);
      this.dummy.updateMatrix();
      this.markersMesh.setMatrixAt(i, this.dummy.matrix);
      this.markersMesh.setColorAt(i, this.settings.markerInActive);
    }
    this.markersMesh.setColorAt(this.activeIndex, this.settings.markerActive);
  }

  setMarkerLine() {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader: markerLineVertex,
      fragmentShader: markerLineFragment,
    });
    this.markerLine = new THREE.Mesh(geometry, material);
    this.group.add(this.markerLine);
  }

  setNavButton() {
    const buttonGeometry = new THREE.CircleGeometry(1, 30);
    const openPositionAttribute = buttonGeometry.attributes.position.clone();
    const s = 2.55;
    const array = openPositionAttribute.array;
    for (let i = 0; i < openPositionAttribute.array.length / 3; i++) {
      openPositionAttribute.set(
        [array[i * 3] * 9, array[i * 3 + 1] * 2],
        i * 3
      );
      // openPositionAttribute.set(
      //   [array[i * 3] * s, array[i * 3 + 1] * 2],
      //   i * 3
      // );
      // openPositionAttribute.set([array[i * 3] - (s - 1)], i * 3);
    }
    buttonGeometry.setAttribute("aOpenPosition", openPositionAttribute);

    const buttonMaterial = new THREE.ShaderMaterial({
      vertexShader: navButtonVertex,
      fragmentShader: navButtonFragment,
      transparent: true,
      uniforms: {
        uIsActive: { value: 0 },
        uColor: { value: new THREE.Vector3(1, 0.6, 0.2) },
      },
    });

    this.homeNav = new THREE.Mesh(buttonGeometry, buttonMaterial);
    this.homeGroup.add(this.homeNav);

    const aboutMaterial = buttonMaterial.clone();
    aboutMaterial.uniforms.uColor.value.set(0.2, 0.6, 1);
    this.aboutNav = new THREE.Mesh(buttonGeometry, aboutMaterial);
    this.aboutGroup.add(this.aboutNav);
  }

  setText() {
    const font = this.world.resources.fontsData.audiowide;

    const homeTextGeometry = new TextGeometryOGL();
    homeTextGeometry.setText({
      font: font.data,
      text: "HOME",
      align: "right",
    });

    const aboutTextGeometry = new TextGeometryOGL();
    aboutTextGeometry.setText({
      font: font.data,
      text: "ABOUT",
      align: "right",
    });

    this.textMaterial = new THREE.ShaderMaterial({
      vertexShader: textVertex,
      fragmentShader: textFragment,
      uniforms: {
        tMap: { value: this.world.textureLoader.load(font.url) },
        uViewport: { value: new THREE.Vector2() },
        uAspect: { value: 0 },
        uCenter: { value: new THREE.Vector2() },
        uRadiusClosed: { value: 35 },
        uRadiusOpen: { value: 35 * 9 },
        uIsActive: { value: 0 },
      },
      transparent: true,
    });

    this.homeText = new THREE.Mesh(homeTextGeometry, this.textMaterial);
    this.homeGroup.add(this.homeText);

    this.aboutText = new THREE.Mesh(
      aboutTextGeometry,
      this.textMaterial.clone()
    );
    this.aboutGroup.add(this.aboutText);
  }

  setButtonIcons() {
    const buttonIconGeometry = new THREE.PlaneGeometry(1, 1);
    const buttoIconMaterial = new THREE.ShaderMaterial({
      vertexShader: buttonIconVertex,
      fragmentShader: buttonIconFragment,
      transparent: true,
      uniforms: {
        uIcon: { value: null },
      },
    });

    this.homeButtonIcon = new THREE.Mesh(buttonIconGeometry, buttoIconMaterial);
    this.homeButtonIcon.material.uniforms.uIcon.value =
      this.world.textureLoader.load("sunIcon.png");

    this.homeGroup.add(this.homeButtonIcon);

    this.aboutButtonIcon = new THREE.Mesh(
      buttonIconGeometry,
      buttoIconMaterial.clone()
    );
    this.aboutButtonIcon.material.uniforms.uIcon.value =
      this.world.textureLoader.load("moonIcon.png");

    this.aboutGroup.add(this.aboutButtonIcon);
  }

  setDebug() {
    this.debug = this.world.debug.addFolder({ title: "navgiation" });
    this.debug
      .addInput(this.markersMesh, "count", {
        min: 0,
        max: this.settings.maxCount,
        step: 1,
      })
      .on("change", () => this.onUpdateCount());
  }

  updateColors(id: number) {
    this.markersMesh.setColorAt(this.activeIndex, this.settings.markerInActive);
    this.markersMesh.setColorAt(id, this.settings.markerActive);
    this.markersMesh.instanceColor.needsUpdate = true;
  }

  onUpdateCount() {
    this.markersMesh.userData.height = this.markersMesh.count;
    for (let i = 0; i < this.markersMesh.count; i++) {
      this.dummy.position.y = (this.markersMesh.count - 1) / 2 - i;
      this.dummy.updateMatrix();
      this.markersMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.markersMesh.instanceMatrix.needsUpdate = true;

    this.onResize();
  }

  navAnimateIn(target: "home" | "about") {
    const tl = GSAP.timeline();
    if (target === "home") {
      this.homeTimeline.clear();
      tl.to(
        this.homeNav.material.uniforms.uIsActive,
        {
          value: 1,
          duration: 0.5,
        },
        "0"
      );
      tl.to(
        this.homeText.material.uniforms.uIsActive,
        {
          value: 1,
          duration: 0.5,
        },
        "0"
      );
    } else {
      this.aboutTimeline.clear();
      tl.to(
        this.aboutNav.material.uniforms.uIsActive,
        {
          value: 1,
          duration: 0.5,
        },
        "0"
      );
      tl.to(
        this.aboutText.material.uniforms.uIsActive,
        {
          value: 1,
          duration: 0.5,
        },
        "0"
      );
    }
    return tl;
  }

  navAnimateOut(target: "home" | "about") {
    const tl = GSAP.timeline();
    if (target === "home") {
      this.homeTimeline.clear();
      tl.to(
        this.homeNav.material.uniforms.uIsActive,
        {
          value: 0,
          duration: 0.5,
        },
        "0"
      );
      tl.to(
        this.homeText.material.uniforms.uIsActive,
        {
          value: 0,
          duration: 0.5,
        },
        "0"
      );
    } else {
      this.aboutTimeline.clear();
      tl.to(
        this.aboutNav.material.uniforms.uIsActive,
        {
          value: 0,
          duration: 0.5,
        },
        "0"
      );
      tl.to(
        this.aboutText.material.uniforms.uIsActive,
        {
          value: 0,
          duration: 0.5,
        },
        "0"
      );
    }
    return tl;
  }

  onPointermove(mouse: THREE.Vector2) {
    this.raycaster.set(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(mouse.x, mouse.y, -1).normalize()
    );

    document.body.style.cursor = "";

    if (this.world.template === Template.Projects) {
      const intersectMarkersMesh = this.raycaster.intersectObject(
        this.markersMesh
      );
      if (intersectMarkersMesh.length) {
        document.body.style.cursor = "pointer";
        const id = intersectMarkersMesh[0].instanceId;
        if (id == this.activeIndex) return;
        this.updateColors(id);
        this.activeIndex = id;
        this.onSelectedChange(id);
      }
    }

    const intersectHomeNav = this.raycaster.intersectObject(this.homeNav);
    if (intersectHomeNav.length) {
      document.body.style.cursor = "pointer";
      if (!this.isHomeButtonActive) {
        this.homeTimeline.add(this.navAnimateIn("home"));
        this.isHomeButtonActive = true;
      }
    } else {
      if (this.isHomeButtonActive) {
        this.homeTimeline.add(this.navAnimateOut("home"));
        this.isHomeButtonActive = false;
      }
    }

    const intersectAboutNav = this.raycaster.intersectObject(this.aboutNav);
    if (intersectAboutNav.length) {
      document.body.style.cursor = "pointer";
      if (!this.isAboutButtonActive) {
        this.aboutTimeline.add(this.navAnimateIn("about"));
        this.isAboutButtonActive = true;
      }
    } else {
      if (this.isAboutButtonActive) {
        this.aboutTimeline.add(this.navAnimateOut("about"));
        this.isAboutButtonActive = false;
      }
    }
  }

  onPointerdown() {
    if (this.isHomeButtonActive) {
      this.world.onChange({ template: Template.Home });
    } else if (this.isAboutButtonActive) {
      this.world.onChange({ template: Template.About });
    }
  }

  onSelectedChange(id: number) {
    this.scroll = this.world.screenTitles.scroll;
    this.scrollTargets = this.world.screenTitles.titles.map(
      (titleEntry: any) => titleEntry.scrollPosition
    );
    this.scroll.target = this.scrollTargets[id];
    this.world.screenTitles.updateActiveProject(id);
  }

  resetSizeTargets() {
    const template = this.world.template;
    this.widthScreenRatio = 2 / window.innerWidth;
    this.heightScreenRatio = 2 / window.innerHeight;

    let markerLineWidth, markerLineHeight, navButtonGroupPosition;
    if (template === Template.Projects) {
      const h = this.settings.markerSize * this.heightScreenRatio;

      markerLineWidth = this.settings.markerLineWidth * this.widthScreenRatio;
      markerLineHeight = h * (this.markersMesh.count - 1);

      navButtonGroupPosition = (this.markersMesh.count - 1) * h * 0.5; // hieght of first marker
      navButtonGroupPosition +=
        this.settings.navRadius * this.heightScreenRatio + h / 2; // top of markers
      navButtonGroupPosition += 5 * this.heightScreenRatio; // gap
    } else if (template === Template.Home) {
      markerLineWidth = this.settings.markerLineLength * this.widthScreenRatio;
      markerLineHeight = this.settings.markerLineWidth * this.widthScreenRatio;
      navButtonGroupPosition =
        (this.settings.navRadius + 20) * this.heightScreenRatio;
    }

    return {
      markerLine: {
        width: markerLineWidth,
        height: markerLineHeight,
      },
      navButtonGroupPosition,
    };
  }

  onResize() {
    const { markerLine, navButtonGroupPosition } = this.resetSizeTargets();

    const aspect = window.innerWidth / window.innerHeight;

    // markerMesh
    const w = (2 * this.settings.markerSize) / window.innerWidth;
    const h = w * aspect;
    this.markersMesh.scale.set(w, h, 1);

    this.markerLine.scale.set(markerLine.width, markerLine.height, 1);

    // navButtons
    const navButtonWidth = (2 * this.settings.navRadius) / window.innerWidth;
    const navButtonHeight = navButtonWidth * aspect;
    this.homeNav.scale.set(navButtonWidth, navButtonHeight, 1);
    this.aboutNav.scale.set(navButtonWidth, navButtonHeight, 1);

    // navButtonGroups
    this.homeGroup.position.y = navButtonGroupPosition;
    this.aboutGroup.position.y = -navButtonGroupPosition;

    // icons
    const iconWidth = 80 / window.innerWidth;
    const iconHeight = (aspect * 80) / window.innerWidth;
    this.homeButtonIcon.scale.set(iconWidth, iconHeight, 1);
    this.aboutButtonIcon.scale.set(iconWidth, iconHeight, 1);

    // text
    const textScale =
      ((2 * this.settings.textHeight) / window.innerWidth) * aspect; // set textheight relaitve to viewport height
    const textPosition = (-50 * 2) / window.innerWidth;
    this.homeText.scale.setScalar(textScale);
    this.homeText.position.x = textPosition;
    this.aboutText.scale.setScalar(textScale);
    this.aboutText.position.x = textPosition;

    // text mask
    this.homeText.material.uniforms.uViewport.value.set(
      window.innerWidth,
      window.innerHeight
    );
    this.homeText.material.uniforms.uAspect.value = aspect;
    this.homeText.material.uniforms.uCenter.value.set(
      (0.9 + 1) / 2,
      (this.homeGroup.position.y + 1) / 2
    );
    this.aboutText.material.uniforms.uViewport.value.set(
      window.innerWidth,
      window.innerHeight
    );
    this.aboutText.material.uniforms.uAspect.value = aspect;
    this.aboutText.material.uniforms.uCenter.value.set(
      (0.9 + 1) / 2,
      (this.aboutGroup.position.y + 1) / 2
    );
  }

  toHome() {
    this.group.remove(this.markersMesh);
    const { markerLine, navButtonGroupPosition } = this.resetSizeTargets();
    GSAP.timeline()
      .to(this.markerLine.scale, {
        y: markerLine.height,
        duration: 0.25,
      })
      .to(
        this.markerLine.scale,
        {
          x: markerLine.width,
          duration: 0.1,
        },
        "-=0"
      );

    GSAP.to(this.homeGroup.position, {
      y: navButtonGroupPosition,
      duration: 0.5,
    });
    GSAP.to(this.aboutGroup.position, {
      y: -navButtonGroupPosition,
      duration: 0.5,
    });
  }

  toProjects() {
    this.group.add(this.markersMesh);
    const { markerLine, navButtonGroupPosition } = this.resetSizeTargets();
    GSAP.timeline()
      .to(this.markerLine.scale, {
        y: markerLine.height,
        duration: 0.25,
      })
      .to(
        this.markerLine.scale,
        {
          x: markerLine.width,
          duration: 0.1,
        },
        "-=0"
      );

    GSAP.to(this.homeGroup.position, {
      y: navButtonGroupPosition,
      duration: 0.5,
    });
    GSAP.to(this.aboutGroup.position, {
      y: -navButtonGroupPosition,
      duration: 0.5,
    });
  }

  // at top or bottom of list just navigate on hard scroll
}
