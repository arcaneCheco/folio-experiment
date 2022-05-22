import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector";
import { BufferTexture } from "./BufferTexture";
import WaterRippleBuffer from "./WaterRippleBuffer";
import f from "./fragment.glsl";
import v from "./vertex.glsl";
import World from "./app2";
import ReflectionBuffer from "./ReflectionBuffer";

export class Water {
  constructor() {
    this.world = new World();
    this.renderer = this.world.renderer;
    this.camera = this.world.camera;
    this.scene = this.world.scene;

    this.buffer = new WaterRippleBuffer();

    const g = new THREE.PlaneGeometry(1, 1, 100, 100);

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
         varying vec2 vUv;
              uniform sampler2D tReflectionMap;
              varying vec4 vCoord;`
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <encodings_fragment>",
        `#include <encodings_fragment>
                vec3 coord = vCoord.xyz / vCoord.w;
                vec2 uv = coord.xy + coord.z * (vNormal.xz) * 0.02;
                vec4 texR = texture2D(tReflectionMap, vec2( 1.0 - uv.x, uv.y ) );
                gl_FragColor *= texR;
                float mask = step(length(vUv - vec2(0.5)), 0.5);
                float disk = length(vUv - vec2(0.5));
                if (disk > 0.5) discard;
                // gl_FragColor.a *= mask;`
      );
    };

    // this.mat = new THREE.MeshPhongMaterial({
    //   color: new THREE.Color("ff2222"),
    // });

    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y += 1;
    this.scene.add(this.mesh);

    this.reflector = new ReflectionBuffer(g, this.mat, this.mesh);

    this.mat.uniforms.tReflectionMap.value = this.reflector.output;
    this.mat.uniforms["textureMatrix"].value = this.reflector.textureMatrix;

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
    this.reflector.onResize();
    this.t.scale.set(this.world.viewport.x, this.world.viewport.x, 1);

    this.buffer.resize();
  }

  update(delta) {
    this.reflector.update();
    this.buffer.updateValues(delta);
    this.buffer.update();
  }
}
