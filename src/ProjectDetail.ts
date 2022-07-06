import World, { Template } from "./app2";
import * as THREE from "three";
import VisitButton from "./VisitButton";
import TextGeometryOGL from "./text/TextGeometryOGL";
import textVertex from "./shaders/projectDetail/text/vertex.glsl";
import textFragment from "./shaders/projectDetail/text/fragment.glsl";
import visitIconVertex from "./shaders/projectDetail/visitIcon/vertex.glsl";
import visitIconFragment from "./shaders/projectDetail/visitIcon/fragment.glsl";
import lineVertex from "./shaders/projectDetail/line/vertex.glsl";
import lineFragment from "./shaders/projectDetail/line/fragment.glsl";

export default class ProjectDetail {
  world: World;
  scene;
  raycaster;
  visitButton: THREE.Mesh;
  prevButton: THREE.Mesh;
  nextButton: THREE.Mesh;
  group: THREE.Group;
  settings;
  visitIcon: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  closeIcon: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  visitGroup: THREE.Group;
  lineBL: any;
  lineBR: any;
  lineTL: any;
  lineTR: any;
  testLine: any;
  debug;
  testUnis: any;
  time: number;
  navButtonGroup: THREE.Group;
  hoverCloseButton: boolean;
  hoverVisitButton: boolean;
  hoverPrevButton: boolean;
  hoverNextButton: boolean;
  // visitButtonTouchPlane;
  // hover: any;
  // nextButton: any;
  // prevButton: any;
  // closeButton: any;
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;
    this.group = new THREE.Group();
    this.debug = this.world.debug.addFolder({ title: "projectsDetail" });

    // this.visitButton = new VisitButton();
    // this.group.position.z = 25;
    // this.group.position.y = 10;
    // this.group.add(this.visitButton.mesh);
    // this.visitButtonTouchPlane = new THREE.Mesh(
    //   new THREE.PlaneGeometry(this.visitButton.geometry.text.width, 1),
    //   new THREE.MeshBasicMaterial({ visible: false })
    // );
    // this.visitButton.mesh.add(this.visitButtonTouchPlane);

