import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease, font, tw} from './theme';

// rilin-mark-solid.svg
const MARK = [
  'M7.76865 2.48901L8.99679 1.65652L10.2164 2.48901V17.1511H7.76865V2.48901Z',
  'M4.50493 17.1596V15.8005H6.95272V17.1596H4.50493Z',
  'M11.0324 17.1596V15.8005H13.4806V17.1596H11.0324Z',
  'M14.2961 14.5248L16.7439 16.9472V14.8404L14.2962 12.4182L14.2961 14.5248Z',
  'M11.0326 6.85535L13.4891 9.26102V14.9084H11.0324L11.0326 6.85535Z',
  'M6.95272 6.85535L4.50493 9.26225V14.9084H6.95272V6.85535Z',
  'M3.69069 14.4756V12.258L1.24121 14.7026L1.24132 16.9008L3.69069 14.4756Z',
];
export const MARK_BOTTOM = 17.16 / 17.98; // fraction of box height where the mark sits

export const Mark: React.FC<{size: number; color: string; style?: React.CSSProperties}> = ({size, color, style}) => (
  <svg width={size} height={size} viewBox="0 0 17.98 17.98" style={{display: 'block', overflow: 'visible', ...style}}>
    {MARK.map((d) => (
      <path key={d} d={d} fill={color} fillRule="evenodd" />
    ))}
  </svg>
);

// Line-mask reveal: type slides up inside its own box, exits up and faster
export const Reveal: React.FC<{
  at: number;
  out?: number;
  dur?: number;
  size?: number; // font size, so the mask leaves room for descenders
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, out, dur = 30, size = 40, style, children}) => {
  const f = useCurrentFrame();
  const pin = tw(f, [at, at + dur], [1, 0], ease.enter);
  const pout = out === undefined ? 0 : tw(f, [out, out + Math.round(dur * 0.65)], [0, 1], ease.exit);
  const pad = Math.round(size * 0.28);
  // hidden below = text height + descender pad; hidden above = text height
  return (
    <div style={{position: 'absolute', overflow: 'hidden', paddingBottom: pad, ...style}}>
      <div style={{transform: `translateY(calc(${(pin - pout) * 100}% + ${(pin - pout) * pad}px))`}}>{children}</div>
    </div>
  );
};

export const Display: React.FC<{size: number; color: string; children: React.ReactNode; weight?: number}> = ({
  size,
  color,
  children,
  weight = 600,
}) => (
  <div style={{fontFamily: font, fontWeight: weight, fontSize: size, lineHeight: 0.95, letterSpacing: '-0.035em', color, whiteSpace: 'pre'}}>
    {children}
  </div>
);

export const Body: React.FC<{color: string; children: React.ReactNode}> = ({color, children}) => (
  <div style={{fontFamily: font, fontWeight: 500, fontSize: 38, lineHeight: 1.3, letterSpacing: '-0.01em', color, whiteSpace: 'pre'}}>
    {children}
  </div>
);

export const Label: React.FC<{color: string; children: React.ReactNode}> = ({color, children}) => (
  <div style={{fontFamily: font, fontWeight: 600, fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase', color}}>{children}</div>
);

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'multiply', opacity: 0.03}}>
      <svg width="100%" height="100%">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={Math.floor(f / 2)} />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

