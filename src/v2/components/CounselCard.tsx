// Beat 10 tail: Specialist counsel card (rilin.ai §4, docs/rilin/site/32-specialist-counsel.png)
// at 1.76× site scale. Per the film rules: an initials disc ("SC", from the title), no name, no photo.
// The disc uses the app's avatar-fallback treatment (teal #007574 with white initials).
// Copy verbatim: Specialist Counsel · Employment Law · Matter / Non-compete enforceability ·
// Contract / MSA-2026-014 · Consult Counsel.
import {interpolate, interpolateColors} from 'remotion';
import {ease, tw} from '../../theme';
import {COL, FONT} from '../tokens';
import {Cursor, rise} from '../ui';

const W = 720;
const PAD = 28;
const DISC = 128;
const Y = {header: PAD, rule1: PAD + DISC + 28, meta: PAD + DISC + 28 + 1 + 28, rule2: 0, button: 0};
Y.rule2 = Y.meta + 74 + 28;
Y.button = Y.rule2 + 1 + 28;
const BTN_H = 68;
const H = Y.button + BTN_H + PAD;

export const COUNSEL_CARD = {
  w: W,
  h: H,
  anchors: {
    /** left edge, vertical centre of the card (where a contrail can arrive) */
    left: {x: 0, y: H / 2},
    /** centre of the initials disc */
    disc: {x: PAD + DISC / 2, y: Y.header + DISC / 2},
    /** centre of the Consult Counsel button */
    button: {x: W / 2, y: Y.button + BTN_H / 2},
  },
  t: {
    slideIn: [0, 30] as [number, number],
    loaded: 52, // Matter / Contract values have landed
    /** default press timing when `pressAt` is given: cursor glides 40 f, presses 6 f, releases */
    pressLead: 46,
  },
};
const T = COUNSEL_CARD.t;

/** f: local frame. pressAt: optional local frame of a Consult Counsel click (cursor glides in before it). */
export const CounselCard: React.FC<{f: number; pressAt?: number}> = ({f, pressAt}) => {
  const slide = tw(f, T.slideIn, [0, 1], ease.enter);
  const op = tw(f, [T.slideIn[0], T.slideIn[0] + 12], [0, 1], ease.standard);

  // optional click
  const pa = pressAt ?? 1e9;
  const press = tw(f, [pa - 6, pa], [0, 1], ease.standard) * (1 - tw(f, [pa, pa + 8], [0, 1], ease.enter));
  const confirmed = tw(f, [pa, pa + 10], [0, 1], ease.standard);
  const g = tw(f, [pa - T.pressLead, pa - 8], [0, 1], ease.move);
  const target = COUNSEL_CARD.anchors.button;
  const cx = interpolate(g, [0, 1], [target.x + 260, target.x + 40]);
  const cy = interpolate(g, [0, 1], [target.y + 220, target.y + 8]) - Math.sin(Math.PI * g) * 30;
  const cOp = tw(f, [pa - T.pressLead, pa - T.pressLead + 8], [0, 1], ease.standard);

  const label: React.CSSProperties = {fontSize: 24, fontWeight: 300, color: COL.muted, lineHeight: '30px'};
  const value: React.CSSProperties = {fontSize: 27, fontWeight: 400, color: COL.ink, lineHeight: '36px', marginTop: 8};

  return (
    <div style={{position: 'relative', width: W, height: H, opacity: op, transform: `translateX(${(1 - slide) * 80}px)`}}>
      <div style={{position: 'absolute', inset: 0, boxSizing: 'border-box', background: COL.card, border: `1px solid ${COL.hair}`, borderRadius: 2, fontFamily: FONT.text, color: COL.ink}}>
        {/* header: initials disc + title / practice area */}
        <div style={{position: 'absolute', left: PAD, top: Y.header, display: 'flex', alignItems: 'center', gap: 28}}>
          <div style={{width: DISC, height: DISC, borderRadius: DISC / 2, background: COL.teal, color: COL.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 400, letterSpacing: 1.5, ...rise(f, 8, 26, 10)}}>SC</div>
          <div style={rise(f, 12, 26, 10)}>
            <div style={{fontSize: 34, fontWeight: 500, letterSpacing: -0.3, lineHeight: '42px'}}>Specialist Counsel</div>
            <div style={{fontSize: 26, fontWeight: 300, opacity: 0.6, lineHeight: '34px', marginTop: 6}}>Employment Law</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: PAD, right: PAD, top: Y.rule1, height: 1, background: COL.hair}} />
        {/* context, "loaded" */}
        <div style={{position: 'absolute', left: PAD, top: Y.meta, display: 'flex'}}>
          <div style={{width: 432}}>
            <div style={{...label, ...rise(f, 22, 24, 8)}}>Matter</div>
            <div style={{...value, ...rise(f, 34, 26, 10)}}>Non-compete enforceability</div>
          </div>
          <div>
            <div style={{...label, ...rise(f, 26, 24, 8)}}>Contract</div>
            <div style={{...value, ...rise(f, 40, 26, 10)}}>MSA-2026-014</div>
          </div>
        </div>
        <div style={{position: 'absolute', left: PAD, right: PAD, top: Y.rule2, height: 1, background: COL.hair}} />
        {/* Consult Counsel */}
        <div style={{position: 'absolute', left: PAD, right: PAD, top: Y.button, height: BTN_H, ...rise(f, 46, 26, 8)}}>
          <div
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              background: interpolateColors(confirmed, [0, 1], [COL.navy, COL.teal]),
              border: `1px solid ${interpolateColors(confirmed, [0, 1], ['#556C76', COL.teal])}`,
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COL.card,
              fontSize: 30,
              fontWeight: 300,
              letterSpacing: -0.5,
              transform: `scale(${1 - 0.04 * press})`,
            }}
          >
            Consult Counsel
          </div>
        </div>
      </div>
      {pressAt !== undefined && cOp > 0 && <Cursor x={cx} y={cy} size={46} press={press} opacity={cOp} />}
    </div>
  );
};
