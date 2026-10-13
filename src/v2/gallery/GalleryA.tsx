import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL} from '../tokens';
import {TB_H, TB_W, TransactionBreakdown} from '../components/TransactionBreakdown';
import {OR_H, OR_W, ObligationRegister} from '../components/ObligationRegister';
import {EX_H, EX_W, ExposureStack} from '../components/ExposureStack';
import {SW_H, SW_W, StackWall} from '../components/StackWall';

// Component gallery A: each component on the film ground, one per 150-frame range.
// Each range time-compresses its component's local clock so the range ends on the settled state:
//   0–149   TransactionBreakdown  f = frame × 2.4        (0 → 358)
//   150–299 ObligationRegister    f = (frame−150) × 2.8  (0 → 417)
//   300–449 ExposureStack         f = (frame−300) × 2    (0 → 298)
//   450–599 StackWall (scaled)    f = (frame−450) × 1.6  (0 → 238)
const Fit: React.FC<{w: number; h: number; scale?: number; children: React.ReactNode}> = ({w, h, scale = 1, children}) => (
  <div style={{position: 'absolute', left: 960 - (w * scale) / 2, top: 540 - (h * scale) / 2, width: w, height: h, transform: `scale(${scale})`, transformOrigin: '0 0'}}>{children}</div>
);

export const GalleryA: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: COL.ground, overflow: 'hidden'}}>
      {frame < 150 && (
        <Fit w={TB_W} h={TB_H}>
          <TransactionBreakdown f={frame * 2.4} />
        </Fit>
      )}
      {frame >= 150 && frame < 300 && (
        <Fit w={OR_W} h={OR_H}>
          <ObligationRegister f={(frame - 150) * 2.8} />
        </Fit>
      )}
      {frame >= 300 && frame < 450 && (
        <Fit w={EX_W} h={EX_H}>
          <ExposureStack f={(frame - 300) * 2} />
        </Fit>
      )}
      {frame >= 450 && (
        <Fit w={SW_W} h={SW_H} scale={Math.min(1840 / SW_W, 1040 / SW_H)}>
          <StackWall f={(frame - 450) * 1.6} />
        </Fit>
      )}
    </AbsoluteFill>
  );
};
