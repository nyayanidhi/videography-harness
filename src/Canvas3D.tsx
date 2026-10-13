import {useLayoutEffect, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import {D, F, ease, tw, wpFrame} from './theme';
import {ASSEMBLE_DUR, FOCAL, MARK_PTS, PATH_LEN, RING_S, at, camera, planeS, project, ringPoints} from './world';

const RINGS = RING_S.map((_, k) => ringPoints(k));
export const LOCK = {x: 634, y: 500, h: 360};

// ---- type layout, shared with Overlay so the knock-back matches the real type bounds ----
export const NAME_SIZE = 180;
export const NAME_LEAD = 172;
export const typeAt = (k: number) => wpFrame(k) - 6;
export const typeOut = (k: number) => wpFrame(k) + 132;
export const typeBox = (k: number, lines: number) =>
  k % 2 === 0 ? {left: 262, top: 884 - lines * NAME_LEAD} : {left: 972, top: 120};

type Zone = {x0: number; y0: number; x1: number; y1: number; at: number; out: number};
const ZONES: Zone[] = [
  {x0: 240, y0: 868, x1: 980, y1: 990, at: 60, out: 263},
  {x0: 240, y0: 136, x1: 920, y1: 212, at: 375, out: 495},
  ...[0, 1, 2, 3, 4, 5].map((k) =>
    k % 2 === 0
      ? {x0: 240, y0: 884 - (k === 4 ? 1 : 2) * NAME_LEAD - 10, x1: 1190, y1: 960, at: typeAt(k), out: typeOut(k)}
      : {x0: 950, y0: 110, x1: 1890, y1: 540, at: typeAt(k), out: typeOut(k)},
  ),
];
const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

const rgbOf = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const FG = rgbOf(D.fg), TEAL = rgbOf(D.teal), GREY = rgbOf(D.grey);
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

export const planeScale = (f: number) => (f < F.launch ? 1.1 : tw(f, [F.launch, 400], [1.12, 0.16], ease.enter));

export const planeState = (f: number) => {
  const cam = camera(f);
  const antic = tw(f, [F.launch - 12, F.launch], [0, 1], ease.standard);
  let x = 960, y = 540, h = 18 * 1.1 * (1 + 0.018 * antic) * (FOCAL / 40), rot = 0;
  let yaw = f < 240 ? tw(f, [0, 240], [-0.7, 0.26], ease.move) : tw(f, [240, F.launch], [0.26, 0], ease.move);
  if (f >= F.launch) {
    const s = planeS(f);
    const p = project(at(s), cam);
    const q = project(at(s + 2), cam);
    x = p.x;
    y = p.y;
    h = (18 * planeScale(f) * FOCAL) / Math.max(p.z, 1);
    rot = Math.atan2(q.y - p.y, q.x - p.x) + Math.PI / 2;
    yaw = cam.roll * 1.5;
  }
  // anticipation: settle 10 px before launch, released over 10 frames
  y += 10 * (f < F.launch ? antic : 1 - tw(f, [F.launch, F.launch + 10], [0, 1]));
  if (f >= F.land[0]) {
    const t = tw(f, F.land, [0, 1], ease.move);
    x += (LOCK.x - x) * t;
    y += (LOCK.y - y) * t;
    h += (LOCK.h - h) * t;
    rot *= 1 - t;
    yaw *= 1 - t;
    // the film's single overshoot: the mark settling into the lockup
    h *= 1 + 0.04 * tw(f, [F.land[1], F.land[1] + 12], [0, 1]) * (1 - tw(f, [F.land[1] + 12, F.land[1] + 36], [0, 1], ease.move));
  }
  return {x, y, h, rot, yaw};
};

export const Canvas3D: React.FC = () => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.fillStyle = D.ground;
    ctx.fillRect(0, 0, 1920, 1080);
    const cam = camera(f);

    // soft, envelope-driven knock-back under whichever type is on screen
    const zones = ZONES.map((z) => ({...z, r: tw(f, [z.at, z.at + 20], [0, 1]) * (1 - tw(f, [z.out, z.out + 20], [0, 1]))})).filter((z) => z.r > 0);
    const dot = (x: number, y: number, r: number, c: number[], a: number, knock = true) => {
      if (x < -20 || x > 1940 || y < -20 || y > 1100) return;
      if (knock) {
        for (const z of zones) {
          const inside = Math.min(x - z.x0, z.x1 - x, y - z.y0, z.y1 - y);
          if (inside > 0) a *= 1 - 0.85 * z.r * smooth(0, 40, inside);
        }
      }
      if (a <= 0.01) return;
      ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // contrail: emerges behind the plane's tail; at landing it retracts into the plane
    const ps = planeS(f);
    const trailLen = PATH_LEN * (1 - tw(f, F.land, [0, 1], ease.exit));
    const tail = ps - 8 * planeScale(f);
    for (let s = Math.max(0, ps - trailLen); s < tail; s += 0.45) {
      const p = project(at(s), cam);
      if (p.z < 1.5) continue;
      const fog = Math.min(1, Math.max(0, 1 - p.z / 320));
      const age = 0.35 + 0.65 * Math.exp(-(ps - s) / 160);
      dot(p.x, p.y, Math.min(5, Math.max(0.6, (0.13 * FOCAL) / p.z)), TEAL, fog * age);
    }

    // waypoint rings: grey ahead, ink as we pass, teal behind; cut when the trail is absorbed
    if (trailLen > 1) {
      RINGS.forEach((pts, k) => {
        const g = ease.enter(Math.min(1, Math.max(0, (ps - (RING_S[k] - 110)) / 30)));
        if (g <= 0) return;
        const wf = wpFrame(k);
        const toFg = tw(f, [wf - 30, wf - 18], [0, 1], ease.standard);
        const toTeal = tw(f, [wf + 20, wf + 32], [0, 1], ease.standard);
        const color = mix(mix(GREY, FG, toFg), TEAL, toTeal);
        const alpha = 1 - 0.5 * toTeal;
        const c = at(RING_S[k]);
        for (const w of pts) {
          const q: typeof w = [c[0] + (w[0] - c[0]) * g, c[1] + (w[1] - c[1]) * g, c[2] + (w[2] - c[2]) * g];
          const p = project(q, cam);
          if (p.z < 1.5) continue;
          const fog = Math.min(1, Math.max(0, 1 - p.z / 300));
          dot(p.x, p.y, Math.min(6, Math.max(0.7, (0.16 * FOCAL) / p.z)), color, fog * alpha);
        }
      });
    }

    // the plane / mark (never knocked back)
    const st = planeState(f);
    const k = st.h / 18;
    const cy = Math.cos(st.yaw), sy = Math.sin(st.yaw);
    const cr = Math.cos(st.rot), sr = Math.sin(st.rot);
    const ghostA = 0.09 * Math.min(1, 1 - tw(f, [F.launch, F.launch + 10], [0, 1], ease.exit) + tw(f, [F.land[1], F.land[1] + 30], [0, 1]));
    const flatten = 1 - tw(f, F.land, [0, 1], ease.move); // single plane at the lockup: no moiré
    for (const m of MARK_PTS) {
      if (m.ghost && ghostA <= 0.005) continue;
      const u = Math.min(1, Math.max(0, (f - m.delay) / ASSEMBLE_DUR));
      if (u <= 0) continue;
      const e = ease.enter(u);
      const lx = m.src[0] + (m.p[0] - m.src[0]) * e;
      const ly = m.src[1] + (m.p[1] - m.src[1]) * e;
      const lz = (m.src[2] + (m.p[2] - m.src[2]) * e) * flatten;
      const xr = lx * cy - lz * sy;
      const zr = lx * sy + lz * cy;
      const persp = Math.min(1.6, 40 / Math.max(8, 40 + zr));
      const dx = xr * k * persp, dy = -ly * k * persp;
      const shade = 0.7 + 0.3 * Math.min(1, Math.max(0, 0.5 - zr / 1.6));
      dot(st.x + dx * cr - dy * sr, st.y + dx * sr + dy * cr, Math.max(0.7, k * 0.088 * persp), FG, (0.15 + 0.85 * u) * (m.ghost ? ghostA : shade), false);
    }
  }, [f]);

  return <canvas ref={ref} width={1920} height={1080} style={{position: 'absolute', inset: 0}} />;
};
