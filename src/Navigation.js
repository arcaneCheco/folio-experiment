import World from "./app2";

export default class Navigation {
  constructor() {
    this.world = new World();
    this.titles = this.world.screenTitles.titles;
    this.nTitles = this.world.screenTitles.nTitles;
    this.scroll = this.world.screenTitles.scroll;
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
        this.scroll.target = target.scrollTarget;
      };
    }
    this.homeButton = document.querySelector(".navigation__home");
    this.aboutButton = document.querySelector(".navigation__about");
    this.homeButton.onclick = () => this.world.onChange({ url: "/" });
    this.aboutButton.onclick = () => this.world.onChange({ url: "/about" });

    this.setDebug();
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
}
