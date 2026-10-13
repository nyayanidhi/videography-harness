// One 2.5D world shared by DOM (product UI, contrail) and WebGL (rocket).
// World units are px on the z=0 plane; +y is down (CSS). The camera only translates
// (pan x/y, dolly toward the plane), so CSS perspective and the Three camera stay locked.
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill} from 'remotion';
import * as THREE from 'three';
import {Rocket} from '../r3d/Rocket';
import {Studio} from '../r3d/Studio';
import {COL} from './tokens';

export const D = 1500; // camera distance to the z=0 plane at dolly 0
export type Cam = {x: number; y: number; dolly: number};
export type RocketPose = {x: number; y: number; z: number; dir: [number, number, number]; bank: number; size: number; visible: boolean; build?: number};
export type Rect = {x: number; y: number; w: number; h: number};

// nose = travel direction; face = camera direction made perpendicular to the nose; then a bounded bank
const faceToCamera = (dir: THREE.Vector3, bank: number) => {
  const up = dir.clone().normalize();
  let face = new THREE.Vector3(0, 0, 1).sub(up.clone().multiplyScalar(up.z));
  if (face.lengthSq() < 1e-4) face = new THREE.Vector3(0, 1, 0).sub(up.clone().multiplyScalar(up.y));
  face.normalize();
  const right = new THREE.Vector3().crossVectors(up, face).normalize();
  const m = new THREE.Matrix4().makeBasis(right, up, face);
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  return new THREE.Quaternion().setFromAxisAngle(up, Math.max(-0.35, Math.min(0.35, bank))).multiply(q);
};

// invisible planes on the UI cards (z = 0) that only write depth: anything behind the cards is hidden by them
const Occluders: React.FC<{rects: Rect[]}> = ({rects}) => (
  <>
    {rects.map((r, i) => (
      <mesh key={i} position={[r.x + r.w / 2, -(r.y + r.h / 2), 0]} renderOrder={-2}>
        <planeGeometry args={[r.w, r.h]} />
        <meshBasicMaterial colorWrite={false} />
      </mesh>
    ))}
  </>
);

const SyncCamera: React.FC<{cam: Cam}> = ({cam}) => {
  const {camera} = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.fov = (2 * Math.atan(540 / D) * 180) / Math.PI;
  c.near = 1;
  c.far = 20000;
  c.position.set(cam.x, -cam.y, D - cam.dolly);
  c.lookAt(cam.x, -cam.y, -1e4);
  c.updateProjectionMatrix();
  return null;
};

// screen position of a world point (for overlays that must track world objects)
export const toScreen = (cam: Cam, x: number, y: number, z = 0) => {
  const k = D / (D - cam.dolly - z);
  return {x: 960 + (x - cam.x) * k, y: 540 + (y - cam.y) * k, k};
};

export const Stage: React.FC<{
  cam: Cam;
  rocket?: RocketPose;
  world?: React.ReactNode; // DOM in world space (behind the rocket)
  front?: React.ReactNode; // DOM in world space drawn above the rocket
  three?: React.ReactNode; // extra WebGL content (e.g. clouds)
  ground?: string;
  occluders?: Rect[];
  haze?: number; // 0–1 white cloud haze over the world, under the rocket
}> = ({cam, rocket, world, front, three, ground = COL.ground, occluders = [], haze = 0}) => {
  const worldStyle: React.CSSProperties = {
    position: 'absolute',
    left: 960,
    top: 540,
    width: 0,
    height: 0,
    transformStyle: 'preserve-3d',
    transform: `translate3d(${-cam.x}px, ${-cam.y}px, ${cam.dolly}px)`,
  };
  const persp: React.CSSProperties = {perspective: `${D}px`, perspectiveOrigin: '960px 540px'};
  // nose = local +Y in Three; world dir is given in CSS axes (y down) → flip y
  const q = rocket ? faceToCamera(new THREE.Vector3(rocket.dir[0], -rocket.dir[1], rocket.dir[2]), rocket.bank) : undefined;
  return (
    <AbsoluteFill style={{background: ground, overflow: 'hidden'}}>
      <AbsoluteFill style={persp}>
        <div style={worldStyle}>{world}</div>
      </AbsoluteFill>
      {haze > 0 && <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #F6F7F8 0%, #eef1f4 70%, #e3e8ee 100%)', opacity: haze}} />}
      <AbsoluteFill>
        <ThreeCanvas width={1920} height={1080} gl={{alpha: true, antialias: true}} style={{background: 'transparent'}}>
          <SyncCamera cam={cam} />
          <Occluders rects={occluders} />
          {three}
          <Studio />
          {rocket?.visible && (
            <group position={[rocket.x, -rocket.y, rocket.z]} quaternion={q} scale={rocket.size / 18}>
              <Rocket build={rocket.build ?? 1} />
            </group>
          )}
        </ThreeCanvas>
      </AbsoluteFill>
      {front && (
        <AbsoluteFill style={persp}>
          <div style={worldStyle}>{front}</div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// Place DOM content at a world position (top-left anchored unless centered)
export const At: React.FC<{x: number; y: number; z?: number; center?: boolean; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, z = 0, center, children, style}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transform: `translate3d(${x}px, ${y}px, ${z}px)${center ? ' translate(-50%, -50%)' : ''}`, ...style}}>{children}</div>
);
