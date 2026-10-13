// Beat 10 (~6 s): Ask Rilin. The user asks "Can we terminate this vendor before renewal?" and
// Rilin's answer (verbatim, rilin.ai conversation 8c) streams in line by line. The notice-window
// date "14 June 2026" is highlighted as it lands, in sync with the timeline's NOTICE WINDOW.
// Rebuilt from docs/rilin/site/53-ask-rilin-tab3.png at ~1.95× site scale.
import {interpolate, interpolateColors} from 'remotion';
import {ease, tw} from '../../theme';
import {COL, FONT} from '../tokens';
import {RilinLogo, rise} from '../ui';

const W = 760;
const H = 840;
const PAD = 40;
const FS = 28; // answer body: DM Sans 400, site 14.8 / 22.2
const LH = 42;
const ANS_Y = 320;
const PARA_GAP = 22;

type Run = string | {b: string; date?: true};
// Lines are hand-broken by meaning (not the site's width wrap) so each streamed line is a phrase and the date never splits.
const ANSWER: Run[][][] = [
  [
    ['Based on Clause 9.5 of the Master Services'],
    ['Agreement, the contract may be terminated'],
    ['through non-renewal by providing written notice'],
    ['at least 90 days before the expiry date.'],
  ],
  [
    ['The current agreement is scheduled to expire on'],
    [{b: '12 September 2026'}, ', which means the notice'],
    ['window closes on ', {b: '14 June 2026', date: true}, '.'],
  ],
  [
    ['Before proceeding, consider any active obligations,'],
    ['outstanding invoices, and transition requirements'],
    ['that may survive termination.'],
  ],
];

// line timing: 7 frames apart inside a paragraph, 18 between paragraphs
const LINE_T: number[][] = [];
{
  let t = 100;
  ANSWER.forEach((p, i) => {
    if (i > 0) t += 11;
    LINE_T.push(p.map(() => ((t += 7), t - 7)));
  });
}
const LINE_Y: number[][] = [];
{
  let y = ANS_Y;
  ANSWER.forEach((p, i) => {
    if (i > 0) y += PARA_GAP;
    LINE_Y.push(p.map(() => ((y += LH), y - LH)));
  });
}
const DATE_LINE_T = LINE_T[1][2];
const DATE_X = PAD + 233; // left edge of "14 June 2026" (measured: "window closes on " at 28 px DM Sans)
const DATE_W = 172;

export const ASK_RILIN = {
  w: W,
  h: H,
  anchors: {
    /** centre of the highlighted notice-window date, on its underline */
    date: {x: DATE_X + DATE_W / 2, y: LINE_Y[1][2] + LH - 4},
    /** left edge of the date, on its underline */
    dateStart: {x: DATE_X, y: LINE_Y[1][2] + LH - 4},
    /** right edge of the question bubble, mid-height */
    question: {x: W - PAD, y: 179},
  },
  t: {
    panelIn: [0, 28] as [number, number],
    question: 20,
    thinking: [62, 100] as [number, number],
    answerStart: LINE_T[0][0],
    dateLine: DATE_LINE_T,
    /** the date is on screen and its highlight starts: light NOTICE WINDOW on the timeline here */
    date: DATE_LINE_T + 6,
    answerDone: LINE_T[2][2] + 24,
  },
};
const T = ASK_RILIN.t;

