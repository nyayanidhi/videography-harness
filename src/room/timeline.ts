// RILIN "ROOM": the film's single source of truth. Every shot, camera, light change,
// world event and title lives here, as pure data/functions of film time (seconds).
// The picture, the score and the QA tools all read this file.
import {H, W} from './config';
import {CamState, Key, keyed, makeRig, Take, V3} from './rig';
import {COLUMNS, Column, DESK, FIGURE, makePings, Ping, pingPos} from './world/layout';
import {rng} from './world/rng';

export const BPM = 80; // Act II/III pulse: one beat = 0.75 s = 18 frames
export const BEAT = 60 / BPM;
export const GRID0 = 34.5; // the hit: beat 0 of the score's grid
export const beat = (n: number) => GRID0 + n * BEAT;

export const LENGTH = 106.5;
export const BAR_239 = (1 - W / H / 2.39) / 2;

// ── shots ────────────────────────────────────────────────────────────────────────────
export type Shot = {id: string; t0: number; t1: number; take: Take};
const fixed = (p: V3) => () => p;

const SHOTS_DEF: Shot[] = [
  {
    id: 'A·nave',
    t0: 0,
    t1: 13.5,
    take: {
      t0: 0,
      t1: 13.5,
      path: [
        [1.9, 1.35, 52],
        [1.6, 1.4, 46],
        [1.25, 1.47, 40],
        [0.9, 1.55, 34],
        [0.6, 1.62, 28],
      ],
      aim: [
        [0.7, 2.6, -60],
        [0.5, 2.5, -56],
        [0.3, 2.35, -52],
        [0.15, 2.2, -48],
        [0.0, 2.1, -44],
      ],
      speed: [
        [0, 1],
        [13.5, 0.8],
      ],
      focal: [[0, 32]],
      stop: 2.0,
      focus: fixed([FIGURE.x, 1.15, FIGURE.z]),
    },
  },
  {
    // a lateral track along the monoliths: the work keeps arriving
    id: 'B·face',
    t0: 13.5,
    t1: 22.5,
    take: {
      t0: 13.5,
      t1: 22.5,
      path: [
        [-1.6, 3.0, 6.2],
        [-1.6, 3.04, 4.85],
        [-1.6, 3.08, 3.5],
        [-1.6, 3.12, 2.15],
        [-1.6, 3.16, 0.8],
      ],
      aim: [
        [13, 3.3, 5.0],
        [13, 3.34, 3.65],
        [13, 3.38, 2.3],
        [13, 3.42, 0.95],
        [13, 3.46, -0.4],
      ],
      speed: [[13.5, 1]],
      focal: [[13.5, 50]],
      stop: 2.8,
      focus: fixed([9.8, 3.3, 3.5]),
    },
  },
  {
    // reverse, low behind the person: they look up at what towers over them
    id: 'C·up',
    t0: 22.5,
    t1: 33,
    take: {
      t0: 22.5,
      t1: 33,
      path: [
        [1.35, 0.42, 1.5],
        [1.3, 0.44, 1.25],
        [1.24, 0.46, 1.0],
        [1.18, 0.48, 0.75],
      ],
      aim: [
        [-0.2, 9, -30],
        [-0.25, 11.5, -30],
        [-0.3, 14, -30],
        [-0.35, 16.5, -30],
      ],
      speed: [[22.5, 1]],
      focal: [[22.5, 24]],
      stop: 4.0,
      focus: fixed([0, 1.3, FIGURE.z]),
    },
  },
  {
    // high and wide: order arrives. The monoliths slide away to their owners.
    id: 'D·order',
    t0: 33,
    t1: 46.5,
    take: {
      t0: 33,
      t1: 46.5,
      path: [
        [0, 7.6, 47],
        [0, 7.9, 48.8],
        [0, 8.2, 50.6],
      ],
      aim: [
        [0, 5.2, -60],
        [0, 5.0, -60],
        [0, 4.8, -60],
      ],
      speed: [[33, 1]],
      focal: [[33, 32]],
      stop: 4.0,
      focus: fixed([0, 1.2, FIGURE.z]),
    },
  },
  {
    // overhead insert: the one decision that needs a person
    id: 'E·desk',
    t0: 46.5,
    t1: 58.5,
    take: {
      t0: 46.5,
      t1: 58.5,
      path: [
        [0.12, 1.8, -2.21],
        [0.12, 1.77, -2.215],
        [0.12, 1.74, -2.22],
      ],
      aim: [
        [0.12, 0.8, -2.47],
        [0.12, 0.8, -2.47],
        [0.12, 0.8, -2.47],
      ],
      speed: [[46.5, 1]],
      focal: [[46.5, 44]],
      stop: 2.8,
      focus: fixed([0.12, 0.795, -2.45]),
    },
  },
  {
    // low along the floor: a sign-off runs to the next person
    id: 'F·handoff',
    t0: 58.5,
    t1: 70.5,
    take: {
      t0: 58.5,
      t1: 70.5,
      path: [
        [2.6, 0.5, 1.6],
        [9, 0.52, 1.4],
        [17, 0.55, 1.2],
        [25, 0.6, 1.0],
        [31, 0.66, 0.9],
      ],
      aim: [
        [30, 0.9, -4],
        [45, 1.2, -3.6],
        [60, 1.5, -3.2],
        [72, 1.7, -3],
        [76, 1.8, -2.9],
      ],
      speed: [
        [58.5, 0.85],
        [61, 1],
        [70.5, 0.9],
      ],
      focal: [[58.5, 32]],
      stop: 2.8,
      focus: (t) => [Math.min(72, 6 + (t - 58.5) * 13.8), 0.5, -2.6],
    },
  },
  {
    // the room: frontal, symmetric. The wall opens into the mark.
    id: 'G·room',
    t0: 70.5,
    t1: 85.5,
    take: {
      t0: 70.5,
      t1: 85.5,
      path: [
        [0, 1.3, 40],
        [0, 1.36, 36],
        [0, 1.42, 32],
      ],
      aim: [
        [0, 11, -100],
        [0, 11.5, -100],
        [0, 12, -100],
      ],
      speed: [[70.5, 1]],
      focal: [[70.5, 28]],
      stop: 4.0,
      focus: fixed([0, 1.2, FIGURE.z]),
    },
  },
  {
    // behind the person, standing now, in the light
    id: 'H·stand',
    t0: 85.5,
    t1: 97.5,
    take: {
      t0: 85.5,
      t1: 97.5,
      path: [
        [-3.4, 1.15, 13.5],
        [-3.4, 1.18, 12.2],
        [-3.4, 1.2, 10.9],
      ],
      aim: [
        [0.9, 12.5, -100],
        [0.8, 13.0, -100],
        [0.7, 13.5, -100],
      ],
      speed: [[85.5, 1]],
      focal: [[85.5, 35]],
      stop: 2.8,
      focus: fixed([0, 1.4, FIGURE.z]),
    },
  },
  {
    // the window, flat and far: it becomes the mark
    id: 'I·mark',
    t0: 97.5,
    t1: LENGTH,
    take: {
      t0: 97.5,
      t1: LENGTH,
      path: [
        [0, 16.6, 96],
        [0, 16.6, 93],
      ],
      aim: [
        [0, 16.6, -100],
        [0, 16.6, -100],
      ],
      speed: [[97.5, 1]],
      focal: [[97.5, 75]],
      stop: 8,
      focus: fixed([0, 16.6, -100]),
    },
  },
];

