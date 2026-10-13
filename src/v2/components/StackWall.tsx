// Beat 11: "one becomes many". A wall of compact transaction and contract cards, with the hero
// transaction (IT Vendor Onboarding · TXN-2026-014) outlined in teal at the exact centre.
// Fixed size SW_W × SW_H (≈4000 × 2400), top-left at 0,0. Local frame f.
// Only site-published names appear as text (IT Vendor Onboarding, Baker Supply, Acme Corp, Globex, Initech).
// Every other card is abstracted: skeleton names with real tag/chip vocabulary, so no customer is invented.
import {random} from 'remotion';
import {ease, tw} from '../../theme';
import {COL, FONT, RADIUS} from '../tokens';
import {Chip, Skeleton, Status, Tag} from '../ui';
import {rise} from './anim';

const COLS = 11;
const ROWS = 11;
const CW = 340;
const CH = 196;
const GAP = 24;
export const SW_W = 4000;
export const SW_H = 2400;
const OX = (SW_W - (COLS * CW + (COLS - 1) * GAP)) / 2;
const OY = (SW_H - (ROWS * CH + (ROWS - 1) * GAP)) / 2;
const HERO = {c: 5, r: 5};
const cellX = (c: number) => OX + c * (CW + GAP);
const cellY = (r: number) => OY + r * (CH + GAP);

// Anchors (component-local px)
export const SW_HERO = {x: cellX(HERO.c), y: cellY(HERO.r), w: CW, h: CH, cx: cellX(HERO.c) + CW / 2, cy: cellY(HERO.r) + CH / 2};
export const SW_CELL = {w: CW, h: CH, gap: GAP};

// Timeline: cards populate outward from the hero, then everything holds.
const MAX_D = Math.hypot(5, 5);
const delay = (c: number, r: number) => 6 + (Math.hypot(c - HERO.c, r - HERO.r) / MAX_D) * 84 + random(`d${c}-${r}`) * 10;
export const SW_T = {heroIn: 0, outline: [0, 24] as [number, number], settled: 6 + 84 + 10 + 28};

const pick = <T,>(seed: string, arr: T[]) => arr[Math.floor(random(seed) * arr.length) % arr.length];
const DEPTS = ['FINANCE', 'INFOSEC', 'DELIVERY', 'LEGAL OPS'];
const TYPES = ['MSA', 'SLA', 'NDA'];
type Lvl = {status: Status; label: string; score: number};
// Contracts carry exposure levels (CRITICAL / CAUTION / STANDARD + score); transactions carry obligation states (DUE / UPCOMING / DONE)
const lvl = (seed: string, kind: 'contract' | 'txn'): Lvl => {
  const x = random(seed);
  const c = kind === 'contract';
  if (x < 0.1) return {status: 'critical', label: c ? 'CRITICAL' : 'DUE', score: 0.72 + random(seed + 's') * 0.24};
  if (x < 0.34) return {status: 'caution', label: c ? 'CAUTION' : 'UPCOMING', score: 0.36 + random(seed + 's') * 0.3};
  return {status: 'ok', label: c ? 'STANDARD' : 'DONE', score: 0.06 + random(seed + 's') * 0.26};
};

// Real cells (site copy), placed off-centre so the hero stays the only highlight
const REAL: Record<string, {kind: 'contract' | 'txn'; title: string; type?: string; lvl: Lvl}> = {
  '3-4': {kind: 'contract', title: 'Acme Corp', type: 'MSA', lvl: {status: 'critical', label: 'CRITICAL', score: 0.92}},
  '7-6': {kind: 'contract', title: 'Globex', type: 'SLA', lvl: {status: 'caution', label: 'CAUTION', score: 0.42}},
  '6-3': {kind: 'contract', title: 'Initech', type: 'NDA', lvl: {status: 'ok', label: 'STANDARD', score: 0.15}},
  '4-7': {kind: 'txn', title: 'Baker Supply', lvl: {status: 'caution', label: 'DUE IN 3 DAYS', score: 0}},
};

const T = 13; // tag size inside compact cards

const Bar: React.FC<{v: number; s: Status}> = ({v, s}) => (
  <div style={{height: 6, background: COL.track, borderRadius: RADIUS}}>
    <div style={{width: `${v * 100}%`, height: 6, background: COL[s], borderRadius: RADIUS}} />
  </div>
);

const Active: React.FC = () => (
  <span style={{display: 'flex', alignItems: 'center', gap: 6, fontFamily: FONT.mono, fontWeight: 600, fontSize: 12, letterSpacing: 1.2, color: COL.ink}}>
    <span style={{width: 8, height: 8, borderRadius: '50%', background: COL.ok}} />
    ACTIVE
  </span>
);

const NavyCount: React.FC<{children?: React.ReactNode; w?: number}> = ({children, w}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', height: 24, padding: '0 9px', background: COL.navy, color: '#FFFFFD', fontFamily: FONT.text, fontSize: 13, letterSpacing: 0.2}}>
    {children ?? <span style={{display: 'block', width: w, height: 6, background: 'rgba(255,255,253,0.35)', borderRadius: 1}} />}
  </span>
);