export const AskRilin: React.FC<{f: number}> = ({f}) => {
  const panel = tw(f, T.panelIn, [0, 1], ease.enter);
  const think = tw(f, T.thinking, [0, 1], ease.standard);
  const thinkOut = tw(f, [T.answerStart - 4, T.answerStart + 4], [1, 0], ease.standard);
  const hl = tw(f, [T.date, T.date + 16], [0, 1], ease.standard);

  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        boxSizing: 'border-box',
        background: COL.card,
        border: '1px solid rgba(7,41,57,0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        opacity: panel,
        transform: `translateY(${(1 - panel) * 24}px)`,
        fontFamily: FONT.text,
      }}
    >
      {/* top bar */}
      <div style={{position: 'absolute', left: PAD, top: 42}}>
        <RilinLogo height={50} />
      </div>
      <IconBox x={W - PAD - 112 - 10 - 64} w={64}>
        <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={COL.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.2 13.5 A8 8 0 1 0 6.3 6.3" />
          <path d="M6.6 2.8 V6.6 H2.8" />
          <path d="M12 8 V12 L14.8 13.8" />
        </svg>
      </IconBox>
      <IconBox x={W - PAD - 112} w={112}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={COL.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4 H6 Q4 4 4 6 V18 Q4 20 6 20 H18 Q20 20 20 18 V13" />
            <path d="M17.6 3.4 Q18.6 2.4 19.9 3.4 L20.6 4.1 Q21.6 5.4 20.6 6.4 L12.5 14.5 L9 15 L9.5 11.5 Z" />
          </svg>
          <div style={{width: 30, height: 30, borderRadius: 3, background: COL.ink, color: COL.card, fontSize: 17, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>T</div>
        </div>
      </IconBox>

      {/* question bubble (site radius 8.4 at 0.844 of the base grid → 16 at film scale; bottom-right square) */}
      <div style={{position: 'absolute', right: PAD, top: 136, ...rise(f, T.question, 31, 16)}}>
        <div style={{background: COL.navy, color: COL.card, fontSize: FS, lineHeight: `${LH}px`, fontWeight: 300, letterSpacing: -0.28, padding: '22px 28px', borderRadius: '16px 16px 0 16px', whiteSpace: 'nowrap'}}>
          Can we terminate this vendor before renewal?
        </div>
      </div>
      <div style={{position: 'absolute', right: PAD + 4, top: 238, display: 'flex', gap: 26, opacity: tw(f, [T.question + 18, T.question + 30], [0, 1], ease.standard)}}>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={COL.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x={8.5} y={8.5} width={12.5} height={12.5} rx={2} />
          <path d="M5.5 15.5 H5 Q3 15.5 3 13.5 V5 Q3 3 5 3 H13.5 Q15.5 3 15.5 5 V5.5" />
        </svg>
        <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={COL.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16.6 3.6 Q17.9 2.3 19.4 3.6 L20.4 4.6 Q21.7 6.1 20.4 7.4 L8 19.8 L3.2 20.8 L4.2 16 Z" />
        </svg>
      </div>

      {/* thinking: a single static-weight teal line that grows during the hold (no sparkle, no dots) */}
      <div style={{position: 'absolute', left: PAD, top: ANS_Y + 20, height: 2, width: 72 * think, background: COL.teal, opacity: (think > 0 ? 1 : 0) * thinkOut}} />

      {/* answer, streamed line by line (line-mask rise) */}
      {ANSWER.map((p, i) =>
        p.map((runs, j) => {
          const t0 = LINE_T[i][j];
          const p0 = tw(f, [t0, t0 + 22], [0, 1], ease.enter);
          const o = tw(f, [t0, t0 + 10], [0, 1], ease.standard);
          return (
            <div key={`${i}-${j}`} style={{position: 'absolute', left: PAD, top: LINE_Y[i][j], height: LH, overflow: 'hidden', paddingRight: 8}}>
              <div style={{transform: `translateY(${(1 - p0) * 26}px)`, opacity: o, fontFamily: FONT.answer, fontSize: FS, lineHeight: `${LH}px`, letterSpacing: -0.28, color: COL.ink, whiteSpace: 'pre'}}>
                {runs.map((r, k) =>
                  typeof r === 'string' ? (
                    <span key={k}>{r}</span>
                  ) : r.date ? (
                    <span key={k} style={{position: 'relative', fontWeight: 600, color: interpolateColors(hl, [0, 1], [COL.ink, COL.teal])}}>
                      <span style={{position: 'absolute', left: -4, top: 4, bottom: 4, width: `calc(${hl * 100}% + ${hl * 8}px)`, background: 'rgba(0,117,116,0.12)'}} />
                      <span style={{position: 'relative'}}>{r.b}</span>
                      <span style={{position: 'absolute', left: 0, bottom: 2, height: 2, width: `${interpolate(hl, [0, 1], [0, 100])}%`, background: COL.teal}} />
                    </span>
                  ) : (
                    <span key={k} style={{fontWeight: 600}}>
                      {r.b}
                    </span>
                  ),
                )}
              </div>
            </div>
          );
        }),
      )}
    </div>
  );
};

const IconBox: React.FC<{x: number; w: number; children: React.ReactNode}> = ({x, w, children}) => (
  <div style={{position: 'absolute', left: x, top: 34, width: w, height: 64, boxSizing: 'border-box', border: `1px solid ${COL.hair}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
);
