import World, { Template } from "./app2";
import * as THREE from "three";
import VisitButton from "./VisitButton";

export default class ProjectDetail {
  world: World;
  scene;
  raycaster;
  visitButton;
  group;
  visitButtonTouchPlane;
  hover: any;
  nextButton: any;
  prevButton: any;
  closeButton: any;
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;

    this.visitButton = new VisitButton();
    this.group = new THREE.Group();
    this.group.position.z = 25;
    this.group.position.y = 10;
    this.group.add(this.visitButton.mesh);
    this.visitButtonTouchPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(this.visitButton.geometry.text.width, 1),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    // this.visitButtonTouchPlane.renderOrder = 1000;
    this.visitButton.mesh.add(this.visitButtonTouchPlane);

    this.setNavButton();
  }

  show() {
    this.scene.add(this.group);
    this.world.faScreen.updateActiveProject(
      this.world.screenTitles.activeProject
    );
  }

  hide() {
    this.scene.remove(this.group);
  }

  setNavButton() {
    this.nextButton = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshBasicMaterial()
    );
    this.prevButton = this.nextButton.clone();
    this.nextButton.position.set(20, 0, 0);
    this.prevButton.position.set(-20, 0, 0);
    this.group.add(this.nextButton);
    this.group.add(this.prevButton);

    this.closeButton = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 3),
      new THREE.MeshBasicMaterial()
    );
    this.closeButton.position.set(0, 20, 0);
    this.group.add(this.closeButton);
  }

  onPointermove() {
    const [hit] = this.raycaster.intersectObjects(this.group.children);
    if (hit) {
      document.body.style.cursor = "pointer";
      this.hover = true;
    } else {
      document.body.style.cursor = "";
      this.hover = false;
    }
  }

  onPointerdown() {
    if (!this.hover) return;
    const [hit] = this.raycaster.intersectObjects(this.group.children);
    if (hit?.object) {
      const object = hit.object;
      if (object === this.nextButton) {
        const activeProject = Math.min(
          this.world.screenTitles.activeProject + 1,
          this.world.resources.projectsData.length - 1
        );
        this.world.screenTitles.updateActiveProject(activeProject);
        this.world.onChange({ template: Template.ProjectDetail });
      } else if (object === this.prevButton) {
        const activeProject = Math.max(
          this.world.screenTitles.activeProject - 1,
          0
        );
        this.world.screenTitles.updateActiveProject(activeProject);
        this.world.onChange({ template: Template.ProjectDetail });
      } else if (object === this.closeButton) {
        this.world.onChange({ template: Template.Projects });
      } else if (object === this.visitButton.mesh) {
        const url =
          this.world.resources.projectsData[
            this.world.screenTitles.activeProject
          ].link;
        window.open(url, "_blank").focus();
      }
    }
  }
}
