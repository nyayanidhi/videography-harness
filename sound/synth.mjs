// Procedural sound design. Reads cues (seconds) and writes a 48k stereo WAV.
// usage: node sound/synth.mjs src/cues.json public/sfx.wav
import fs from 'node:fs';

const SR = 48000;
const [, , cueFile, outFile] = process.argv;
const {duration, cues} = JSON.parse(fs.readFileSync(cueFile, 'utf8'));
const N = Math.ceil(duration * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);

let seed = 1337;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// Chamberlin state-variable filter
const svf = () => {
  let lp = 0, bp = 0;
  return (x, fc, q = 0.7) => {
    const f = 2 * Math.sin((Math.PI * clamp(fc, 20, SR / 6)) / SR);
    const hp = x - lp - q * bp;
    bp += f * hp;
    lp += f * bp;
    return {lp, bp, hp};
  };
};

const add = (t0, len, fn) => {
  const s0 = Math.floor(t0 * SR);
  const n = Math.floor(len * SR);
  for (let i = 0; i < n && s0 + i < N; i++) {
    if (s0 + i < 0) continue;
    const [l, r] = fn(i / SR, i / n);
    L[s0 + i] += l;
    R[s0 + i] += r;
  }
};
const panLR = (x, p) => [x * Math.cos(((p + 1) * Math.PI) / 4), x * Math.sin(((p + 1) * Math.PI) / 4)];

const voices = {
  // airy pass-by: bandpassed noise, cutoff + pan sweep
  whoosh({t, len = 0.9, gain = 0.5, from = -0.8, to = 0.8, lo = 300, hi = 4000}) {
    const f = svf();
    add(t, len, (_, u) => {
      const env = Math.sin(Math.PI * Math.pow(u, 0.7)) ** 2;
      const fc = lo + (hi - lo) * Math.sin(Math.PI * u);
      return panLR(f(rnd(), fc, 0.5).bp * env * gain, from + (to - from) * u);
    });
  },
  // tension build ending exactly at t
  riser({t, len = 2, gain = 0.35}) {
    const f = svf();
    let ph = 0;
    add(t - len, len, (_, u) => {
      const env = Math.pow(u, 2.2);
      const freq = 80 + 900 * Math.pow(u, 2);
      ph += (2 * Math.PI * freq) / SR;
      const tone = Math.sin(ph) * 0.25 + Math.sin(ph * 1.5) * 0.12;
      const n = f(rnd(), 400 + 7000 * u, 0.6).bp;
      const x = (tone + n * 0.8) * env * gain;
      return [x, x];
    });
  },
  // cinematic low hit: pitch-dropped sine + click + noise tail
  impact({t, gain = 0.9, len = 1.6, f0 = 110, f1 = 38}) {
    const f = svf();
    let ph = 0;
    add(t, len, (s, u) => {
      const freq = f1 + (f0 - f1) * Math.exp(-s * 18);
      ph += (2 * Math.PI * freq) / SR;
      const body = Math.sin(ph) * Math.exp(-s * 3.2);
      const click = rnd() * Math.exp(-s * 260) * 0.5;
      const tail = f(rnd(), 900, 0.8).lp * Math.exp(-s * 6) * 0.35;
      const x = Math.tanh((body + click + tail) * 1.4) * gain * (1 - u * 0.2);
      return [x, x];
    });
  },
  // short typographic tick
  tick({t, gain = 0.25, pan = 0, freq = 3200}) {
    const f = svf();
    add(t, 0.05, (s) => panLR(f(rnd(), freq, 0.3).bp * Math.exp(-s * 140) * gain, pan));
  },
  // jet take-off roar: brown noise with opening lowpass, ends at t+len
  jet({t, len = 3, gain = 0.5}) {
    const f = svf();
    let b = 0;
    add(t, len, (_, u) => {
      b = (b + rnd() * 0.02) * 0.998;
      const env = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15) * 0.5), 1.5) * (u > 0.85 ? (1 - u) / 0.15 : 1);
      const x = f(b * 2.2, 120 + 2600 * Math.pow(u, 1.8), 0.4).lp * env * gain;
      return panLR(x, -0.2 + 0.4 * u);
    });
  },
  // low bed under everything
  drone({t, len, gain = 0.12, f0 = 55}) {
    let a = 0, b = 0;
    add(t, len, (s, u) => {
      a += (2 * Math.PI * f0) / SR;
      b += (2 * Math.PI * f0 * 1.501) / SR;
      const env = Math.min(1, s / 1.5) * Math.min(1, (1 - u) * len / 1.5);
      const breath = 0.8 + 0.2 * Math.sin(s * 0.9);
      return [Math.sin(a) * env * gain * breath, Math.sin(b) * env * gain * 0.6 * breath];
    });
  },
  // soft FM bell; notes in Hz
  bell({t, notes = [587.33], spread = 0.12, gain = 0.28, len = 3}) {
    notes.forEach((hz, k) => {
      let pc = 0, pm = 0;
      add(t + k * spread, len, (s) => {
        pm += (2 * Math.PI * hz * 3.5) / SR;
        pc += (2 * Math.PI * hz) / SR + Math.sin(pm) * 0.0009 * Math.exp(-s * 4) * 60;
        const x = Math.sin(pc) * Math.exp(-s * 1.6) * gain * Math.min(1, s * 400);
        return panLR(x, (k - (notes.length - 1) / 2) * 0.35);
      });
    });
  },
};

for (const c of cues) {
  if (!voices[c.type]) throw new Error(`unknown voice ${c.type}`);
  voices[c.type](c);
}

// Schroeder reverb send for space
const reverb = (buf) => {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({d, b: new Float32Array(d), i: 0}));
  const aps = [225, 556].map((d) => ({d, b: new Float32Array(d), i: 0}));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) {
      const y = c.b[c.i];
      c.b[c.i] = buf[n] + y * 0.82;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    for (const a of aps) {
      const y = a.b[a.i];
      a.b[a.i] = s + y * 0.5;
      a.i = (a.i + 1) % a.d;
      s = y - s * 0.5;
    }
    out[n] = s * 0.12;
  }
  return out;
};
const rl = reverb(L), rr = reverb(R);

let peak = 0;
for (let n = 0; n < N; n++) peak = Math.max(peak, Math.abs(L[n] + rl[n]), Math.abs(R[n] + rr[n]));
const norm = peak > 0 ? 0.89 / peak : 1;

const data = Buffer.alloc(N * 4);
for (let n = 0; n < N; n++) {
  data.writeInt16LE(Math.round(clamp((L[n] + rl[n]) * norm, -1, 1) * 32767), n * 4);
  data.writeInt16LE(Math.round(clamp((R[n] + rr[n]) * norm, -1, 1) * 32767), n * 4 + 2);
}
const h = Buffer.alloc(44);
h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
h.write('data', 36); h.writeUInt32LE(data.length, 40);
fs.writeFileSync(outFile, Buffer.concat([h, data]));
console.log(`wrote ${outFile} (${duration}s, peak ${peak.toFixed(2)})`);
