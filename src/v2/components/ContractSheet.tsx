// Beat 1 (0–4 s): the Master Services Agreement sheet slides up, is signed, and is stamped
// DAY 1 · CONTRACT EXECUTED. Rebuilt from rilin.ai's contract sheet (docs/rilin/site/22-contract-card.png)
// at ~2.5× site scale. Local frames; top-left at 0,0.
import {interpolate} from 'remotion';
import {ease, tw} from '../../theme';
import {COL, FONT} from '../tokens';
import {rise} from '../ui';

const W = 500;
const H = 700;
const PX = 44; // side padding
const FOLD = 30; // folded top-right corner

// Signature box (component-local)
const SIG = {x: PX - 6, y: 478, w: 330, h: 118};
const SIG_LINE_Y = 588;
const STAMP = {x: PX, y: 616};

export const CONTRACT_SHEET = {
  w: W,
  h: H,
  anchors: {
    /** launch pad: centre of the sheet's top edge */
    launchPad: {x: W / 2, y: 0},
    /** left end of the signature line (where the pen starts) */
    signatureStart: {x: PX, y: SIG_LINE_Y},
    /** top-left of the DAY 1 · CONTRACT EXECUTED tag */
    stamp: {x: STAMP.x, y: STAMP.y},
  },
  /** local frame timeline */
  t: {
    slideIn: [0, 48] as [number, number],
    signature: [62, 134] as [number, number],
    flourish: [128, 150] as [number, number],
    stamp: 156, // tag lands (impact frame = stamp + 8)
    rest: 186,
  },
};
const T = CONTRACT_SHEET.t;

