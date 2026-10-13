import {useMemo} from 'react';
import {random} from 'remotion';
import * as THREE from 'three';

// Soft cloud billows thrown up and out where the rocket breaches the cloud top.
const makeTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  // several overlapping soft lobes → an irregular puff
  for (let i = 0; i < 9; i++) {
    const x = 128 + (random(`px${i}`) - 0.5) * 90;
    const y = 128 + (random(`py${i}`) - 0.5) * 70;
    const r = 50 + random(`pr${i}`) * 50;
    const grd = g.createRadialGradient(x, y - r * 0.2, 0, x, y, r);
    grd.addColorStop(0, 'rgba(255,255,255,0.95)');
    grd.addColorStop(0.55, 'rgba(250,251,252,0.65)');
    grd.addColorStop(1, 'rgba(240,243,247,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

export const CloudPuffs: React.FC<{t: number; y?: number}> = ({t, y = -2}) => {
  // t: seconds since the breach
  const tex = useMemo(makeTexture, []);
  const puffs = useMemo(
    () =>
      new Array(22).fill(0).map((_, i) => ({
        a: (i / 34) * Math.PI * 2 + random(`a${i}`) * 0.3,
        speed: 20 + random(`s${i}`) * 22,
        lift: 1 + random(`l${i}`) * 5,
        size: 4 + random(`z${i}`) * 6,
        rot: random(`r${i}`) * Math.PI,
        column: i < 8, // a few ride up in the rocket's wake
      })),
    [],
  );
  if (t <= 0 || t > 3) return null;
  const decay = 1 - Math.exp(-t * 3.2); // fast out, then drift
  const fade = Math.max(0, 1 - t / 2.6);
  return (
    <group position={[0, y, 0]}>
      {puffs.map((p, i) => {
        const r = p.column ? 1.5 + decay * 2.5 : 4 + decay * p.speed;
        const h = p.column ? decay * (2 + p.lift) : decay * p.lift;
        return (
          <sprite key={i} position={[Math.cos(p.a) * r, h, Math.sin(p.a) * r]} scale={[p.size * (0.9 + decay * 0.9), p.size * (0.3 + decay * 0.25), 1]}>
            <spriteMaterial map={tex} transparent depthWrite={false} toneMapped={false} opacity={fade * (p.column ? 0.45 : 0.6)} rotation={p.rot} />
          </sprite>
        );
      })}
    </group>
  );
};