    this.settings = {
      visitButtonTextHeight: 40,
      navButtonTextHeight: 20,
    };
    this.init();
  }

  init() {
    //temp
    window.setTimeout(() => {
      this.world.faScreen.onResize();
      this.world.faScreen.updateActiveProject(
        this.world.screenTitles.activeProject
      );
    }, 1200);
    this.setNavButtons();
    this.onResize();
  }

  setNavButtons() {
    const font = this.world.resources.fontsData.audiowide;
    // visitButton
    this.visitGroup = new THREE.Group();
    this.group.add(this.visitGroup);
    const geometry = new TextGeometryOGL();
    geometry.setText({
      font: font.data,
      text: "Visit",
      align: "center",
    });
    const textMaterial = new THREE.ShaderMaterial({
      vertexShader: textVertex,
      fragmentShader: textFragment,
      uniforms: {
        tMap: { value: this.world.textureLoader.load(font.url) },
      },
      transparent: true,
    });
    this.visitButton = new THREE.Mesh(geometry, textMaterial);
    this.visitGroup.position.y = -0.75;
    this.visitGroup.add(this.visitButton);

    const visitIconGeometry = new THREE.PlaneGeometry(1, 1);
    const iconMaterial = new THREE.ShaderMaterial({
      vertexShader: visitIconVertex,
      fragmentShader: visitIconFragment,
      uniforms: {
        uIcon: { value: null },
      },
      transparent: true,
    });
    this.visitIcon = new THREE.Mesh(visitIconGeometry, iconMaterial);
    this.visitIcon.material.uniforms.uIcon.value =
      this.world.textureLoader.load("visitIcon.png");
    this.visitGroup.add(this.visitIcon);

    //lines
    const lineGeometry = new THREE.PlaneGeometry(1, 1, 100, 1);
    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
      uniforms: {},
    });
    this.lineBL = new THREE.Mesh(lineGeometry, lineMaterial);
    this.lineBL.position.y = -0.75;
    this.group.add(this.lineBL);

    this.lineBR = this.lineBL.clone();
    this.group.add(this.lineBR);

    this.lineTL = this.lineBL.clone();
    this.lineTL.position.y = 0.8;
    this.group.add(this.lineTL);

    this.lineTR = this.lineTL.clone();
    this.group.add(this.lineTR);

    // navButton
    this.navButtonGroup = new THREE.Group();
    this.group.add(this.navButtonGroup);
    const prevTextGeometry = new TextGeometryOGL();
    prevTextGeometry.setText({
      font: font.data,
      text: "PREV.",
      align: "left",
    });
    this.prevButton = new THREE.Mesh(prevTextGeometry, textMaterial);
    this.navButtonGroup.add(this.prevButton);

    const nextTextGeometry = new TextGeometryOGL();
    nextTextGeometry.setText({
      font: font.data,
      text: "NEXT",
      align: "right",
    });
    this.nextButton = new THREE.Mesh(nextTextGeometry, textMaterial);
    this.navButtonGroup.add(this.nextButton);

    // closeButton
    const closeGeometry = new THREE.PlaneGeometry(1, 1);
    const closeMaterial = iconMaterial.clone();
    closeMaterial.uniforms.uIcon.value =
      this.world.textureLoader.load("closeIcon.png");
    this.closeIcon = new THREE.Mesh(closeGeometry, closeMaterial);
    this.closeIcon.position.y = 0.8;
    this.group.add(this.closeIcon);
  }

  onPointermove(mouse: THREE.Vector2) {
    this.raycaster.set(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(mouse.x, mouse.y, -1).normalize()
    );

    document.body.style.cursor = "";

    const intersectCloseButton = this.raycaster.intersectObject(this.closeIcon);
    if (intersectCloseButton.length) {
      document.body.style.cursor = "pointer";
      this.hoverCloseButton = true;
    } else {
      this.hoverCloseButton = false;
    }

    const intersectVisitButton = this.raycaster.intersectObjects([
      this.visitButton,
      this.visitIcon,
    ]);
    if (intersectVisitButton.length) {
      document.body.style.cursor = "pointer";
      this.hoverVisitButton = true;
    } else {
      this.hoverVisitButton = false;
    }

    const intersectPrevButton = this.raycaster.intersectObject(this.prevButton);
    if (intersectPrevButton.length) {
      document.body.style.cursor = "pointer";
      this.hoverPrevButton = true;
    } else {
      this.hoverPrevButton = false;
    }

    const intersectNextButton = this.raycaster.intersectObject(this.nextButton);
    if (intersectNextButton.length) {
      document.body.style.cursor = "pointer";
      this.hoverNextButton = true;
    } else {
      this.hoverNextButton = false;
    }
  }

  onPointerdown() {
    if (this.hoverCloseButton) {
      this.scene.remove(this.group);
      this.world.onChange({ template: Template.Projects });
    } else if (this.hoverVisitButton) {
      const url =
        this.world.resources.projectsData[this.world.screenTitles.activeProject]
          .link;
      window.open(url, "_blank").focus();
    } else if (this.hoverPrevButton) {
      const activeProject = Math.max(
        this.world.screenTitles.activeProject - 1,
        0
      );
      this.world.screenTitles.updateActiveProject(activeProject);
    } else if (this.hoverNextButton) {
      const activeProject = Math.min(
        this.world.screenTitles.activeProject + 1,
        this.world.resources.projectsData.length - 1
      );
      this.world.screenTitles.updateActiveProject(activeProject);
    }
  }

  onResize() {
    const widthScreenRatio = 2 / window.innerWidth;
    const heightScreenRatio = 2 / window.innerHeight;

    // visitButton
    const visitTextScale =
      this.settings.visitButtonTextHeight * heightScreenRatio;
    this.visitButton.scale.setScalar(visitTextScale);

    // visitIcon
    this.visitIcon.scale.setScalar(visitTextScale * 0.7);
    this.visitIcon.position.x = visitTextScale * 1.8;
    this.visitGroup.position.x = -visitTextScale * 0.45;

    //lineBL
    const marginLeft = 0.1;
    const lineWidth = 2 * heightScreenRatio;
    const positionRight = visitTextScale * 1.8;
    const lineBLLength =
      1 - marginLeft * widthScreenRatio - visitTextScale - positionRight;
    this.lineBL.scale.set(lineBLLength, lineWidth, 1);
    this.lineBL.position.x =
      -lineBLLength / 2 - positionRight - Math.abs(this.visitGroup.position.x);

    //lineBR
    this.lineBR.scale.set(lineBLLength, lineWidth, 1);
    this.lineBR.position.x = -this.lineBL.position.x;

    // lineTL
    const topLineLength = 300 * widthScreenRatio;
    const topLinePositionOffset = 60 * widthScreenRatio + topLineLength / 2;
    this.lineTL.scale.set(topLineLength, lineWidth, 1);
    this.lineTL.position.x = -topLinePositionOffset;

    // lineTR
    this.lineTR.scale.set(topLineLength, lineWidth, 1);
    this.lineTR.position.x = topLinePositionOffset;

    // navButtons
    const navTextScale = this.settings.navButtonTextHeight * heightScreenRatio;
    this.navButtonGroup.position.y = -0.75 + navTextScale * 0.5;
    this.prevButton.scale.setScalar(navTextScale);
    this.prevButton.position.x = -1 + marginLeft;
    this.nextButton.scale.setScalar(navTextScale);
    this.nextButton.position.x = 1 - marginLeft;

    // closeIcon
    let closeIconSize = 40;
    this.closeIcon.scale.set(
      closeIconSize * widthScreenRatio,
      closeIconSize * heightScreenRatio,
      1
    );
  }

  update() {
    // this.time = this.world.time;
    // this.testUnis.uTime.value = this.time;
  }

  toProjectDetail() {
    this.scene.add(this.group);
  }

  toAbout() {
    this.scene.remove(this.group);
  }
}

