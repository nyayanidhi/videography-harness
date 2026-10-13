// Beat 9 (~6 s): Draft and Review. The Master-services-agreement.docx view scrolls and pushes in to
// clause 8.2, the CLAUSE 8.2 · REDLINE popover proposes ₹50,00,000 → ₹75,00,000, the cursor clicks
// "Implement changes →" (hero click) and the clause resolves to the accepted ₹75,00,000.
// Rebuilt from docs/rilin/site/33-draft-review-redline.png + 34-redline-popover.png at 2× site scale.
import {interpolate, interpolateColors} from 'remotion';
import {ease, tw} from '../../theme';
import {COL, FONT} from '../tokens';
import {Cursor, rise} from '../ui';

// ── geometry (component-local px) ───────────────────────────────────────────
const DOC_W = 860;
const DOC_H = 780;
const BORDER = 3;
const BAR_H = 76;
const VIEW_H = DOC_H - BAR_H - BORDER * 2; // scrolling body viewport
const PAD_X = 32;
const FS = 24;
const LH = 38.4;
const DOC_BLUE = '#C2E6FF'; // site's doc header / frame
const GLYPH_BLUE = '#2C7BE5';

const POP = {x: 800, y: 196, w: 560, pad: 24};
const PFS = 28; // popover text size (site 15 px grid, rebuilt at 2×)
const PLH = 44;
const P_TOP = {header: 24, body: 88, del: 240, ins: 308, rule: 384, link: 404};
const POP_H = 470;
const LINK_W = 262; // rendered width of "Implement changes" at 28 px Stack Sans Text 400
const ARROW = {x: POP.x + POP.pad + LINK_W + 12, y: POP.y + P_TOP.link + 21, len: 30};

const W = POP.x + POP.w;
const H = DOC_H;

// ── document text (verbatim from rilin.ai; line breaks as the site wraps them) ──
type Block = {kind: 'h' | 'p'; lines: string[]; id?: '8.2'};
const DOC: Block[] = [
  {kind: 'h', lines: ['7. CONFIDENTIALITY']},
  {kind: 'p', lines: ['7.1 The Parties acknowledge that, during the term of this Agreement,', 'each Party may receive confidential and proprietary information.']},
  {kind: 'p', lines: ['7.2 Each Party shall protect such Confidential Information using the', 'same degree of care it uses to protect its own.']},
  {kind: 'p', lines: ['7.3 Neither Party shall disclose Confidential Information to any third', 'party except as expressly permitted.']},
  {kind: 'h', lines: ['8. INDEMNITY']},
  {kind: 'p', lines: ['8.1 Supplier shall indemnify, defend and hold Customer harmless', 'from and against any third-party claims.']},
  {kind: 'p', id: '8.2', lines: ['8.2 Supplier may, in its sole discretion, maintain cybersecurity', 'insurance coverage for an amount not exceeding ']},
  {kind: 'p', lines: ['8.3 Notwithstanding the foregoing, neither Party shall be liable for', 'indirect, incidental or consequential loss arising under this', 'Agreement.']},
  {kind: 'h', lines: ['9. LIMITATION OF LIABILITY']},
  {kind: 'p', lines: ["9.1 Each Party's aggregate liability under this Agreement shall not", 'exceed the total fees paid in the preceding twelve (12) months.']},
  {kind: 'p', lines: ["9.2 Nothing in this Agreement shall exclude or limit either Party's", 'liability for fraud or wilful misconduct.']},
  {kind: 'h', lines: ['10. TERM AND TERMINATION']},
  {kind: 'p', lines: ['10.1 This Agreement shall remain in force until terminated by either', 'Party in accordance with the notice provisions set out herein.']},
];
// y of each block in the scrolling body (site rhythm ×2: 16 px between paragraphs, 48 px before a heading)
const BLOCK_Y: number[] = [];
{
  let y = 36;
  DOC.forEach((b, i) => {
    if (i > 0) y += b.kind === 'h' ? 48 : 16;
    BLOCK_Y.push(y);
    y += b.lines.length * LH;
  });
}
const I82 = DOC.findIndex((b) => b.id === '8.2');
const Y82 = BLOCK_Y[I82];
const SCROLL_END = Y82 + LH - VIEW_H / 2 + 6; // 8.2 centred in the viewport
const SCROLL_START = SCROLL_END - 250;
const CLAUSE_CENTRE = {x: PAD_X + 380, y: BORDER + BAR_H + VIEW_H / 2 + 6};

