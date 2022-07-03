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
      markerInActive: new THREE.Color(0x666666),
      markerActive: new THREE.Color(0xffffff),
    };
    this.setNavMarkers();
    this.initMarkersMesh();
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
    if (id === this.activeIndex) return;
    this.markersMesh.setColorAt(this.activeIndex, this.settings.markerInActive);
    this.markersMesh.setColorAt(id, this.settings.markerActive);
    this.markersMesh.instanceColor.needsUpdate = true;
    this.activeIndex = id;
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

    const intersectMarkersMesh = this.raycaster.intersectObject(
      this.markersMesh
    );
    if (intersectMarkersMesh.length) {
      document.body.style.cursor = "pointer";
      this.updateColors(intersectMarkersMesh[0].instanceId);
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

  onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const w = (2 * this.settings.markerSize) / window.innerWidth;
    const h = w * aspect;
    this.markersMesh.scale.set(w, h, 1);

    const navButtonWidth = (2 * this.settings.navRadius) / window.innerWidth;
    const navButtonHeight = navButtonWidth * aspect;

    this.homeGroup.position.y = (this.markersMesh.count - 1) * h * 0.5; // hieght of first marker
    this.homeGroup.position.y += navButtonHeight + h / 2; // top of markers
    this.homeGroup.position.y += (10 / window.innerWidth) * aspect; // gap

    this.homeNav.scale.set(navButtonWidth, navButtonHeight, 1);

    this.aboutGroup.position.y = -this.homeGroup.position.y;

    this.aboutNav.scale.set(navButtonWidth, navButtonHeight, 1);

    const iconWidth = 80 / window.innerWidth;
    const iconHeight = (aspect * 80) / window.innerWidth;

    this.homeButtonIcon.scale.set(iconWidth, iconHeight, 1);

    this.aboutButtonIcon.scale.set(iconWidth, iconHeight, 1);

    const textScale =
      ((2 * this.settings.textHeight) / window.innerWidth) * aspect;
    const textPosition = (-50 * 2) / window.innerWidth;

    this.homeText.scale.setScalar(textScale);
    this.homeText.position.x = textPosition;

    this.aboutText.scale.setScalar(textScale);
    this.aboutText.position.x = textPosition;

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

  setOldNav() {
    this.screenTitles = this.world.screenTitles;
    this.titles = this.screenTitles.titles;
    this.nTitles = this.screenTitles.nTitles;
    this.scroll = this.screenTitles.scroll;
    this.navigationLine = document.querySelector(".navigation__line");
    this.markers = [];
    for (let i = 0; i < this.nTitles; i++) {
      const marker: any = document.createElement("div");
      this.markers.push(marker);
      marker.index = i;
      marker.scrollTarget = this.titles[i].scrollPosition;
      marker.classList.add("navigation__line__marker");
      this.navigationLine.appendChild(marker);
      marker.onpointerover = ({ target }: any) => {
        if (this.world.template !== Template.Projects) return;
        this.scroll.target = target.scrollTarget;
        this.screenTitles.updateActiveProject(target.index);
      };
    }
    this.homeButton = document.querySelector(".navigation__home");
    this.aboutButton = document.querySelector(".navigation__about");
    this.homeButton.onclick = () =>
      this.world.onChange({ template: Template.Home });
    this.aboutButton.onclick = () =>
      this.world.onChange({ template: Template.About });
  }

  // setDebug() {
  //   this.debug = this.world.debug.addFolder({
  //     title: "navigation",
  //     expanded: true,
  //   });
  //   this.debug
  //     .addBlade({
  //       view: "list",
  //       label: "route",
  //       options: [
  //         { text: "home", value: "/" },
  //         { text: "projects", value: "/projects" },
  //         { text: "elasticMesh", value: "/projects/elastic-mesh" },
  //         { text: "about", value: "/about" },
  //       ],
  //       value: "",
  //     })
  //     .on("change", ({ value }: any) => {
  //       // ignore for now, come back after defining types everywhere
  //       this.world.onChange({ template: value });
  //     });
  // }

  setOverlayNav() {
    this.topoverlay = document.querySelector(".overlayTop");
    this.topoverlay.onclick = () => {
      this.topoverlay.style.visibility = "hidden";
      this.world.onChange({ template: Template.Home });
    };
    this.bottomoverlay = document.querySelector(".overlayBottom");
    this.bottomoverlay.onclick = () => {
      this.bottomoverlay.style.visibility = "hidden";
      this.world.onChange({ template: Template.About });
    };
  }
}
