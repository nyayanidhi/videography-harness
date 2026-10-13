// Two families only: Stack Sans (the Rilin site's own typeface) and Geist Mono for
// the etched records. Rendering waits until both are in.
import {useEffect, useState} from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';
import {loadFont as loadMono} from '@remotion/google-fonts/GeistMono';

const mono = loadMono('normal', {weights: ['400', '500'], subsets: ['latin', 'latin-ext']});

export const FONTS = {
  head: '"Stack Sans Headline", system-ui, sans-serif',
  text: '"Stack Sans Text", system-ui, sans-serif',
  mono: `${mono.fontFamily}, ui-monospace, monospace`,
};

let ready: Promise<void> | null = null;
const loadAll = () => {
  if (!ready) {
    const faces: [string, string][] = [
      ['Stack Sans Text', 'fonts/StackSans-Text-Variable.woff2'],
      ['Stack Sans Headline', 'fonts/StackSans-Headline-Variable.woff2'],
    ];
    ready = Promise.all([
      ...faces.map(([family, file]) =>
        new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight: '100 900'}).load().then((f) => {
          document.fonts.add(f);
        }),
      ),
      mono.waitUntilDone(),
    ]).then(() => undefined);
  }
  return ready;
};

export const useFontsReady = () => {
  const [ok, setOk] = useState(false);
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    loadAll().then(() => {
      setOk(true);
      continueRender(handle);
    });
  }, [handle]);
  return ok;
};
