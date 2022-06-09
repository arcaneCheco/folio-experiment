import World from "./app2";

export default class Navigation {
  constructor() {
    this.world = new World();
    this.screenTitles = this.world.screenTitles;
    this.titles = this.screenTitles.titles;
    this.nTitles = this.screenTitles.nTitles;
    this.scroll = this.screenTitles.scroll;
    this.navigationLine = document.querySelector(".navigation__line");
    this.markers = [];
    for (let i = 0; i < this.nTitles; i++) {
      const marker = document.createElement("div");
      this.markers.push(marker);
      marker.index = i;
      marker.scrollTarget = this.titles[i].scrollPosition;
      marker.classList.add("navigation__line__marker");
      this.navigationLine.appendChild(marker);
      marker.onpointerover = ({ target }) => {
        if (this.world.template !== "/projects") return;
        this.scroll.target = target.scrollTarget;
        this.screenTitles.updateActiveProject(target.index);
      };
    }
    this.homeButton = document.querySelector(".navigation__home");
    this.aboutButton = document.querySelector(".navigation__about");
    this.homeButton.onclick = () => this.world.onChange({ url: "/" });
    this.aboutButton.onclick = () => this.world.onChange({ url: "/about" });

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
      .on("change", ({ value }) => {
        this.world.onChange({ url: value });
      });
  }

  setOverlayNav() {
    this.topoverlay = document.querySelector(".overlayTop");
    this.topoverlay.onclick = () => {
      this.topoverlay.style.visibility = "hidden";
      this.world.onChange({ url: "/" });
    };
    this.bottomoverlay = document.querySelector(".overlayBottom");
    this.bottomoverlay.onclick = () => {
      this.bottomoverlay.style.visibility = "hidden";
      this.world.onChange({ url: "/about" });
    };
  }
}
