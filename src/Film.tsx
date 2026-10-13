import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Canvas3D} from './Canvas3D';
import {Grain} from './components';
import {Overlay} from './Overlay';

export const Film: React.FC = () => (
  <AbsoluteFill>
    <Canvas3D />
    <Overlay />
    <Grain />
    <Audio src={staticFile('sfx.wav')} />
  </AbsoluteFill>
);
