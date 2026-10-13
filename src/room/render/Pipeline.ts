// The camera body and the lab. For each output frame:
//   for each of S sub-exposures (spread over the 180° shutter, jittered across the lens
//   aperture and the pixel): pose the world, shoot the light's depth, shoot the scene,
//   march the haze, add into the accumulation buffer.
// Averaging S exposures gives true motion blur, true thin-lens depth of field and
// anti-aliasing at once. Then bloom/halation and the film finish.
import * as THREE from 'three';
import {FPS, H, SHUTTER, W, vfovDeg} from '../config';
import {CamState} from '../rig';
import {EMIT_LAYER, Hall} from '../world/Hall';
import {ACCUM_FRAG, DOWN_FRAG, FINAL_FRAG, FS_VERT, UP_FRAG, VOLUME_FRAG} from './shaders';

const hdrTarget = (w: number, h: number, depth = false) => {
  const rt = new THREE.WebGLRenderTarget(w, h, {type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: depth, magFilter: THREE.LinearFilter, minFilter: THREE.LinearFilter});
  if (depth) {
    rt.depthTexture = new THREE.DepthTexture(w, h, THREE.FloatType);
    rt.depthTexture.format = THREE.DepthFormat;
  }
  return rt;
};

const halton = (i: number, b: number) => {
  let f = 1;
  let r = 0;
  while (i > 0) {
    f /= b;
    r += f * (i % b);
    i = Math.floor(i / b);
  }
  return r;
};

// concentric map: square → unit disk (uniform, low distortion)
const toDisk = (u: number, v: number): [number, number] => {
  const a = 2 * u - 1;
  const b = 2 * v - 1;
  if (a === 0 && b === 0) return [0, 0];
  if (Math.abs(a) > Math.abs(b)) {
    const r = a;
    const phi = (Math.PI / 4) * (b / a);
    return [r * Math.cos(phi), r * Math.sin(phi)];
  }
  const r = b;
  const phi = Math.PI / 2 - (Math.PI / 4) * (a / b);
  return [r * Math.cos(phi), r * Math.sin(phi)];
};

export type Look = {debug?: number; sunScatter?: number; warmScatter?: number; ambScatter?: number; exposure: number; bloom: number; grain: number; haze: number; hazeFalloff: number; bar: number};

export class Pipeline {
  readonly camera = new THREE.PerspectiveCamera(30, W / H, 0.05, 900);
  private lightCams: THREE.OrthographicCamera[] = [];
  private lightRTs: THREE.WebGLRenderTarget[] = [];
  private sceneRT = hdrTarget(W, H, true);
  private frameRT = hdrTarget(W, H);
  private accRT = hdrTarget(W, H);
  private mips: THREE.WebGLRenderTarget[] = [];
  private ups: THREE.WebGLRenderTarget[] = [];
  private quadScene = new THREE.Scene();
  private quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private quad: THREE.Mesh;
  private volume: THREE.ShaderMaterial;
  private accum: THREE.ShaderMaterial;
  private down: THREE.ShaderMaterial;
  private up: THREE.ShaderMaterial;
  private final: THREE.ShaderMaterial;
  private black = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  private depthOnly = new THREE.MeshBasicMaterial({colorWrite: false});

