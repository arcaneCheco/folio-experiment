import World from "./app2";
import { projects } from "./Assets";

export default class Resources {
  constructor() {
    this.world = new World();
    this.textureLoader = this.world.textureLoader;
    this.projects = projects;
    this.projects.forEach((project) => {
      this.textureLoader.load(project.media, (texture) => {
        project.texture = texture;
        const data = texture.source.data;
        project.imageAspect = data.width / data.height;
      });
    });
  }
}
