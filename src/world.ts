// Pure, frame-deterministic 3D world: path, rings, mark lattice, camera, plane.
import {random} from 'remotion';
import {F, ease, tw, wpFrame} from './theme';

export type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => mul(a, 1 / (Math.hypot(...a) || 1));
const lerp = (a: V3, b: V3, t: number): V3 => add(a, mul(sub(b, a), t));

// ---------- flight path (Catmull-Rom, arc-length parametrised) ----------
const CP: V3[] = [
  [0, -20, 0], [0, 0, 0], [0, 26, 18], [-26, 40, 75], [22, 30, 145], [-22, 50, 215],
  [26, 36, 285], [-18, 56, 355], [18, 44, 425], [-10, 52, 495], [0, 50, 560], [0, 50, 600],
];
const cr = (p0: V3, p1: V3, p2: V3, p3: V3, t: number): V3 => {
  const t2 = t * t, t3 = t2 * t;
  return [0, 1, 2].map((i) =>
    0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3),
  ) as V3;
};
const PTS: V3[] = [];
for (let i = 1; i < CP.length - 2; i++) for (let j = 0; j < 200; j++) PTS.push(cr(CP[i - 1], CP[i], CP[i + 1], CP[i + 2], j / 200));
const CUM: number[] = [0];
for (let i = 1; i < PTS.length; i++) CUM.push(CUM[i - 1] + Math.hypot(...sub(PTS[i], PTS[i - 1])));
export const PATH_LEN = CUM[CUM.length - 1];

export const at = (s: number): V3 => {
  s = Math.max(0, Math.min(PATH_LEN, s));
  let lo = 0, hi = CUM.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (CUM[m] < s) lo = m; else hi = m;
  }
  const t = (s - CUM[lo]) / (CUM[hi] - CUM[lo] || 1);
  return lerp(PTS[lo], PTS[hi], t);
};
export const tangent = (s: number) => norm(sub(at(s + 0.6), at(s - 0.6)));

// ---------- waypoints ----------
export const CAM_LAG = 24;
const S0 = 120;
const SEND = PATH_LEN - 30;
export const RING_S = [0, 1, 2, 3, 4, 5].map((k) => S0 + (k * (SEND - 60 - S0)) / 5);

// plane arc-length position over time
// fastest through each ring (1.7x), slowest mid-segment (0.3x) while the type is read
const glide = (u: number) => u + (0.7 * Math.sin(2 * Math.PI * u)) / (2 * Math.PI);
export const planeS = (f: number) => {
  if (f <= F.launch) return 0;
  const first = wpFrame(0);
  if (f < first) return (RING_S[0] + CAM_LAG) * Math.pow((f - F.launch) / (first - F.launch), 2); // take-off: accelerate from rest
  for (let k = 0; k < 5; k++) {
    const a = wpFrame(k), b = wpFrame(k + 1);
    if (f < b) return RING_S[k] + CAM_LAG + (RING_S[k + 1] - RING_S[k]) * glide((f - a) / (b - a));
  }
  const a = wpFrame(5);
  return RING_S[5] + CAM_LAG + (SEND - RING_S[5] - CAM_LAG) * tw(f, [a, F.land[1]], [0, 1], ease.standard);
};

// ---------- camera ----------
export type Cam = {pos: V3; look: V3; roll: number};
const FIXED: Cam = {pos: [0, 0, -40], look: [0, 0, 0], roll: 0};

const followCam = (f: number): Cam => {
  const ps = planeS(f);
  const cs = Math.max(0, ps - CAM_LAG);
  const pos = add(at(cs), [0, 3, 0]);
  const look = at(ps + 8);
  const fwd = norm(sub(look, pos));
  const right = norm(cross([0, 1, 0], fwd));
  const lateral = dot(sub(tangent(cs + 18), tangent(cs)), right);
  return {pos, look, roll: Math.max(-0.4, Math.min(0.4, -lateral * 1.6))};
};
const blend = (a: Cam, b: Cam, t: number): Cam => ({pos: lerp(a.pos, b.pos, t), look: lerp(a.look, b.look, t), roll: a.roll + (b.roll - a.roll) * t});

export const camera = (f: number): Cam => {
  if (f < F.follow[0]) {
    // fixed camera, tilting to watch the take-off
    const t = tw(f, [F.launch, F.follow[0]], [0, 1], ease.move);
    return {...FIXED, look: lerp(FIXED.look, at(planeS(f) * 0.6), t)};
  }
  const tilted: Cam = {...FIXED, look: at(planeS(F.follow[0]) * 0.6)};
  if (f < F.follow[1]) return blend(tilted, followCam(f), tw(f, F.follow, [0, 1], ease.move));
  if (f < F.land[0]) return followCam(f);
  const end = at(SEND);
  const lock: Cam = {pos: add(end, [0, 6, -70]), look: end, roll: 0};
  return blend(followCam(Math.min(f, F.land[1])), lock, tw(f, F.land, [0, 1], ease.move));
};