export const SHOTS = SHOTS_DEF.map((s) => ({...s, rig: makeRig(s.take)}));
export const shotAt = (t: number) => SHOTS.find((s) => t >= s.t0 && t < s.t1) ?? SHOTS[SHOTS.length - 1];
// camera for the frame whose centre time is tc, sampled at sub-frame time ts (never crosses a cut)
export const camera = (tc: number, ts: number): CamState => {
  const s = shotAt(tc);
  return s.rig(Math.min(Math.max(ts, s.t0), s.t1 - 1e-4));
};
export const CUTS = SHOTS.slice(1).map((s) => s.t0);

// ── pings: the work around the work, lighting up ───────────────────────────────────────
const inner = COLUMNS.filter((c) => Math.abs(c.x) < 20);
const colB = inner.find((c) => c.x > 0 && c.z === 4) as Column;

const facePings = (col: Column, t0: number, t1: number, seed: number): Ping[] => {
  const r = rng(seed);
  const face = col.x > 0 ? 1 : 0;
  const slots: [number, number][] = [];
  for (let row = 0; row < 6; row++) for (const u of [-0.66, 0, 0.66]) slots.push([1.55 + row * 0.82, u]);
  // shuffle, then fire them on an accelerating clock
  for (let i = slots.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }
  return slots.map(([y, u], k) => {
    const x = k / slots.length;
    const t = t0 + (t1 - t0) * (1 - Math.pow(1 - x, 1.7));
    return {t, col: col.id, face, y, u, ...pingPos(col, face, y, u)};
  });
};