const box: React.CSSProperties = {width: CW, height: CH, boxSizing: 'border-box', background: COL.card, border: `1px solid ${COL.hair}`, borderRadius: RADIUS, padding: 18, fontFamily: FONT.text, color: COL.ink, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'};

const TxnCell: React.FC<{seed: string; title?: string; chip?: Lvl}> = ({seed, title, chip}) => {
  const l = chip ?? (random(seed + 'c') < 0.4 ? lvl(seed + 'l', 'txn') : undefined); // most transaction cards carry no chip
  const d = pick(seed + 'dep', DEPTS);
  return (
    <div style={box}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Tag size={T}>Transaction</Tag>
        <Active />
      </div>
      <div>
        {title ? (
          <div style={{fontSize: 26, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.1}}>{title}</div>
        ) : (
          <Skeleton w={130 + random(seed + 'w') * 140} h={18} />
        )}
        <div style={{marginTop: 10}}>
          <Skeleton w={96} h={8} />
        </div>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap'}}>
          <NavyCount w={44 + random(seed + 'n') * 30} />
          {!title && <Tag size={T}>{d}</Tag>}
        </span>
        {l && (
          <Chip status={l.status} size={13}>
            {l.label}
          </Chip>
        )}
      </div>
    </div>
  );
};

const ContractCell: React.FC<{seed: string; title?: string; type?: string; chip?: Lvl}> = ({seed, title, type, chip}) => {
  const l = chip ?? lvl(seed + 'l', 'contract');
  const ty = type ?? pick(seed + 'ty', TYPES);
  return (
    <div style={box}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <span style={{width: 2, height: 16, background: COL.navy}} />
          <span style={{fontFamily: FONT.mono, fontWeight: 600, fontSize: 12, letterSpacing: 1.2, color: COL.navy}}>CONTRACT</span>
        </span>
        <Tag tone="ink" size={T}>
          {ty}
        </Tag>
      </div>
      <div>
        {title ? (
          <div style={{fontSize: 26, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.1}}>{title}</div>
        ) : (
          <Skeleton w={110 + random(seed + 'w') * 130} h={18} />
        )}
        <div style={{marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7}}>
          <Skeleton w={'100%'} h={6} />
        </div>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
        <Chip status={l.status} size={13}>
          {l.label}
        </Chip>
        <div style={{flex: 1}}>
          <Bar v={l.score} s={l.status} />
        </div>
        {title ? <span style={{fontSize: 14, color: COL[l.status], fontVariantNumeric: 'tabular-nums'}}>{l.score.toFixed(2)}</span> : <Skeleton w={30} h={10} />}
      </div>
    </div>
  );
};

const HeroCell: React.FC<{f: number}> = ({f}) => {
  const o = tw(f, SW_T.outline, [0, 1], ease.enter);
  return (
    <div style={{...box, padding: 18, position: 'relative'}}>
      <div style={{position: 'absolute', inset: -9, border: `4px solid ${COL.teal}`, borderRadius: RADIUS + 2, opacity: o, transform: `scale(${1.04 - 0.04 * o})`}} />
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Tag size={T}>Transaction</Tag>
        <Active />
      </div>
      <div>
        <div style={{fontSize: 27, fontWeight: 500, letterSpacing: -0.3, lineHeight: 1.1, whiteSpace: 'nowrap'}}>IT Vendor Onboarding</div>
        <div style={{marginTop: 8, fontFamily: FONT.mono, fontWeight: 600, fontSize: 12, letterSpacing: 1.2, color: COL.navy, opacity: 0.8}}>ID:TXN-2026-014</div>
      </div>
      <div>
        <NavyCount>→ 4 core obligations</NavyCount>
      </div>
    </div>
  );
};

export const StackWall: React.FC<{f: number}> = ({f}) => {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const key = `${c}-${r}`;
      const isHero = c === HERO.c && r === HERO.r;
      const t = isHero ? SW_T.heroIn : delay(c, r);
      if (!isHero && f < t) continue;
      const real = REAL[key];
      const contract = real ? real.kind === 'contract' : random(`k${key}`) < 0.36;
      const node = isHero ? (
        <HeroCell f={f} />
      ) : contract ? (
        <ContractCell seed={key} title={real?.title} type={real?.type} chip={real?.lvl} />
      ) : (
        <TxnCell seed={key} title={real?.title} chip={real?.lvl} />
      );
      cells.push(
        <div key={key} style={{position: 'absolute', left: cellX(c), top: cellY(r), ...(isHero ? {} : rise(f, t, 28, 18))}}>
          {node}
        </div>,
      );
    }
  }
  return <div style={{position: 'relative', width: SW_W, height: SW_H}}>{cells}</div>;
};
