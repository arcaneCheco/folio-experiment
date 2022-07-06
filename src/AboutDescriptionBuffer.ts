import World from "./app2";
import * as THREE from "three";
import TextGeometryOGL from "./text/TextGeometryOGL";
import vertex from "./shaders/aboutDescriptionBuffer/vertex.glsl";
import fragment from "./shaders/aboutDescriptionBuffer/fragment.glsl";

export default class AboutDescriptionBuffer {
  world;
  font;
  descriptionText;
  textMaterial;
  textureLoader;
  constructor() {
    this.world = new World();
    this.textureLoader = this.world.textureLoader;

    this.font = this.world.resources.fontsData.audiowide;

    this.textMaterial = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        tMap: { value: this.textureLoader.load(this.font.url) },
      },
      transparent: true,
    });

    const descriptionTextGeometry = new TextGeometryOGL();
    descriptionTextGeometry.setText({
      font: this.font.data,
      text: `
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy
              text ever since the 1500s, when an unknown printer took a galley
              of type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into electronic
              typesetting, remaining essentially unchanged. It was popularised in
              the 1960s with the release of Letraset sheets containing Lorem
              Ipsum passages, and more recently with desktop publishing
              software like Aldus PageMaker including versions of Lorem Ipsum.
              `,
      lineWidth: 600 / 40,
      wordBreak: false,
    });
    this.descriptionText = new THREE.Mesh(
      descriptionTextGeometry,
      this.textMaterial
    );
  }
}
