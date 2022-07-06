import World from "./app2";
import * as THREE from "three";
import TextGeometryOGL from "./text/TextGeometryOGL";
import textVertex from "./shaders/about/text/vertex.glsl";
import textFragment from "./shaders/about/text/fragment.glsl";
import lineVertex from "./shaders/about/line/vertex.glsl";
import lineFragment from "./shaders/about/line/fragment.glsl";
import descriptionPlaneVertex from "./shaders/about/descriptionPlane/vertex.glsl";
import descriptionPlaneFragment from "./shaders/about/descriptionPlane/fragment.glsl";
import iconVertex from "./shaders/about/icon/vertex.glsl";
import iconFragment from "./shaders/about/icon/fragment.glsl";

export default class About {
  world;
  textureLoader;
  font;
  projectsNavText: THREE.Mesh;
  group;
  scene;
  projectNavLine: THREE.Mesh;
  proejctNavGroup: THREE.Group;
  textMaterial: THREE.ShaderMaterial;
  titleMesh: THREE.Mesh;
  descMesh: THREE.Mesh;
  callToAction: THREE.Mesh;
  bottomGroup: THREE.Group;
  mailMesh: THREE.Mesh;
  cvText: THREE.Mesh;
  locationText: THREE.Mesh;
  descriptionText: THREE.Mesh;
  mailIconMesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  socialGithub: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  socialTwitter: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  socialLinkedIn: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  cvIcon: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  locationIcon: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  socialIconGroup: THREE.Group;
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.textureLoader = this.world.textureLoader;

    this.font = this.world.resources.fontsData.audiowide;

