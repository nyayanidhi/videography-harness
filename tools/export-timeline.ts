// Export the film's timeline as JSON for the score: every sound event with its time,
// stereo position (from where it is on screen in the active shot) and distance.
import {writeFileSync} from 'node:fs';
import {project} from '../src/room/project';
import {W} from '../src/room/config';
import {BEAT, BPM, camera, CUTS, END, FINANCE_STAND, GRID0, HANDOFF, LANES, LENGTH, MOVES, PINGS, PRESS, REVEALS, SHOTS, SILENCES, SUPERS, panelState} from '../src/room/timeline';
import {COLUMNS} from '../src/room/world/layout';

const where = (t: number, p: [number, number, number]) => {
  const cs = camera(t, t);
  const s = project(cs, p);
  const onScreen = s.depth > 0 && s.x > -100 && s.x < W + 100;
  const pan = s.depth > 0 ? Math.max(-1, Math.min(1, (s.x / W) * 2 - 1)) : 0;
  const dist = Math.hypot(p[0] - cs.pos[0], p[1] - cs.pos[1], p[2] - cs.pos[2]);
  return {pan: +pan.toFixed(3), dist: +dist.toFixed(2), onScreen};
};
const shotOf = (t: number) => SHOTS.find((s) => t >= s.t0 && t < s.t1)?.id ?? '';

const out = {
  length: LENGTH,
  bpm: BPM,
  beat: BEAT,
  grid0: GRID0,
  cuts: CUTS,
  shots: SHOTS.map((s) => ({id: s.id, t0: s.t0, t1: s.t1})),
  silences: SILENCES,
  supers: SUPERS.map((s) => ({t0: s.t0, t1: s.t1, text: s.lines.join(' ')})),
  pings: PINGS.map((p) => ({t: +p.t.toFixed(4), shot: shotOf(p.t), y: +p.y.toFixed(2), ...where(p.t, p.pos)})),
  moves: MOVES.map((m) => {
    const c = COLUMNS[m.col];
    return {t: m.start, dur: m.dur, side: m.side, z: c.z, ...where(m.start, [c.x, 3, c.z])};
  }),
  lanes: LANES.map((l) => ({t: l.start, dur: l.dur, side: Math.sign(l.x1), z: l.z})),
  press: PRESS,
  panel: {strike: 48.0, insert: [49.1, 50.9], matched: 51.1, judge: 52.1, approved: 56.2, on: 45.6},
  handoff: {t: HANDOFF.start, dur: HANDOFF.dur},
  financeStand: FINANCE_STAND[0][0],
  reveals: REVEALS,
  end: END,
};
void panelState;
writeFileSync(process.argv[2] ?? 'out/room/timeline.json', JSON.stringify(out, null, 1));
console.log(`pings ${out.pings.length}, moves ${out.moves.length}, lanes ${out.lanes.length}, cuts ${out.cuts.length}`);