export const REDLINE_CARD = {
  w: W,
  h: H,
  anchors: {
    /** the → in "Implement changes →": the contrail becomes this arrow (tail → tip) */
    arrowTail: {x: ARROW.x, y: ARROW.y},
    arrowTip: {x: ARROW.x + ARROW.len, y: ARROW.y},
    /** where the cursor clicks (centre of "Implement changes") */
    click: {x: POP.x + POP.pad + LINK_W / 2, y: POP.y + P_TOP.link + 22},
    /** centre of clause 8.2 in the document once scrolled into place */
    clause: CLAUSE_CENTRE,
  },
  t: {
    docIn: [0, 30] as [number, number],
    scroll: [18, 80] as [number, number],
    highlight: [80, 110] as [number, number],
    popoverIn: 100,
    arrowDraw: [142, 162] as [number, number],
    cursorGlide: [150, 190] as [number, number],
    press: [194, 200] as [number, number],
    click: 200,
    strike: [204, 218] as [number, number],
    popoverOut: [222, 244] as [number, number],
    swap: [226, 248] as [number, number],
    settle: [276, 310] as [number, number],
    rest: 312,
  },
};
const T = REDLINE_CARD.t;

/** f: local frame. arrow: optional override 0–1 for drawing the → (e.g. when the contrail hands off into it). */
export const RedlineCard: React.FC<{f: number; arrow?: number; cursor?: boolean}> = ({f, arrow, cursor = true}) => {
  // entrance + push in on clause 8.2
  const docIn = tw(f, T.docIn, [0, 1], ease.enter);
  const push = tw(f, [0, 96], [0.94, 1], ease.standard);
  const scroll = tw(f, T.scroll, [SCROLL_START, SCROLL_END], ease.move);

  // highlight sweep (line 1, then line 2) and its fade once the change is accepted
  const hl1 = tw(f, [T.highlight[0], T.highlight[0] + 18], [0, 1], ease.standard);
  const hl2 = tw(f, [T.highlight[0] + 12, T.highlight[1]], [0, 1], ease.standard);
  const hlOut = tw(f, [T.settle[0] + 8, T.settle[1]], [1, 0], ease.standard);

  // click
  const press = tw(f, T.press, [0, 1], ease.standard) * (1 - tw(f, [T.click, T.click + 8], [0, 1], ease.enter));
  const hover = tw(f, [T.cursorGlide[1] - 4, T.cursorGlide[1] + 4], [0, 1], ease.standard);
  const linkCol = interpolateColors(hover, [0, 1], [COL.navy, COL.teal]);
  const arrowP = arrow ?? tw(f, T.arrowDraw, [0, 1], ease.enter);

  // resolution in the document
  const strike = tw(f, T.strike, [0, 1], ease.standard);
  const swap = tw(f, T.swap, [0, 1], ease.move);
  const settle = tw(f, T.settle, [0, 1], ease.standard);
  const underline = tw(f, [T.settle[0] + 4, T.settle[0] + 28], [0, 1], ease.enter);

  // popover in/out
  const popOut = tw(f, T.popoverOut, [0, 1], ease.exit);

  // cursor path: eased arc in from lower right, then drifts off after the click
  const target = REDLINE_CARD.anchors.click;
  const g = tw(f, T.cursorGlide, [0, 1], ease.move);
  const leave = tw(f, [T.click + 16, T.click + 64], [0, 1], ease.move);
  const cx = interpolate(g, [0, 1], [target.x + 300, target.x + 18]) + leave * 140;
  const cy = interpolate(g, [0, 1], [target.y + 330, target.y + 6]) - Math.sin(Math.PI * g) * 36 + leave * 120;
  const cOp = tw(f, [T.cursorGlide[0], T.cursorGlide[0] + 8], [0, 1], ease.standard) * (1 - tw(f, [T.click + 40, T.click + 64], [0, 1], ease.standard));

  const lineOpacity = (vy: number) => {
    const top = interpolate(vy, [-LH * 0.5, 70], [0.15, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const bot = interpolate(vy, [VIEW_H - 110, VIEW_H - LH * 0.5], [1, 0.15], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return Math.min(top, bot);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: W,
        height: H,
        transform: `scale(${push})`,
        transformOrigin: `${CLAUSE_CENTRE.x}px ${CLAUSE_CENTRE.y}px`,
        fontFamily: FONT.text,
        color: COL.ink,
      }}
    >
      {/* ── document viewer ── */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: DOC_W,
          height: DOC_H,
          boxSizing: 'border-box',
          border: `${BORDER}px solid ${DOC_BLUE}`,
          background: COL.card,
          overflow: 'hidden',
          opacity: docIn,
          transform: `translateY(${(1 - docIn) * 24}px)`,
        }}
      >
        <div style={{height: BAR_H, background: DOC_BLUE, display: 'flex', alignItems: 'center', gap: 20, padding: '0 24px'}}>
          <svg width={30} height={40} viewBox="0 0 30 40">
            <path d="M3 0 H20 L30 10 V37 Q30 40 27 40 H3 Q0 40 0 37 V3 Q0 0 3 0 Z" fill={GLYPH_BLUE} />
            <path d="M20 0 V7 Q20 10 23 10 H30 Z" fill="#8DBBF2" />
            <rect x={7} y={18} width={16} height={2.6} rx={1} fill={COL.card} />
            <rect x={7} y={24} width={16} height={2.6} rx={1} fill={COL.card} />
            <rect x={7} y={30} width={11} height={2.6} rx={1} fill={COL.card} />
          </svg>
          <span style={{fontSize: 28, fontWeight: 300, letterSpacing: -0.1, color: COL.ink}}>Master-services-agreement.docx</span>
        </div>
        <div style={{position: 'relative', height: VIEW_H, overflow: 'hidden'}}>
          {DOC.map((b, i) =>
            b.lines.map((line, j) => {
              const y = BLOCK_Y[i] + j * LH - scroll;
              if (y < -LH * 2 || y > VIEW_H + LH) return null;
              const is82 = b.id === '8.2';
              const hp = is82 ? (j === 0 ? hl1 : hl2) * hlOut : 0;
              return (
                <div
                  key={`${i}-${j}`}
                  style={{
                    position: 'absolute',
                    left: PAD_X,
                    top: y,
                    height: LH,
                    lineHeight: `${LH}px`,
                    fontSize: FS,
                    fontWeight: b.kind === 'h' ? 400 : 300,
                    whiteSpace: 'pre',
                    opacity: lineOpacity(y),
                  }}
                >
                  <span style={{position: 'relative', display: 'inline-block'}}>
                    {is82 && <span style={{position: 'absolute', left: -4, top: 3, bottom: 3, width: `calc(${hp * 100}% + ${hp * 8}px)`, background: 'rgba(255,223,44,0.4)'}} />}
                    <span style={{position: 'relative'}}>
                      {line}
                      {is82 && j === 1 && <ValueSlot strike={strike} swap={swap} settle={settle} underline={underline} />}
                      {is82 && j === 1 && '.'}
                    </span>
                  </span>
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* ── redline popover ── */}
      <div
        style={{
          position: 'absolute',
          left: POP.x,
          top: POP.y,
          width: POP.w,
          height: POP_H,
          boxSizing: 'border-box',
          background: COL.card,
          border: `2px solid ${COL.hair}`,
          borderRadius: 2,
          ...rise(f, T.popoverIn, 30, 16),
          ...(popOut > 0 ? {opacity: 1 - popOut, transform: `translateY(${popOut * 12}px)`} : {}),
        }}
      >
        <div style={{position: 'absolute', left: POP.pad - 2, right: POP.pad - 2, top: P_TOP.header - 2, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...rise(f, T.popoverIn + 4, 24, 8)}}>
          <span style={{fontSize: 26, fontWeight: 400, letterSpacing: 0.2, color: COL.ink}}>CLAUSE 8.2</span>
          <span style={{background: 'rgba(40,40,40,0.1)', color: COL.critical, fontFamily: FONT.mono, fontWeight: 600, fontSize: 22, letterSpacing: 2.6, lineHeight: 1, padding: '11px 16px 11px 18px'}}>REDLINE</span>
        </div>
        <div style={{position: 'absolute', left: POP.pad - 2, top: P_TOP.body - 2, fontSize: PFS, lineHeight: `${PLH}px`, fontWeight: 300, whiteSpace: 'pre', ...rise(f, T.popoverIn + 10, 24, 8)}}>
          {'Supplier may, in its sole discretion,\nmaintain cybersecurity insurance\ncoverage for an amount'}
        </div>
        <DiffLine top={P_TOP.del} sign="-" text="not exceeding ₹50,00,000" tone={COL.critical} tint="rgba(193,17,6,0.1)" style={rise(f, T.popoverIn + 22, 24, 8)} strike={tw(f, [T.click + 2, T.click + 14], [0, 1], ease.standard)} />
        <DiffLine top={P_TOP.ins} sign="+" text="not exceeding ₹75,00,000" tone={COL.ok} tint="rgba(30,120,12,0.1)" style={rise(f, T.popoverIn + 31, 24, 8)} />
        <div style={{position: 'absolute', left: POP.pad - 2, right: POP.pad - 2, top: P_TOP.rule - 2, height: 1, background: COL.hair, ...rise(f, T.popoverIn + 40, 24, 0)}} />
        {/* hero link: Implement changes → */}
        <div
          style={{
            position: 'absolute',
            left: POP.pad - 2,
            top: P_TOP.link - 2,
            height: 44,
            width: LINK_W + 12 + ARROW.len + 2,
            ...rise(f, T.popoverIn + 40, 24, 8),
          }}
        >
          <div style={{position: 'absolute', inset: 0, transform: `scale(${1 - 0.04 * press})`, transformOrigin: `${LINK_W / 2}px 22px`}}>
          <span style={{position: 'absolute', left: 0, top: 0, fontSize: PFS, lineHeight: '44px', fontWeight: 400, letterSpacing: -0.1, color: linkCol, whiteSpace: 'nowrap'}}>Implement changes</span>
          <svg width={ARROW.len + 4} height={20} viewBox={`0 0 ${ARROW.len + 4} 20`} style={{position: 'absolute', left: LINK_W + 12, top: 23 - 10, overflow: 'visible'}}>
            <path d={`M0 10 H${ARROW.len}`} stroke={linkCol} strokeWidth={2.4} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrowP} />
            <path d={`M${ARROW.len - 8} 3 L${ARROW.len} 10 L${ARROW.len - 8} 17`} fill="none" stroke={linkCol} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" opacity={tw(arrowP, [0.7, 1], [0, 1], ease.standard)} />
          </svg>
          {/* underline under text and arrow, as on the site */}
          <div style={{position: 'absolute', left: 0, top: 40, height: 2, width: LINK_W + 12 + (ARROW.len + 1) * arrowP, background: linkCol}} />
          </div>
        </div>
      </div>

      {cursor && cOp > 0 && <Cursor x={cx} y={cy} size={46} press={press} opacity={cOp} />}
    </div>
  );
};

const DiffLine: React.FC<{top: number; sign: string; text: string; tone: string; tint: string; style: React.CSSProperties; strike?: number}> = ({top, sign, text, tone, tint, style, strike = 0}) => (
  <div style={{position: 'absolute', left: POP.pad - 2, top: top - 2, height: 56, display: 'flex', alignItems: 'center', background: tint, color: tone, padding: '0 20px', fontSize: PFS, fontWeight: 300, whiteSpace: 'pre', ...style}}>
    <span style={{position: 'relative'}}>
      {`${sign} ${text}`}
      {strike > 0 && <span style={{position: 'absolute', left: 0, top: '54%', height: 2, width: `${strike * 100}%`, background: tone}} />}
    </span>
  </div>
);

// ₹50,00,000 → ₹75,00,000 in place: both values share one grid cell (width = the wider), and swap
// with a line-mask slide, so the clause never reflows.
const ValueSlot: React.FC<{strike: number; swap: number; settle: number; underline: number}> = ({strike, swap, settle, underline}) => {
  const oldCol = interpolateColors(strike, [0, 1], [COL.ink, COL.critical]);
  const newCol = interpolateColors(settle, [0, 1], [COL.ok, COL.ink]);
  return (
    <span style={{display: 'inline-grid', verticalAlign: 'top', height: LH, clipPath: 'inset(0px -60px 0px -60px)'}}>
      <span style={{gridArea: '1 / 1', position: 'relative', color: oldCol, transform: `translateY(${-swap * LH}px)`}}>
        <span style={{position: 'absolute', left: -4, right: -4, top: 5, bottom: 5, background: `rgba(193,17,6,${0.1 * strike})`}} />
        <span style={{position: 'relative'}}>₹50,00,000</span>
        <span style={{position: 'absolute', left: 0, top: '52%', height: 2, width: `${strike * 100}%`, background: COL.critical}} />
      </span>
      <span style={{gridArea: '1 / 1', position: 'relative', color: newCol, fontWeight: interpolate(settle, [0, 1], [300, 400]), transform: `translateY(${(1 - swap) * LH}px)`}}>
        <span style={{position: 'absolute', left: -4, right: -4, top: 5, bottom: 5, background: `rgba(30,120,12,${0.1 * (1 - settle)})`}} />
        <span style={{position: 'relative'}}>₹75,00,000</span>
        <span style={{position: 'absolute', left: 0, bottom: 3, height: 2, width: `${underline * 100}%`, background: COL.teal}} />
      </span>
    </span>
  );
};
