// The Rilin mark as architecture: the back wall's windows are the mark's pieces, at
// 1.75 m per logo unit, standing on the floor, centred on the nave.
import {MARK_GHOST, MARK_SOLID} from '../../wordmark';

export const MARK_S = 1.75; // metres per logo unit
const CX = 10.9256; // centre pillar axis in logo units
const BASE = 20.8475; // logo baseline

export type Poly = [number, number][];

// parse the M/L/H/V/Z absolute paths used by the mark
export const parsePath = (d: string): Poly => {
  const pts: Poly = [];
  let x = 0;
  let y = 0;
  const re = /([MLHVZ])([^MLHVZ]*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    const nums = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
    switch (m[1]) {
      case 'M':
      case 'L':
        for (let i = 0; i < nums.length; i += 2) {
          x = nums[i];
          y = nums[i + 1];
          pts.push([x, y]);
        }
        break;
      case 'H':
        x = nums[0];
        pts.push([x, y]);
        break;
      case 'V':
        y = nums[0];
        pts.push([x, y]);
        break;
    }
  }
  // drop a closing duplicate
  const [fx, fy] = pts[0];
  const [lx, ly] = pts[pts.length - 1];
  if (Math.abs(fx - lx) < 1e-4 && Math.abs(fy - ly) < 1e-4) pts.pop();
  return pts;
};

const toWorld = (p: Poly): Poly => p.map(([x, y]) => [(x - CX) * MARK_S, (BASE - y) * MARK_S]);

export type MarkPiece = {id: string; poly: Poly; ghost: boolean; cx: number; top: number; minX: number; maxX: number; minY: number};
const piece = (d: string, ghost: boolean, i: number): MarkPiece => {
  const poly = toWorld(parsePath(d));
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  return {id: `${ghost ? 'g' : 's'}${i}`, poly, ghost, cx: xs.reduce((a, b) => a + b) / xs.length, top: Math.max(...ys), minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys)};
};

export const MARK_PIECES: MarkPiece[] = [...MARK_SOLID.map((d, i) => piece(d, false, i)), ...MARK_GHOST.map((d, i) => piece(d, true, i))];
// the centre pillar: open from the first frame (the hall's one window on the world)
export const CENTRE = MARK_PIECES[0];