  constructor(private gl: THREE.WebGLRenderer, private hall: Hall) {
    this.camera.layers.enable(EMIT_LAYER);
    hall.buildEnv(gl);
    this.black.needsUpdate = true;
    // one depth map per light whose shafts the haze shows, framed like its shadow camera
    for (const light of hall.volumeLights) {
      const rt = new THREE.WebGLRenderTarget(2048, 2048, {depthBuffer: true});
      rt.depthTexture = new THREE.DepthTexture(2048, 2048, THREE.FloatType);
      const sc = light.shadow.camera as THREE.OrthographicCamera;
      const cam = new THREE.OrthographicCamera(sc.left, sc.right, sc.top, sc.bottom, sc.near, sc.far);
      cam.position.copy(light.position);
      cam.lookAt(light.target.position);
      cam.updateProjectionMatrix();
      cam.updateMatrixWorld();
      cam.layers.set(0);
      this.lightCams.push(cam);
      this.lightRTs.push(rt);
    }

    let w = W >> 1;
    let h = H >> 1;
    for (let i = 0; i < 6; i++) {
      this.mips.push(hdrTarget(w, h));
      this.ups.push(hdrTarget(w, h));
      w = Math.max(w >> 1, 1);
      h = Math.max(h >> 1, 1);
    }
    const mk = (frag: string, uniforms: Record<string, THREE.IUniform>) =>
      new THREE.ShaderMaterial({vertexShader: FS_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false});
    this.volume = mk(VOLUME_FRAG, {
      tColor: {value: null},
      tDepth: {value: null},
      tLightDepth0: {value: this.lightRTs[0].depthTexture},
      tLightDepth1: {value: this.lightRTs[1].depthTexture},
      uProjInv: {value: new THREE.Matrix4()},
      uCamWorld: {value: new THREE.Matrix4()},
      uCamPos: {value: new THREE.Vector3()},
      uLightVP0: {value: new THREE.Matrix4().multiplyMatrices(this.lightCams[0].projectionMatrix, this.lightCams[0].matrixWorldInverse)},
      uLightVP1: {value: new THREE.Matrix4().multiplyMatrices(this.lightCams[1].projectionMatrix, this.lightCams[1].matrixWorldInverse)},
      uSunDir0: {value: hall.volumeLights[0].target.position.clone().sub(hall.volumeLights[0].position).normalize()},
      uSunDir1: {value: hall.volumeLights[1].target.position.clone().sub(hall.volumeLights[1].position).normalize()},
      uSunCol0: {value: new THREE.Color()},
      uSunCol1: {value: new THREE.Color()},
      uAmbCol: {value: new THREE.Color(0.05, 0.062, 0.078)},
      uDensity: {value: 0.02},
      uFalloff: {value: 38},
      uTime: {value: 0},
      uSeed: {value: 0},
      uLampPos: {value: hall.lampPos},
      uLampDir: {value: hall.lampDir},
      uLampCol: {value: new THREE.Color().copy(hall.lamp.color).multiplyScalar(hall.lamp.intensity * 0.8)},
      uMaxDist: {value: 170},
      uDebug: {value: 0},
    });
    this.accum = mk(ACCUM_FRAG, {tSrc: {value: null}, uWeight: {value: 1}});
    this.accum.transparent = true;
    this.accum.blending = THREE.CustomBlending;
    this.accum.blendSrc = THREE.OneFactor;
    this.accum.blendDst = THREE.OneFactor;
    this.accum.blendEquation = THREE.AddEquation;
    this.down = mk(DOWN_FRAG, {tSrc: {value: null}, uTexel: {value: new THREE.Vector2()}});
    this.up = mk(UP_FRAG, {tSrc: {value: null}, tPrev: {value: null}, uTexel: {value: new THREE.Vector2()}});
    this.final = mk(FINAL_FRAG, {
      tSrc: {value: this.accRT.texture},
      tBloom: {value: null},
      uExposure: {value: 1},
      uBloom: {value: 0.05},
      uGrain: {value: 0.03},
      uFrame: {value: 0},
      uBar: {value: 0},
      uRes: {value: new THREE.Vector2(W, H)},
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.accum);
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);
  }

  private pass(mat: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) {
    this.quad.material = mat;
    this.gl.setRenderTarget(target);
    this.gl.render(this.quadScene, this.quadCam);
  }

  // place the physical camera: lens offset (dx, dy) on the aperture, pixel jitter (jx, jy)
  private shoot(cs: CamState, lens: [number, number], jitter: [number, number]) {
    const c = this.camera;
    c.fov = vfovDeg(cs.focalMm);
    c.aspect = W / H;
    c.position.set(...cs.pos);
    c.up.set(0, 1, 0);
    c.lookAt(...cs.target);
    if (cs.rollDeg) c.rotateZ((cs.rollDeg * Math.PI) / 180);
    c.updateProjectionMatrix();
    // thin lens: move the entrance pupil within the aperture and shear the frustum so the
    // focus plane stays put. Aperture diameter = f / N.
    const apertureM = cs.focalMm / cs.fstop / 1000;
    const ox = lens[0] * apertureM * 0.5;
    const oy = lens[1] * apertureM * 0.5;
    c.translateX(ox);
    c.translateY(oy);
    c.updateMatrixWorld();
    const P = c.projectionMatrix.elements;
    P[8] += -(P[0] * ox) / cs.focusDist + (2 * jitter[0]) / W;
    P[9] += -(P[5] * oy) / cs.focusDist + (2 * jitter[1]) / H;
    c.projectionMatrixInverse.copy(c.projectionMatrix).invert();
  }

