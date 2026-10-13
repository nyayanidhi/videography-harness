import {AbsoluteFill} from 'remotion';
import {Reveal} from './components';
import {LOCK, NAME_LEAD, NAME_SIZE, typeAt, typeBox, typeOut} from './Canvas3D';
import {D, F, font} from './theme';
import {WORDMARK} from './wordmark';

// Copy is verbatim (or trimmed) from rilin.ai — nothing invented
const WP = [
  {name: ['Risk', 'Surfacing'], fact: 'Exposure mapped across every contract.'},
  {name: ['Obligation', 'Tracking'], fact: 'Every commitment held as a live register.'},
  {name: ['Draft', 'and Review'], fact: 'Drafted, reviewed and analysed in one place.'},
  {name: ['Specialist', 'Counsel'], fact: 'Empanelled counsel, with full contract context.'},
  {name: ['Ask Rilin'], fact: 'Know what impacts your business.'},
  {name: ['Tenant', 'Isolation'], fact: 'Your contracts are never used to train models.'},
];

const display: React.CSSProperties = {
  fontFamily: font,
  fontWeight: 600,
  fontSize: NAME_SIZE,
  lineHeight: 1,
  letterSpacing: '-0.04em',
  color: D.fg,
  whiteSpace: 'pre',
};
const body = (size: number): React.CSSProperties => ({fontFamily: font, fontWeight: 500, fontSize: size, lineHeight: 1.3, letterSpacing: '-0.01em', color: D.fg, whiteSpace: 'pre'});

// mark-solid → logo-lockup geometry (see LOCK in Canvas3D)
const PX = LOCK.h / 18; // px per mark unit
const LPX = PX / 1.2155; // px per logo-lockup unit
const WM_LEFT = LOCK.x + (7.7687 - 9) * PX + (26 - 9.4386) * LPX;
const WM_TOP = LOCK.y + (17.151 - 9) * PX - 20.837 * LPX;

export const Overlay: React.FC = () => (
  <AbsoluteFill>
    {/* the rilin.ai line, split around the take-off; the mark is the hero here */}
    {['Lawyers show up at the start', 'and at the end.'].map((l, i) => (
      <Reveal key={l} at={60 + i * 4} out={263} size={40} style={{left: 262, top: 880 + i * 52}}>
        <div style={body(40)}>{l}</div>
      </Reveal>
    ))}
    <Reveal at={375} out={495} size={40} style={{left: 262, top: 150}}>
      <div style={body(40)}>Rilin runs everything in between.</div>
    </Reveal>

    {WP.map((w, k) => {
      const at = typeAt(k);
      const out = typeOut(k);
      const {left, top} = typeBox(k, w.name.length);
      return (
        <div key={w.fact}>
          {w.name.map((l, i) => (
            <Reveal key={l} at={at + i * 4} out={out} size={NAME_SIZE} style={{left, top: top + i * NAME_LEAD}}>
              <div style={display}>{l}</div>
            </Reveal>
          ))}
          <Reveal at={at + 14} out={out} size={32} style={{left: left + 4, top: top + w.name.length * NAME_LEAD + 22}}>
            <div style={body(32)}>{w.fact}</div>
          </Reveal>
        </div>
      );
    })}

    {/* the real rilin wordmark, then the positioning line */}
    <Reveal at={F.wordmark} dur={30} size={200} style={{left: WM_LEFT, top: WM_TOP}}>
      <svg width={34.5 * LPX} height={21.8447 * LPX} viewBox="26 0 34.5 21.8447" style={{display: 'block'}}>
        {WORDMARK.map((d) => (
          <path key={d} d={d} fill={D.fg} fillRule="evenodd" />
        ))}
      </svg>
    </Reveal>
    <Reveal at={F.wordmark + 24} dur={30} size={30} style={{left: WM_LEFT + 0.85 * LPX, top: LOCK.y + 205}}>
      <div style={body(30)}>Contractual liability control for enterprises.</div>
    </Reveal>
  </AbsoluteFill>
);
