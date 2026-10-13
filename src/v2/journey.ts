// One continuous rocket journey (960 → 2880) and a camera physically tied to it.
// - Path: centripetal Catmull-Rom through waypoints, arc-length parametrised (no loops, no cusps).
// - Timing: monotone cubic Hermite of arc length over time (Fritsch–Carlson), so speed is
//   continuous, never negative, never stops, and never jumps.
// - Camera: a target that blends "chase the rocket" with "frame the card", smoothed by a
//   critically damped spring simulated frame by frame (deterministic, precomputed).
import {ease} from '../theme';
import type {Cam} from './Stage';

type V3 = [number, number, number];
export type WP = {f: number; p: V3};

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);

// centripetal Catmull-Rom segment (alpha 0.5)
const ccr = (p0: V3, p1: V3, p2: V3, p3: V3, t: number): V3 => {
  const tj = (ti: number, a: V3, b: V3) => ti + Math.pow(Math.max(len(sub(b, a)), 1e-3), 0.5);
  const t0 = 0, t1 = tj(t0, p0, p1), t2 = tj(t1, p1, p2), t3 = tj(t2, p2, p3);
  const u = t1 + (t2 - t1) * t;
  const L = (a: V3, b: V3, ta: number, tb: number): V3 => {
    const w = (u - ta) / (tb - ta);
    return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w];
  };
  const A1 = L(p0, p1, t0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
  const B1 = L(A1, A2, t0, t2), B2 = L(A2, A3, t1, t3);
  return L(B1, B2, t1, t2);
};

export const makeJourney = (wps: WP[]) => {
  const P = (i: number) => wps[Math.max(0, Math.min(wps.length - 1, i))].p;
  // dense samples + cumulative arc length; remember the arc length at each waypoint
  const pts: V3[] = [];
  const cum: number[] = [];
  const sAt: number[] = [0];
  const N = 80;
  for (let i = 0; i < wps.length - 1; i++) {
    const a = i === 0 ? sub(P(0), sub(P(1), P(0))) : P(i - 1);
    const d = i === wps.length - 2 ? [P(i + 1)[0] * 2 - P(i)[0], P(i + 1)[1] * 2 - P(i)[1], P(i + 1)[2] * 2 - P(i)[2]] as V3 : P(i + 2);
    for (let j = i === 0 ? 0 : 1; j <= N; j++) {
      const q = ccr(a, P(i), P(i + 1), d, j / N);
      cum.push(pts.length ? cum[cum.length - 1] + len(sub(q, pts[pts.length - 1])) : 0);
      pts.push(q);
    }
    sAt.push(cum[cum.length - 1]);
  }
  const total = cum[cum.length - 1];
  const at = (s: number): V3 => {
    s = Math.max(0, Math.min(total, s));
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1;
      if (cum[m] < s) lo = m; else hi = m;
    }
    const w = (s - cum[lo]) / (cum[hi] - cum[lo] || 1);
    return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * w, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * w, pts[lo][2] + (pts[hi][2] - pts[lo][2]) * w];
  };

  // monotone Hermite s(t) through (f_i, s_i)
  const T = wps.map((w) => w.f);
  const S = sAt;
  const n = T.length;
  const dk = new Array(n - 1).fill(0).map((_, i) => (S[i + 1] - S[i]) / (T[i + 1] - T[i]));
  const m = new Array(n).fill(0);
  m[0] = dk[0] * 0.5; // ease out of the start
  m[n - 1] = dk[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (dk[i - 1] * dk[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * (T[i + 1] - T[i]) + (T[i] - T[i - 1]);
      const w2 = (T[i + 1] - T[i]) + 2 * (T[i] - T[i - 1]);
      m[i] = (w1 + w2) / (w1 / dk[i - 1] + w2 / dk[i]);
    }
  }
  const sOf = (f: number) => {
    if (f <= T[0]) return 0;
    if (f >= T[n - 1]) return total;
    let i = 0;
    while (f > T[i + 1]) i++;
    const h = T[i + 1] - T[i];
    const t = (f - T[i]) / h;
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * S[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * S[i + 1] + (t3 - t2) * h * m[i + 1];
  };

  const pos = (f: number) => at(sOf(f));
  const tangent = (f: number): V3 => {
    const s = sOf(f);
    const a = at(s - 6), b = at(s + 6);
    const d = sub(b, a);
    const l = len(d) || 1;
    return [d[0] / l, d[1] / l, d[2] / l];
  };
  // bank into turns from the change of screen-plane heading (smoothed over ±10 frames)
  const bank = (f: number) => {
    const h = (g: number) => {
      const t = tangent(g);
      return Math.atan2(t[1], t[0]);
    };
    let d = h(f + 10) - h(f - 10);
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return Math.max(-0.35, Math.min(0.35, d * 0.9));
  };
  return {pos, tangent, bank, sOf, at, total};
};

// ---------- camera ----------
export type Frame = {a: number; b: number; from: Cam; to: Cam};

export const makeCamera = (opts: {
  start: number;
  end: number;
  startCam: Cam;
  rocket: (f: number) => V3;
  frames: Frame[];
  chaseDolly: number;
  omega: number; // spring stiffness (rad per second)
  ramp: number; // frames to blend between chase and card framing
}) => {
  const {start, end, startCam, rocket, frames, chaseDolly, omega, ramp} = opts;
  const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const target = (f: number): Cam => {
    const r = rocket(f);
    let tgt: Cam = {x: r[0], y: r[1], dolly: chaseDolly};
    for (const fr of frames) {
      const w = smooth((f - (fr.a - ramp)) / ramp) * (1 - smooth((f - fr.b) / ramp));
      if (w <= 0) continue;
      const u = ease.move(Math.max(0, Math.min(1, (f - fr.a) / Math.max(1, fr.b - fr.a))));
      const c = {x: fr.from.x + (fr.to.x - fr.from.x) * u, y: fr.from.y + (fr.to.y - fr.from.y) * u, dolly: fr.from.dolly + (fr.to.dolly - fr.from.dolly) * u};
      tgt = {x: tgt.x + (c.x - tgt.x) * w, y: tgt.y + (c.y - tgt.y) * w, dolly: tgt.dolly + (c.dolly - tgt.dolly) * w};
    }
    return tgt;
  };
  // critically damped spring, 4 substeps per frame
  const out: Cam[] = [];
  let x = {...startCam};
  let v = {x: 0, y: 0, dolly: 0};
  const dt = 1 / 60 / 4;
  for (let f = start; f <= end; f++) {
    const t = target(f);
    for (let k = 0; k < 4; k++) {
      for (const key of ['x', 'y', 'dolly'] as const) {
        const a = omega * omega * (t[key] - x[key]) - 2 * omega * v[key];
        v[key] += a * dt;
        x[key] += v[key] * dt;
      }
    }
    out.push({...x});
  }
  return (f: number) => out[Math.max(0, Math.min(out.length - 1, Math.round(f) - start))];
};