/*
Bouncy Line: 
    const lineGeometry = new THREE.PlaneGeometry(1, 1, 100, 1);
    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
    });
    this.testLine = new THREE.Mesh(lineGeometry, lineMaterial);

    this.testLine.material.uniforms.uContact = { value: 0 };
    this.testLine.material.uniforms.uContactMade = { value: false };
    this.testLine.material.uniforms.uMouse = { value: new THREE.Vector2() };
    this.testLine.material.uniforms.uLength = { value: 1 };
    this.testLine.material.uniforms.uViewport = { value: new THREE.Vector2() };
    this.testLine.material.uniforms.uRelease = { value: false };
    this.testLine.material.uniforms.uTime = { value: 0 };
    this.testLine.material.uniforms.uReleaseTime = { value: 0 };
    this.testUnis = this.testLine.material.uniforms;


    onResize
    this.testLine.scale.set(600 * widthScreenRatio, 3 * heightScreenRatio, 1);
    this.testUnis.uLength.value = 600 / window.innerWidth;
    this.testUnis.uViewport.value.set(window.innerWidth, window.innerHeight);

    onPointermove
    this.raycaster.set(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(mouse.x, mouse.y, -1).normalize()
    );
    const [hit] = this.raycaster.intersectObject(this.testLine);
    if (this.testUnis.uContactMade.value) {
      this.testUnis.uMouse.value.set(mouse.x, mouse.y);
      if (
        new THREE.Vector2(this.testUnis.uContact.value, 0).distanceTo(mouse) >
        0.3
      ) {
        this.testUnis.uContactMade.value = false;
        this.testUnis.uRelease.value = true;
        this.testUnis.uReleaseTime.value = this.world.time;
        window.setTimeout(() => {
          this.testUnis.uRelease.value = false;
          this.testUnis.uMouse.value.x = this.testUnis.uContact.value;
          this.testUnis.uMouse.value.y = 0;
        }, 1000);
      }
    }
    if (hit && this.testUnis.uRelease.value === false) {
      if (!this.testUnis.uContactMade.value) {
        this.testUnis.uContact.value = hit.point.x;
        this.testUnis.uMouse.value.x = hit.point.x;
        this.testUnis.uContactMade.value = true;
        this.testUnis.uRelease.value = false;
      }
    }

    vertexShader:
    #define PI 3.1415

    uniform float uContact;
    uniform float uContactMade;
    uniform vec2 uMouse;
    uniform vec2 uViewport;
    uniform float uLength;
    uniform float uRelease;
    uniform float uTime;
    uniform float uReleaseTime;

    void main() {
        vec3 newPos = position;

        float phase = PI * 5.;
        float dist = position.x - uContact;
        float influence = sin(dist * phase) / (dist * phase);
        
        float scaleY = 3.; // line width from uniforms;
        float ampY = uMouse.y * uViewport.y * 0.5 / scaleY;
        float distortionY = influence * ampY;

        float scaleX = 600.;
        float ampX = (uMouse.x - uContact) * uViewport.x * 0.5 / scaleX;
        float distortionX = influence * ampX;

        if (uRelease > 0.5) {
            float timeElapsed = uTime - uReleaseTime;
            float decay = exp(-6.5 * timeElapsed) * sin(uTime * 100.);
            distortionX *= decay;
            distortionY *= decay;
        }

        newPos.y += distortionY;
        newPos.x += distortionX;

        gl_Position = modelMatrix * vec4(newPos, 1.);
    }
*/
