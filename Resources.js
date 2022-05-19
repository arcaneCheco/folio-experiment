import World from "./app2";
import { projects } from "./Assets";

export default class Resources {
  constructor() {
    this.world = new World();
    this.textureLoader = this.world.textureLoader;
    this.projects = projects;
    this.projects.forEach((project) => {
      project.texture = this.textureLoader.load(project.media);
    });
  }
}
