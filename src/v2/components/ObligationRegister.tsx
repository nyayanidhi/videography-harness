// Beat 7: the obligation register (rilin.ai §6) at film scale on the light ground.
// Fixed size OR_W × OR_H, top-left at 0,0. Local frame f (~420 = 7 s).
// The site register has 3 rows and gives no owner/due/status for the 4th obligation, so it stays at 3.
// "Remediate Critical vulnerabilities" is owned by Infosec (film decision; the site register says Legal Ops).
import {ease, tw} from '../../theme';
import {COL, FONT} from '../tokens';
import {Card, Chip, InitialsDisc, Status} from '../ui';
import {rise, tick} from './anim';

export const OR_W = 1400;
const PAD_X = 40;
const PAD_Y = 16;
const HEAD_H = 104;
const ROW_H = 146;
export const OR_H = PAD_Y * 2 + HEAD_H + ROW_H * 3;

// column x (card-local)
const COLS = {obligation: PAD_X, owner: PAD_X + 640, due: PAD_X + 930, status: PAD_X + 1120};

const rowTop = (i: number) => PAD_Y + HEAD_H + i * ROW_H;
const FS = 30; // row text size

// Anchors (component-local px). baseline = text baseline of the row; left/right = inner row extent.
export const OR_ROWS = [0, 1, 2].map((i) => ({
  top: rowTop(i),
  bottom: rowTop(i) + ROW_H,
  baseline: Math.round(rowTop(i) + ROW_H / 2 + FS * 0.36),
  underline: Math.round(rowTop(i) + ROW_H / 2 + FS * 0.36 + 14), // a comfortable underline y beneath the text
  left: PAD_X,
  right: OR_W - PAD_X,
}));

// Timeline (local frames)
export const OR_T = {
  cardIn: 0,
  rowIn: (i: number) => 10 + i * 6, // fcRise 90 ms stagger
  assign: (i: number) => 90 + i * 30, // owner discs pop in on beats
  done: 240, // "Issue formal SLA credit report" UPCOMING → DONE
  due: 270, // "Submit certificate of insurance" UPCOMING → DUE
  settled: 290,
};

type Row = {title: string; owner: string; initials: string; date: string; status: (f: number) => [Status, string, number]};
const ROWS: Row[] = [
  {title: 'Submit certificate of insurance', owner: 'Finance', initials: 'F', date: 'Apr 12', status: (f) => (f < OR_T.due ? ['caution', 'UPCOMING', 0] : ['critical', 'DUE', OR_T.due])},
  {title: 'Remediate Critical vulnerabilities', owner: 'Infosec', initials: 'I', date: 'May 03', status: () => ['caution', 'UPCOMING', 0]},
  {title: 'Issue formal SLA credit report', owner: 'Delivery', initials: 'D', date: 'Mar 28', status: (f) => (f < OR_T.done ? ['caution', 'UPCOMING', 0] : ['ok', 'DONE', OR_T.done])},
];

const Head: React.FC<{x: number; children: React.ReactNode}> = ({x, children}) => (
  <span style={{position: 'absolute', left: x, top: PAD_Y, height: HEAD_H, display: 'flex', alignItems: 'center', fontSize: 28, fontWeight: 300, color: COL.ink, opacity: 0.5}}>{children}</span>
);

// Unassigned owner slot (app grammar: dashed "+" chip), then the initials disc + department name
const Owner: React.FC<{f: number; r: Row; at: number}> = ({f, r, at}) => {
  const p = tw(f, [at, at + 18], [0, 1], ease.enter);
  const name = tw(f, [at + 4, at + 19], [0, 1], ease.standard);
  const D = 46;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, height: D}}>
      <div style={{position: 'relative', width: D, height: D}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', border: `2px dashed ${COL.hair}`, boxSizing: 'border-box', opacity: 1 - tw(f, [at, at + 6], [0, 1], ease.standard)}}>
          <span style={{position: 'absolute', left: D / 2 - 8, top: D / 2 - 1, width: 16, height: 2, background: COL.muted, opacity: 0.6}} />
          <span style={{position: 'absolute', left: D / 2 - 1, top: D / 2 - 8, width: 2, height: 16, background: COL.muted, opacity: 0.6}} />
        </div>
        {p > 0 && <InitialsDisc initials={r.initials} size={D} style={{position: 'absolute', inset: 0, transform: `scale(${0.4 + 0.6 * p})`, opacity: tw(f, [at, at + 5], [0, 1], ease.standard)}} />}
      </div>
      <span style={{fontSize: FS, fontWeight: 400, color: COL.ink, opacity: name, transform: `translateX(${(1 - name) * -14}px)`}}>{r.owner}</span>
    </div>
  );
};

export const ObligationRegister: React.FC<{f: number}> = ({f}) => (
  <Card w={OR_W} h={OR_H} style={{position: 'relative', ...rise(f, OR_T.cardIn, 32, 24)}}>
    <div style={rise(f, 4, 28, 10)}>
      <Head x={COLS.obligation}>Obligation</Head>
      <Head x={COLS.owner}>Owner</Head>
      <Head x={COLS.due}>Due</Head>
      <Head x={COLS.status}>Status</Head>
    </div>
    <div style={{position: 'absolute', left: PAD_X, right: PAD_X, top: PAD_Y + HEAD_H - 1, height: 1, background: COL.hair}} />
    {ROWS.map((r, i) => {
      const [st, label, at] = r.status(f);
      const s = at ? tick(f, at, 0.1, 14) : 1;
      return (
        <div key={i} style={{position: 'absolute', left: 0, top: rowTop(i), width: OR_W, height: ROW_H, ...rise(f, OR_T.rowIn(i), 30, 20)}}>
          <div style={{position: 'absolute', left: COLS.obligation, top: 0, height: ROW_H, display: 'flex', alignItems: 'center', fontSize: FS, fontWeight: 600, letterSpacing: -0.2, color: COL.ink}}>{r.title}</div>
          <div style={{position: 'absolute', left: COLS.owner, top: 0, height: ROW_H, display: 'flex', alignItems: 'center'}}>
            <Owner f={f} r={r} at={OR_T.assign(i)} />
          </div>
          <div style={{position: 'absolute', left: COLS.due, top: 0, height: ROW_H, display: 'flex', alignItems: 'center', fontSize: FS, fontWeight: 400, color: COL.ink}}>{r.date}</div>
          <div style={{position: 'absolute', left: COLS.status, top: 0, height: ROW_H, display: 'flex', alignItems: 'center'}}>
            <span style={{display: 'inline-block', transform: `scale(${s})`, transformOrigin: '0% 50%'}}>
              <Chip status={st} size={24}>
                {label}
              </Chip>
            </span>
          </div>
          {i < ROWS.length - 1 && <div style={{position: 'absolute', left: PAD_X, right: PAD_X, bottom: 0, height: 1, background: COL.hairSoft}} />}
        </div>
      );
    })}
  </Card>
);
