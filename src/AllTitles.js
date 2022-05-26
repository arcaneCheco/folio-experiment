import * as THREE from "three";
import World from "./app2";
import MsdfTitle from "./MsdfTitle";
import { degToRad } from "three/src/math/MathUtils";

export default class AllTitles {
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;
    this.raycaster = this.world.raycaster;
    this.resources = this.world.resources;
    this.screen = this.world.screen;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.activeProject = 0;
    this.setMeshes();

    this.onOverTitle = () => {};
  }
  setMeshes() {
    this.resources.projects.forEach((project, i) => {
      project.mesh = new MsdfTitle(project.title).mesh;
      project.mesh.projectIndex = i;
      const yOffset = +i * 1;
      project.mesh.position.y = yOffset;
      this.group.add(project.mesh);
    });
  }

  onPointerover() {
    const intersectsTitles = this.raycaster.intersectObjects(
      this.resources.projects.map((project) => project.mesh)
    );
    if (intersectsTitles.length) {
      const index = intersectsTitles[0].object.projectIndex;

      if (this.activeProject === index) return;

      this.screen.material.uniforms.uTexture.value =
        this.resources.projects[index].texture;
      this.screen.textureAspect = this.resources.projects[index].imageAspect;

      this.resources.projects[index].mesh.material.uniforms.uColor.value.set(
        1,
        0,
        0
      );

      this.resources.projects[
        this.activeProject
      ].mesh.material.uniforms.uColor.value.set(1, 1, 0);

      this.activeProject = index;
    }
  }

  onResize() {
    this.distanceToCamera = this.world.dominantSize * 0.1;
    this.viewportDimensions = new THREE.Vector2();
    const h =
      2 * this.distanceToCamera * Math.tan(degToRad(this.world.camera.fov) / 2);
    const w = h * (this.world.resolutionX / this.world.resolutionY);
    this.viewportDimensions.set(w, h);

    this.group.position.set(
      this.viewportDimensions.x * 0.1,
      0,
      this.world.camera.position.z - this.distanceToCamera
    );
    // this.group.lookAt(this.world.camera.position);

    const s = 0.05;
    this.group.scale.set(
      this.viewportDimensions.x * s,
      this.viewportDimensions.x * s,
      1
    );

    // this.group.children.forEach((title, i) => {
    //   title.scale.set(
    //     this.world.viewport.x * 0.1,
    //     this.world.viewport.x * 0.1,
    //     1
    //   );
    //   const yOffset = i * this.world.viewport.x * 0.3;
    //   title.position.y = yOffset;
    // });
    // this.group.rotation.y = -0.3;
  }

  onWheel(deltaY) {
    this.group.position.y += deltaY * 0.1;
    // this.onOverTitle();
  }
}
