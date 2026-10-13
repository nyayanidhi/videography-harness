// The hall, as pure data (no three.js), so tools and the score can read it too.
import {rng} from './rng';

export type Column = {id: number; x: number; z: number; w: number; d: number};
export const ROOF_Y = 70;
export const BACK_Z = -100;
export const OPENING = {w: 5.2, h: 38}; // tall slot in the back wall: the hall's one window on the world
export const DESK = {x: 0, z: -2.6, top: 0.74};
export const FIGURE = {x: 0, z: -1.95}; // seated, back to camera, facing the opening
// Daylight: a steep sun from high behind-left, its shafts leaning toward the camera.
export const SUN_ELEV = (66 * Math.PI) / 180;
export const SUN_AZ = (12 * Math.PI) / 180; // 0 = travelling +z (toward camera), 90° = travelling +x; shafts stay inside the nave
export const SUN_DIR: [number, number, number] = [Math.sin(SUN_AZ) * Math.cos(SUN_ELEV), -Math.sin(SUN_ELEV), Math.cos(SUN_AZ) * Math.cos(SUN_ELEV)];
// Square skylights throw discrete pillars of light. Each is placed in the roof so its
// light lands where the story needs it; one lands just behind the desk.
export const SKY_SIZE = 3.4;
export const LIGHT_POOLS: [number, number][] = [
  [0.2, 8],
  [-1.6, -5.2], // behind the desk: the person sits at the edge of the light
  [0.4, -24],
  [-0.2, -42],
  [0.5, -60],
  [0, -78],
];
const toRoof = (ROOF_Y) / -SUN_DIR[1];
export const SKYLIGHTS: [number, number][] = LIGHT_POOLS.map(([x, z]) => [x - toRoof * SUN_DIR[0], z - toRoof * SUN_DIR[2]]);

// Nave: two inner rows, two outer rows, 16 m bays; monoliths 6.4 m square
export const COL_W = 6.4;
export const COLUMNS: Column[] = (() => {
  const out: Column[] = [];
  let id = 0;
  for (let k = 0; k < 9; k++) {
    const z = 36 - k * 16;
    out.push({id: id++, x: -13, z, w: COL_W, d: COL_W});
    out.push({id: id++, x: 13, z, w: COL_W, d: COL_W});
  }
  for (let k = 0; k < 8; k++) {
    const z = 28 - k * 16;
    if (z === -4) continue; // the bay beside the desk stays open: the hand-off lane runs through it
    out.push({id: id++, x: -31, z, w: COL_W, d: COL_W});
    out.push({id: id++, x: 31, z, w: COL_W, d: COL_W});
  }
  return out;
})();

// A ping: one piece of the work around the work lighting up on a column face.
// face: 0 = +x, 1 = -x, 2 = +z
export type Ping = {t: number; col: number; face: 0 | 1 | 2; y: number; u: number; pos: [number, number, number]; normal: [number, number, number]};

export const pingPos = (c: Column, face: 0 | 1 | 2, y: number, u: number): {pos: [number, number, number]; normal: [number, number, number]} => {
  const off = 0.2; // clear of the blocks' jitter
  const m = c.w / 2 - 0.8;
  if (face === 2) return {pos: [c.x + u * m, y, c.z + c.d / 2 + off], normal: [0, 0, 1]};
  const s = face === 0 ? 1 : -1;
  return {pos: [c.x + s * (c.w / 2 + off), y, c.z + u * m], normal: [s, 0, 0]};
};

// Act I: pings accelerate out of time. Deterministic.
export const makePings = (t0: number, t1: number, maxZ: number): Ping[] => {
  const r = rng(4242);
  const out: Ping[] = [];
  const pool = COLUMNS.filter((c) => c.z < maxZ && Math.abs(c.x) < 20); // inner rows: the ones the camera sees
  let t = t0;
  while (t < t1) {
    const c = pool[Math.floor(r() * pool.length)];
    // faces the camera can see: the nave-facing side and the front
    const face: 0 | 1 | 2 = r() < 0.55 ? 2 : c.x < 0 ? 0 : 1;
    const y = 1.2 + 34 * Math.pow(r(), 1.5);
    const u = r() * 2 - 1;
    out.push({t, col: c.id, face, y, u, ...pingPos(c, face, y, u)});
    const iv = 0.8 * Math.exp(-(t - t0) / 7) + 0.03;
    t += iv * (0.6 + 0.8 * r());
  }
  return out;
};

// ping brightness envelope (relative): sharp flash, then a lingering ember
export const pingLevel = (dt: number) => {
  if (dt < 0) return 0;
  const attack = Math.min(dt / 0.035, 1);
  return attack * (0.7 * Math.exp(-dt / 0.3) + 0.3 * Math.exp(-dt / 9));
};
