import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import {useEffect} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Clouds} from './Clouds';
import {Rocket, orient} from './Rocket';
import {Studio} from './Studio';

const Cam: React.FC<{y: number}> = ({y}) => {
  const {camera} = useThree();
  camera.position.set(0, y, 160);
  camera.lookAt(0, y * 0.55, 0);
  camera.updateProjectionMatrix();
  return null;
};

export const CloudTest: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const ry = interpolate(f, [0, 120], [-30, 40]);
  return (
    <AbsoluteFill>
      <ThreeCanvas width={width} height={height} camera={{fov: 32, near: 0.5, far: 4000}}>
        <Cam y={22} />
        <Clouds time={f / 60} top={0} base={-70} />
        <Studio />
        <group position={[0, ry, 0]} quaternion={orient(new THREE.Vector3(0, 1, 0.12))}>
          <Rocket />
        </group>
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
