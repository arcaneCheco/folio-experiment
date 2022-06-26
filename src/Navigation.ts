import World, { Template } from "./app2";

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
  constructor() {
    this.world = new World();
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

    this.setDebug();

    this.setOverlayNav();
  }

  setDebug() {
    this.debug = this.world.debug.addFolder({
      title: "navigation",
      expanded: true,
    });
    this.debug
      .addBlade({
        view: "list",
        label: "route",
        options: [
          { text: "home", value: "/" },
          { text: "projects", value: "/projects" },
          { text: "elasticMesh", value: "/projects/elastic-mesh" },
          { text: "about", value: "/about" },
        ],
        value: "",
      })
      .on("change", ({ value }: any) => {
        // ignore for now, come back after defining types everywhere
        this.world.onChange({ template: value });
      });
  }

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
