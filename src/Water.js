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
    // this.setupSphereStuff();
    this.waterPosition = new THREE.Vector3(0, -0, 0);

    this.buffer = new WaterRippleBuffer();

    const geometry = new THREE.PlaneGeometry(1, 1, 600, 600);

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
    this.material.color = new THREE.Color(0xff0000);
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
                  //gl_FragColor *= texR;
                  gl_FragColor = mix( gl_FragColor, vec4( texR.rgb, 1.), texR.a * 0.3 );
                  //gl_FragColor += (1.-gl_FragColor.a) * vec4( texR.rgb, 1 ) *texR.a;
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
    // this.sphereDynamics();
  }

  setupSphereStuff() {
    this.dummySphere = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshBasicMaterial()
    );
    this.dummySphere.position.z = 30;
    this.dummySphere.userData.velocity = new THREE.Vector3();
    this.scene.add(this.dummySphere);
    this.sphereRT = new THREE.WebGLRenderTarget(4, 1, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: false,
    });
    this.waterNormal = new THREE.Vector3();
    this.sphereScene = new THREE.Scene();

    // Create a 4x1 pixel image and a render target (Uint8, 4 channels, 1 byte per channel) to read water height and orientation
    this.readWaterLevelImage = new Uint8Array(4 * 1 * 4);

    const g = new THREE.PlaneGeometry(2, 2);
    this.sphereRTmat = new THREE.ShaderMaterial({
      vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.);
      }
      `,
      fragmentShader: `
      uniform vec2 point1;

			uniform sampler2D levelTexture;

			// Integer to float conversion from https://stackoverflow.com/questions/17981163/webgl-read-pixels-from-floating-point-render-target

			float shift_right( float v, float amt ) {

				v = floor( v ) + 0.5;
				return floor( v / exp2( amt ) );

			}

			float shift_left( float v, float amt ) {

				return floor( v * exp2( amt ) + 0.5 );

			}

			float mask_last( float v, float bits ) {

				return mod( v, shift_left( 1.0, bits ) );

			}

			float extract_bits( float num, float from, float to ) {

				from = floor( from + 0.5 ); to = floor( to + 0.5 );
				return mask_last( shift_right( num, from ), to - from );

			}

			vec4 encode_float( float val ) {
				if ( val == 0.0 ) return vec4( 0, 0, 0, 0 );
				float sign = val > 0.0 ? 0.0 : 1.0;
				val = abs( val );
				float exponent = floor( log2( val ) );
				float biased_exponent = exponent + 127.0;
				float fraction = ( ( val / exp2( exponent ) ) - 1.0 ) * 8388608.0;
				float t = biased_exponent / 2.0;
				float last_bit_of_biased_exponent = fract( t ) * 2.0;
				float remaining_bits_of_biased_exponent = floor( t );
				float byte4 = extract_bits( fraction, 0.0, 8.0 ) / 255.0;
				float byte3 = extract_bits( fraction, 8.0, 16.0 ) / 255.0;
				float byte2 = ( last_bit_of_biased_exponent * 128.0 + extract_bits( fraction, 16.0, 23.0 ) ) / 255.0;
				float byte1 = ( sign * 128.0 + remaining_bits_of_biased_exponent ) / 255.0;
				return vec4( byte4, byte3, byte2, byte1 );
			}

			void main()	{

				// vec2 cellSize = 1.0 / resolution.xy;
				vec2 cellSize = vec2(0.0001);

				float waterLevel = texture2D( levelTexture, point1 ).x;

				vec2 normal = vec2(
					( texture2D( levelTexture, point1 + vec2( - cellSize.x, 0 ) ).x - texture2D( levelTexture, point1 + vec2( cellSize.x, 0 ) ).x ),
					( texture2D( levelTexture, point1 + vec2( 0, - cellSize.y ) ).x - texture2D( levelTexture, point1 + vec2( 0, cellSize.y ) ).x ));

				if ( gl_FragCoord.x < 1.5 ) {

					gl_FragColor = encode_float( waterLevel );

				} else if ( gl_FragCoord.x < 2.5 ) {

					gl_FragColor = encode_float( normal.x );

				} else if ( gl_FragCoord.x < 3.5 ) {

					gl_FragColor = encode_float( normal.y );

				} else {

					gl_FragColor = encode_float( 0.0 );

				}

			}
      `,
      uniforms: {
        levelTexture: { value: null },
        point1: { value: new THREE.Vector2() },
      },
    });
    this.calcMesh = new THREE.Mesh(g, this.sphereRTmat);
    this.sphereScene.add(this.calcMesh);
  }

  sphereDynamics() {
    this.sphereRTmat.uniforms["levelTexture"].value = this.buffer.uniform.value;

    let sphere = this.dummySphere;

    // Read water level and orientation
    const u = (0.5 * sphere.position.x) / this.mesh.scale.x + 0.5;
    const v = 1 - ((0.5 * sphere.position.z) / this.mesh.scale.y + 0.5);
    this.sphereRTmat.uniforms["point1"].value.set(u, v);
    this.world.renderer.setRenderTarget(this.sphereRT);
    this.world.renderer.render(this.sphereScene, this.world.camera);
    // this.world.renderer.setRenderTarget(null);

    this.world.renderer.readRenderTargetPixels(
      this.sphereRT,
      0,
      0,
      4,
      1,
      this.readWaterLevelImage
    );
    const pixels = new Float32Array(this.readWaterLevelImage.buffer);

    // Get orientation
    this.waterNormal.set(pixels[1], 0, -pixels[2]);

    const pos = sphere.position;

    // Set height
    pos.y = pixels[0] * 0.2;

    // Move sphere
    this.waterNormal.multiplyScalar(0.08);
    sphere.userData.velocity.add(this.waterNormal);
    sphere.userData.velocity.multiplyScalar(0.998);
    pos.add(sphere.userData.velocity);

    // if (pos.x < -this.mesh.scale.x) {
    //   pos.x = -this.mesh.scale.x + 0.001;
    //   sphere.userData.velocity.x *= -0.3;
    // } else if (pos.x > BOUNDS_HALF) {
    //   pos.x = BOUNDS_HALF - 0.001;
    //   sphere.userData.velocity.x *= -0.3;
    // }

    // if (pos.z < -BOUNDS_HALF) {
    //   pos.z = -BOUNDS_HALF + 0.001;
    //   sphere.userData.velocity.z *= -0.3;
    // } else if (pos.z > BOUNDS_HALF) {
    //   pos.z = BOUNDS_HALF - 0.001;
    //   sphere.userData.velocity.z *= -0.3;
    // }
  }
}
