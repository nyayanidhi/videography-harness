// Beat 8: "Exposure - Contract Stack" (rilin.ai §3) at film scale on the light ground.
// Fixed size EX_W × EX_H, top-left at 0,0. Local frame f (~300 = 5 s).
// Site bug fixed: bar length = score (the site draws Initech 0.15 at 92 %).
import {ease, tw} from '../../theme';
import {COL, FONT, RADIUS} from '../tokens';
import {Card, Chip, Status, Tag, TabNum} from '../ui';
import {rise, tick} from './anim';

export const EX_W = 1360;
const PAD = 36;
const HEAD_H = 92; // card top → header divider (site 42 css × 2.2)
const ROW_H = 150;
export const EX_H = HEAD_H + ROW_H * 3 + 18;
const TRACK_W = 440;
const TRACK_H = 16;
const SCORE_W = 84;
const CHIP_BOX = 200;
const GAP = 34;
const rowTop = (i: number) => HEAD_H + i * ROW_H;
const trackX = EX_W - PAD - SCORE_W - GAP - TRACK_W;

// Thresholds that map a score to the site's three levels (0.15 STANDARD · 0.42 CAUTION · 0.92 CRITICAL)
const CAUTION_AT = 0.35;
const CRITICAL_AT = 0.7;
const level = (v: number): [Status, string] => (v >= CRITICAL_AT ? ['critical', 'CRITICAL'] : v >= CAUTION_AT ? ['caution', 'CAUTION'] : ['ok', 'STANDARD']);

// Timeline (local frames)
export const EX_T = {
  cardIn: 0,
  rowIn: (i: number) => 8 + i * 6,
  fill: [
    [52, 112], // Acme first settles at 0.15 (STANDARD) …
    [44, 98], // Globex → 0.42
    [36, 84], // Initech → 0.15
  ] as [number, number][],
  acmeClimb: [130, 196] as [number, number], // … then climbs 0.15 → 0.92 last, flipping CAUTION → CRITICAL
  settled: 210,
};

const ROWS = [
  {name: 'Acme Corp', type: 'MSA', score: 0.92},
  {name: 'Globex', type: 'SLA', score: 0.42},
  {name: 'Initech', type: 'NDA', score: 0.15},
];

const acmeValue = (f: number) => {
  const [a, b] = EX_T.fill[0];
  const first = tw(f, [a, b], [0, 0.15], ease.standard);
  return f < EX_T.acmeClimb[0] ? first : tw(f, EX_T.acmeClimb, [0.15, 0.92], ease.move);
};
// frame at which Acme's climb crosses a score (inverse of the move curve by search; deterministic)
const crossFrame = (v: number) => {
  for (let x = EX_T.acmeClimb[0]; x <= EX_T.acmeClimb[1]; x++) if (acmeValue(x) >= v) return x;
  return EX_T.acmeClimb[1];
};
const ACME_CAUTION = crossFrame(CAUTION_AT);
const ACME_CRITICAL = crossFrame(CRITICAL_AT);

const valueAt = (i: number, f: number) => (i === 0 ? acmeValue(f) : tw(f, EX_T.fill[i], [0, ROWS[i].score], ease.standard));

// Anchors (component-local px)
export const EX_ANCHORS = {
  acmeRight: {x: EX_W, y: rowTop(0) + ROW_H / 2}, // right edge of the card at the Acme row's centre
  acmeScoreRight: {x: EX_W - PAD, y: rowTop(0) + ROW_H / 2}, // right end of "0.92"
  acmeBarEnd: {x: trackX + TRACK_W * 0.92, y: rowTop(0) + ROW_H / 2},
  rows: [0, 1, 2].map((i) => ({top: rowTop(i), bottom: rowTop(i) + ROW_H, y: rowTop(i) + ROW_H / 2})),
  flips: {caution: ACME_CAUTION, critical: ACME_CRITICAL},
};

export const ExposureStack: React.FC<{f: number}> = ({f}) => {
  const blink = 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(((f % 60) / 60) * Math.PI * 2)); // LIVE dot, 1 Hz
  return (
    <Card w={EX_W} h={EX_H} style={{position: 'relative', ...rise(f, EX_T.cardIn, 32, 24)}}>
      <div style={{position: 'absolute', left: PAD, right: PAD, top: 0, height: 74, display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...rise(f, 4, 28, 10)}}>
        <span style={{fontSize: 30, fontWeight: 300, color: COL.ink, opacity: 0.5, lineHeight: 1.2}}>Exposure - Contract Stack</span>
        <span style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{width: 16, height: 16, borderRadius: '50%', background: COL.ok, opacity: blink}} />
          <span style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 20, letterSpacing: 2, color: COL.ok}}>LIVE</span>
        </span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: HEAD_H - 1, height: 1, background: COL.hair}} />
      {ROWS.map((r, i) => {
        const v = valueAt(i, f);
        const [st, label] = level(v);
        const flipAt = i === 0 ? (st === 'critical' ? ACME_CRITICAL : st === 'caution' ? ACME_CAUTION : 0) : 0;
        const s = flipAt ? tick(f, flipAt, 0.1, 14) : 1;
        const shown = f >= EX_T.fill[i][0] - 2;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: rowTop(i), width: EX_W, height: ROW_H, ...rise(f, EX_T.rowIn(i), 30, 20)}}>
            <div style={{position: 'absolute', left: PAD, top: 0, height: ROW_H, display: 'flex', alignItems: 'center', gap: 20}}>
              <span style={{fontSize: 32, fontWeight: 500, letterSpacing: -0.3, color: COL.ink}}>{r.name}</span>
              <Tag tone="ink" size={20}>
                {r.type}
              </Tag>
            </div>
            <div style={{position: 'absolute', left: trackX - GAP - CHIP_BOX, width: CHIP_BOX, top: 0, height: ROW_H, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
              <span style={{display: 'inline-block', transform: `scale(${s})`, transformOrigin: '100% 50%', opacity: shown ? 1 : 0}}>
                <Chip status={st} size={24}>
                  {label}
                </Chip>
              </span>
            </div>
            <div style={{position: 'absolute', left: trackX, top: (ROW_H - TRACK_H) / 2, width: TRACK_W, height: TRACK_H, background: COL.track, borderRadius: RADIUS}}>
              <div style={{width: TRACK_W * v, height: TRACK_H, background: COL[st], borderRadius: RADIUS}} />
            </div>
            <div style={{position: 'absolute', right: PAD, width: SCORE_W, top: 0, height: ROW_H, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: 28, fontWeight: 400, color: COL[st], opacity: shown ? 1 : 0}}>
              <TabNum value={v.toFixed(2)} />
            </div>
            {i < ROWS.length - 1 && <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, background: COL.hairSoft}} />}
          </div>
        );
      })}
    </Card>
  );
};
