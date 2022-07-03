import World from "./app2";
import * as THREE from "three";

export default class Particles {
  world;
  geometry;
  count;
  material;
  scene;
  mesh;
  time: any;
  constructor() {
    this.world = new World();
    this.scene = this.world.scene;

    this.geometry = new THREE.BufferGeometry();
    this.count = 100;
    const posArray = new Float32Array(this.count * 3);
    const envSize = this.world.settings.environmentSize;
    for (let i = 0; i < this.count; i++) {
      const x = (Math.random() - 0.5) * envSize;
      const y = 3;
      const z = (Math.random() - 0.5) * envSize;
      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;
    }
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
            uniform float uTime;

            void main() {
                vec3 newPos = position;
                newPos.y += 20. * sin(fract(uTime*0.4) * 3.1415);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.);
                gl_PointSize = 4.;
            }
        `,
      fragmentShader: `
            void main() {
                gl_FragColor = vec4(1., 0., 0., 1.);
            }
        `,
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.mesh.layers.enable(1);
    this.scene.add(this.mesh);
  }

  update() {
    this.time = this.world.time;
    this.material.uniforms.uTime.value = this.time;
  }
}
