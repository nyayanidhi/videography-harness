// RILIN "ROOM": the film. One world, one renderer, one timeline.
import {useFrame, useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {useMemo, useRef} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FPS, H, W} from './config';
import {EndCard} from './EndCard';
import {FONTS, useFontsReady} from './fonts';
import {Pipeline} from './render/Pipeline';
import {camera, LENGTH, LOOK} from './timeline';
import {Titles} from './Titles';
import {Hall} from './world/Hall';
import {makeConcrete, makePingAtlas, makeWorkAtlas} from './world/textures';

export const ROOM_LEN = Math.round(LENGTH * FPS);

const Renderer: React.FC<{hall: Hall; samples: number}> = ({hall, samples}) => {
  const {gl} = useThree();
  const frame = useCurrentFrame();
  const fr = useRef(frame);
  fr.current = frame;
  const pipe = useMemo(() => new Pipeline(gl, hall), [gl, hall]);
  useFrame(() => {
    const t = fr.current / FPS;
    pipe.render(t, fr.current, (ts) => camera(t, ts), samples, LOOK(t));
  }, 1);
  return null;
};

export const RilinRoom: React.FC<{samples?: number; audio?: boolean}> = ({samples = 16, audio = false}) => {
  const fonts = useFontsReady();
  const hall = useMemo(() => {
    if (!fonts) return null;
    return new Hall({
      atlas: makeWorkAtlas(FONTS.mono, FONTS.text),
      concrete: makeConcrete(),
      pingAtlas: makePingAtlas(FONTS.mono, FONTS.text),
      fonts: {text: FONTS.text, mono: FONTS.mono},
    });
  }, [fonts]);
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {hall && (
        <ThreeCanvas width={W} height={H} shadows flat linear gl={{antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance'}}>
          <Renderer hall={hall} samples={samples} />
        </ThreeCanvas>
      )}
      <Titles />
      <EndCard />
      {audio && <Audio src={staticFile('room/score.wav')} />}
    </AbsoluteFill>
  );
};