export const FOCAL = 1100;
export const project = (p: V3, cam: Cam) => {
  const fwd = norm(sub(cam.look, cam.pos));
  let right = norm(cross([0, 1, 0], fwd));
  let up = cross(fwd, right);
  const c = Math.cos(cam.roll), s = Math.sin(cam.roll);
  [right, up] = [add(mul(right, c), mul(up, s)), sub(mul(up, c), mul(right, s))];
  const d = sub(p, cam.pos);
  const z = dot(d, fwd);
  return {x: 960 + (FOCAL * dot(d, right)) / z, y: 540 - (FOCAL * dot(d, up)) / z, z};
};

// ring geometry: two concentric rings perpendicular to the path
export const ringPoints = (k: number): V3[] => {
  const c = at(RING_S[k]);
  const T = tangent(RING_S[k]);
  const a = norm(cross(T, [0, 1, 0]));
  const b = cross(T, a);
  const pts: V3[] = [];
  [[7.5, 84], [6.4, 64]].forEach(([r, n]) => {
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2;
      pts.push(add(c, add(mul(a, Math.cos(th) * r), mul(b, Math.sin(th) * r))));
    }
  });
  return pts;
};

// ---------- the mark as a 3D lattice (svg units, y down, 18×18) ----------
export const POLYS: [number, number][][] = [
  [[7.769, 2.489], [8.997, 1.657], [10.216, 2.489], [10.216, 17.151], [7.769, 17.151]],
  [[4.505, 17.16], [4.505, 15.801], [6.953, 15.801], [6.953, 17.16]],
  [[11.032, 17.16], [11.032, 15.801], [13.481, 15.801], [13.481, 17.16]],
  [[14.296, 14.525], [16.744, 16.947], [16.744, 14.84], [14.296, 12.418]],
  [[11.033, 6.855], [13.489, 9.261], [13.489, 14.908], [11.032, 14.908]],
  [[6.953, 6.855], [4.505, 9.262], [4.505, 14.908], [6.953, 14.908]],
  [[3.691, 14.476], [3.691, 12.258], [1.241, 14.703], [1.241, 16.901]],
];
const toSolid = ([x, y]: [number, number]): [number, number] => [7.7687 + (x - 9.4386) * 0.823, 17.151 + (y - 20.837) * 0.823];
export const GHOSTS: [number, number][][] = ([
  [[4.482, 13.458], [1.508, 16.43], [1.508, 1.022], [4.482, 1.022]],
  [[8.447, 6.963], [5.473, 9.897], [5.473, 1.022], [8.447, 1.022]],
  [[13.404, 1.022], [16.378, 1.022], [16.378, 9.897], [13.404, 6.961]],
  [[17.369, 13.481], [20.343, 16.42], [20.343, 1.022], [17.369, 1.022]],
] as [number, number][][]).map((poly) => poly.map(toSolid));
const inside = (x: number, y: number, poly: [number, number][]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
export type MarkPt = {p: V3; src: V3; delay: number; ghost: boolean};
const STEP = 0.27;
export const MARK_PTS: MarkPt[] = [];
for (const z of [-0.8, 0, 0.8]) {
  for (let y = 0.4; y < 17.3; y += STEP) {
    for (let x = 0.5; x < 17.3; x += STEP) {
      const solid = POLYS.some((p) => inside(x, y, p));
      const ghost = !solid && z === 0 && GHOSTS.some((p) => inside(x, y, p));
      if (!solid && !ghost) continue;
      const id = `${x.toFixed(2)}:${y.toFixed(2)}:${z}`;
      const th = random(`a${id}`) * Math.PI * 2;
      const ph = Math.acos(2 * random(`b${id}`) - 1);
      const r = 8 + random(`r${id}`) * 14;
      const p: V3 = [x - 9, 9 - y, z];
      MARK_PTS.push({
        p,
        src: add(p, [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th) * 0.6 - 6, r * Math.cos(ph)]),
        delay: 30 + 110 * ((17.2 - y) / 15.6) + 24 * random(`d${id}`),
        ghost,
      });
    }
  }
}
export const ASSEMBLE_DUR = 50;
export const SEND_S = SEND;
