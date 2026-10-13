import {Easing, interpolate} from 'remotion';
import {loadFont} from '@remotion/google-fonts/InstrumentSans';

export const font = loadFont('normal', {weights: ['500', '600'], subsets: ['latin']}).fontFamily;

// Four colours. Navy-tinted off-black and warm paper; teal is the brand's own.
export const C = {
  ink: '#11161F',
  paper: '#F2F0EA',
  teal: '#007574',
  grey: '#7C8490',
};

export const FPS = 60;
export const BEAT = 30; // 120 BPM
export const TOTAL = 1800; // 30 s

// The film's only four curves
export const ease = {
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  exit: Easing.bezier(0.7, 0, 0.84, 0),
  move: Easing.bezier(0.65, 0, 0.35, 1),
  standard: Easing.bezier(0.2, 0, 0, 1),
};

export const tw = (f: number, range: [number, number], out: [number, number], easing = ease.enter) =>
  interpolate(f, range, out, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

// 12-col grid, 120 px margins, 24 px gutters → 118 px columns
export const col = (n: number) => 120 + n * 142;

export const LINE = 2; // hairline weight

// Scene boundaries (global frames)
export const T = {
  takeoffCut: 330,
  bank: 420,
  waypoints: 510,
  landing: 1410,
};
export const WP_LEN = 150;


// Light-ground palette (four colours): off-white ground, ink foreground, Rilin teal, light grey
export const D = {
  ground: '#FAFAF7',
  fg: '#11161F',
  teal: '#007574',
  grey: '#B9BEC5',
};

// Film schedule (global frames @60fps)
export const F = {
  hudIn: 12,
  launch: 285,
  follow: [390, 480] as [number, number],
  wp0: 510,
  wpLen: 150,
  land: [1410, 1500] as [number, number],
  wordmark: 1575,
  sonic: 1590,
};
export const wpFrame = (k: number) => F.wp0 + k * F.wpLen;
