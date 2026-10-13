import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, FONT} from '../tokens';
import {CONTRACT_SHEET, ContractSheet} from '../components/ContractSheet';
import {LIFECYCLE_AXIS, LifecycleAxis} from '../components/LifecycleAxis';
import {ease, tw} from '../../theme';
import {REDLINE_CARD, RedlineCard} from '../components/RedlineCard';
import {ASK_RILIN, AskRilin} from '../components/AskRilin';
import {COUNSEL_CARD, CounselCard} from '../components/CounselCard';

// Component gallery B: each component rendered on the film ground for review.
// Gallery frames map to 2× local frames so each component's whole timeline is visible.

const Marker: React.FC<{x: number; y: number; label: string}> = ({x, y, label}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
    <div style={{position: 'absolute', left: -9, top: -0.5, width: 18, height: 1, background: COL.teal}} />
    <div style={{position: 'absolute', left: -0.5, top: -9, width: 1, height: 18, background: COL.teal}} />
    <div style={{position: 'absolute', left: 10, top: 6, fontFamily: FONT.mono, fontSize: 11, letterSpacing: 1, color: COL.teal, whiteSpace: 'nowrap'}}>{label}</div>
  </div>
);

const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 40, top: 32, fontFamily: FONT.mono, fontWeight: 600, fontSize: 14, letterSpacing: 1.4, color: COL.muted}}>{children}</div>
);

const Place: React.FC<{x: number; y: number; scale?: number; children: React.ReactNode}> = ({x, y, scale = 1, children}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${scale})`, transformOrigin: '0 0'}}>{children}</div>
);

export const GalleryB: React.FC = () => {
  const frame = useCurrentFrame();
  let body: React.ReactNode = null;
  if (frame < 120) {
    const f = frame * 2;
    const x = (1920 - CONTRACT_SHEET.w) / 2;
    const y = (1080 - CONTRACT_SHEET.h) / 2;
    body = (
      <>
        <Label>CONTRACTSHEET · f={f}</Label>
        <Place x={x} y={y}>
          <ContractSheet f={f} />
          {Object.entries(CONTRACT_SHEET.anchors).map(([k, p]) => <Marker key={k} x={p.x} y={p.y} label={k} />)}
        </Place>
      </>
    );
  }
  if (frame >= 120 && frame < 240) {
    const g = frame - 120;
    const drawn = tw(g, [0, 50], [0, 1], ease.move);
    const lit = {notice: 62};
    const fit = 1800 / LIFECYCLE_AXIS.w;
    // 1:1 crops of the axis (window x-range in component px)
    const crops: [number, number, string][] = [
      [-30, 850, 'DAY 1'],
      [1640, 2520, 'NOTICE WINDOW · lit at g=62'],
      [5300, 6180, 'RENEWAL DEADLINE · faint'],
      [8150, 9030, 'DAY N'],
    ];
    body = (
      <>
        <Label>LIFECYCLEAXIS · g={g} · drawn={drawn.toFixed(2)} · top: whole axis at {fit.toFixed(2)}× · below: 1:1 crops</Label>
        <Place x={60} y={120} scale={fit}>
          <LifecycleAxis f={g} drawn={drawn} lit={lit} />
        </Place>
        {crops.map(([a, b, name], i) => (
          <div key={i} style={{position: 'absolute', left: 60 + (i % 2) * 920, top: 260 + Math.floor(i / 2) * 380, width: b - a, height: 300, overflow: 'hidden', outline: `1px dashed ${COL.hair}`}}>
            <div style={{position: 'absolute', left: 12, top: 8, fontFamily: FONT.mono, fontSize: 12, letterSpacing: 1.2, color: COL.muted}}>{name}</div>
            <Place x={-a} y={40}>
              <LifecycleAxis f={g} drawn={drawn} lit={lit} />
              {Object.entries(LIFECYCLE_AXIS.anchors).map(([k, p]) => <Marker key={k} x={p.x} y={p.y} label={k} />)}
            </Place>
          </div>
        ))}
      </>
    );
  }
  if (frame >= 240 && frame < 420) {
    const f = (frame - 240) * 2;
    const x = (1920 - REDLINE_CARD.w) / 2;
    const y = (1080 - REDLINE_CARD.h) / 2 + 20;
    body = (
      <>
        <Label>REDLINECARD · f={f} · click at f={REDLINE_CARD.t.click}</Label>
        <Place x={x} y={y}>
          <RedlineCard f={f} />
          {Object.entries(REDLINE_CARD.anchors).map(([k, p]) => <Marker key={k} x={p.x} y={p.y} label={k} />)}
        </Place>
      </>
    );
  }
  if (frame >= 420 && frame < 540) {
    const f = (frame - 420) * 2;
    const x = (1920 - ASK_RILIN.w) / 2;
    const y = (1080 - ASK_RILIN.h) / 2;
    body = (
      <>
        <Label>ASKRILIN · f={f} · date at f={ASK_RILIN.t.date}</Label>
        <Place x={x} y={y}>
          <AskRilin f={f} />
          {Object.entries(ASK_RILIN.anchors).map(([k, p]) => <Marker key={k} x={p.x} y={p.y} label={k} />)}
        </Place>
      </>
    );
  }
  if (frame >= 540) {
    const f = (frame - 540) * 2;
    const x = (1920 - COUNSEL_CARD.w) / 2;
    const y = (1080 - COUNSEL_CARD.h) / 2;
    body = (
      <>
        <Label>COUNSELCARD · f={f} · pressAt=96</Label>
        <Place x={x} y={y}>
          <CounselCard f={f} pressAt={96} />
          {Object.entries(COUNSEL_CARD.anchors).map(([k, p]) => <Marker key={k} x={p.x} y={p.y} label={k} />)}
        </Place>
      </>
    );
  }
  return <AbsoluteFill style={{background: COL.ground}}>{body}</AbsoluteFill>;
};
