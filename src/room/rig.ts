// The camera rig. One designed path per take: position and aim are uniform cubic
// B-splines (C2: no kinks, no acceleration jumps), reparametrised by arc length.
// Travel timing comes from a speed profile whose keys are joined by quintic
// smootherstep blends, so speed, acceleration and jerk are all continuous.
// The camera only stops where a key says speed 0, never as a side effect.

export type V3 = [number, number, number];
export type Key = [t: number, v: number];

const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);

// value from keys; quintic blend between neighbours, held flat outside
export const keyed = (keys: Key[], t: number): number => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [ta, va] = keys[i - 1];
    const [tb, vb] = keys[i];
    if (t <= tb) return va + (vb - va) * smoother((t - ta) / (tb - ta));
  }
  return keys[keys.length - 1][1];
};

const bspline = (P: V3[], u: number): V3 => {
  // clamp ends by repeating endpoints so the curve starts/ends on them
  const Q = [P[0], P[0], ...P, P[P.length - 1], P[P.length - 1]];
  const segs = Q.length - 3;
  const x = Math.min(Math.max(u, 0), 1) * segs;
  const i = Math.min(Math.floor(x), segs - 1);
  const s = x - i;
  const b0 = (1 - s) ** 3 / 6;
  const b1 = (3 * s ** 3 - 6 * s ** 2 + 4) / 6;
  const b2 = (-3 * s ** 3 + 3 * s ** 2 + 3 * s + 1) / 6;
  const b3 = s ** 3 / 6;
  const [p0, p1, p2, p3] = [Q[i], Q[i + 1], Q[i + 2], Q[i + 3]];
  return [0, 1, 2].map((k) => b0 * p0[k] + b1 * p1[k] + b2 * p2[k] + b3 * p3[k]) as V3;
};

class ArcCurve {
  private us: number[] = [];
  private ls: number[] = [];
  readonly length: number;
  constructor(private P: V3[], n = 4000) {
    let L = 0;
    let prev = bspline(P, 0);
    for (let k = 0; k <= n; k++) {
      const u = k / n;
      const p = bspline(P, u);
      L += Math.hypot(p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]);
      this.us.push(u);
      this.ls.push(L);
      prev = p;
    }
    this.length = L;
  }
  // point at arc-length fraction f in [0,1]
  at(f: number): V3 {
    const target = Math.min(Math.max(f, 0), 1) * this.length;
    let lo = 0;
    let hi = this.ls.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.ls[mid] < target) lo = mid;
      else hi = mid;
    }
    const span = this.ls[hi] - this.ls[lo] || 1;
    const u = this.us[lo] + ((target - this.ls[lo]) / span) * (this.us[hi] - this.us[lo]);
    return bspline(this.P, u);
  }
}

export type Take = {
  t0: number; // take start (s, film time)
  t1: number; // take end
  path: V3[]; // camera position control points
  aim: V3[]; // look-at control points (travel in step with the camera)
  speed: Key[]; // relative speed keys over film time; integrated and scaled to the path
  focal: Key[]; // mm
  stop: number; // f-number
  focus: (t: number) => V3; // what the focus puller follows
  roll?: Key[]; // degrees
};

export type CamState = {pos: V3; target: V3; focalMm: number; focusDist: number; fstop: number; rollDeg: number};

export const makeRig = (take: Take) => {
  const cam = new ArcCurve(take.path);
  const aim = new ArcCurve(take.aim);
  // integrate the speed profile on a fine grid
  const dt = 1 / 2400;
  const n = Math.ceil((take.t1 - take.t0) / dt);
  const D = new Float64Array(n + 1);
  for (let k = 1; k <= n; k++) {
    const t = take.t0 + (k - 0.5) * dt;
    D[k] = D[k - 1] + keyed(take.speed, t) * dt;
  }
  const total = D[n] || 1;
  const frac = (t: number) => {
    const x = (Math.min(Math.max(t, take.t0), take.t1) - take.t0) / dt;
    const i = Math.min(Math.floor(x), n - 1);
    return (D[i] + (D[i + 1] - D[i]) * (x - i)) / total;
  };
  return (t: number): CamState => {
    const f = frac(t);
    const pos = cam.at(f);
    const target = aim.at(f);
    const fp = take.focus(t);
    return {
      pos,
      target,
      focalMm: keyed(take.focal, t),
      // focus distance measured along the optical axis, as a focus puller would set it
      focusDist: (() => {
        const ax = [target[0] - pos[0], target[1] - pos[1], target[2] - pos[2]];
        const al = Math.hypot(ax[0], ax[1], ax[2]) || 1;
        return Math.max(0.3, ((fp[0] - pos[0]) * ax[0] + (fp[1] - pos[1]) * ax[1] + (fp[2] - pos[2]) * ax[2]) / al);
      })(),
      fstop: take.stop,
      rollDeg: take.roll ? keyed(take.roll, t) : 0,
    };
  };
};
