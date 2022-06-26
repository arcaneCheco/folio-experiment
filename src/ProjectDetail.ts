import World from "./app2";
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
    this.visitButton.mesh.add(this.visitButtonTouchPlane);
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

  onPointermove() {
    const [hit] = this.raycaster.intersectObject(this.visitButtonTouchPlane);
    if (hit) {
      this.hover = true;
    } else {
      this.hover = false;
    }
  }

  onPointerdown() {
    if (!this.hover) return;
    console.log(this.world.screenTitles.activeProject, "WEELLLEL");
    const url =
      this.world.resources.projectsData[this.world.screenTitles.activeProject]
        .link;
    window.open(url, "_blank").focus();
  }
}
