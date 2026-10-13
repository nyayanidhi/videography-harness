// Film copy: rilin.ai's display voice (Stack Sans Headline, light, large), revealed word by word.
import {useCurrentFrame} from 'remotion';
import {ease, tw} from '../theme';
import {COL, FONT} from './tokens';

export const CopyLine: React.FC<{text: string; at: number; out?: number; x?: number; y: number; size?: number; color?: string; align?: 'left' | 'center'}> = ({
  text,
  at,
  out,
  x = 0,
  y,
  size = 84,
  color = COL.navy,
  align = 'center',
}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  const gone = out === undefined ? 0 : tw(f, [out, out + 16], [0, 1], ease.exit);
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'center' ? 0 : x,
        width: align === 'center' ? 1920 : undefined,
        top: y,
        textAlign: align,
        fontFamily: FONT.head,
        fontWeight: 300,
        fontSize: size,
        letterSpacing: '-0.02em',
        lineHeight: 1.15,
        color,
        whiteSpace: 'pre',
      }}
    >
      {words.map((w, i) => {
        const k = tw(f, [at + i * 3, at + i * 3 + 18], [0, 1], ease.enter);
        return (
          <span key={i} style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: size * 0.2, marginBottom: -size * 0.2}}>
            <span style={{display: 'inline-block', transform: `translateY(${(1 - k + gone) * 110}%)`, opacity: gone > 0.98 ? 0 : 1}}>
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        );
      })}
    </div>
  );
};
