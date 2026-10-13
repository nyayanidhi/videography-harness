// The end card. The glowing window in the wall becomes the vector mark in the same place at
// the same size (a true match dissolve), then settles into the lockup with the wordmark.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, H, PAL, W} from './config';
import {FONTS} from './fonts';
import {project} from './project';
import {camera, END} from './timeline';
import {MARK_GHOST, MARK_SOLID, WORDMARK} from '../wordmark';
import {MARK_S} from './world/mark';
import {BACK_Z} from './world/layout';

const smooth = (x: number) => {
  const c = Math.min(Math.max(x, 0), 1);
  return c * c * c * (c * (c * 6 - 15) + 10);
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

// logo units (lockup space of the SVG): mark x 1.508–20.343, ghost top y 1.02, baseline 20.8475
const CX = 10.9256;
const BASE = 20.8475;

export const EndCard: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  if (t < END.dissolve[0]) return null;
  const k = smooth((t - END.dissolve[0]) / (END.dissolve[1] - END.dissolve[0]));
  // where the window is on screen at this moment (shot I's camera)
  const cs = camera(t, t);
  const base = project(cs, [0, 0, BACK_Z]);
  const top = project(cs, [0, BASE * MARK_S - 0 * MARK_S, BACK_Z]);
  const pxPerUnit0 = (base.y - top.y) / BASE; // window: BASE logo units tall from y=0 to baseline
  // final lockup: mark ~150 px tall, whole lockup (x 1.5–60) centred, a touch above centre
  const pxPerUnit1 = 7.4;
  const lockW = (60.0 - 1.5) * pxPerUnit1;
  const x1 = W / 2 - lockW / 2 - 1.5 * pxPerUnit1; // screen x of logo-unit 0
  const y1 = H / 2 - 30 - (BASE * pxPerUnit1) / 2; // screen y of logo-unit 0
  // window placement: logo unit CX sits at the window's axis, BASE at the floor line
  const x0 = base.x - CX * pxPerUnit0;
  const y0 = base.y - BASE * pxPerUnit0;
  const m = smooth((t - END.lockup[0]) / (END.lockup[1] - END.lockup[0]));
  const s = mix(pxPerUnit0, pxPerUnit1, m);
  const x = mix(x0, x1, m);
  const y = mix(y0, y1, m);
  const word = smooth((t - END.lockup[0] - 0.5) / 0.9);
  const tag = smooth((t - END.tagline[0]) / (END.tagline[1] - END.tagline[0]));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{backgroundColor: PAL.navy, opacity: k}} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: k}}>
        <g transform={`translate(${x} ${y}) scale(${s})`}>
          {MARK_GHOST.map((d, i) => (
            <path key={`g${i}`} d={d} fill={PAL.ivory} fillOpacity={0.14} />
          ))}
          {MARK_SOLID.map((d, i) => (
            <path key={`s${i}`} d={d} fill={PAL.ivory} />
          ))}
          <g style={{opacity: word}} transform={`translate(${(1 - word) * -1.2} 0)`}>
            {WORDMARK.map((d, i) => (
              <path key={`w${i}`} d={d} fill={PAL.ivory} />
            ))}
          </g>
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: y1 + BASE * pxPerUnit1 + 58,
          textAlign: 'center',
          fontFamily: FONTS.text,
          fontWeight: 400,
          fontSize: 30,
          letterSpacing: '0.005em',
          color: PAL.ivory,
          opacity: tag * 0.78,
        }}
      >
        Order for the work. Room for the people.
      </div>
    </AbsoluteFill>
  );
};
