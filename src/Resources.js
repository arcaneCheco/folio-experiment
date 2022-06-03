import World from "./app2";
import EventEmitter from "events";

export default class Resources extends EventEmitter {
  constructor() {
    super();
    this.world = new World();
    this.textureLoader = this.world.textureLoader;
    this.projectsData = window.PROJECTS;
    this.numAssets = this.projectsData.length;
    this.loadedAssets = 0;
    this.load();
  }

  load() {
    this.projectsData.forEach((project) => {
      this.textureLoader.load(project.link, (texture) => {
        project.texture = texture;
        this.onAssetLoaded();
      });
    });
  }

  onAssetLoaded() {
    this.loadedAssets++;
    const progress = this.loadedAssets / this.numAssets;
    console.log(progress);
    if (progress === 1) {
      window.setTimeout(() => {
        this.emit("finsished loading");
      }, 1000);
    }
  }
}
