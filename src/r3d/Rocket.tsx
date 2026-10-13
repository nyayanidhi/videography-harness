import {useMemo} from 'react';
import * as THREE from 'three';
import {POLYS} from '../world';

// The Rilin mark, extruded into a solid. Local frame: nose = +Y, face = +Z, centred on the mark.
export const useRocketGeometry = () =>
  useMemo(() => {
    const geos = POLYS.map((poly) => {
      const shape = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(x - 9, 9.4 - y)));
      const g = new THREE.ExtrudeGeometry(shape, {depth: 1.4, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.16, bevelSegments: 6, curveSegments: 1});
      g.translate(0, 0, -0.7);
      return g;
    });
    return geos;
  }, []);

const BASE = -7.75; // mark bottom in local units
// build: 0 → 1, pillars rise from the base like rilin.ai's intro (rilinBarRise)
const ORDER = [0, 5, 6, 4, 3, 1, 2];
export const Rocket: React.FC<{color?: string; opacity?: number; build?: number; clip?: THREE.Plane[]}> = ({color = '#0d3346', opacity = 1, build = 1, clip}) => {
  const geos = useRocketGeometry();
  return (
    <group>
      {geos.map((g, i) => {
        const k = Math.min(1, Math.max(0, build * 1.7 - ORDER.indexOf(i) * 0.1));
        const sy = 1 - Math.pow(1 - k, 3);
        if (sy <= 0.001) return null;
        return (
          <group key={i} position={[0, BASE, 0]} scale={[1, sy, 1]}>
            <mesh geometry={g} position={[0, -BASE, 0]}>
              <meshPhysicalMaterial color={color} roughness={0.38} metalness={0.05} clearcoat={0.7} clearcoatRoughness={0.25} envMapIntensity={1.1} transparent={opacity < 1} opacity={opacity} clippingPlanes={clip} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Orient local +Y (nose) along a direction, with a bank (roll) about that axis.
export const orient = (dir: THREE.Vector3, bank = 0) => {
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  const roll = new THREE.Quaternion().setFromAxisAngle(dir.clone().normalize(), bank);
  return roll.multiply(q);
};
