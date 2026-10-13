import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Clouds} from './Clouds';
import {Rocket, orient} from './Rocket';
import {Studio} from './Studio';
import {VaporCone} from './VaporCone';

const Cam: React.FC = () => {
  const {camera} = useThree();
  camera.position.set(-62, 14, 34);
  camera.lookAt(0, 12, 0);
  camera.updateProjectionMatrix();
  return null;
};

export const VaporTest: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const y = interpolate(f, [0, 60], [-6, 30]);
  const life = interpolate(f, [8, 44], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} camera={{fov: 34, near: 0.5, far: 4000}}>
        <Cam />
        <Clouds time={f / 60} top={0} base={-70} />
        <Studio />
        <group position={[0, y, 0]} quaternion={orient(new THREE.Vector3(0.08, 1, 0.05), 0.2)}>
          <Rocket />
          <VaporCone life={life} />
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
