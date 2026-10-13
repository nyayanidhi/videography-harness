import {useThree} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

// Soft studio reflections (no HDR download needed) + key/fill lights
export const Studio: React.FC = () => {
  const {gl, scene} = useThree();
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return tex;
  }, [gl]);
  scene.environment = env;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.0;
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[8, 16, 12]} intensity={2.6} />
      <directionalLight position={[-10, -4, 6]} intensity={0.8} />
      <directionalLight position={[0, 6, -14]} intensity={1.4} />
    </>
  );
};
