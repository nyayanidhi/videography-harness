// Beats 12–14 (48–60 s): climb inside the clouds → burst + vapor cone on the 52 s hit → lockup above the cloud sea.
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Clouds} from '../r3d/Clouds';
import {Rocket, orient} from '../r3d/Rocket';
import {Studio} from '../r3d/Studio';
import {VaporCone} from '../r3d/VaporCone';
import {CloudPuffs} from '../r3d/CloudPuffs';
import {ease, tw} from '../theme';
import {MARK_GHOST, MARK_SOLID, WORDMARK} from '../wordmark';
import {COL, FONT} from './tokens';
import {CopyLine} from './Copy';

export const FINALE_LEN = 720;
const CLOUD_TOP = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 1.5)]; // hide what's still inside the cloud deck
export const BURST = 240; // local frame of the 52 s hit

// Final lockup. Mark top = wordmark glyph top; mark bottom = tagline baseline; wordmark and tagline share a start line.
const LOCK = (() => {
  const s = 13; // px per wordmark unit
  const H = 15.41 * s + 78; // wordmark glyph height + gap down to the tagline baseline
  const x = 407, y = 361;
  const textLeft = x + H + Math.round(H * 0.35);
  return {
    s, H, x, y, textLeft,
    wmLeft: textLeft - 0.85 * s, // glyph starts 0.85 units into the viewBox
    wmTop: y - 3.2 * s, // glyph top sits 3.2 units down the viewBox
    tagSize: 36,
    tagTop: y + H - 29, // tagline baseline on the mark's bottom edge
    from: {x: 444, y: 317, h: 316}, // logo box (ghosts incl.) around the 3D mark when it squares up (measured)
    swap: [BURST + 250, BURST + 262] as [number, number],
    settle: [BURST + 262, BURST + 300] as [number, number],
  };
})();

// one smooth climb: cubic Hermite through (0, −60, at rest) → (BURST, −4, v) → (BURST+190, 30, at rest).
// The rocket carries speed straight through the cloud top: no change of pace at the breach.
const V_BREACH = 0.42; // units per frame at the cloud top
const herm = (f: number, f0: number, f1: number, y0: number, y1: number, m0: number, m1: number) => {
  const h = f1 - f0, t = Math.max(0, Math.min(1, (f - f0) / h)), t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m0 + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m1;
};
const rocketY = (f: number) => (f < BURST ? herm(f, 0, BURST, -60, -4, 0, V_BREACH) : herm(f, BURST, BURST + 190, -4, 30, V_BREACH, 0));

// one continuous camera: hand-over framing → chase from below inside the haze → rises out through the
// cloud top just ahead of the rocket (so the breach is seen from outside, same shot) → wide lockup framing
const camPose = (f: number) => {
  const ry = rocketY(f);
  const start = {pos: new THREE.Vector3(0, ry, 180), look: new THREE.Vector3(0, ry, 0)};
  const climb = {pos: new THREE.Vector3(-14 + Math.sin(f / 23) * 0.3, ry - 22 + Math.sin(f / 17) * 0.3, 40), look: new THREE.Vector3(0, ry + 4, 0)};
  const breach = {pos: new THREE.Vector3(-44, 3, 84), look: new THREE.Vector3(0, Math.max(ry + 6, 3), 0)};
  const wide = {pos: new THREE.Vector3(19, 16, 92), look: new THREE.Vector3(19, 27, 0)};
  const k1 = tw(f, [0, 130], [0, 1], ease.move);
  const k2 = tw(f, [150, BURST + 6], [0, 1], ease.move);
  const k3 = tw(f, [BURST + 30, BURST + 210], [0, 1], ease.move);
  const pos = start.pos.clone().lerp(climb.pos, k1).lerp(breach.pos, k2).lerp(wide.pos, k3);
  const look = start.look.clone().lerp(climb.look, k1).lerp(breach.look, k2).lerp(wide.look, k3);
  return {pos, look};
};
const CLOUD_TOP_Y = 0;
// first frame the camera is clear of the cloud deck (deterministic from the path)
const EMERGE = (() => {
  for (let f = 0; f < FINALE_LEN; f++) if (camPose(f).pos.y > CLOUD_TOP_Y + 1) return f;
  return BURST;
})();

const CameraRig: React.FC<{f: number}> = ({f}) => {
  const {camera, scene, gl} = useThree();
  gl.localClippingEnabled = true;
  const {pos, look} = camPose(f);
  // a short, decaying shake on the boom
  const s = f >= BURST && f < BURST + 14 ? (1 - (f - BURST) / 14) * 0.6 : 0;
  camera.position.set(pos.x + Math.sin(f * 2.3) * s, pos.y + Math.cos(f * 3.1) * s, pos.z);
  camera.lookAt(look);
  (camera as THREE.PerspectiveCamera).fov = 34;
  camera.updateProjectionMatrix();
  // haze on the rocket while the camera is inside the clouds (set synchronously: no first-frame pop per render chunk)
  const dist = camera.position.distanceTo(new THREE.Vector3(0, rocketY(f), 0));
  scene.fog = f < EMERGE ? new THREE.Fog('#f6f7f8', dist * 0.6, dist * 3.4) : null;
  return null;
};

