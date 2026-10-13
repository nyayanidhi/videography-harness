// Rilin film v2 tokens: taken from rilin.ai's product mocks and the app (docs/rilin-components.md §0)
import {continueRender, delayRender, staticFile} from 'remotion';
import {loadFont as loadMono} from '@remotion/google-fonts/GeistMono';
import {loadFont as loadDM} from '@remotion/google-fonts/DMSans';

const faces: [string, string][] = [
  ['Stack Sans Text', 'fonts/StackSans-Text-Variable.woff2'],
  ['Stack Sans Headline', 'fonts/StackSans-Headline-Variable.woff2'],
];
if (typeof document !== 'undefined') {
  for (const [family, file] of faces) {
    const h = delayRender(`font ${family}`);
    const ff = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight: '100 900'});
    ff.load().then((f) => {
      document.fonts.add(f);
      continueRender(h);
    });
  }
}

export const FONT = {
  text: '"Stack Sans Text", system-ui, sans-serif', // product UI
  head: '"Stack Sans Headline", system-ui, sans-serif', // film copy (site uses 200–300, large)
  mono: loadMono('normal', {weights: ['600'], subsets: ['latin']}).fontFamily, // caps tags
  answer: loadDM('normal', {weights: ['400', '600'], subsets: ['latin']}).fontFamily, // Ask Rilin answers
};

export const COL = {
  ground: '#FAFAF7', // film field (no pure white)
  card: '#FFFFFD', // card surface, a hair lighter than the field
  navy: '#072939', // Rilin brand ink (logo, CTAs, bubbles)
  ink: '#1E1E1E', // primary text in mocks
  muted: '#6B6E73', // secondary text
  hair: 'rgba(7,41,57,0.14)', // card border
  hairSoft: 'rgba(7,41,57,0.08)', // row dividers
  teal: '#007574', // brand accent: contrail, active states
  tagTeal: '#297373', // department tags
  skeleton: '#E4E2DE',
  track: '#E1E1DE',
  // data-only status trio (chips and bars only)
  critical: '#C11106',
  caution: '#AE3F00',
  ok: '#1E780C',
};

export const RADIUS = 2; // rilin.ai shape language
export const FPS = 60;
export const sec = (s: number) => Math.round(s * FPS);
