// Private render entry for GalleryB review stills (registers only GalleryB so work-in-progress
// files elsewhere in the project cannot break this bundle). Not used by the film.
import {Composition, registerRoot} from 'remotion';
import {FPS} from '../tokens';
import {GalleryB} from './GalleryB';

const RootB: React.FC = () => <Composition id="GalleryB" component={GalleryB} durationInFrames={600} fps={FPS} width={1920} height={1080} />;
registerRoot(RootB);
