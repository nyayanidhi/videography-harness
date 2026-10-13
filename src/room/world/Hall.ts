// The hall: a brutalist nave whose monoliths are stacked work, and whose back wall is the
// Rilin mark. Built once; update(t) poses everything for any (sub-frame) film time, so
// the renderer can sample time freely (motion blur) and every change is a function of t.
import * as THREE from 'three';
import {K} from '../config';
import {keyed} from '../rig';
import {
  columnDX,
  handHidden,
  FINANCE_STAND,
  ghostGlow,
  HANDOFF,
  laneGrow,
  laneLevel,
  LANES,
  panelState,
  personPose,
  PINGS,
  pingResolve,
  revealOf,
  SIDE_X,
  skyWarm,
  topSun,
  warmSun,
} from '../timeline';
import {DeskPanel, PANEL_H, PANEL_W} from './panel';
import {Person} from './person';
import {ATLAS_CELLS, PING_CELLS} from './textures';
import {rng} from './rng';
import {BACK_Z, COL_W, COLUMNS, DESK, FIGURE, LIGHT_POOLS, pingLevel, ROOF_Y, SKY_SIZE, SKYLIGHTS, SUN_DIR} from './layout';
import {MARK_PIECES, Poly} from './mark';

// Layer 1 = emitters: seen by the camera, invisible to the lights' depth passes.
export const EMIT_LAYER = 1;
const WALL_X = SIDE_X; // inner face of the side walls
const WARM_ELEV = (13 * Math.PI) / 180;
export const WARM_DIR: [number, number, number] = [0, -Math.sin(WARM_ELEV), Math.cos(WARM_ELEV)];

type Buf = {p: number[]; n: number[]; uv: number[]; i: number[]};
const face = (b: Buf, c: number[], n: number[], r: number[], u: number[], hw: number, hh: number, uv: [number, number, number, number]) => {
  const base = b.p.length / 3;
  const corner = (sr: number, su: number) => [0, 1, 2].map((k) => c[k] + sr * hw * r[k] + su * hh * u[k]);
  for (const [sr, su, uu, vv] of [
    [-1, -1, uv[0], uv[1]],
    [1, -1, uv[2], uv[1]],
    [1, 1, uv[2], uv[3]],
    [-1, 1, uv[0], uv[3]],
  ] as const) {
    b.p.push(...corner(sr, su));
    b.n.push(...n);
    b.uv.push(uu, vv);
  }
  b.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
};

const cellRect = (r: () => number, wm: number, hm: number): [number, number, number, number] => {
  const cx = Math.floor(r() * ATLAS_CELLS);
  const cy = Math.floor(r() * ATLAS_CELLS);
  const fw = Math.min(wm / COL_W, 1);
  const fh = Math.min(hm / COL_W, 1);
  const u0 = r() * (1 - fw);
  const v0 = r() * (1 - fh);
  const vb = 1 - (cy + 1) / ATLAS_CELLS;
  return [(cx + u0) / ATLAS_CELLS, vb + v0 / ATLAS_CELLS, (cx + u0 + fw) / ATLAS_CELLS, vb + (v0 + fh) / ATLAS_CELLS];
};

const box = (b: Buf, r: () => number, cx: number, cy: number, cz: number, w: number, h: number, d: number) => {
  const X = [1, 0, 0];
  const Y = [0, 1, 0];
  const Z = [0, 0, 1];
  const neg = (v: number[]) => v.map((x) => -x);
  face(b, [cx, cy, cz + d / 2], Z, X, Y, w / 2, h / 2, cellRect(r, w, h));
  face(b, [cx, cy, cz - d / 2], neg(Z), neg(X), Y, w / 2, h / 2, cellRect(r, w, h));
  face(b, [cx + w / 2, cy, cz], X, neg(Z), Y, d / 2, h / 2, cellRect(r, d, h));
  face(b, [cx - w / 2, cy, cz], neg(X), Z, Y, d / 2, h / 2, cellRect(r, d, h));
  face(b, [cx, cy + h / 2, cz], Y, X, neg(Z), w / 2, d / 2, cellRect(r, w, d));
  face(b, [cx, cy - h / 2, cz], neg(Y), X, Z, w / 2, d / 2, cellRect(r, w, d));
};

