// RILIN "ROOM": film-wide constants. World units are metres; time is seconds.
export const FPS = 24; // cinema cadence, 180° shutter
export const W = 1920;
export const H = 1080;
export const SHUTTER = 0.5; // fraction of a frame the shutter is open (180°)

// Super 35 gate cropped to 16:9: 24.89 mm wide → 14.0 mm tall
export const SENSOR_H_MM = 14.0;
export const vfovDeg = (focalMm: number) => (2 * Math.atan(SENSOR_H_MM / 2 / focalMm) * 180) / Math.PI;

// Palette (linear-light values are derived in shaders; these are display hexes from the Rilin site)
export const PAL = {
  navy: '#072939',
  ivory: '#EBE9DE',
  aqua: '#A4D8D2',
  teal: '#297373',
  bar: '#040506', // letterbox
};

// Colour temperatures as linear RGB multipliers
export const K = {
  sky: [0.78, 0.86, 1.0] as const, // overcast daylight through the hall, ~7500 K
  lamp: [1.0, 0.62, 0.32] as const, // tungsten desk lamp, ~2700 K
  aqua: [0.37, 0.69, 0.64] as const, // the light of the work
};

export const sec = (s: number) => Math.round(s * FPS);
