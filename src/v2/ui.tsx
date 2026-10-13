// Shared UI primitives matching rilin.ai's product mocks
import {Easing, interpolate} from 'remotion';
import {COL, FONT, RADIUS} from './tokens';

export const Card: React.FC<{w: number; h?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({w, h, style, children}) => (
  <div style={{width: w, height: h, background: COL.card, border: `1px solid ${COL.hair}`, borderRadius: RADIUS, fontFamily: FONT.text, color: COL.ink, boxSizing: 'border-box', ...style}}>
    {children}
  </div>
);

// Caps tag: MSA / FINANCE / TRANSACTION …
export const Tag: React.FC<{children: React.ReactNode; tone?: 'teal' | 'ink' | 'navy'; size?: number}> = ({children, tone = 'teal', size = 14}) => (
  <span
    style={{
      display: 'inline-block',
      background: tone === 'teal' ? COL.tagTeal : tone === 'navy' ? COL.navy : COL.ink,
      color: '#FFFFFD',
      fontFamily: FONT.mono,
      fontWeight: 600,
      fontSize: size,
      letterSpacing: size * 0.1,
      padding: `${size * 0.4}px ${size * 0.8}px`,
      lineHeight: 1,
      textTransform: 'uppercase',
    }}
  >
    {children}
  </span>
);

export type Status = 'critical' | 'caution' | 'ok';
export const Chip: React.FC<{status: Status; children: React.ReactNode; size?: number}> = ({status, children, size = 16}) => (
  <span
    style={{
      display: 'inline-block',
      background: COL[status],
      color: '#FFFFFD',
      fontFamily: FONT.text,
      fontWeight: 400,
      fontSize: size,
      letterSpacing: size * 0.017,
      padding: `${size * 0.33}px ${size * 0.67}px`,
      borderRadius: RADIUS,
      lineHeight: 1,
      textTransform: 'uppercase',
    }}
  >
    {children}
  </span>
);

export const Skeleton: React.FC<{w: number | string; h?: number}> = ({w, h = 12}) => (
  <div style={{width: w, height: h, background: COL.skeleton, borderRadius: 1}} />
);

// Initials disc (stands in for photo avatars). Solid department teal, white initials.
export const InitialsDisc: React.FC<{initials: string; size?: number; style?: React.CSSProperties}> = ({initials, size = 40, style}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: COL.tagTeal,
      color: '#FFFFFD',
      fontFamily: FONT.text,
      fontWeight: 500,
      fontSize: size * 0.42,
      lineHeight: `${size}px`,
      textAlign: 'center',
      letterSpacing: 0,
      flexShrink: 0,
      ...style,
    }}
  >
    {initials}
  </div>
);

// Tabular number: each digit in a fixed-width cell so counting values never jitter.
export const TabNum: React.FC<{value: string; em?: number}> = ({value, em = 0.6}) => (
  <span style={{display: 'inline-flex'}}>
    {value.split('').map((ch, i) => (
      <span key={i} style={{display: 'inline-block', width: /[0-9]/.test(ch) ? `${em}em` : undefined, textAlign: 'center'}}>
        {ch}
      </span>
    ))}
  </span>
);

// ── Added for gallery B components ─────────────────────────────────────────
// Pointer cursor drawn as a plain SVG (no icon library). Its tip sits at the wrapper's (0,0).
// `press` 0–1 dips the pointer toward its tip (use the same curve as the button it presses).
export const Cursor: React.FC<{x: number; y: number; size?: number; press?: number; opacity?: number}> = ({x, y, size = 44, press = 0, opacity = 1}) => {
  const k = size / 34;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, opacity, pointerEvents: 'none'}}>
      <svg width={26 * k} height={36 * k} viewBox="-1.5 -1.5 26 36" style={{position: 'absolute', left: -1.5 * k, top: -1.5 * k, transform: `scale(${1 - 0.1 * press})`, transformOrigin: `${1.5 * k}px ${1.5 * k}px`, overflow: 'visible'}}>
        <path d="M0 0 L0 27.5 L6.6 21.4 L11.1 31.6 L15.6 29.6 L11.2 19.7 L20 19.7 Z" fill={COL.ink} stroke={COL.card} strokeWidth={1.9} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// Site "fcRise"/"askLineIn": rise `dist` px and fade in from local frame t0 over `dur` frames (enter curve).
