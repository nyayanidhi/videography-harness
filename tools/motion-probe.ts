// Motion probe: is every camera move smooth, continuous and within 24 fps judder limits?
// For each shot: per frame, project a 9×5 grid of world points (placed at the focus
// distance along the frame's rays) into the next frame; measure screen speed (px/frame)
// and its change (px/frame²). Flags: accel spikes, stalls inside a move, speeds that
// strobe at 24 fps (> 1/7 frame width per second for broad pans).
import {FPS, H, W, vfovDeg} from '../src/room/config';
import {project} from '../src/room/project';
import {CamState, V3} from '../src/room/rig';
import {SHOTS} from '../src/room/timeline';

const basis = (cs: CamState) => {
  const f = norm(sub(cs.target, cs.pos));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  return {f, r, u};
};
function sub(a: V3, b: V3): V3 { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross(a: V3, b: V3): V3 { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function norm(a: V3): V3 { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

const PAN_LIMIT = W / 7 / FPS; // ≈ 11.4 px/frame: the classic 7-second rule for broad pans
let fail = 0;
for (const s of SHOTS) {
  const n = Math.round((s.t1 - s.t0) * FPS);
  const speeds: number[] = [];
  const depth = s.rig((s.t0 + s.t1) / 2).focusDist; // fixed probe depth per shot
  for (let k = 0; k < n - 1; k++) {
    const t = s.t0 + k / FPS;
    const a = s.rig(t);
    const b = s.rig(t + 1 / FPS);
    const {f, r, u} = basis(a);
    const th = Math.tan((vfovDeg(a.focalMm) / 2) * Math.PI / 180);
    let sum = 0;
    let cnt = 0;
    for (let i = 0; i < 9; i++)
      for (let j = 0; j < 5; j++) {
        const nx = (i / 8) * 2 - 1;
        const ny = (j / 4) * 2 - 1;
        const d = depth;
        const dir: V3 = [f[0] + r[0] * nx * th * (W / H) + u[0] * ny * th, f[1] + r[1] * nx * th * (W / H) + u[1] * ny * th, f[2] + r[2] * nx * th * (W / H) + u[2] * ny * th];
        const p: V3 = [a.pos[0] + dir[0] * d, a.pos[1] + dir[1] * d, a.pos[2] + dir[2] * d];
        const pa = project(a, p);
        const pb = project(b, p);
        if (pb.depth <= 0) continue;
        sum += Math.hypot(pb.x - pa.x, pb.y - pa.y);
        cnt++;
      }
    speeds.push(sum / Math.max(cnt, 1));
  }
  const acc = speeds.slice(1).map((v, i) => Math.abs(v - speeds[i]));
  const maxAcc = Math.max(...acc);
  const maxV = Math.max(...speeds);
  const minV = Math.min(...speeds.slice(2, -2));
  const stalls = speeds.slice(2, -2).filter((v) => v < 0.02).length;
  const flags: string[] = [];
  if (maxAcc > 0.8) flags.push(`accel ${maxAcc.toFixed(2)} px/f²`);
  if (stalls > 0 && maxV > 0.3) flags.push(`${stalls} stalled frames inside a move`);
  if (maxV > PAN_LIMIT) flags.push(`speed ${maxV.toFixed(1)} px/f > ${PAN_LIMIT.toFixed(1)} (24 fps strobing risk)`);
  if (flags.length) fail++;
  console.log(`${s.id.padEnd(12)} ${n} f  speed ${minV.toFixed(2)}–${maxV.toFixed(2)} px/f  max Δ ${maxAcc.toFixed(3)}  ${flags.length ? 'FAIL: ' + flags.join('; ') : 'ok'}`);
}
process.exit(fail ? 1 : 0);
