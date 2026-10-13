// Title supers: set like cinema titles, centred in the picture area, never on the bars.
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, H, PAL} from './config';
import {FONTS} from './fonts';
import {LOOK, SUPERS} from './timeline';

const smooth = (x: number) => {
  const c = Math.min(Math.max(x, 0), 1);
  return c * c * (3 - 2 * c);
};

export const Titles: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const bar = LOOK(t).bar;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {SUPERS.map((s, i) => {
        const fi = 0.9;
        const fo = 0.7;
        const o = smooth((t - s.t0) / fi) * (1 - smooth((t - (s.t1 - fo)) / fo));
        if (o <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s.align === 'left' ? 120 : 0,
              right: s.align === 'left' ? undefined : 0,
              // left-set lines sit in the dark wall beside the window, a little above centre
              ...(s.align === 'left' ? {top: H * 0.38} : {bottom: bar * H + 112}),
              textAlign: s.align === 'left' ? 'left' : 'center',
              // a soft scrim keeps titles legible over light, without a visible box
              textShadow: '0 0 28px rgba(4,6,8,0.55), 0 0 60px rgba(4,6,8,0.35)',
              fontFamily: FONTS.head,
              fontWeight: 300,
              fontSize: 44,
              lineHeight: 1.22,
              letterSpacing: '0.004em',
              color: PAL.ivory,
              opacity: o,
            }}
          >
            {s.lines.map((line, k) => (
              <div key={k}>
                {s.accent && line.endsWith(s.accent) ? (
                  <>
                    {line.slice(0, line.length - s.accent.length)}
                    <span style={{color: PAL.aqua}}>{s.accent}</span>
                  </>
                ) : (
                  line
                )}
              </div>
            ))}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
