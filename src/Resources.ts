import World from "./app2";
import { EventEmitter } from "events";

declare global {
  interface Window {
    PROJECTS: any;
    FONTS: any;
  }
}

export default class Resources extends EventEmitter {
  world;
  textureLoader;
  projectsData;
  numAssets;
  loadedAssets;
  fontsData;
  constructor() {
    super();
    this.world = new World();
    this.textureLoader = this.world.textureLoader;
    this.projectsData = window.PROJECTS;
    this.numAssets = this.projectsData.length;
    this.loadedAssets = 0;
    this.load();

    this.fontsData = window.FONTS;

    this.world.debug
      .addButton({ title: "finish loading" })
      .on("click", () => this.emit("finsished loading"));
  }

  load() {
    this.projectsData.forEach((project: any) => {
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
      // window.setTimeout(() => {
      //   this.emit("finsished loading");
      // }, 500);
    }
  }
}