export const PINGS: Ping[] = [
  ...makePings(1.6, 33, 30),
  ...facePings(colB, 13.8, 22.4, 77),
].sort((a, b) => a.t - b.t);

// ── Act II: the monoliths slide away to their owners ───────────────────────────────────
// rank by distance from the desk; pairs move together, one half-beat apart
const ranks = [...new Set(inner.map((c) => Math.abs(c.z - DESK.z)).map((d) => Math.round(d)))].sort((a, b) => a - b);
export type Move = {col: number; start: number; dur: number; dx: number; laneZ: number; side: number};
export const MOVES: Move[] = inner.map((c) => {
  const rank = ranks.indexOf(Math.round(Math.abs(c.z - DESK.z)));
  const side = Math.sign(c.x);
  return {col: c.id, start: beat(rank * 0.5), dur: 6.75, dx: side * 31, laneZ: c.z, side};
});
const minJerk = (x: number) => {
  const c = Math.min(Math.max(x, 0), 1);
  return c * c * c * (c * (c * 6 - 15) + 10);
};
export const columnDX = (id: number, t: number) => {
  const m = MOVES.find((mv) => mv.col === id);
  return m ? m.dx * minJerk((t - m.start) / m.dur) : 0;
};
// a column's unanswered work goes quiet as it starts to move
export const pingResolve = (col: number, t: number) => {
  const m = MOVES.find((mv) => mv.col === col);
  if (!m) return 1;
  return 1 - minJerk((t - m.start + 0.2) / 1.2);
};

// lanes of light on the floor: from each monolith's old place to a doorway in the side wall
export const SIDE_X = 70;
export type Lane = {x0: number; x1: number; z: number; start: number; dur: number};
export const LANES: Lane[] = MOVES.map((m) => {
  const c = COLUMNS[m.col];
  return {x0: c.x, x1: m.side * (SIDE_X - 0.4), z: c.z, start: m.start + 0.3, dur: 2.6};
});
// the hand-off lane: from the desk to Finance
export const PRESS = beat(28); // 55.5: the hero press, on the downbeat
export const HANDOFF: Lane = {x0: 0.5, x1: SIDE_X - 0.4, z: DESK.z, start: 58.6, dur: 5.0};
export const FINANCE_STAND: Key[] = [
  [64.0, 0],
  [66.2, 1],
];
export const laneGrow = (l: Lane, t: number) => minJerk((t - l.start) / l.dur);
// lanes settle to an ember once Act III's daylight arrives
export const laneLevel = (t: number) => keyed([[0, 1], [76, 1], [81, 0]], t);

// ── Act II: the desk ──────────────────────────────────────────────────────────────────
export const panelState = (t: number) => ({
  on: keyed([[45.6, 0], [46.4, 1]], t),
  strike: keyed([[48.0, 0], [49.0, 1]], t),
  insert: keyed([[49.1, 0], [50.9, 1]], t),
  matched: keyed([[51.1, 0], [51.7, 1]], t),
  judge: keyed([[52.1, 0], [52.9, 1]], t),
  press: t >= PRESS ? 1 : 0,
  approved: keyed([[56.2, 0], [56.9, 1]], t),
});

