import {useMemo} from 'react';
import * as THREE from 'three';

// A tapered teal ribbon through the rocket's past positions (Three coords). Thick near the tail, thinning with age.
export const Contrail: React.FC<{points: THREE.Vector3[]; radius: number; color?: string}> = ({points, radius, color = '#007574'}) => {
  const geo = useMemo(() => {
    if (points.length < 2) return null;
    const curve = new THREE.CatmullRomCurve3(points);
    const g = new THREE.TubeGeometry(curve, Math.min(600, points.length * 2), radius, 10, false);
    // taper: scale ring radius by position along the tube (0 = oldest)
    const pos = g.attributes.position as THREE.BufferAttribute;
    const rings = Math.min(600, points.length * 2) + 1;
    const per = 11;
    for (let r = 0; r < rings; r++) {
      const t = r / (rings - 1);
      const c = curve.getPoint(t);
      const k = 0.25 + 0.75 * Math.pow(t, 0.6);
      for (let j = 0; j < per; j++) {
        const i = r * per + j;
        if (i >= pos.count) break;
        pos.setXYZ(i, c.x + (pos.getX(i) - c.x) * k, c.y + (pos.getY(i) - c.y) * k, c.z + (pos.getZ(i) - c.z) * k);
      }
    }
    pos.needsUpdate = true;
    return g;
  }, [points, radius]);
  if (!geo) return null;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};
