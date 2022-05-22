import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector";
import { BufferTexture } from "./BufferTexture";
import WaterRippleBuffer from "./WaterRippleBuffer";
import f from "./fragment.glsl";
import v from "./vertex.glsl";
import World from "./app2";

export class Water {
  constructor() {
    this.world = new World();
    this.renderer = this.world.renderer;
    this.camera = this.world.camera;
    this.scene = this.world.scene;

    this.buffer = new WaterRippleBuffer();

    const g = new THREE.PlaneGeometry(1, 1, 600, 600);
    // const g = new THREE.PlaneGeometry(250, 250, 600, 600);
    // const g = new THREE.CircleGeometry(100, 500, 0, Math.PI * 2);

    this.mat = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.ShaderLib["phong"].uniforms,
        {
          heightmap: { value: null },
          u_buffer: { value: null },
        },
      ]),
      vertexShader: v,
      fragmentShader: THREE.ShaderChunk["meshphong_frag"],
    });
    this.mat.lights = true;

    // Material attributes from THREE.MeshPhongMaterial
    // this.mat.color = new THREE.Color(0xff0000);
    this.mat.color = new THREE.Color(0x0040c0);
    this.mat.color = new THREE.Color(0xffffff);
    this.mat.specular = new THREE.Color(0x11ffff);
    this.mat.shininess = 50;

    // Sets the uniforms with the material values
    this.mat.uniforms["diffuse"].value = this.mat.color;
    this.mat.uniforms["specular"].value = this.mat.specular;
    this.mat.uniforms["shininess"].value = Math.max(this.mat.shininess, 1e-4);
    this.mat.uniforms["opacity"].value = this.mat.opacity;
    this.mat.uniforms["tReflectionMap"] = { value: null };
    this.mat.uniforms["textureMatrix"] = { value: null };
    this.mat.uniforms["u_buffer"] = this.buffer.uniform;

    this.mat.onBeforeCompile = (shader) => {
      //   console.log(shader.fragmentShader);
      shader.fragmentShader = shader.fragmentShader.replace(
        "uniform float opacity;",
        `uniform float opacity;
              uniform sampler2D tReflectionMap;
              varying vec4 vCoord;`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <encodings_fragment>",
        `#include <encodings_fragment>
                vec3 coord = vCoord.xyz / vCoord.w;
                vec2 uv = coord.xy + coord.z * (vNormal.xz) * 0.02;
                vec4 texR = texture2D(tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );
                gl_FragColor *= texR;`
      );
    };

    // this.mat = new THREE.MeshPhongMaterial({
    //   color: new THREE.Color("ff2222"),
    // });

    this.reflector = new Reflector(g, {
      textureHeight: 1024,
      textureWidth: 1024,
      color: new THREE.Color(0xffffff),
      clipBias: 0.05,
    });
    console.log(this.reflector);
    this.reflector.rotation.x = -Math.PI / 2.0;
    this.reflector.position.y += 1;
    this.reflector.matrixAutoUpdate = false;
    this.reflector.updateMatrix();
    // this.scene.add(this.reflector);
    this.mat.uniforms.tReflectionMap.value =
      this.reflector.getRenderTarget().texture;

    const textureMatrix = new THREE.Matrix4();
    this.mat.uniforms["textureMatrix"].value = textureMatrix;

    this.updateReflector = () => {
      textureMatrix.set(
        0.5,
        0.0,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.0,
        0.5,
        0.5,
        0.0,
        0.0,
        0.0,
        1.0
      );

      textureMatrix.multiply(this.camera.projectionMatrix);
      textureMatrix.multiply(this.camera.matrixWorldInverse);
      textureMatrix.multiply(this.mesh.matrixWorld);

      //   this.mesh.visible = false;
      this.mat.uniforms["textureMatrix"].value = textureMatrix;
      this.reflector.matrixWorld.copy(this.mesh.matrixWorld);

      this.reflector.onBeforeRender(this.renderer, this.scene, this.camera);
      //   this.mesh.visible = true;
    };

    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y += 1;
    this.scene.add(this.mesh);

    this.t = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.t.rotation.x = -Math.PI / 2;
    this.t.position.y += 1;
    this.scene.add(this.t);
  }

  onResize() {
    this.mesh.scale.set(this.world.viewport.x, this.world.viewport.x, 1);
    this.reflector.scale.set(this.world.viewport.x, this.world.viewport.x, 1);
    this.t.scale.set(this.world.viewport.x, this.world.viewport.x, 1);

    this.buffer.resize();
  }
}
