import World from "./app2";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { LuminosityShader } from "three/examples/jsm/shaders/LuminosityShader";
import finalEffectFragment from "./shaders/post/finalEffect.glsl";

export default class SelectiveBloom {
  world: World;
  constructor() {
    this.world = new World();
    this.setSelectiveBloom();
  }

  setSelectiveBloom() {
    const BLOOM_SCENE = 1;
    this.world.bloomLayer = new THREE.Layers();
    this.world.bloomLayer.set(BLOOM_SCENE);
    this.world.faScreen.mesh.layers.enable(BLOOM_SCENE);
    // this.screenTitles.group.layers.enable(BLOOM_SCENE);
    // this.screenTitles.titles.map((mesh) => mesh.layers.enable(BLOOM_SCENE));

    // render-pass
    this.world.renderPass = new RenderPass(this.world.scene, this.world.camera);
    // bloom
    this.world.bloomComposer = new EffectComposer(this.world.renderer);
    this.world.bloomComposer.renderToScreen = false;
    this.world.bloomComposer.addPass(this.world.renderPass);
    const res = 0.5;
    this.world.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(100, 100),
      1,
      0,
      0
    );
    this.world.bloomPass.threshold = 0;
    this.world.bloomPass.strength = 4;
    this.world.bloomPass.radius = 0;
    this.world.bloomPass.needsSwap = true;
    this.world.exposure = 0;
    this.world.bloomComposer.addPass(this.world.bloomPass);
    this.world.bloomComposer.setSize(
      window.innerWidth * res,
      window.innerHeight * res
    );

    this.world.debug.addInput(this.world.bloomPass, "strength", {
      min: 0,
      max: 6,
      step: 0.01,
    });
    this.world.debug.addInput(this.world.bloomPass, "threshold", {
      min: 0,
      max: 1,
      step: 0.01,
    });
    this.world.debug.addInput(this.world.bloomPass, "radius", {
      min: 0,
      max: 50,
      step: 0.01,
    });
    this.world.debug
      .addInput(this.world, "exposure", {
        min: 0.1,
        max: 6,
        step: 0.001,
      })
      .on(
        "change",
        () =>
          (this.world.renderer.toneMappingExposure = Math.pow(
            this.world.exposure,
            4.0
          ))
      );

    const lumPass = new ShaderPass(LuminosityShader, "tDiffuse");
    // this.bloomComposer.addPass(lumPass);

    // probably need blending or blur to make this work
    const customBloomEffect = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        lightPos: { value: new THREE.Vector2(0.5, 0.5) },
        fExposure: { value: 10 },
        fDecay: { value: 0.3 },
        fDensity: { value: 0.6 },
        fWeight: { value: 1.5 },
        fClamp: { value: 10 },
      },
      vertexShader: `
          varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,
      fragmentShader: `
            uniform vec2 lightPos;
            uniform float fExposure;
            uniform float fDecay;
            uniform float fDensity;
            uniform float fWeight;
            uniform float fClamp;
            uniform sampler2D tDiffuse;
            varying vec2 vUv;
    
            const int iSamples = 20;
    
            void main() {
              vec2 deltaTextCoord = vUv - lightPos;
              deltaTextCoord *= 1.0  / float(iSamples) * fDensity;
              vec2 coord = vUv;
          
              float illuminationDecay = 1.0;
              vec4 color = vec4(0.0);
          
              for (int i = 0; i < iSamples; i++) {
                  coord -= deltaTextCoord;
                  vec4 texel = texture2D(tDiffuse, coord);
                  texel *= illuminationDecay * fWeight;
          
                  color += texel;
                  illuminationDecay *= fDecay;
              }
          
              color *= fExposure;
              color = clamp(color, 0.0, fClamp);
              gl_FragColor = color;
            }
          `,
      defines: {},
      depthTest: true,
      depthWrite: true,
    });
    const customBloomPass = new ShaderPass(customBloomEffect, "tDiffuse");
    // this.bloomComposer.addPass(customBloomPass);

    /////////
    // this.textComopser = new EffectComposer(this.renderer)
    // this.filmPass = new FilmPass();
    // this.textComopser.addPass(this.renderPass)
    // this.textComopser.addPass(this.filmPass)
    // this.bloomComposer.addPass(this.filmPass);
    /////////

    // final
    this.world.finalComposer = new EffectComposer(this.world.renderer);
    this.world.finalComposer.setSize(window.innerWidth, window.innerHeight);
    this.world.finalComposer.addPass(this.world.renderPass);

    this.world.finalEffect = new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: this.world.bloomComposer.renderTarget2.texture },
        uTime: { value: 0 },
      },
      vertexShader: `
          varying vec2 vUv;
    
                void main() {
    
                    vUv = uv;
    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
                }`,
      fragmentShader: finalEffectFragment,
      defines: {},
    });

    const bokehPass = new BokehPass(this.world.scene, this.world.camera, {
      focus: 2,
      maxblur: 0.005,
      width: window.innerWidth,
      height: window.innerHeight,
      aperture: 1,
    });

    const finalPass = new ShaderPass(this.world.finalEffect, "baseTexture");
    finalPass.needsSwap = true;
    this.world.finalComposer.addPass(finalPass);
    // this.finalComposer.addPass(bokehPass);
  }
}
