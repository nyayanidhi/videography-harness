// Small motion helpers shared by the v2 product components (house curves only).
import type {CSSProperties} from 'react';
import {ease, tw} from '../../theme';

// fcRise (rilin.ai): rise + fade on the enter curve. dy is film-scale (site 10 px × ~2).
export const rise = (f: number, start: number, dur = 30, dy = 20): CSSProperties => {
  const p = tw(f, [start, start + dur], [0, 1], ease.enter);
  return {opacity: tw(f, [start, start + dur * 0.5], [0, 1], ease.standard), transform: `translateY(${(1 - p) * dy}px)`};
};

// 0→1 progress for drawing a stroke
export const draw = (f: number, start: number, dur = 18, easing = ease.move) => tw(f, [start, start + dur], [0, 1], easing);

// Quick scale tick when a status cuts (starts a hair large, settles to 1)
export const tick = (f: number, at: number, amt = 0.08, dur = 12) => (f < at ? 1 : 1 + amt * (1 - tw(f, [at, at + dur], [0, 1], ease.enter)));

