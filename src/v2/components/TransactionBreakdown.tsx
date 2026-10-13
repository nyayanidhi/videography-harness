// Beat 6: Transaction → Contract → Obligations (rilin.ai §2), rebuilt on the light ground at film scale.
// Fixed size TB_W × TB_H, top-left at 0,0. Local frame f = frames since the moment starts (~360).
import {ease, tw} from '../../theme';
import {COL, FONT, RADIUS} from '../tokens';
import {Card, Skeleton, Tag} from '../ui';
import {draw, rise} from './anim';

export const TB_W = 1830;
export const TB_H = 840;

const MID = TB_H / 2;
const TXN = {x: 0, w: 440, h: 258};
const SHEET = {x: 510, w: 320, h: 420};
const HUB = {x: 905, y: MID};
const OB = {x: 1110, w: 720, h: 192, gap: 24};
const ELBOW_X = OB.x - 52;
const obTop = (i: number) => i * (OB.h + OB.gap);
const obMid = (i: number) => obTop(i) + OB.h / 2;

const LINE_COL = 'rgba(7,41,57,0.30)';
const LINE_W = 2;

// Anchor points (component-local px)
export const TB_ANCHORS = {
  input: {x: TXN.x, y: MID}, // left input port of the transaction card: the contrail arrives here
  txnOut: {x: TXN.x + TXN.w, y: MID},
  branch: {x: HUB.x, y: HUB.y}, // branch node that fans into the four obligations
  obligations: [0, 1, 2, 3].map((i) => ({x: OB.x, y: obMid(i)})), // left edge, vertical centre of each card
};

// Timeline (local frames)
export const TB_T = {
  txnIn: 0,
  activePulse: 26,
  wireIn: 28, // txn → hub hairline draws (behind the sheet)
  sheetIn: 40,
  hub: 78,
  obligation: (i: number) => 90 + i * 30, // fan out one per beat
  settled: 90 + 3 * 30 + 36, // 216: everything holds still after this
};

// Copy: verbatim from rilin.ai (only "Atleast" → "At least")
const OBLIGATIONS = [
  {title: 'Submit certificate of insurance', dept: 'FINANCE', clause: 'CLAUSE 7.2', pre: 'Within ', qty: '30 Days', post: ' Of Execution'},
  {title: 'Remediate Critical vulnerabilities', dept: 'INFOSEC', clause: 'CLAUSE 11.4', pre: 'Within ', qty: '48 Hours', post: ' Of Discovery'},
  {title: 'Issue formal SLA credit report', dept: 'DELIVERY', clause: 'CLAUSE 4.3', pre: 'Within ', qty: '10 Business Days', post: ' Of Month-End'},
  {title: 'Provide written notice of non-renewal', dept: 'LEGAL OPS', clause: 'CLAUSE 9.5', pre: 'At least ', qty: '90 Days', post: ' Prior To Term End'},
];

// Dark caps label used by "→ 4 core obligations" / "→ 12 material clauses" (navy fill, Stack Sans Text)
const CountTag: React.FC<{children: React.ReactNode}> = ({children}) => (
  <span style={{display: 'inline-block', background: COL.navy, color: '#FFFFFD', fontFamily: FONT.text, fontWeight: 400, fontSize: 21, letterSpacing: 0.4, padding: '8px 15px', lineHeight: 1}}>
    {children}
  </span>
);

const Port: React.FC<{x: number; y: number; r?: number; filled?: boolean; s?: number}> = ({x, y, r = 5, filled = true, s = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      boxSizing: 'border-box',
      background: filled ? '#7A8F99' : COL.ground,
      border: filled ? undefined : `2px solid #7A8F99`,
      transform: `scale(${s})`,
    }}
  />
);