// Abstract signature: a pen trajectory, not letters. A chain of slanted cursive loops
// (prolate-cycloid pen path) with a tall entry loop and varied loop heights, then a long
// return underline. No name. Coordinates in the 330 × 118 box.
const sigPath = () => {
  // one entry per turn: [height (negative = descender loop), forward travel of that turn]
  const turns: [number, number][] = [
    [84, 42],
    [20, 30],
    [32, 22],
    [15, 24],
    [52, 32],
    [18, 24],
    [11, 22],
    [7, 58],
  ];
  const base = 78;
  const pts: string[] = [];
  let x0 = 10;
  turns.forEach(([h, adv], j) => {
    const steps = 70;
    const next = turns[j + 1]?.[0] ?? 0;
    for (let i = j === 0 ? 0 : 1; i <= steps; i++) {
      const u = i / steps;
      const ph = 2 * Math.PI * u;
      const hh = j === turns.length - 1 ? h * (1 - u) : h;
      // blend into the next turn's height over the last 20% so joins stay smooth
      const blend = u > 0.8 ? (1 - Math.cos(Math.PI * (u - 0.8) / 0.2)) / 2 : 0;
      const H = hh * (1 - blend) + next * blend * 0;
      const w = 4 + 0.09 * Math.abs(H) + 3; // loop width grows with height
      const lift = -((1 - Math.cos(ph)) / 2) * H;
      const y = base + lift;
      const x = x0 + adv * u + w * Math.sin(ph) * Math.sign(H || 1) + 0.36 * (base - y);
      pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    x0 += adv;
  });
  return 'M ' + pts.join(' L ');
};
const SIG_MAIN = sigPath();
const SIG_FLOURISH = 'M 300 70 C 240 96, 120 104, 30 98';

export const ContractSheet: React.FC<{f: number}> = ({f}) => {
  // sheet slides up
  const slide = tw(f, T.slideIn, [1, 0], ease.enter);
  const fade = tw(f, [0, 16], [0, 1], ease.standard);

  // stamp lands: drops from 1.14× and settles; the sheet takes a 3 px impact dip
  const sIn = tw(f, [T.stamp, T.stamp + 10], [0, 1], ease.enter);
  const sOp = tw(f, [T.stamp, T.stamp + 5], [0, 1], ease.standard);
  const dip = tw(f, [T.stamp + 6, T.stamp + 10], [0, 1], ease.standard) * (1 - tw(f, [T.stamp + 10, T.stamp + 28], [0, 1], ease.enter));

  const sig = tw(f, T.signature, [0, 1], ease.move);
  const flo = tw(f, T.flourish, [0, 1], ease.enter);
  const lineDraw = tw(f, [40, 76], [0, 1], ease.enter);

  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        opacity: fade,
        transform: `translateY(${slide * 160 + dip * 3}px)`,
      }}
    >
      {/* sheet with folded corner: SVG so the 1 px hairline follows the diagonal */}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={`M0.5 2.5 Q0.5 0.5 2.5 0.5 L${W - FOLD - 0.5} 0.5 L${W - 0.5} ${FOLD + 0.5} L${W - 0.5} ${H - 2.5} Q${W - 0.5} ${H - 0.5} ${W - 2.5} ${H - 0.5} L2.5 ${H - 0.5} Q0.5 ${H - 0.5} 0.5 ${H - 2.5} Z`} fill={COL.card} stroke={COL.hair} />
        <path d={`M${W - FOLD - 0.5} 0.5 L${W - FOLD - 0.5} ${FOLD - 1.5} Q${W - FOLD - 0.5} ${FOLD + 0.5} ${W - FOLD + 1.5} ${FOLD + 0.5} L${W - 0.5} ${FOLD + 0.5} Z`} fill={COL.skeleton} stroke={COL.hair} strokeLinejoin="round" />
      </svg>

      {/* eyebrow */}
      <div style={{position: 'absolute', left: PX, top: 56, display: 'flex', alignItems: 'center', gap: 14, ...rise(f, 16, 29, 18)}}>
        <div style={{width: 4, height: 30, background: COL.navy}} />
        <span style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, letterSpacing: 2.6, color: COL.navy, lineHeight: 1}}>CONTRACT</span>
      </div>

      {/* title */}
      <div
        style={{
          position: 'absolute',
          left: PX,
          top: 112,
          fontFamily: FONT.text,
          fontWeight: 500,
          fontSize: 54,
          lineHeight: '61px',
          letterSpacing: -0.6,
          color: COL.ink,
          ...rise(f, 21, 29, 18),
        }}
      >
        Master
        <br />
        Services
        <br />
        Agreement
      </div>

      {/* skeleton clause lines (site widths 171 / 149 / 171 / 140) */}
      {[1, 0.87, 1, 0.82].map((w, i) => (
        <div key={i} style={{position: 'absolute', left: PX, top: 336 + i * 34, width: (W - 2 * PX) * w, height: 16, background: COL.skeleton, borderRadius: 2, ...rise(f, 26 + i * 5, 29, 18)}} />
      ))}

      {/* signature */}
      <svg width={SIG.w} height={SIG.h} viewBox={`0 0 ${SIG.w} ${SIG.h}`} style={{position: 'absolute', left: SIG.x, top: SIG.y, overflow: 'visible'}}>
        <path d={SIG_MAIN} fill="none" stroke={COL.navy} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - sig} opacity={sig > 0 ? 1 : 0} />
        <path d={SIG_FLOURISH} fill="none" stroke={COL.navy} strokeWidth={2.6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - flo} opacity={flo > 0 ? 1 : 0} />
      </svg>

      {/* signature line */}
      <div style={{position: 'absolute', left: PX, top: SIG_LINE_Y, width: (W - 2 * PX) * 0.78 * lineDraw, height: 1.5, background: 'rgba(7,41,57,0.38)'}} />

      {/* DAY 1 · CONTRACT EXECUTED stamp */}
      <div
        style={{
          position: 'absolute',
          left: STAMP.x,
          top: STAMP.y,
          opacity: sOp,
          transform: `scale(${interpolate(sIn, [0, 1], [1.16, 1])})`,
          transformOrigin: '30% 50%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: COL.navy,
          color: COL.card,
          padding: '12px 18px',
          fontFamily: FONT.mono,
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: 2,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        <span>DAY 1</span>
        <span style={{width: 5, height: 5, background: COL.card, opacity: 0.6, borderRadius: 3}} />
        <span>CONTRACT EXECUTED</span>
      </div>
    </div>
  );
};
