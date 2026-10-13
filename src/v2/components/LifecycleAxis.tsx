// Beats 2–3 and 10: the contract-lifecycle axis. DAY 1 · CONTRACT EXECUTED at x=0 → DAY N ·
// LITIGATION INITIATED at x=W, with the four callouts from rilin.ai's "Liability Exposure" radar
// (docs/rilin/site/10-timeline-radar.png) laid out as flag ticks along it.
//
// Site callout grammar kept: 1 px outlined box + solid colour swatch on the left + caps label.
// Site neon (#08f40e / #fc8a21 / #fc2e21) is mapped to the film's toned status trio, and the
// colour stays inside the swatch (a bar), never on text or lines.
//
// Order follows contract time, as in the site spec: NOTICE WINDOW → PAYMENT DUE → RENEWAL
// DEADLINE → TERMINATION RIGHT. The radar places the four blips ~90° apart, so they are evenly
// spaced: at 1/5, 2/5, 3/5, 4/5 of the axis.
import {interpolate, interpolateColors} from 'remotion';
import {ease, tw} from '../../theme';
import {COL, FONT} from '../tokens';

export type MilestoneId = 'notice' | 'payment' | 'renewal' | 'termination';

const W = 9000;
const H = 240;
const AXIS_Y = 176; // axis centre line
const BOX_H = 56;
const BOX_TOP = 64; // label box top; its bottom (120) is where the tick meets it
const SWATCH = 18;

const MS: {id: MilestoneId; label: string; tone: string}[] = [
  {id: 'notice', label: 'NOTICE WINDOW', tone: COL.ok},
  {id: 'payment', label: 'PAYMENT DUE', tone: COL.caution},
  {id: 'renewal', label: 'RENEWAL DEADLINE', tone: COL.critical},
  {id: 'termination', label: 'TERMINATION RIGHT', tone: COL.ok},
];
const MX: Record<MilestoneId, number> = {notice: W * 0.2, payment: W * 0.4, renewal: W * 0.6, termination: W * 0.8};

export const LIFECYCLE_AXIS = {
  w: W,
  h: H,
  axisY: AXIS_Y,
  /** milestone tick x positions (component-local px); the tick is the flag's left edge */
  milestones: MX,
  anchors: {
    day1: {x: 0, y: AXIS_Y},
    dayN: {x: W, y: AXIS_Y},
    notice: {x: MX.notice, y: AXIS_Y},
    payment: {x: MX.payment, y: AXIS_Y},
    renewal: {x: MX.renewal, y: AXIS_Y},
    termination: {x: MX.termination, y: AXIS_Y},
  },
  /** frames the lit animation takes after its start frame */
  litDur: 24,
};

const AXIS_INK = 'rgba(7,41,57,0.30)';
const TICK_FAINT = 'rgba(7,41,57,0.22)';

type Lit = MilestoneId[] | Partial<Record<MilestoneId, number>>;

/**
 * f: local frame. drawn: 0–1, how much of the axis line is drawn (left → right), so the contrail can lead it.
 * marks: 0–1, how far along the axis the milestone ticks have appeared (default = drawn).
 * lit: either an array of ids that are fully lit, or {id: startFrame} to animate each one lighting at that local frame.
 */
export const LifecycleAxis: React.FC<{f: number; drawn?: number; marks?: number; lit?: Lit}> = ({f, drawn = 1, marks, lit = []}) => {
  const head = drawn * W;
  const markHead = (marks ?? drawn) * W;
  const litP = (id: MilestoneId) => {
    if (Array.isArray(lit)) return lit.includes(id) ? 1 : 0;
    const t0 = lit[id];
    return t0 === undefined ? 0 : tw(f, [t0, t0 + LIFECYCLE_AXIS.litDur], [0, 1], ease.enter);
  };
  const endN = tw(head, [W - 40, W], [0, 1], ease.standard);

  return (
    <div style={{position: 'relative', width: W, height: H, fontFamily: FONT.text}}>
      {/* axis line */}
      <div style={{position: 'absolute', left: 0, top: AXIS_Y - 1, width: head, height: 2, background: AXIS_INK}} />

      {/* end nodes */}
      <EndNode x={0} align="left" day="DAY 1" label="CONTRACT EXECUTED" show={tw(head, [0, 24], [0, 1], ease.standard)} />
      <EndNode x={W} align="right" day="DAY N" label="LITIGATION INITIATED" show={endN} />

      {MS.map((m) => {
        const x = MX[m.id];
        const show = tw(markHead, [x - 40, x + 260], [0, 1], ease.standard);
        if (show <= 0) return null;
        const p = litP(m.id);
        const tick = interpolateColors(p, [0, 1], [TICK_FAINT, COL.teal]);
        const below = interpolate(p, [0, 1], [0, 30]);
        const tickW = interpolate(p, [0, 1], [2, 3]);
        const node = interpolate(p, [0, 1], [0, 1]);
        return (
          <div key={m.id} style={{opacity: show}}>
            {/* tick: from the flag's bottom-left corner down through the axis */}
            <div style={{position: 'absolute', left: x - tickW / 2, top: BOX_TOP + BOX_H, width: tickW, height: AXIS_Y - BOX_TOP - BOX_H + below, background: tick}} />
            {/* axis node: hollow when faint, fills teal when lit */}
            <div
              style={{
                position: 'absolute',
                left: x - 7,
                top: AXIS_Y - 7,
                width: 14,
                height: 14,
                borderRadius: 7,
                boxSizing: 'border-box',
                background: interpolateColors(node, [0, 1], [COL.ground, COL.teal]),
                border: `2px solid ${interpolateColors(node, [0, 1], [TICK_FAINT, COL.teal])}`,
                transform: `scale(${interpolate(p, [0, 0.5, 1], [1, 1.25, 1.15])})`,
              }}
            />
            {/* flag label */}
            <div
              style={{
                position: 'absolute',
                left: x - 1,
                top: BOX_TOP,
                height: BOX_H,
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'stretch',
                background: COL.card,
                border: `1px solid ${interpolateColors(p, [0, 1], [COL.hair, COL.teal])}`,
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}
            >
              <div style={{width: SWATCH, background: m.tone, opacity: interpolate(p, [0, 1], [0.55, 1])}} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 20px 0 18px',
                  fontSize: 24,
                  fontWeight: interpolate(p, [0, 1], [400, 500]),
                  letterSpacing: 1.2,
                  color: interpolateColors(p, [0, 1], [COL.muted, COL.teal]),
                }}
              >
                {m.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EndNode: React.FC<{x: number; align: 'left' | 'right'; day: string; label: string; show: number}> = ({x, align, day, label, show}) => (
  <div style={{opacity: show}}>
    <div style={{position: 'absolute', left: x - 8, top: AXIS_Y - 8, width: 16, height: 16, borderRadius: 8, background: COL.navy}} />
    <div
      style={{
        position: 'absolute',
        top: AXIS_Y - 112,
        ...(align === 'left' ? {left: x - 8} : {right: W - x - 8}),
        textAlign: align,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, letterSpacing: 2.2, color: COL.muted, lineHeight: '30px'}}>{day}</div>
      <div style={{fontFamily: FONT.text, fontWeight: 500, fontSize: 28, letterSpacing: 1.2, color: COL.ink, lineHeight: '40px', marginTop: 4}}>{label}</div>
    </div>
  </div>
);
