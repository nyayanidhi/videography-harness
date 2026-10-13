// Builds sound/cues.json from the film schedule (mirror of F in src/theme.ts), then renders public/sfx.wav
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

const fps = 60;
const sec = (f) => +(f / fps).toFixed(4);
const F = {launch: 285, follow: [390, 480], wp0: 510, wpLen: 150, land: [1410, 1500], wordmark: 1575, sonic: 1590};
const wp = (k) => F.wp0 + k * F.wpLen;

let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const cues = [
  {type: 'drone', t: 0, len: sec(1540), gain: 0.1},
  {type: 'tick', t: sec(59), gain: 0.18, freq: 3000},
  {type: 'tick', t: sec(63), gain: 0.12, freq: 4000},
  {type: 'tick', t: sec(374), gain: 0.18, freq: 3000},
];
// granular lock-in as the mark assembles (bottom-up, 30–215)
for (let i = 0; i < 70; i++) {
  const u = Math.pow(rnd(), 0.9);
  cues.push({type: 'tick', t: sec(45 + u * 165), gain: 0.05 + rnd() * 0.08, freq: 2500 + rnd() * 4000, pan: rnd() * 1.4 - 0.7});
}
cues.push(
  {type: 'riser', t: sec(F.launch), len: 3.0, gain: 0.4},
  {type: 'impact', t: sec(F.launch), gain: 0.9},
  {type: 'whoosh', t: sec(F.launch + 4), len: 1.3, gain: 0.5, from: 0, to: 0.2, lo: 180, hi: 2600},
  {type: 'whoosh', t: sec(F.follow[0]), len: 1.5, gain: 0.35, from: -0.3, to: 0.3, lo: 150, hi: 1400},
);
for (let k = 0; k < 6; k++) {
  const f = wp(k);
  cues.push(
    {type: 'whoosh', t: sec(f - 21), len: 0.75, gain: 0.55, from: k % 2 ? 0.6 : -0.6, to: k % 2 ? -0.6 : 0.6, lo: 250, hi: 3800},
    {type: 'tick', t: sec(f - 7), gain: 0.3, freq: 3000},
    {type: 'tick', t: sec(f + 7), gain: 0.18, freq: 4200},
  );
}
cues.push(
  {type: 'riser', t: sec(F.land[1]), len: 2.4, gain: 0.3},
  {type: 'whoosh', t: sec(F.land[0]), len: 1.4, gain: 0.4, from: 0.5, to: -0.4, lo: 200, hi: 2000},
  {type: 'impact', t: sec(F.land[1]), gain: 0.55, f0: 90, len: 1.0},
  // ~400 ms of near-silence, then the sonic logo on the wordmark's settle
  {type: 'bell', t: sec(F.sonic), notes: [587.33, 880, 1174.66], spread: 0.11, gain: 0.3, len: 1.25},
  {type: 'impact', t: sec(F.sonic), gain: 0.35, f0: 70, f1: 36, len: 1.2},
);

fs.writeFileSync('sound/cues.json', JSON.stringify({duration: 30, cues}, null, 1));
execFileSync('node', ['sound/synth.mjs', 'sound/cues.json', 'public/sfx.wav'], {stdio: 'inherit'});