// ── people ────────────────────────────────────────────────────────────────────────────
export const handHidden = (t: number) => t >= 46.5 && t < 58.5;
export const personPose = (t: number) => ({
  headPitch: keyed([[0, 0.12], [24.6, 0.12], [26.9, -0.5], [33, -0.5], [33.5, 0.12], [46.5, 0.3], [84, 0.3], [86, 0.05], [90, -0.12]], t),
  reach: keyed([[54.6, 0], [55.45, 1], [55.95, 1], [56.9, 0]], t),
  stand: keyed([[86.0, 0], [88.6, 1]], t),
  breath: Math.sin((2 * Math.PI * t) / 4.2),
});

// ── Act III: the wall opens into the mark ─────────────────────────────────────────────
// solid pieces (index into MARK_PIECES) open centre-out in symmetric pairs, on the beat
export const REVEALS: {pieces: number[]; t: number}[] = [
  {pieces: [5, 4], t: beat(52)}, // mid pillars  73.5
  {pieces: [1, 2], t: beat(53)}, // base blocks  74.25
  {pieces: [6, 3], t: beat(54)}, // outer angles 75.0
];
export const revealOf = (piece: number, t: number) => {
  const r = REVEALS.find((rv) => rv.pieces.includes(piece));
  return r ? minJerk((t - r.t) / 2.4) : 0;
};
export const ghostGlow = (t: number) => keyed([[0, 0.05], [75.6, 0.05], [78, 0.42]], t);

// ── light and atmosphere ───────────────────────────────────────────────────────────────
export const LOOK = (t: number) => ({
  exposure: keyed([[0, 0], [0.6, 0], [3.2, 1.15], [33, 1.15], [33.01, 1.45], [46.5, 1.45], [46.51, 0.05], [58.5, 0.05], [58.51, 1.05], [70.5, 1.05], [76, 1.0], [83, 0.62], [97.5, 0.62], [98.7, 0.72]], t),
  warmScatter: 0.32,
  haze: keyed([[0, 0.011], [22.5, 0.011], [32.8, 0.02], [33, 0.012], [70, 0.012], [76, 0.012], [82, 0.0055]], t),
  sunScatter: 11,
  hazeFalloff: 38,
  ambScatter: keyed([[0, 0.35], [76, 0.35], [83, 0.28]], t),
  bar: BAR_239 * (1 - keyed([[64.5, 0], [76.5, 1]], t)),
  bloom: keyed([[0, 0.06], [76, 0.06], [83, 0.09]], t),
  grain: 0.028,
});
export const topSun = (t: number) => keyed([[0, 9], [76, 9], [82, 2.2]], t);
export const warmSun = (t: number) => keyed([[0, 0], [76.4, 0], [82.6, 11]], t);
export const skyWarm = (t: number) => keyed([[0, 0], [75.5, 0], [82, 1]], t);

// ── titles ───────────────────────────────────────────────────────────────────────────
export type Super = {t0: number; t1: number; lines: string[]; accent?: string; align?: 'center' | 'left'};
export const SUPERS: Super[] = [
  {t0: 6.2, t1: 9.5, lines: ['Your team is working.']},
  {t0: 9.9, t1: 13.2, lines: ['You’re still chasing.']},
  {t0: 25.2, t1: 31.2, lines: ['Knowing where the work stands', 'has become another job.']},
  {t0: 38.0, t1: 44.6, lines: ['Agentic processes', 'to unlock bandwidth.'], accent: 'bandwidth.'},
  {t0: 61.8, t1: 68.6, lines: ['A sign-off is someone', 'else’s starting point.']},
  {t0: 92.1, t1: 97.2, lines: ['Offload the chaos.', 'Make room', 'for your best work.'], align: 'left'},
];
export const SILENCES: [number, number][] = [
  [33.0, 34.45],
  [91.45, 92.05],
];

// ── end card ─────────────────────────────────────────────────────────────────────────
export const END = {
  dissolve: [98.6, 100.0] as [number, number], // window → vector mark (same place, same size)
  lockup: [100.6, 101.9] as [number, number], // mark moves to the lockup; wordmark reveals
  tagline: [102.4, 103.4] as [number, number],
  settle: 101.9, // sonic logo lands here
};
