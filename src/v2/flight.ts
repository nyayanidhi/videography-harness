// Keyframed choreography: camera holds/moves and the rocket's 3D flight (world px, y down, +z toward camera).
import {Easing} from 'remotion';
import {ease} from '../theme';
import type {Cam} from './Stage';

export type CamKey = {f: number} & Cam & {e?: (t: number) => number};
export const camAt = (keys: CamKey[], f: number): Cam => {
  if (f <= keys[0].f) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f < b.f) {
      const t = (b.e ?? ease.move)((f - a.f) / (b.f - a.f));
      return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, dolly: a.dolly + (b.dolly - a.dolly) * t};
    }
  }
  return keys[keys.length - 1];
};

// Rocket waypoints: Catmull-Rom through positions, timed per key, eased per segment
export type FlyKey = {f: number; x: number; y: number; z: number; e?: (t: number) => number};
type V = [number, number, number];
const cr = (p0: V, p1: V, p2: V, p3: V, t: number): V => {
  const t2 = t * t, t3 = t2 * t;
  return [0, 1, 2].map((i) => 0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * t + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3)) as V;
};
export const flyAt = (keys: FlyKey[], f: number): V => {
  const P = (i: number): V => {
    const k = keys[Math.max(0, Math.min(keys.length - 1, i))];
    return [k.x, k.y, k.z];
  };
  if (f <= keys[0].f) return P(0);
  for (let i = 0; i < keys.length - 1; i++) {
    if (f < keys[i + 1].f) {
      const u = (f - keys[i].f) / (keys[i + 1].f - keys[i].f);
      const t = (keys[i + 1].e ?? Easing.linear)(u);
      return cr(P(i - 1), P(i), P(i + 1), P(i + 2), t);
    }
  }
  return P(keys.length - 1);
};

// heading + bank from the path itself
export const poseAt = (keys: FlyKey[], f: number) => {
  const p = flyAt(keys, f);
  const a = flyAt(keys, f - 2), b = flyAt(keys, f + 2);
  let dir: V = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const speed = Math.hypot(...dir);
  if (speed < 0.5) dir = [0, -1, 0]; // hovering: nose up
  // bank into turns: lateral change of heading in screen x
  const a2 = flyAt(keys, f - 8), b2 = flyAt(keys, f + 8);
  const turn = (b2[0] - p[0]) * (p[1] - a2[1]) - (b2[1] - p[1]) * (p[0] - a2[0]);
  const bank = Math.max(-0.7, Math.min(0.7, turn * 0.00004));
  return {p, dir, bank, speed};
};
