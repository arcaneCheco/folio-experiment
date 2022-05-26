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
    this.waterPosition = new THREE.Vector3(0, -0, 0);

    this.buffer = new WaterRippleBuffer();

    const geometry = new THREE.PlaneGeometry(1, 1, 450, 450);

    this.setMaterial();

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.copy(this.waterPosition);
    this.scene.add(this.mesh);

    this.reflector = new ReflectionBuffer(geometry, this.material, this.mesh);

    this.material.uniforms.tReflectionMap.value = this.reflector.output;
    this.material.uniforms["textureMatrix"].value =
      this.reflector.textureMatrix;

    this.setRaycastPlane();
  }

  setMaterial() {
    // this.mat = new THREE.MeshPhongMaterial({
    //   color: new THREE.Color("ff2222"),
    // });
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.merge([
        THREE.ShaderLib["phong"].uniforms,
        {
          heightmap: { value: null },
          u_buffer: { value: null },
        },
      ]),
      vertexShader: v,
      fragmentShader: THREE.ShaderChunk["meshphong_frag"],
      //   wireframe: true,
    });
    this.material.lights = true;

    // Material attributes from THREE.MeshPhongMaterial
    // this.mat.color = new THREE.Color(0xff0000);
    this.material.color = new THREE.Color(0x0040c0);
    this.material.color = new THREE.Color(0xffffff);
    this.material.specular = new THREE.Color(0x11ffff);
    this.material.shininess = 50;

    // Sets the uniforms with the material values
    this.material.uniforms["diffuse"].value = this.material.color;
    this.material.uniforms["specular"].value = this.material.specular;
    this.material.uniforms["shininess"].value = Math.max(
      this.material.shininess,
      1e-4
    );
    this.material.uniforms["opacity"].value = this.material.opacity;
    this.material.uniforms["tReflectionMap"] = { value: null };
    this.material.uniforms["textureMatrix"] = { value: null };
    this.material.uniforms["u_buffer"] = this.buffer.uniform;

    this.material.onBeforeCompile = (shader) => {
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
                  float disk = length(vUv - vec2(0.5));
                  if (disk > 0.5) discard;`
      );
    };
  }

  setRaycastPlane() {
    this.t = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.t.rotation.x = -Math.PI / 2;
    this.t.position.copy(this.waterPosition);
    this.scene.add(this.t);
  }

  onResize() {
    const s = this.world.settings.environmentSize;
    this.mesh.scale.set(s, s, 1);
    this.t.scale.set(s, s, 1);
    this.reflector.onResize(s);

    this.buffer.resize(this.world.resolutionX, this.world.resolutionY);
  }

  update(delta) {
    this.reflector.update();
    this.buffer.updateValues(delta);
    this.buffer.update();
  }
}