// streaming cloud wisps for the inside-the-cloud climb (moves down = we move up)
const Wisps: React.FC<{f: number}> = ({f}) => (
  <AbsoluteFill style={{opacity: 0.9}}>
    <svg width="1920" height="1080">
      <filter id="wisp" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.0026 0.006" numOctaves="4" seed="7" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.89  0 0 0 0 0.93  0 0 0 -2.2 1.35" />
      </filter>
      <g transform={`translate(0 ${((f * 18) % 2160) - 2160})`}>
        <rect width="1920" height="4320" filter="url(#wisp)" />
      </g>
    </svg>
  </AbsoluteFill>
);

export const Finale: React.FC = () => {
  const f = useCurrentFrame();
  const ry = rocketY(f);
  const vapor = tw(f, [BURST, BURST + 44], [0, 1], (x) => x);
  // final settle: the rocket turns square to camera to become the mark
  const square = tw(f, [BURST + 170, BURST + 240], [0, 1], ease.move);
  const settleIn = tw(f, [10, 110], [0, 1], ease.move);
  const lean = (1 - square) * 0.12 * settleIn;
  const wm = tw(f, [BURST + 268, BURST + 298], [0, 1], ease.enter);
  const tag = tw(f, [BURST + 286, BURST + 316], [0, 1], ease.enter);
  const swap = tw(f, LOCK.swap, [0, 1], ease.standard);
  const st = tw(f, LOCK.settle, [0, 1], ease.move);
  const markBox = {
    x: LOCK.from.x + (LOCK.x - LOCK.from.x) * st,
    y: LOCK.from.y + (LOCK.y - LOCK.from.y) * st,
    h: LOCK.from.h + (LOCK.H - LOCK.from.h) * st,
  };
  return (
    <AbsoluteFill style={{background: f < EMERGE ? 'radial-gradient(ellipse at 50% 30%, #F6F7F8 0%, #eef1f4 70%, #e3e8ee 100%)' : '#eef1f4'}}>
      {f < EMERGE && <Wisps f={f} />}
      <ThreeCanvas width={1920} height={1080} camera={{fov: 34, near: 0.5, far: 5000}}>
        <CameraRig f={f} />
        {f >= EMERGE && <Clouds time={f / 60 + 3} top={CLOUD_TOP_Y} base={-70} />}
        <CloudPuffs t={(f - BURST) / 60} y={-1} />
        <Studio />
        <group position={[0, ry, 0]} quaternion={orient(new THREE.Vector3(lean, 1, lean * 0.5), (1 - square) * 0.25 * settleIn)}>
          {swap < 1 && <Rocket clip={f >= EMERGE ? CLOUD_TOP : undefined} opacity={1 - swap} />}
          <VaporCone life={vapor} />
        </group>
      </ThreeCanvas>
      {f >= EMERGE && f < EMERGE + 16 && (
        <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #F6F7F8 0%, #eef1f4 70%, #e3e8ee 100%)', opacity: 1 - tw(f, [EMERGE, EMERGE + 16], [0, 1], ease.standard)}} />
      )}

      {/* copy inside the clouds (breakdown) */}
      <CopyLine text="The contracts are already signed." at={8} out={222} y={150} />
      <CopyLine text="Do you know what they say?" at={50} out={222} y={228} />

      {/* lockup: the 3D rocket hands off to the real flat logo, then settles into the aligned lockup */}
      {f >= LOCK.swap[0] && (
        <svg
          width={markBox.h * (18.835 / 19.826)}
          height={markBox.h}
          viewBox="1.508 1.022 18.835 19.826"
          style={{position: 'absolute', left: markBox.x, top: markBox.y, overflow: 'visible', opacity: swap}}
        >
          {MARK_GHOST.map((d) => (
            <path key={d} d={d} fill={COL.navy} fillOpacity={0.09} fillRule="evenodd" />
          ))}
          {MARK_SOLID.map((d) => (
            <path key={d} d={d} fill={COL.navy} fillRule="evenodd" />
          ))}
        </svg>
      )}
      <div style={{position: 'absolute', left: LOCK.wmLeft, top: LOCK.wmTop, overflow: 'hidden', paddingBottom: 40}}>
        <svg width={34.5 * LOCK.s} height={21.8447 * LOCK.s} viewBox="26 0 34.5 21.8447" style={{display: 'block', transform: `translateY(${(1 - wm) * 105}%)`}}>
          {WORDMARK.map((d) => (
            <path key={d} d={d} fill={COL.navy} fillRule="evenodd" />
          ))}
        </svg>
      </div>
      <div style={{position: "absolute", left: LOCK.textLeft - 2, top: LOCK.tagTop, overflow: 'hidden', paddingBottom: 12}}>
        <div style={{fontFamily: FONT.text, fontSize: LOCK.tagSize, lineHeight: 1, color: COL.navy, letterSpacing: '-0.01em', whiteSpace: 'pre', transform: `translateY(${(1 - tag) * 130}%)`}}>
          Contractual liability control for enterprises.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// exported for the offline motion check
export const camPoseForCheck = camPose;
export const rocketYForCheck = rocketY;
export const EMERGE_FOR_CHECK = EMERGE;