  render(t: number, frame: number, rig: (ts: number) => CamState, samples: number, look: Look) {
    const gl = this.gl;
    gl.autoClear = false;
    gl.shadowMap.autoUpdate = false;
    gl.setClearColor(0x000000, 1);
    gl.setRenderTarget(this.accRT);
    gl.clear(true, true, true);
    const v = this.volume.uniforms;
    v.uDensity.value = look.haze;
    v.uFalloff.value = look.hazeFalloff;
    v.uDebug.value = look.debug ?? 0;
    v.uAmbCol.value.setRGB(0.05, 0.062, 0.078).multiplyScalar(look.ambScatter ?? 1);
    // decorrelate the sequences between frames
    const rot = (frame * 0.7548776662) % 1;
    for (let s = 0; s < samples; s++) {
      const ts = t + (((s + 0.5) / samples + rot / samples - 0.5) * SHUTTER) / FPS;
      this.hall.update(ts, t);
      const cs = rig(ts);
      const vl = this.hall.volumeLights;
      v.uSunCol0.value.copy(vl[0].color).multiplyScalar(vl[0].intensity * (look.sunScatter ?? 1));
      v.uSunCol1.value.copy(vl[1].color).multiplyScalar(vl[1].intensity * (look.sunScatter ?? 1) * (look.warmScatter ?? 1));
      const lens = toDisk((halton(s + 1, 2) + rot) % 1, (halton(s + 1, 3) + rot * 0.5) % 1);
      const jit: [number, number] = [halton(s + 1, 5) - 0.5, halton(s + 1, 7) - 0.5];
      this.shoot(cs, lens, jit);

      // light depth (occluders only), then the scene with three's own lighting and shadows
      this.hall.scene.overrideMaterial = this.depthOnly;
      for (let i = 0; i < this.lightCams.length; i++) {
        if (i > 0 && vl[i].intensity <= 0) continue;
        gl.setRenderTarget(this.lightRTs[i]);
        gl.clear(true, true, true);
        gl.render(this.hall.scene, this.lightCams[i]);
      }
      this.hall.scene.overrideMaterial = null;
      gl.shadowMap.needsUpdate = s === 0;
      gl.setRenderTarget(this.sceneRT);
      gl.clear(true, true, true);
      gl.render(this.hall.scene, this.camera);

      v.tColor.value = this.sceneRT.texture;
      v.tDepth.value = this.sceneRT.depthTexture;
      v.uProjInv.value.copy(this.camera.projectionMatrixInverse);
      v.uCamWorld.value.copy(this.camera.matrixWorld);
      v.uCamPos.value.setFromMatrixPosition(this.camera.matrixWorld);
      v.uTime.value = ts;
      v.uSeed.value = (s * 0.618034 + rot) % 1;
      this.pass(this.volume, this.frameRT);

      this.accum.uniforms.tSrc.value = this.frameRT.texture;
      this.accum.uniforms.uWeight.value = 1 / samples;
      this.pass(this.accum, this.accRT);
    }

    // bloom chain
    let src: THREE.Texture = this.accRT.texture;
    let sw = W;
    let sh = H;
    for (const m of this.mips) {
      this.down.uniforms.tSrc.value = src;
      this.down.uniforms.uTexel.value.set(0.5 / sw, 0.5 / sh);
      this.pass(this.down, m);
      src = m.texture;
      sw = m.width;
      sh = m.height;
    }
    let prev: THREE.Texture = this.black;
    for (let i = this.mips.length - 1; i >= 0; i--) {
      const m = this.mips[i];
      this.up.uniforms.tSrc.value = m.texture;
      this.up.uniforms.tPrev.value = prev;
      this.up.uniforms.uTexel.value.set(0.5 / m.width, 0.5 / m.height);
      this.pass(this.up, this.ups[i]);
      prev = this.ups[i].texture;
    }

    const f = this.final.uniforms;
    f.tBloom.value = prev;
    f.uExposure.value = look.exposure;
    f.uBloom.value = look.bloom / this.mips.length;
    f.uGrain.value = look.grain;
    f.uFrame.value = frame;
    f.uBar.value = look.bar;
    this.pass(this.final, null);
  }
}

