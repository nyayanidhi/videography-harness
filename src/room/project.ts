// Project world points to screen pixels with the film's camera model (pure; matches the
// renderer's PerspectiveCamera with lookAt, no roll).
import {vfovDeg, W, H} from './config';
import {CamState, V3} from './rig';

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export const project = (cs: CamState, p: V3): {x: number; y: number; depth: number} => {
  const f = norm(sub(cs.target, cs.pos)); // forward
  const r = norm(cross(f, [0, 1, 0])); // right
  const u = cross(r, f); // up
  const d = sub(p, cs.pos);
  const z = dot(d, f);
  const t = Math.tan(((vfovDeg(cs.focalMm) / 2) * Math.PI) / 180);
  const x = dot(d, r) / (z * t * (W / H));
  const y = dot(d, u) / (z * t);
  return {x: ((x + 1) / 2) * W, y: ((1 - y) / 2) * H, depth: z};
};
