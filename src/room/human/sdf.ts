// Signed-distance primitives for sculpting people. Pure math, no allocation in the hot path.
// Distances in metres. A body is a list of primitives smooth-unioned in order.

export type Region = 'skin' | 'shirt' | 'trousers' | 'shoe' | 'hair';
export type Prim = {
  d: (x: number, y: number, z: number) => number;
  bone: string;
  region: Region;
  k: number; // smooth-union radius into the shape so far
  sub?: boolean; // carve instead of add
  detail?: (x: number, y: number, z: number) => number; // surface displacement (folds, strands)
};

export const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

export const ellipsoid = (cx: number, cy: number, cz: number, rx: number, ry: number, rz: number) => (x: number, y: number, z: number) => {
  const px = (x - cx) / rx;
  const py = (y - cy) / ry;
  const pz = (z - cz) / rz;
  const k0 = Math.sqrt(px * px + py * py + pz * pz);
  const qx = (x - cx) / (rx * rx);
  const qy = (y - cy) / (ry * ry);
  const qz = (z - cz) / (rz * rz);
  const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
  return k1 > 1e-9 ? (k0 * (k0 - 1)) / k1 : -Math.min(rx, ry, rz);
};

// Inigo Quilez's exact round cone between spheres (a, r1) and (b, r2)
export const roundCone = (ax: number, ay: number, az: number, bx: number, by: number, bz: number, r1: number, r2: number) => {
  const bax = bx - ax;
  const bay = by - ay;
  const baz = bz - az;
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = r1 - r2;
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  return (x: number, y: number, z: number) => {
    const pax = x - ax;
    const pay = y - ay;
    const paz = z - az;
    const yy = pax * bax + pay * bay + paz * baz;
    const zz = yy - l2;
    const x2x = pax * l2 - bax * yy;
    const x2y = pay * l2 - bay * yy;
    const x2z = paz * l2 - baz * yy;
    const x2 = x2x * x2x + x2y * x2y + x2z * x2z;
    const y2 = yy * yy * l2;
    const z2 = zz * zz * l2;
    const k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
  };
};

// torus around the y axis, tilted about x by `tilt` (front dips when tilt > 0)
export const torusY = (cx: number, cy: number, cz: number, R: number, r: number, tilt: number, sx = 1, sz = 1) => {
  const c = Math.cos(tilt);
  const s = Math.sin(tilt);
  return (x: number, y: number, z: number) => {
    const px = (x - cx) / sx;
    let py = y - cy;
    let pz = (z - cz) / sz;
    const ty = py * c - pz * s;
    const tz = py * s + pz * c;
    py = ty;
    pz = tz;
    const q = Math.hypot(px, pz) - R;
    return Math.hypot(q, py) - r;
  };
};

// value noise for folds and strands (deterministic)
const hash = (i: number, j: number, k: number) => {
  let h = (i * 374761393 + j * 668265263 + k * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
export const vnoise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = x - xi;
  const yf = y - yi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const w = zf * zf * (3 - 2 * zf);
  const l = (a: number, b: number, t: number) => a + (b - a) * t;
  return (
    l(
      l(l(hash(xi, yi, zi), hash(xi + 1, yi, zi), u), l(hash(xi, yi + 1, zi), hash(xi + 1, yi + 1, zi), u), v),
      l(l(hash(xi, yi, zi + 1), hash(xi + 1, yi, zi + 1), u), l(hash(xi, yi + 1, zi + 1), hash(xi + 1, yi + 1, zi + 1), u), v),
      w,
    ) *
      2 -
    1
  );
};
export const fbm = (x: number, y: number, z: number) => vnoise(x, y, z) * 0.6 + vnoise(x * 2.1, y * 2.1, z * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3, z * 4.3) * 0.1;
