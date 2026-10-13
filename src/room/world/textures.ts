// Procedural textures, drawn once into canvases. Everything deterministic (seeded).
import * as THREE from 'three';
import {rng} from './rng';

// The work around the work: verbatim fragments from the Rilin bandwidth site and its
// interactive examples (all illustrative records on the site itself).
export const FRAGMENTS: {label: string; line: string; sub?: string}[] = [
  {label: 'EMAIL · 10:42 AM', line: 'Re: any update on this?', sub: 'Looping in Finance. Who has the latest version?'},
  {label: 'TEAM CHAT · 11:06 AM', line: '“I thought Legal had it.”', sub: 'Can someone check with Ananya?'},
  {label: 'YOUR TO-DO LIST', line: 'Follow up with Legal', sub: 'Get the missing invoice'},
  {label: 'YOUR TO-DO LIST', line: 'Ask if the vendor is approved'},
  {label: 'EMAIL', line: '3 forwards · 2 attachments'},
  {label: 'STATUS', line: 'Actual status: someone needs to ask.'},
  {label: 'FOCUS', line: 'Re: final_final_v7.docx', sub: 'Who’s waiting on whom?'},
  {label: 'TEAM CHAT', line: 'Can you chase Finance?'},
  {label: 'SUPPLY AGREEMENT · V8', line: 'In review'},
  {label: 'SEPTEMBER · INVOICE RECONCILIATION', line: 'Match invoice INV-204 to PO-089', sub: 'Confirm goods receipt with Operations'},
  {label: 'WEEK 38 · OPERATING REVIEW', line: 'Collect updates from 10 team leads', sub: 'Follow up on two missing site reports'},
  {label: 'PRE-SALES · WEEKLY TEAM REVIEW', line: 'Reconcile proposal status with CRM', sub: 'Assign two overdue customer follow-ups'},
  {label: 'SERIES B · DILIGENCE PROGRAMME', line: 'Get Finance sign-off on revised accounts'},
  {label: 'MASTER SERVICES AGREEMENT.DOCX', line: 'Route liability exception to Ananya'},
  {label: 'NEHA · PROCUREMENT', line: 'Can someone check with Ananya?'},
  {label: 'INV-204 + PO-089 + GRN-114', line: 'Resolve ₹12,000 quantity variance'},
];

const finish = (c: HTMLCanvasElement, srgb = true) => {
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
};

// 4×4 atlas, each 1024 px cell = one 6.4 m column face (≈6 mm per px).
// Faces are stacked paper: fine strata of sheet edges, with sheets of work pressed into them.
export const ATLAS_CELLS = 4;
export const makeWorkAtlas = (mono: string, sans: string) => {
  const S = 4096;
  const cell = S / ATLAS_CELLS;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const g = c.getContext('2d')!;
  const r = rng(1209);
  g.fillStyle = '#c3bfb3';
  g.fillRect(0, 0, S, S);
  // strata: sheet edges, varied in tone and thickness
  for (let y = 0; y < S; ) {
    const h = 1 + r() * 2.2;
    const l = 170 + Math.floor((r() - 0.5) * 16);
    g.fillStyle = `rgb(${l + 6},${l + 3},${l - 6})`;
    g.fillRect(0, y, S, h);
    if (r() < 0.3) {
      g.fillStyle = `rgba(40,38,34,${0.05 + r() * 0.08})`;
      g.fillRect(0, y + h - 1, S, 1);
    }
    y += h;
  }
  // per-cell sheets carrying fragments
  for (let cy = 0; cy < ATLAS_CELLS; cy++)
    for (let cx = 0; cx < ATLAS_CELLS; cx++) {
      const x0 = cx * cell;
      const y0 = cy * cell;
      const n = 1 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const f = FRAGMENTS[Math.floor(r() * FRAGMENTS.length)];
        const w = 300 + r() * 300;
        const h = 110 + r() * 60;
        const x = x0 + 30 + r() * (cell - w - 60);
        const y = y0 + 20 + r() * (cell - h - 40);
        const l = 184 + Math.floor(r() * 12);
        g.fillStyle = `rgb(${l},${l - 3},${l - 10})`;
        g.fillRect(x, y, w, h);
        g.strokeStyle = 'rgba(30,30,28,0.18)';
        g.lineWidth = 2;
        g.strokeRect(x, y, w, h);
        g.fillStyle = 'rgba(32,34,33,0.62)';
        g.font = `500 15px ${mono}`;
        g.fillText(f.label, x + 18, y + 32);
        g.fillStyle = 'rgba(24,26,25,0.7)';
        g.font = `400 28px ${sans}`;
        g.fillText(f.line, x + 18, y + 72, w - 36);
        if (f.sub) {
          g.fillStyle = 'rgba(32,34,33,0.45)';
          g.font = `400 18px ${sans}`;
          g.fillText(f.sub, x + 18, y + 100, w - 36);
        }
      }
    }
  return finish(c);
};

// Polished concrete: low-frequency mottling, fine aggregate, 6 m expansion joints.
export const makeConcrete = () => {
  const S = 2048;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const g = c.getContext('2d')!;
  const r = rng(77);
  g.fillStyle = '#76746e';
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) {
    const x = r() * S;
    const y = r() * S;
    const rad = 40 + r() * 260;
    const l = 100 + Math.floor((r() - 0.5) * 50);
    const grd = g.createRadialGradient(x, y, 0, x, y, rad);
    grd.addColorStop(0, `rgba(${l},${l - 1},${l - 5},0.10)`);
    grd.addColorStop(1, `rgba(${l},${l - 1},${l - 5},0)`);
    g.fillStyle = grd;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  for (let i = 0; i < 60000; i++) {
    const l = Math.floor(r() * 255);
    g.fillStyle = `rgba(${l},${l},${l},0.05)`;
    g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2);
  }
  // joints at the tile edges (texture spans one 6 m bay)
  g.fillStyle = 'rgba(28,27,25,0.55)';
  g.fillRect(0, 0, S, 3);
  g.fillRect(0, 0, 3, S);
  return finish(c);
};

// Notification cards for the pings: aqua light with the fragment knocked out in navy.
// 4×4 cells of 512×256 (the card is 1.1 × 0.6 m).
export const PING_CELLS = 4;
export const makePingAtlas = (mono: string, sans: string) => {
  const cw = 512;
  const ch = 256;
  const c = document.createElement('canvas');
  c.width = cw * PING_CELLS;
  c.height = ch * PING_CELLS;
  const g = c.getContext('2d')!;
  FRAGMENTS.slice(0, PING_CELLS * PING_CELLS).forEach((f, i) => {
    const x = (i % PING_CELLS) * cw;
    const y = Math.floor(i / PING_CELLS) * ch;
    g.fillStyle = '#A4D8D2';
    g.fillRect(x + 4, y + 4, cw - 8, ch - 8);
    g.fillStyle = 'rgba(7,41,57,0.72)';
    g.font = `500 22px ${mono}`;
    g.fillText(f.label.slice(0, 30), x + 34, y + 66);
    g.fillStyle = 'rgba(7,41,57,0.92)';
    g.font = `500 38px ${sans}`;
    g.fillText(f.line, x + 34, y + 132, cw - 68);
    if (f.sub) {
      g.fillStyle = 'rgba(7,41,57,0.62)';
      g.font = `400 26px ${sans}`;
      g.fillText(f.sub, x + 34, y + 182, cw - 68);
    }
  });
  return finish(c);
};
