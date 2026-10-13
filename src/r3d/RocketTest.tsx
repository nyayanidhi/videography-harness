import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {Rocket, orient} from './Rocket';
import {Studio} from './Studio';

export const RocketTest: React.FC = () => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const dir = new THREE.Vector3(0.35, 0.55, -1).normalize();
  const q = orient(dir, Math.sin(f / 30) * 0.4);
  const trail = Array.from({length: 120}, (_, i) => dir.clone().multiplyScalar(-(i * 0.35 + 9)));
  return (
    <AbsoluteFill style={{background: '#FAFAF7'}}>
      <ThreeCanvas width={width} height={height} camera={{position: [0, 6, 75], fov: 30}}>
        <Studio />
        <group quaternion={q}>
          <Rocket />
        </group>
        {trail.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.12, 10, 10]} />
            <meshBasicMaterial color="#007574" />
          </mesh>
        ))}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
