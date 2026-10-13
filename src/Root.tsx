import {Composition} from 'remotion';
import {Film} from './Film';
import {RocketTest} from './r3d/RocketTest';
import {CloudTest} from './r3d/CloudTest';
import {VaporTest} from './r3d/VaporTest';
import {StageTest} from './v2/StageTest';
import {GalleryA} from './v2/gallery/GalleryA';
import {Finale, FINALE_LEN} from './v2/Finale';
import {FilmV2, V2_LEN} from './v2/FilmV2';
import {GalleryB} from './v2/gallery/GalleryB';
import {FPS, TOTAL} from './theme';
import {RilinRoom, ROOM_LEN} from './room/Film';
import {FPS as ROOM_FPS} from './room/config';

export const Root: React.FC = () => (
  <>
    <Composition id="RilinRoom" component={RilinRoom} durationInFrames={ROOM_LEN} fps={ROOM_FPS} width={1920} height={1080} defaultProps={{samples: 16, audio: false}} />
    <Composition id="RilinV2" component={FilmV2} durationInFrames={V2_LEN} fps={FPS} width={1920} height={1080} />
    <Composition id="Launch" component={Film} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="RocketTest" component={RocketTest} durationInFrames={120} fps={FPS} width={1920} height={1080} />
    <Composition id="CloudTest" component={CloudTest} durationInFrames={120} fps={FPS} width={1920} height={1080} />
    <Composition id="VaporTest" component={VaporTest} durationInFrames={60} fps={FPS} width={1920} height={1080} />
    <Composition id="StageTest" component={StageTest} durationInFrames={60} fps={FPS} width={1920} height={1080} />
    <Composition id="GalleryA" component={GalleryA} durationInFrames={600} fps={FPS} width={1920} height={1080} />
    <Composition id="GalleryB" component={GalleryB} durationInFrames={600} fps={FPS} width={1920} height={1080} />
    <Composition id="Finale" component={Finale} durationInFrames={FINALE_LEN} fps={FPS} width={1920} height={1080} />
  </>
);