    this.setProjectsNav();
    this.setTitle();
    this.setDescription();
    this.setBottom();
    this.onResize();
  }

  setProjectsNav() {
    this.proejctNavGroup = new THREE.Group();
    this.group.add(this.proejctNavGroup);
    this.proejctNavGroup.position.x = -1 + 0.1;
    this.proejctNavGroup.position.y = 0.7;
    const textGeometry = new TextGeometryOGL();
    textGeometry.setText({
      font: this.font.data,
      text: "VIEW PROJECTS",
      align: "center",
    });

    this.textMaterial = new THREE.ShaderMaterial({
      vertexShader: textVertex,
      fragmentShader: textFragment,
      uniforms: {
        tMap: { value: this.textureLoader.load(this.font.url) },
      },
      transparent: true,
    });

    this.projectsNavText = new THREE.Mesh(textGeometry, this.textMaterial);
    this.projectsNavText.rotation.z = Math.PI / 2;
    this.proejctNavGroup.add(this.projectsNavText);

    const lineGeometry = new THREE.PlaneGeometry(1, 1);
    const lineMaterial = new THREE.ShaderMaterial({
      vertexShader: lineVertex,
      fragmentShader: lineFragment,
    });
    this.projectNavLine = new THREE.Mesh(lineGeometry, lineMaterial);
    this.proejctNavGroup.add(this.projectNavLine);
  }

  setTitle() {
    const titleGeometry = new TextGeometryOGL();
    titleGeometry.setText({
      font: this.font.data,
      text: "Thanks for stopping\nby!",
    });
    this.titleMesh = new THREE.Mesh(titleGeometry, this.textMaterial);
    this.group.add(this.titleMesh);
  }

  setDescription() {
    const descGeometry = new THREE.PlaneGeometry(1, 1);
    const descMaterial = new THREE.ShaderMaterial({
      vertexShader: descriptionPlaneVertex,
      fragmentShader: descriptionPlaneFragment,
      transparent: true,
      uniforms: {
        uTextMap: { value: this.textureLoader.load("descriptionMapTemp.png") },
      },
    });
    this.descMesh = new THREE.Mesh(descGeometry, descMaterial);
    this.group.add(this.descMesh);
  }

  setBottom() {
    this.bottomGroup = new THREE.Group();
    this.group.add(this.bottomGroup);
    this.bottomGroup.position.y = -0.8;

    // call to action
    const callToActionGeometry = new TextGeometryOGL();
    callToActionGeometry.setText({
      font: this.font.data,
      text: "Get in\nTouch",
      align: "center",
    });
    this.callToAction = new THREE.Mesh(callToActionGeometry, this.textMaterial);
    this.bottomGroup.add(this.callToAction);

    // mail
    const mailGeometry = new TextGeometryOGL();
    mailGeometry.setText({
      font: this.font.data,
      text: "sergio@azizi.dev",
    });
    this.mailMesh = new THREE.Mesh(mailGeometry, this.textMaterial);
    this.bottomGroup.add(this.mailMesh);

    const iconGeometry = new THREE.PlaneGeometry(1, 1);
    const iconMaterial = new THREE.ShaderMaterial({
      vertexShader: iconVertex,
      fragmentShader: iconFragment,
      uniforms: {
        uIcon: { value: null },
      },
      transparent: true,
    });

    this.mailIconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
    this.mailIconMesh.material.uniforms.uIcon.value =
      this.textureLoader.load("mailIcon.png");
    this.bottomGroup.add(this.mailIconMesh);

    // social Icons
    this.socialIconGroup = new THREE.Group();
    this.bottomGroup.add(this.socialIconGroup);

    this.socialGithub = new THREE.Mesh(iconGeometry, iconMaterial.clone());
    this.socialGithub.material.uniforms.uIcon.value =
      this.textureLoader.load("githubIcon.png");
    this.socialIconGroup.add(this.socialGithub);

    this.socialTwitter = new THREE.Mesh(iconGeometry, iconMaterial.clone());
    this.socialTwitter.material.uniforms.uIcon.value =
      this.textureLoader.load("twitterIcon.png");
    this.socialIconGroup.add(this.socialTwitter);

    this.socialLinkedIn = new THREE.Mesh(iconGeometry, iconMaterial.clone());
    this.socialLinkedIn.material.uniforms.uIcon.value =
      this.textureLoader.load("linkedInIcon.png");
    this.socialIconGroup.add(this.socialLinkedIn);

    this.cvIcon = new THREE.Mesh(iconGeometry, iconMaterial.clone());
    this.cvIcon.material.uniforms.uIcon.value =
      this.textureLoader.load("cvIcon.png");
    this.socialIconGroup.add(this.cvIcon);

    const cvGeometry = new TextGeometryOGL();
    cvGeometry.setText({
      font: this.font.data,
      text: "curriculum vitae",
    });
    this.cvText = new THREE.Mesh(cvGeometry, this.textMaterial);
    this.bottomGroup.add(this.cvText);

    this.locationIcon = new THREE.Mesh(iconGeometry, iconMaterial.clone());
    this.locationIcon.material.uniforms.uIcon.value =
      this.textureLoader.load("locationIcon.png");
    this.bottomGroup.add(this.locationIcon);

    const locationGeometry = new TextGeometryOGL();
    locationGeometry.setText({
      font: this.font.data,
      text: "London, UK",
    });
    this.locationText = new THREE.Mesh(locationGeometry, this.textMaterial);
    this.bottomGroup.add(this.locationText);
  }

  onResize() {
    const widthScreenRatio = 2 / window.innerWidth;
    const heightScreenRatio = 2 / window.innerHeight;

    this.projectsNavText.scale.setScalar(10 * heightScreenRatio);

    this.projectNavLine.scale.set(
      5 * widthScreenRatio,
      120 * heightScreenRatio,
      1
    );
    this.projectNavLine.position.x = (5 + 2) * heightScreenRatio;

    // title
    this.titleMesh.scale.setScalar(25 * heightScreenRatio);
    this.titleMesh.position.set(-0.8, 0.7, 0);

    // descriptionPlane
    this.descMesh.scale.set(600 * widthScreenRatio, 300 * heightScreenRatio, 1);
    this.descMesh.position.x = -1 + 0.5 * 600 * widthScreenRatio + 0.2;
    this.descMesh.position.y = 1 - 300 * heightScreenRatio * 0.5 - 0.5;

    // call-to-action
    this.callToAction.scale.setScalar(30 * heightScreenRatio);
    this.callToAction.position.x = -0.75;

    // mail mesh
    this.mailMesh.scale.setScalar(10 * heightScreenRatio);
    this.mailMesh.position.x = this.callToAction.position.x + 0.3;

    this.mailIconMesh.scale.set(
      20 * widthScreenRatio,
      20 * heightScreenRatio,
      1
    );
    this.mailIconMesh.position.x =
      this.mailMesh.position.x - 10 * widthScreenRatio;

    // socialIcons
    this.socialIconGroup.position.x = this.mailIconMesh.position.x + 0.5;
    const iconScaleWidth = 30 * widthScreenRatio;
    const iconScaleHeight = 30 * heightScreenRatio;

    this.socialGithub.scale.set(iconScaleWidth, iconScaleHeight, 1);
    this.socialGithub.position.set(0, -iconScaleHeight * 0.5, 0);

    this.socialTwitter.scale.set(iconScaleWidth, iconScaleHeight, 1);
    this.socialTwitter.position.set(
      -0.5 * iconScaleWidth,
      iconScaleHeight * 0.5,
      0
    );

    this.socialLinkedIn.scale.set(iconScaleWidth, iconScaleHeight, 1);
    this.socialLinkedIn.position.set(
      0.5 * iconScaleWidth,
      iconScaleHeight * 0.5,
      0
    );

    this.cvIcon.scale.set(iconScaleWidth, iconScaleHeight, 1);
    this.cvIcon.position.x = this.socialIconGroup.position.x + 0.15;

    this.cvText.scale.setScalar(10 * heightScreenRatio);
    this.cvText.position.x = this.cvIcon.position.x + 0.08;

    this.locationIcon.scale.set(iconScaleWidth, iconScaleHeight, 1);
    this.locationIcon.position.x = this.cvText.position.x + 0.45;

    this.locationText.scale.setScalar(10 * heightScreenRatio);
    this.locationText.position.x = this.locationIcon.position.x + 0.04;
  }
}
