// The one product moment: a sheet of light on the desk showing the site's own example —
// MSA clause 12.2, the playbook redline, and the decision that needs a person.
// Copy is verbatim from the Rilin bandwidth page (Legal process, "Aster workspace").
import * as THREE from 'three';

export const PANEL_W = 0.46; // metres
export const PANEL_H = 0.31;
const CW = 1840;
const CH = Math.round((CW * PANEL_H) / PANEL_W);

export type PanelState = {on: number; strike: number; insert: number; matched: number; judge: number; press: number; approved: number};

const C = {
  paper: '#F3F1E8',
  ink: '#0B2530',
  grey: '#4A5654',
  line: 'rgba(22,51,59,0.14)',
  red: '#A8402F',
  green: '#1F6464',
  greenBg: 'rgba(41,115,115,0.12)',
  navy: '#072939',
  tag: 'rgba(22,51,59,0.08)',
};

// lay out words with wrapping; each run can carry a style
type Run = {text: string; color: string; strike?: number; bg?: string; reveal?: number};
const flow = (g: CanvasRenderingContext2D, runs: Run[], x0: number, y0: number, maxW: number, lh: number) => {
  let x = x0;
  let y = y0;
  for (const run of runs) {
    const words = run.text.split(/(\s+)/);
    const total = run.text.length;
    let shown = 0;
    for (const w of words) {
      const ww = g.measureText(w).width;
      if (x + ww > x0 + maxW && w.trim()) {
        x = x0;
        y += lh;
      }
      if (!w.trim()) {
        x += ww;
        shown += w.length;
        continue;
      }
      // partial reveal for written-in insertions (left to right, by character)
      const frac = run.reveal === undefined ? 1 : Math.min(Math.max(run.reveal * total - shown, 0) / w.length, 1);
      shown += w.length;
      if (frac <= 0) continue;
      if (run.bg) {
        g.fillStyle = run.bg;
        g.fillRect(x - 3, y - lh * 0.72, ww * frac + 6, lh * 0.92);
      }
      g.save();
      g.beginPath();
      g.rect(x - 2, y - lh, ww * frac + 4, lh * 1.4);
      g.clip();
      g.fillStyle = run.color;
      g.fillText(w, x, y);
      g.restore();
      if (run.strike && run.strike > 0) {
        g.fillStyle = run.color;
        g.fillRect(x - 2, y - lh * 0.28, (ww + 4) * Math.min(1, run.strike), 3);
      }
      x += ww;
    }
  }
  return y;
};

export class DeskPanel {
  canvas = document.createElement('canvas');
  texture: THREE.CanvasTexture;
  private last = '';
  constructor(private fonts: {text: string; mono: string}) {
    this.canvas.width = CW;
    this.canvas.height = CH;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 16;
    this.draw({on: 1, strike: 0, insert: 0, matched: 0, judge: 0, press: 0, approved: 0});
  }

  draw(s: PanelState) {
    const key = JSON.stringify(Object.values(s).map((v) => Math.round(v * 60)));
    if (key === this.last) return;
    this.last = key;
    const g = this.canvas.getContext('2d')!;
    const serif = 'Georgia, "Times New Roman", serif';
    g.fillStyle = C.paper;
    g.fillRect(0, 0, CW, CH);
    const L = 96;
    // document header
    g.fillStyle = C.ink;
    g.font = `600 26px ${this.fonts.text}`;
    g.fillText('ASTER', L, 92);
    g.fillStyle = C.grey;
    g.font = `500 22px ${this.fonts.mono}`;
    g.textAlign = 'right';
    g.fillText('MASTER SERVICES AGREEMENT', CW - L, 92);
    g.textAlign = 'left';
    g.fillStyle = C.line;
    g.fillRect(L, 124, CW - 2 * L, 2);
    // clause
    g.fillStyle = C.ink;
    g.font = `400 56px ${serif}`;
    g.fillText('12. Limitation of liability', L, 214);
    g.font = `400 38px ${serif}`;
    let y = flow(g, [{text: '12.1 Each party shall be responsible for its obligations under this Agreement.', color: C.grey}], L, 290, CW - 2 * L, 56);
    y = flow(
      g,
      [
        {text: '12.2 The aggregate liability of either party shall not exceed ', color: C.ink},
        {text: 'three times the annual fees', color: s.strike > 0 ? C.red : C.ink, strike: s.strike},
        {text: ' ', color: C.ink},
        {text: 'the fees paid in the preceding twelve months', color: C.green, bg: C.greenBg, reveal: s.insert},
        {text: '.', color: C.ink, reveal: s.insert >= 1 ? 1 : 0},
      ],
      L,
      y + 74,
      CW - 2 * L,
      58,
    );
    // playbook match
    if (s.matched > 0) {
      g.globalAlpha = s.matched;
      g.fillStyle = C.green;
      g.beginPath();
      g.arc(L + 9, y + 66, 9, 0, Math.PI * 2);
      g.fill();
      g.font = `500 28px ${this.fonts.text}`;
      g.fillText('Matched to your playbook · Liability cap', L + 32, y + 76);
      g.globalAlpha = 1;
    }
    // the decision
    const jy = y + 130;
    if (s.judge > 0) {
      g.globalAlpha = s.judge;
      g.fillStyle = C.line;
      g.fillRect(L, jy, CW - 2 * L, 2);
      g.fillStyle = C.tag;
      g.fillRect(L, jy + 34, 236, 44);
      g.fillStyle = C.ink;
      g.font = `600 22px ${this.fonts.mono}`;
      g.fillText('YOUR JUDGEMENT', L + 18, jy + 64);
      g.font = `400 34px ${this.fonts.text}`;
      flow(g, [{text: 'The liability position now matches your playbook. Your approval is required to move forward.', color: C.ink}], L, jy + 136, 980, 48);
      g.fillStyle = C.grey;
      g.font = `400 26px ${this.fonts.text}`;
      g.fillText('Ananya · Legal', L, jy + 262);
      // button
      const bx = CW - L - 560;
      const by = jy + 120;
      const pressed = s.press;
      if (s.approved < 1) {
        g.globalAlpha = s.judge * (1 - s.approved);
        g.fillStyle = pressed ? '#0B3A50' : C.navy;
        const inset = pressed ? 6 : 0;
        g.fillRect(bx + inset, by + inset, 560 - inset * 2, 112 - inset * 2);
        g.fillStyle = C.paper;
        g.font = `600 36px ${this.fonts.text}`;
        g.fillText('Approve for signature  →', bx + 58, by + 68);
      }
      if (s.approved > 0) {
        g.globalAlpha = s.approved;
        const ax = bx - 170;
        g.fillStyle = C.green;
        g.font = `600 32px ${this.fonts.text}`;
        g.fillText('✓  Approved version ready for signature', ax, by + 40);
        g.font = `400 25px ${this.fonts.text}`;
        flow(g, [{text: 'The approval is recorded. Finance is notified; the signing task is ready.', color: C.grey}], ax + 46, by + 88, CW - L - ax - 46, 36);
      }
      g.globalAlpha = 1;
    }
    this.texture.needsUpdate = true;
  }
}