const TransactionCard: React.FC<{f: number}> = ({f}) => {
  const t = TB_T.txnIn;
  const pulse = tw(f, [TB_T.activePulse, TB_T.activePulse + 40], [0, 1], ease.enter);
  return (
    <Card w={TXN.w} h={TXN.h} style={{position: 'absolute', left: TXN.x, top: MID - TXN.h / 2, padding: 28, ...rise(f, t, 32, 24)}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...rise(f, t + 5, 28, 12)}}>
        <Tag size={18}>Transaction</Tag>
        <span style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT.mono, fontWeight: 600, fontSize: 18, letterSpacing: 1.8, color: COL.ink}}>
          <span style={{position: 'relative', width: 14, height: 14}}>
            <span style={{position: 'absolute', inset: 0, borderRadius: '50%', background: COL.ok}} />
            {pulse > 0 && pulse < 1 && (
              <span style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${COL.ok}`, transform: `scale(${1 + pulse * 1.6})`, opacity: 0.7 * (1 - pulse)}} />
            )}
          </span>
          ACTIVE
        </span>
      </div>
      <div style={{marginTop: 30, ...rise(f, t + 10, 28, 12)}}>
        <div style={{fontWeight: 500, fontSize: 36, lineHeight: 1.1, letterSpacing: -0.4, color: COL.ink}}>IT Vendor Onboarding</div>
        <div style={{marginTop: 10, fontFamily: FONT.mono, fontWeight: 600, fontSize: 17, letterSpacing: 1.7, color: COL.navy, opacity: 0.8}}>ID:TXN-2026-014</div>
      </div>
      <div style={{marginTop: 30, ...rise(f, t + 15, 28, 12)}}>
        <CountTag>→ 4 core obligations</CountTag>
      </div>
    </Card>
  );
};

// Contract sheet with folded top-right corner and two ghost sheets that fan out behind it
const ContractSheet: React.FC<{f: number}> = ({f}) => {
  const t = TB_T.sheetIn;
  const fan = tw(f, [t + 14, t + 44], [0, 1], ease.enter);
  const top = MID - SHEET.h / 2;
  const fold = 26;
  const W = SHEET.w;
  const H = SHEET.h;
  const outline = `M1 1 H${W - fold} L${W - 1} ${fold} V${H - 1} H1 Z`;
  const ghost = (deg: number, dx: number, op: number) => (
    <svg
      width={W}
      height={H}
      style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', transform: `translateX(${dx * fan}px) rotate(${deg * fan}deg)`, transformOrigin: '50% 60%', opacity: op}}
    >
      <rect x={0.5} y={0.5} width={W - 1} height={H - 1} rx={RADIUS} fill={COL.card} stroke={COL.hair} strokeWidth={1} />
    </svg>
  );
  return (
    <div style={{position: 'absolute', left: SHEET.x, top, width: W, height: H, ...rise(f, t, 32, 24)}}>
      {ghost(-4.5, -10, 0.9)}
      {ghost(3.5, 12, 0.9)}
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={outline} fill={COL.card} stroke={COL.hair} strokeWidth={1} />
        <path d={`M${W - fold} 1 V${fold} H${W - 1} Z`} fill={COL.skeleton} />
      </svg>
      <div style={{position: 'absolute', inset: 0, padding: '32px 24px', fontFamily: FONT.text, color: COL.ink}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, ...rise(f, t + 6, 28, 10)}}>
          <span style={{width: 3, height: 26, background: COL.navy}} />
          <span style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 17, letterSpacing: 1.8, color: COL.navy}}>CONTRACT</span>
        </div>
        <div style={{marginTop: 18, fontWeight: 500, fontSize: 36, lineHeight: 1.12, letterSpacing: -0.4, ...rise(f, t + 10, 28, 10)}}>
          Master
          <br />
          Services
          <br />
          Agreement
        </div>
        <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 14, ...rise(f, t + 14, 28, 10)}}>
          {[272, 214, 272, 196].map((w, i) => (
            <Skeleton key={i} w={w} h={12} />
          ))}
        </div>
        <div style={{marginTop: 34, ...rise(f, t + 18, 28, 10)}}>
          <CountTag>→ 12 material clauses</CountTag>
        </div>
      </div>
    </div>
  );
};

const ObligationCard: React.FC<{f: number; i: number}> = ({f, i}) => {
  const o = OBLIGATIONS[i];
  const t = TB_T.obligation(i) + 8; // lands as its branch line arrives
  return (
    <Card w={OB.w} h={OB.h} style={{position: 'absolute', left: OB.x, top: obTop(i), padding: '28px 30px', ...rise(f, t, 32, 24)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <span style={{width: 10, height: 10, borderRadius: '50%', background: COL.teal, flexShrink: 0}} />
        <span style={{fontWeight: 500, fontSize: 34, lineHeight: 1.15, letterSpacing: -0.5, color: COL.ink, whiteSpace: 'nowrap'}}>{o.title}</span>
      </div>
      <div style={{marginLeft: 26}}>
        <div style={{marginTop: 16, display: 'flex', alignItems: 'center', gap: 18, ...rise(f, t + 5, 28, 10)}}>
          <Tag size={18}>{o.dept}</Tag>
          <span style={{fontSize: 22, fontWeight: 400, letterSpacing: 0.4, color: COL.tagTeal}}>{o.clause}</span>
        </div>
        <div style={{marginTop: 16, fontSize: 24, fontWeight: 400, color: COL.muted, letterSpacing: 0, whiteSpace: 'nowrap', ...rise(f, t + 10, 28, 10)}}>
          {o.pre}
          <span style={{color: COL.ink, fontWeight: 500}}>{o.qty}</span>
          {o.post}
        </div>
      </div>
    </Card>
  );
};

export const TransactionBreakdown: React.FC<{f: number}> = ({f}) => {
  // txn → hub wire (passes behind the contract sheet)
  const wire = draw(f, TB_T.wireIn, 50, ease.move);
  const hubS = tw(f, [TB_T.hub, TB_T.hub + 18], [0, 1], ease.enter);
  const portS = tw(f, [8, 24], [0, 1], ease.enter);
  const branch = (i: number) => {
    const y = obMid(i);
    return `M${HUB.x} ${HUB.y} L${ELBOW_X} ${y} H${OB.x}`;
  };
  return (
    <div style={{position: 'relative', width: TB_W, height: TB_H}}>
      <svg width={TB_W} height={TB_H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <line x1={TXN.w} y1={MID} x2={TXN.w + (HUB.x - TXN.w) * wire} y2={MID} stroke={LINE_COL} strokeWidth={LINE_W} />
        {OBLIGATIONS.map((_, i) => {
          const p = draw(f, TB_T.obligation(i), 16, ease.standard);
          return p > 0 ? (
            <path key={i} d={branch(i)} fill="none" stroke={LINE_COL} strokeWidth={LINE_W} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
          ) : null;
        })}
      </svg>
      <ContractSheet f={f} />
      <TransactionCard f={f} />
      <Port x={TB_ANCHORS.input.x} y={MID} r={7} filled={false} s={portS} />
      <Port x={TB_ANCHORS.txnOut.x} y={MID} r={5} s={portS} />
      <Port x={HUB.x} y={HUB.y} r={8} s={hubS} />
      {OBLIGATIONS.map((_, i) => (
        <ObligationCard key={i} f={f} i={i} />
      ))}
    </div>
  );
};