const toGeo = (b: Buf) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
  g.setIndex(b.i);
  return g;
};

const lin = (rgb: readonly number[], k: number) => new THREE.Color(rgb[0] * k, rgb[1] * k, rgb[2] * k);
const WARM = [1.0, 0.8, 0.58] as const;
const shapeOf = (poly: Poly) => new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x, y)));
const pathOf = (poly: Poly) => new THREE.Path(poly.map(([x, y]) => new THREE.Vector2(x, y)));
const ease = (x: number) => {
  const c = Math.min(Math.max(x, 0), 1);
  return c * c * c * (c * (c * 6 - 15) + 10);
};

export type HallAssets = {atlas: THREE.Texture; concrete: THREE.Texture; pingAtlas: THREE.Texture; fonts: {text: string; mono: string}};

export class Hall {
  scene = new THREE.Scene();
  sun: THREE.DirectionalLight;
  warm: THREE.DirectionalLight;
  lamp: THREE.SpotLight;
  lampPos = new THREE.Vector3();
  lampDir = new THREE.Vector3();
  person: Person;
  finance: Person;
  private cols: {mesh: THREE.Mesh; id: number}[] = [];
  private pings: THREE.InstancedMesh;
  private lanes: THREE.InstancedMesh;
  private pulse: THREE.Mesh;
  private markPanels: {mesh: THREE.Mesh; idx: number; dir: number; width: number}[] = [];
  private ghostMat: THREE.MeshBasicMaterial;
  private skyMat: THREE.MeshBasicMaterial;
  private desk: DeskPanel;
  private deskMat: THREE.MeshStandardMaterial;
  private deskGlow: THREE.PointLight;
  private chairs: THREE.Group[] = [];
  private tmpM = new THREE.Matrix4();
  private tmpQ = new THREE.Quaternion();
  private tmpC = new THREE.Color();