export const rise = (f: number, t0: number, dur = 29, dist = 16): React.CSSProperties => {
  const p = interpolate(f, [t0, t0 + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const o = interpolate(f, [t0, t0 + Math.min(dur, 12)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {opacity: o, transform: `translateY(${(1 - p) * dist}px)`};
};

// rilin wordmark + pillar emblem, paths from rilin.ai (docs/rilin/site-assets/imgLogoContainer.svg). viewBox 92.85 × 33.81.
const LOGO_PATHS: [string, boolean][] = [
  ['M26.877 29.4987L29.6941 32.2458H26.8768L26.877 29.4987Z', true],
  ['M14.6044 4.67936L16.9134 3.11417L19.2065 4.67936V32.2458H14.6044V4.67936Z', false],
  ['M8.46821 32.2618V29.7064H13.0704V32.2618H8.46821Z', false],
  ['M20.7406 32.2618V29.7064H25.3436V32.2618H20.7406Z', false],
  ['M6.93417 20.8264L2.33203 25.4261V1.58093H6.93417V20.8264Z', true],
  ['M13.0704 10.7749L8.46821 15.3162V1.58093H13.0704V10.7749Z', true],
  ['M20.7406 1.58093H25.3427V15.3162L20.7406 10.7725V1.58093Z', true],
  ['M26.8768 20.8615L31.4789 25.4101V1.58093H26.8768V20.8615Z', true],
  ['M26.8768 27.3082L31.4789 31.8625V27.9014L26.8771 23.3474L26.8768 27.3082Z', false],
  ['M20.7409 12.8886L25.3595 17.4115V28.0293H20.7406L20.7409 12.8886Z', false],
  ['M13.0704 12.8886L8.46821 17.4138V28.0293H13.0704V12.8886Z', false],
  ['M6.93735 27.2156V23.0463L2.33203 27.6423L2.33223 31.7753L6.93735 27.2156Z', false],
  ['M6.93735 29.3754V32.2458L4.11246 32.2457L6.93735 29.3754Z', true],
  ['M60.5027 28.8049H56.7515V12.9101H60.5027V28.8049ZM56.4018 7.82374C56.4018 6.61573 57.3873 5.59846 58.6271 5.59846C59.8669 5.59846 60.8523 6.61573 60.8523 7.82374C60.8523 9.06353 59.8669 10.0808 58.6271 10.0808C57.3873 10.0808 56.4018 9.06353 56.4018 7.82374Z', false],
  ['M67.6037 4.96266V28.8049H63.8525V4.96266H67.6037Z', false],
  ['M74.7047 28.8049H70.9535V12.9101H74.7047V28.8049ZM70.6038 7.82374C70.6038 6.61573 71.5893 5.59846 72.8291 5.59846C74.0689 5.59846 75.0544 6.61573 75.0544 7.82374C75.0544 9.06353 74.0689 10.0808 72.8291 10.0808C71.5893 10.0808 70.6038 9.06353 70.6038 7.82374Z', false],
  ['M81.8057 28.8049H78.0546V12.9101H81.8057V14.6267C82.982 13.3869 84.6986 12.5922 86.5742 12.5922C90.2618 12.5922 92.805 15.1989 92.805 19.2362V28.8049H89.0538V20.031C89.0538 17.3606 87.655 16.1209 85.6523 16.1209C83.4906 16.1209 81.8057 17.7103 81.8057 20.2217V28.8049Z', false],
  ['M41.5439 28.805H45.2951V20.2218C45.2951 17.7104 46.98 16.1209 49.1417 16.1209C50.5522 16.1209 51.6632 16.7359 52.1968 18.0326L55.1826 15.1828C54.0983 13.542 52.2894 12.5923 50.0636 12.5923C48.188 12.5923 46.4713 13.387 45.2951 14.6268V12.9102H41.5439V28.805Z', false],
];
export const RilinLogo: React.FC<{height: number; color?: string}> = ({height, color = COL.navy}) => (
  <svg height={height} width={(height * 92.8512) / 33.8051} viewBox="0 0 92.8512 33.8051" style={{display: 'block'}}>
    {LOGO_PATHS.map(([d, ghost], i) => (
      <path key={i} d={d} fill={color} fillOpacity={ghost ? 0.1 : 1} fillRule="evenodd" clipRule="evenodd" />
    ))}
  </svg>
);