  constructor(tex: HallAssets) {
    const s = this.scene;
    const r = rng(31);

    // ── floor: polished concrete, one texture tile per 6 m bay
    tex.concrete.wrapS = tex.concrete.wrapT = THREE.RepeatWrapping;
    const floorTex = tex.concrete.clone();
    floorTex.repeat.set(800 / 6, 800 / 6);
    floorTex.needsUpdate = true;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), new THREE.MeshStandardMaterial({map: floorTex, roughness: 0.3, metalness: 0}));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    s.add(floor);

    // ── monoliths: stacked blocks of work, one mesh each so they can move
    const colMat = new THREE.MeshStandardMaterial({map: tex.atlas, roughness: 0.86, metalness: 0});
    for (const c of COLUMNS) {
      const b: Buf = {p: [], n: [], uv: [], i: []};
      let y = 0;
      while (y < ROOF_Y + 2) {
        const h = 0.8 + r() * 2.0;
        const sw = (r() - 0.5) * 0.16;
        box(b, r, (r() - 0.5) * 0.24, y + h / 2, (r() - 0.5) * 0.24, c.w + sw, h - 0.018, c.d + sw);
        y += h;
      }
      const m = new THREE.Mesh(toGeo(b), colMat);
      m.position.set(c.x, 0, c.z);
      m.castShadow = m.receiveShadow = true;
      s.add(m);
      this.cols.push({mesh: m, id: c.id});
    }

    // ── architecture
    const shell = new THREE.MeshStandardMaterial({color: new THREE.Color(0.11, 0.108, 0.1), roughness: 0.92});
    const slab = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), shell);
      m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true;
      s.add(m);
      return m;
    };
    const wallH = ROOF_Y + 4;
    // back wall: the mark's pieces are its windows
    {
      const sh = new THREE.Shape([new THREE.Vector2(-WALL_X - 3, -1), new THREE.Vector2(WALL_X + 3, -1), new THREE.Vector2(WALL_X + 3, wallH), new THREE.Vector2(-WALL_X - 3, wallH)]);
      for (const p of MARK_PIECES) sh.holes.push(pathOf(p.poly.map(([x, y]) => [x, Math.max(y, -0.5)] as [number, number])));
      const g = new THREE.ExtrudeGeometry(sh, {depth: 3, bevelEnabled: false, curveSegments: 1});
      const m = new THREE.Mesh(g, shell);
      m.position.z = BACK_Z - 3;
      m.castShadow = m.receiveShadow = true;
      s.add(m);
    }
    // the closed pieces: heavy panels that recess and slide away when the room opens
    this.ghostMat = new THREE.MeshBasicMaterial({color: lin(K.sky, 1)});
    MARK_PIECES.forEach((p, idx) => {
      if (idx === 0) return; // the centre pillar is open from the first frame
      if (p.ghost) {
        // frosted glass: diffuse daylight, no beam
        const g = new THREE.ExtrudeGeometry(shapeOf(p.poly), {depth: 0.25, bevelEnabled: false});
        const m = new THREE.Mesh(g, this.ghostMat);
        m.position.z = BACK_Z - 1.6;
        m.castShadow = true;
        s.add(m);
        return;
      }
      const g = new THREE.ExtrudeGeometry(shapeOf(p.poly), {depth: 1.2, bevelEnabled: false});
      const m = new THREE.Mesh(g, shell);
      m.position.z = BACK_Z - 1.6;
      m.castShadow = m.receiveShadow = true;
      s.add(m);
      this.markPanels.push({mesh: m, idx, dir: Math.sign(p.cx) || 1, width: p.maxX - p.minX});
    });
    // side walls with doorways: each lane of light ends at a door to another team's hall
    const doorZs = [...LANES.map((l) => ({z: l.z, side: Math.sign(l.x1)})), {z: HANDOFF.z, side: 1}];
    for (const side of [-1, 1]) {
      const zs = doorZs.filter((d) => d.side === side).map((d) => d.z);
      const z0 = BACK_Z - 3;
      const z1 = 220;
      const sh = new THREE.Shape([new THREE.Vector2(-z1, -1), new THREE.Vector2(-z0, -1), new THREE.Vector2(-z0, wallH), new THREE.Vector2(-z1, wallH)]);
      for (const z of zs) sh.holes.push(new THREE.Path([new THREE.Vector2(-z - 2.1, 0), new THREE.Vector2(-z + 2.1, 0), new THREE.Vector2(-z + 2.1, 7.4), new THREE.Vector2(-z - 2.1, 7.4)].reverse()));
      const g = new THREE.ExtrudeGeometry(sh, {depth: 3, bevelEnabled: false, curveSegments: 1});
      const m = new THREE.Mesh(g, shell);
      m.rotation.y = Math.PI / 2; // local x → world -z, local z → world x
      m.position.x = side > 0 ? WALL_X : -WALL_X - 3;
      m.castShadow = m.receiveShadow = true;
      s.add(m);
      // the lit rooms beyond
      for (const z of zs) {
        const glow = new THREE.Mesh(new THREE.PlaneGeometry(7, 9), new THREE.MeshBasicMaterial({color: lin(K.lamp, z === HANDOFF.z ? 0.55 : 0.6), side: THREE.DoubleSide}));
        glow.position.set(side * (WALL_X + 9), 4.5, z);
        glow.rotation.y = Math.PI / 2;
        glow.layers.set(EMIT_LAYER);
        s.add(glow);
      }
    }
    // roof: a 0.6 m slab pierced by square skylights
    {
      const X0 = -WALL_X - 3;
      const X1 = WALL_X + 3;
      const Z0 = BACK_Z - 3;
      const Z1 = 220;
      const holes = SKYLIGHTS.map(([x, z]) => ({x0: x - SKY_SIZE / 2, x1: x + SKY_SIZE / 2, z0: z - SKY_SIZE / 2, z1: z + SKY_SIZE / 2})).sort((p, q) => p.z0 - q.z0);
      const y = ROOF_Y + 0.3;
      let z = Z0;
      for (const h of holes) {
        if (h.z0 > z) slab(X1 - X0, 0.6, h.z0 - z, (X0 + X1) / 2, y, (z + h.z0) / 2);
        slab(h.x0 - X0, 0.6, SKY_SIZE, (X0 + h.x0) / 2, y, (h.z0 + h.z1) / 2);
        slab(X1 - h.x1, 0.6, SKY_SIZE, (h.x1 + X1) / 2, y, (h.z0 + h.z1) / 2);
        z = h.z1;
      }
      slab(X1 - X0, 0.6, Z1 - z, (X0 + X1) / 2, y, (z + Z1) / 2);
    }
    // the world beyond the wall: overcast, later warm low sun
    this.skyMat = new THREE.MeshBasicMaterial({color: lin(K.sky, 16), toneMapped: false});
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(900, 400), this.skyMat);
    sky.position.set(0, 80, BACK_Z - 60);
    sky.layers.set(EMIT_LAYER);
    s.add(sky);

    // ── light: cold top-light through the skylights; later a warm low sun through the mark
    this.sun = new THREE.DirectionalLight(lin(K.sky, 1), 9);
    const sd = new THREE.Vector3(...SUN_DIR);
    this.sun.position.copy(sd.clone().multiplyScalar(-220)).add(new THREE.Vector3(0, 0, -25));
    this.sun.target.position.set(0, 0, -25);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    Object.assign(this.sun.shadow.camera, {left: -110, right: 110, top: 140, bottom: -140, near: 1, far: 500});
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.04;
    s.add(this.sun, this.sun.target);

    this.warm = new THREE.DirectionalLight(lin(WARM, 1), 0);
    const wd = new THREE.Vector3(...WARM_DIR);
    this.warm.target.position.set(0, 18, -30);
    this.warm.position.copy(this.warm.target.position).addScaledVector(wd, -300);
    this.warm.castShadow = true;
    this.warm.shadow.mapSize.set(4096, 4096);
    Object.assign(this.warm.shadow.camera, {left: -80, right: 80, top: 60, bottom: -60, near: 1, far: 620});
    this.warm.shadow.bias = -0.0003;
    this.warm.shadow.normalBias = 0.05;
    s.add(this.warm, this.warm.target);

    for (const [x, z] of LIGHT_POOLS) {
      const b = new THREE.PointLight(new THREE.Color(0.86, 0.88, 0.9), 38, 40, 2);
      b.position.set(x, -0.05, z); // just under the floor plane: lights the monoliths, never glints
      s.add(b);
    }
    s.add(new THREE.HemisphereLight(new THREE.Color(0.2, 0.235, 0.29), new THREE.Color(0.07, 0.068, 0.062), 0.3));

    // ── furniture and people
    const ink = new THREE.MeshStandardMaterial({color: new THREE.Color(0.018, 0.019, 0.021), roughness: 0.82});
    const wood = new THREE.MeshStandardMaterial({color: new THREE.Color(0.06, 0.042, 0.03), roughness: 0.45});
    const paper = new THREE.MeshStandardMaterial({color: new THREE.Color(0.62, 0.6, 0.55), roughness: 0.9});
    const cloth = new THREE.MeshStandardMaterial({color: new THREE.Color(0.007, 0.0075, 0.009), roughness: 1, envMapIntensity: 0.25});
    const skin = new THREE.MeshStandardMaterial({color: new THREE.Color(0.16, 0.095, 0.065), roughness: 0.62, envMapIntensity: 0.3});
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = s) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true;
      parent.add(m);
      return m;
    };
    const station = (x: number, z: number, rotY: number) => {
      const g = new THREE.Group();
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      s.add(g);
      add(new THREE.BoxGeometry(1.6, 0.035, 0.78), wood, 0, DESK.top, -0.65, g);
      for (const [lx, lz] of [[-0.76, -0.35], [0.76, -0.35], [-0.76, 0.35], [0.76, 0.35]]) add(new THREE.BoxGeometry(0.03, DESK.top, 0.03), ink, lx, DESK.top / 2, -0.65 + lz, g);
      const chair = new THREE.Group();
      g.add(chair);
      add(new THREE.BoxGeometry(0.46, 0.04, 0.44), ink, 0, 0.46, 0, chair);
      for (const [cx2, cz2] of [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]]) add(new THREE.BoxGeometry(0.022, 0.46, 0.022), ink, cx2, 0.23, cz2, chair);
      const p = new Person(cloth, skin);
      g.add(p.root);
      return {group: g, person: p, chair};
    };
    const main = station(FIGURE.x, FIGURE.z, 0);
    this.person = main.person;
    this.chairs.push(main.chair);
    // paper on the desk: the work, at human scale
    let py = DESK.top + 0.02;
    for (let k = 0; k < 6; k++) {
      const h = 0.012 + r() * 0.03;
      add(new THREE.BoxGeometry(0.3, h, 0.22), paper, DESK.x + 0.52 + (r() - 0.5) * 0.03, py + h / 2, DESK.z - 0.12 + (r() - 0.5) * 0.03);
      py += h;
    }
    // lamp (architect type) and its warm spot
    const lx = DESK.x - 0.58;
    const lz = DESK.z - 0.2;
    const lampParts = [
      add(new THREE.CylinderGeometry(0.07, 0.08, 0.025, 24), ink, lx, DESK.top + 0.03, lz),
      add(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 8), ink, lx + 0.05, DESK.top + 0.23, lz),
      add(new THREE.CylinderGeometry(0.008, 0.008, 0.36, 8), ink, lx + 0.2, DESK.top + 0.45, lz),
      add(new THREE.ConeGeometry(0.085, 0.14, 24, 1, true), ink, lx + 0.34, DESK.top + 0.4, lz),
    ];
    lampParts[1].rotation.z = -0.25;
    lampParts[2].rotation.z = -1.2;
    lampParts[3].rotation.z = 0.55;
    for (const m of lampParts.slice(1)) m.castShadow = false; // the lamp never shadows its own pool
    this.lampPos.set(lx + 0.35, DESK.top + 0.36, lz);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), new THREE.MeshBasicMaterial({color: lin(K.lamp, 60), toneMapped: false}));
    bulb.position.copy(this.lampPos);
    bulb.layers.set(EMIT_LAYER);
    s.add(bulb);
    this.lamp = new THREE.SpotLight(lin(K.lamp, 1), 26, 14, 0.8, 0.7, 2);
    this.lamp.position.copy(this.lampPos);
    this.lamp.target.position.set(DESK.x + 0.05, DESK.top, DESK.z + 0.05);
    this.lampDir.copy(this.lamp.target.position).sub(this.lampPos).normalize();
    this.lamp.castShadow = true;
    this.lamp.shadow.mapSize.set(1024, 1024);
    this.lamp.shadow.bias = -0.0006;
    s.add(this.lamp, this.lamp.target);
    // the desk panel: a sheet of light
    this.desk = new DeskPanel(tex.fonts);
    // e-paper: lit by the lamp (so a hand's shadow can cross it), with a faint backlight
    this.deskMat = new THREE.MeshStandardMaterial({map: this.desk.texture, emissiveMap: this.desk.texture, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 0.3, roughness: 0.92, metalness: 0, envMapIntensity: 0});
    const dp = new THREE.Mesh(new THREE.PlaneGeometry(PANEL_W, PANEL_H), this.deskMat);
    dp.position.set(DESK.x + 0.12, DESK.top + 0.055, DESK.z + 0.15);
    dp.rotation.x = -Math.PI / 2 + 0.24;
    dp.receiveShadow = true;
    s.add(dp);
    add(new THREE.BoxGeometry(PANEL_W + 0.02, 0.012, PANEL_H + 0.02), ink, 0, 0, -0.008, dp).rotation.x = Math.PI / 2;
    this.deskGlow = new THREE.PointLight(new THREE.Color(0.95, 0.93, 0.86), 0, 3, 2);
    this.deskGlow.position.set(DESK.x + 0.12, DESK.top + 0.35, DESK.z + 0.2);
    s.add(this.deskGlow);

    // Finance, in the next hall: the hand-off arrives here
    const fin = station(WALL_X + 7, HANDOFF.z, Math.PI / 2);
    this.finance = fin.person;
    this.chairs.push(fin.chair);
    const fl = new THREE.PointLight(lin(K.lamp, 1), 30, 12, 2);
    fl.position.set(WALL_X + 6.2, 2.6, HANDOFF.z);
    s.add(fl);

    // ── pings: notification cards lighting up on the monoliths
    const pg = new THREE.PlaneGeometry(1.1, 0.6);
    const cells = new Float32Array(PINGS.length * 2);
    const pr = rng(99);
    for (let i = 0; i < PINGS.length; i++) {
      const k = Math.floor(pr() * PING_CELLS * PING_CELLS);
      cells[i * 2] = (k % PING_CELLS) / PING_CELLS;
      cells[i * 2 + 1] = 1 - (Math.floor(k / PING_CELLS) + 1) / PING_CELLS;
    }
    pg.setAttribute('cell', new THREE.InstancedBufferAttribute(cells, 2));
    const pmat = new THREE.MeshBasicMaterial({map: tex.pingAtlas, toneMapped: false, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false});
    pmat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec2 cell;')
        .replace('#include <uv_vertex>', `#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv = vMapUv * ${(1 / PING_CELLS).toFixed(4)} + cell;\n#endif`);
    };
    this.pings = new THREE.InstancedMesh(pg, pmat, PINGS.length);
    this.pings.layers.set(EMIT_LAYER);
    this.pings.frustumCulled = false;
    PINGS.forEach((_, i) => this.pings.setColorAt(i, new THREE.Color(0, 0, 0)));
    s.add(this.pings);

    // ── lanes of light on the floor
    const lg = new THREE.PlaneGeometry(1, 1);
    lg.rotateX(-Math.PI / 2);
    const lmat = new THREE.MeshBasicMaterial({color: 0xffffff, toneMapped: false, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false});
    this.lanes = new THREE.InstancedMesh(lg, lmat, LANES.length + 1);
    this.lanes.layers.set(EMIT_LAYER);
    this.lanes.frustumCulled = false;
    for (let i = 0; i <= LANES.length; i++) this.lanes.setColorAt(i, new THREE.Color(0, 0, 0));
    s.add(this.lanes);
    this.pulse = new THREE.Mesh(lg, new THREE.MeshBasicMaterial({color: lin(K.aqua, 0), toneMapped: false, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false}));
    this.pulse.layers.set(EMIT_LAYER);
    this.pulse.frustumCulled = false;
    s.add(this.pulse);
  }

  // the lights whose shafts the haze shows
  get volumeLights() {
    return [this.sun, this.warm];
  }

  // A soft image of the hall's own light for glossy reflections in the polished floor.
  buildEnv(gl: THREE.WebGLRenderer) {
    const env = new THREE.Scene();
    const room = new THREE.Mesh(new THREE.BoxGeometry(300, 140, 300), new THREE.MeshBasicMaterial({color: new THREE.Color(0.008, 0.009, 0.011), side: THREE.BackSide}));
    room.position.y = 60;
    env.add(room);
    const glow = (w: number, h: number, x: number, y: number, z: number, k: number, rx = 0) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({color: lin(K.sky, k), side: THREE.DoubleSide}));
      m.position.set(x, y, z);
      m.rotation.set(rx, 0, 0);
      env.add(m);
    };
    glow(5.2, 33, 0, 16.5, -140, 14);
    for (const [x, z] of SKYLIGHTS) glow(SKY_SIZE * 2, SKY_SIZE * 2, x * 0.6, 128, z * 0.9, 6, Math.PI / 2);
    const pm = new THREE.PMREMGenerator(gl);
    this.scene.environment = pm.fromScene(env, 0.01).texture;
    this.scene.environmentIntensity = 0.55;
    pm.dispose();
  }

  // pose the world at film time t (sub-frame precise). tFrame: the frame's centre time,
  // for things that should not smear (UI redraws).
  update(t: number, tFrame = t) {
    // monoliths
    for (const c of this.cols) c.mesh.position.x = COLUMNS[c.id].x + columnDX(c.id, t);

    // pings
    const up = new THREE.Vector3(0, 0, 1);
    PINGS.forEach((p, i) => {
      const lv = pingLevel(t - p.t) * 14 * pingResolve(p.col, t);
      this.tmpC.setRGB(1.6 * lv, 1.6 * lv, 1.6 * lv);
      this.pings.setColorAt(i, this.tmpC);
      this.tmpQ.setFromUnitVectors(up, new THREE.Vector3(...p.normal));
      this.tmpM.compose(new THREE.Vector3(p.pos[0] + columnDX(p.col, t), p.pos[1], p.pos[2]), this.tmpQ, new THREE.Vector3(1, 1, 1));
      this.pings.setMatrixAt(i, this.tmpM);
    });
    this.pings.instanceMatrix.needsUpdate = true;
    if (this.pings.instanceColor) this.pings.instanceColor.needsUpdate = true;

    // lanes: grow from each monolith's old place to its owner's door
    const ll = laneLevel(t);
    const all = [...LANES, HANDOFF];
    all.forEach((l, i) => {
      const g = laneGrow(l, t);
      const len = (l.x1 - l.x0) * g;
      this.tmpM.compose(new THREE.Vector3(l.x0 + len / 2, 0.012, l.z), this.tmpQ.identity(), new THREE.Vector3(Math.max(Math.abs(len), 0.001), 1, 0.16));
      this.lanes.setMatrixAt(i, this.tmpM);
      const k = (g > 0 ? 3.2 : 0) * ll;
      this.lanes.setColorAt(i, this.tmpC.setRGB(K.aqua[0] * k, K.aqua[1] * k, K.aqua[2] * k));
    });
    this.lanes.instanceMatrix.needsUpdate = true;
    if (this.lanes.instanceColor) this.lanes.instanceColor.needsUpdate = true;
    // the hand-off pulse: a bright head running ahead of its lane
    const hg = laneGrow(HANDOFF, t);
    const head = HANDOFF.x0 + (HANDOFF.x1 - HANDOFF.x0) * hg;
    const pk = hg > 0 && hg < 1 ? 14 : hg >= 1 ? 14 * Math.max(0, 1 - (t - HANDOFF.start - HANDOFF.dur) / 0.8) : 0;
    this.pulse.position.set(head - 1.5, 0.014, HANDOFF.z);
    this.pulse.scale.set(3, 1, 0.24);
    (this.pulse.material as THREE.MeshBasicMaterial).color.setRGB(K.aqua[0] * pk, K.aqua[1] * pk, K.aqua[2] * pk);

    // the wall opens into the mark: recess, then slide away behind the wall
    for (const p of this.markPanels) {
      const k = revealOf(p.idx, t);
      const recess = ease(k / 0.35);
      const slide = ease((k - 0.3) / 0.7);
      p.mesh.position.z = BACK_Z - 1.6 - 2.4 * recess;
      p.mesh.position.x = p.dir * (p.width + 2) * slide;
    }
    const sw = skyWarm(t);
    const skyCol = lin(K.sky, 16).lerp(lin(WARM, 40), sw);
    this.skyMat.color.copy(skyCol);
    this.ghostMat.color.copy(skyCol).multiplyScalar(ghostGlow(t) * 0.22);

    // light
    this.sun.intensity = topSun(t);
    this.warm.intensity = warmSun(t);

    // people
    const pose = personPose(t);
    this.person.setPose(pose);
    this.chairs[0].position.z = 0.55 * pose.stand; // pushed back as they rise
    const fs = keyed(FINANCE_STAND, t);
    this.finance.setPose({headPitch: 0.15 - 0.15 * fs, reach: 0, stand: fs, breath: Math.sin((2 * Math.PI * t) / 3.9 + 1)});
    this.chairs[1].position.z = 0.55 * fs;

    // the desk panel (drawn at the frame's centre time: UI does not smear)
    const ps = panelState(tFrame);
    this.desk.draw(ps);
    const on = ps.on;
    this.deskMat.emissiveIntensity = 0.3 * on + 0.02;
    this.deskGlow.intensity = 0.6 * on;
    this.person.setArmHidden(handHidden(tFrame));
  }
}
