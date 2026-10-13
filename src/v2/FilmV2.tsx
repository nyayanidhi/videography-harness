// Rilin launch film v2: "Everything in between" (docs/script-v2.md). 60 s @ 60 fps, cut to a 120 BPM edit.
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Contrail} from '../r3d/Contrail';
import {ease, tw} from '../theme';
import {CopyLine} from './Copy';
import {Finale} from './Finale';
import {CamKey, camAt} from './flight';
import {Frame, makeCamera, makeJourney} from './journey';
import {At, Stage} from './Stage';
import {COL} from './tokens';
import {AskRilin} from './components/AskRilin';
import {ContractSheet} from './components/ContractSheet';
import {CounselCard} from './components/CounselCard';
import {ExposureStack} from './components/ExposureStack';
import {LIFECYCLE_AXIS, LifecycleAxis} from './components/LifecycleAxis';
import {ObligationRegister, OR_ROWS} from './components/ObligationRegister';
import {RedlineCard, REDLINE_CARD} from './components/RedlineCard';
import {StackWall} from './components/StackWall';
import {TransactionBreakdown} from './components/TransactionBreakdown';
import {ASK_RILIN} from './components/AskRilin';

export const V2_LEN = 3600;
const FINALE_AT = 2880;

// ---------- world layout (px; axis line at y = 0; flight level around y = -3000) ----------
const AX = {x: 0, y: -LIFECYCLE_AXIS.axisY};
const SHEET = {x: -250, y: -760};
const TXN = {x: 1085, y: -3420};
const REG = {x: 3900, y: -3287};
const EXP = {x: 6320, y: -3280};
const RED = {x: 9120, y: -3390};
const ASK = {x: 11760, y: -3560};
const CNS = {x: 12580, y: -3330};
const AX2 = {x: 12600 - LIFECYCLE_AXIS.milestones.notice, y: -2500 - LIFECYCLE_AXIS.axisY};
const WALL = {x: 14000, y: -4200};

const UNDER_Y = REG.y + OR_ROWS[2].underline;
const UNDER_X: [number, number] = [REG.x + OR_ROWS[2].left, REG.x + OR_ROWS[2].right];
const ARROW_Y = RED.y + REDLINE_CARD.anchors.arrowTail.y;
const ARROW_X: [number, number] = [RED.x + REDLINE_CARD.anchors.arrowTail.x, RED.x + REDLINE_CARD.anchors.arrowTip.x];
const ASK_T = 2410;
const NOTICE_LIT = ASK_T + ASK_RILIN.t.date;

// ---------- intro camera (0–960): keyed; from launch on the camera is tied to the rocket ----------
const INTRO_CAM: CamKey[] = [
  {f: 0, x: 0, y: -410, dolly: 60},
  {f: 240, x: 0, y: -410, dolly: 140},
  {f: 300, x: 0, y: -300, dolly: -1600},
  {f: 420, x: 8400, y: -200, dolly: -1600},
  {f: 480, x: 8400, y: -200, dolly: -1600},
  {f: 545, x: 1250, y: -330, dolly: -1500},
  {f: 720, x: 1250, y: -330, dolly: -1400},
  {f: 800, x: 0, y: -620, dolly: 320},
  {f: 960, x: 0, y: -620, dolly: 420},
];

// ---------- the journey: one continuous flight, launch → clouds ----------
// The rocket never leaves frame: between cards it flies; on a card it cruises the card's margin
// (never over its text); its trail hands off into the register underline and the redline arrow.
const PAD: [number, number] = [0, -835];
const FINAL_Z = 3440; // at 2880 the rocket is centred, nose up, ~176 px: the finale opens on the same framing
const JOURNEY = makeJourney([
  {f: 960, p: [PAD[0], PAD[1], 0]},
  {f: 990, p: [15, -1250, 60]},
  {f: 1025, p: [260, -2000, 100]},
  {f: 1062, p: [700, -2720, 60]},
  {f: 1095, p: [TXN.x - 140, -3000, 0]}, // docks at the transaction's input port
  {f: 1135, p: [1180, -2560, 40]}, // dives under the card
  {f: 1250, p: [1950, -2525, 40]},
  {f: 1370, p: [2900, -2540, 40]},
  {f: 1430, p: [UNDER_X[0], UNDER_Y + 36, 0]}, // runs under the SLA row: the underline draws with it
  {f: 1475, p: [UNDER_X[1], UNDER_Y + 36, 0]},
  {f: 1560, p: [5470, -2860, 40]}, // up the register's right margin
  {f: 1700, p: [5520, -3200, 40]},
  {f: 1790, p: [5480, -3330, 60]},
  {f: 1840, p: [6600, -2600, 80]}, // under the exposure card
  {f: 1885, p: [EXP.x + 1460, EXP.y + 280, 120]}, // round the Acme row's end
  {f: 1990, p: [EXP.x + 1440, EXP.y + 120, 80]},
  {f: 2085, p: [8100, -3170, 60]},
  {f: 2150, p: [9300, -2520, 40]}, // under the redline card
  {f: 2192, p: [ARROW_X[0], ARROW_Y + 40, 0]}, // under "Implement changes →" as the arrow draws
  {f: 2212, p: [ARROW_X[1] + 20, ARROW_Y + 40, 0]},
  {f: 2280, p: [10480, -2560, 40]},
  {f: 2380, p: [10780, -2540, 40]},
  {f: 2480, p: [11950, -2430, 40]},
  {f: NOTICE_LIT, p: [12600, -2450, 0]}, // passes under the NOTICE WINDOW tick as it lights
  {f: 2640, p: [13300, -2480, 40]},
  {f: 2700, p: [14700, -2680, 60]},
  {f: 2745, p: [15650, -2850, 80]},
  {f: 2790, p: [16000, -2860, 120]}, // just under the hero transaction
  {f: 2840, p: [16000, -2960, 1400]},
  {f: FINALE_AT, p: [16000, -2980, FINAL_Z]}, // rises toward camera as the stack falls away
]);

// card framing windows: the camera eases from chasing the rocket to framing the card, then back
const CAM_FRAMES: Frame[] = [
  {a: 1085, b: 1370, from: {x: 2000, y: -3000, dolly: -350}, to: {x: 2000, y: -3000, dolly: -300}},
  {a: 1450, b: 1770, from: {x: 4600, y: -3000, dolly: -200}, to: {x: 4600, y: -3000, dolly: -150}},
  {a: 1870, b: 2010, from: {x: 7000, y: -3000, dolly: -60}, to: {x: 7000, y: -3000, dolly: 0}},
  {a: 2160, b: 2360, from: {x: 9800, y: -3000, dolly: -200}, to: {x: 9800, y: -3000, dolly: -160}},
  {a: 2450, b: 2650, from: {x: 12530, y: -3020, dolly: -540}, to: {x: 12530, y: -3020, dolly: -500}},
  {a: 2745, b: 2795, from: {x: 16000, y: -3000, dolly: 600}, to: {x: 16000, y: -3000, dolly: 680}},
];
const springCam = makeCamera({
  start: 960,
  end: FINALE_AT,
  startCam: INTRO_CAM[INTRO_CAM.length - 1],
  rocket: JOURNEY.pos,
  frames: CAM_FRAMES,
  chaseDolly: -480,
  omega: 9,
  ramp: 30,
});
// the last stretch is keyed exactly (no spring lag) so the frame at 2880 matches the finale's first frame
const PULL_FROM = 2800;
const cameraAt = (f: number) => {
  if (f < 960) return camAt(INTRO_CAM, f);
  const c = springCam(f);
  if (f < PULL_FROM) return c;
  const t = ease.move((f - PULL_FROM) / (FINALE_AT - PULL_FROM));
  const end = {x: 16000, y: -2980, dolly: -3050};
  const a = springCam(PULL_FROM);
  return {x: a.x + (end.x - a.x) * t, y: a.y + (end.y - a.y) * t, dolly: a.dolly + (end.dolly - a.dolly) * t};
};

const show = (f: number, a: number, b: number) => f >= a && f < b;

const Moments: React.FC<{f: number; rocketX: number}> = ({f, rocketX}) => {
  const underline = tw(rocketX, UNDER_X, [0, 1], (t) => t) * (f >= 1430 ? 1 : 0);
  const arrow = f < 2192 ? 0 : tw(rocketX, ARROW_X, [0, 1], (t) => t);
  return (
    <>
      {show(f, 0, 1150) && (
        <At x={AX.x} y={AX.y}>
          <LifecycleAxis f={f} drawn={tw(f, [240, 420], [0, 1], ease.move)} marks={tw(f, [300, 420], [0, 1])} />
          <div style={{position: 'absolute', left: -10, top: LIFECYCLE_AXIS.axisY - 120, width: 440, height: 112, background: COL.ground}} />
        </At>
      )}
      {show(f, 0, 1150) && (
        <At x={SHEET.x} y={SHEET.y}>
          <ContractSheet f={f} />
        </At>
      )}
      {show(f, 1040, 1520) && (
        <At x={TXN.x} y={TXN.y}>
          <TransactionBreakdown f={f - 1080} />
        </At>
      )}
      {show(f, 1370, 1950) && (
        <At x={REG.x} y={REG.y}>
          <ObligationRegister f={f - 1380} />
          <div style={{position: 'absolute', left: OR_ROWS[2].left, top: OR_ROWS[2].underline - 1, height: 3, width: (OR_ROWS[2].right - OR_ROWS[2].left) * underline, background: COL.teal}} />
        </At>
      )}
      {show(f, 1790, 2230) && (
        <At x={EXP.x} y={EXP.y}>
          <ExposureStack f={f - 1800} />
        </At>
      )}
      {show(f, 2040, 2520) && (
        <At x={RED.x} y={RED.y}>
          <RedlineCard f={f - 2050} arrow={arrow} />
        </At>
      )}
      {show(f, 2380, 2780) && (
        <>
          <At x={ASK.x} y={ASK.y}>
            <AskRilin f={f - ASK_T} />
          </At>
          <At x={CNS.x} y={CNS.y}>
            <CounselCard f={f - 2575} />
          </At>
          <At x={AX2.x} y={AX2.y}>
            <div style={{clipPath: `inset(-200px ${LIFECYCLE_AXIS.w - LIFECYCLE_AXIS.milestones.notice - 1100}px -200px ${LIFECYCLE_AXIS.milestones.notice - 600}px)`}}>
              <LifecycleAxis f={f} drawn={1} marks={1} lit={{notice: NOTICE_LIT}} />
            </div>
          </At>
        </>
      )}
      {show(f, 2580, FINALE_AT) && (
        <At x={WALL.x} y={WALL.y}>
          <StackWall f={f < 2790 ? Math.min(Math.max(f - 2580, 0), 5) : f - 2790 + 5} />
        </At>
      )}
    </>
  );
};

const trailPoints = (f: number) => {
  const pts: THREE.Vector3[] = [];
  for (let t = Math.max(962, f - 50); t <= f; t += 2) {
    const [x, y, z] = rocketPos(t);
    pts.push(new THREE.Vector3(x, -y, z));
  }
  return pts;
};

// UI card rects (world px) that are on screen at f: anything behind them in depth is hidden by them
const occludersAt = (f: number) => {
  const r: {x: number; y: number; w: number; h: number}[] = [];
  if (show(f, 0, 1150)) r.push({x: SHEET.x, y: SHEET.y, w: 500, h: 700});
  if (show(f, 1040, 1520)) r.push({x: TXN.x, y: TXN.y, w: 1830, h: 840});
  if (show(f, 1370, 1950)) r.push({x: REG.x, y: REG.y, w: 1400, h: 574});
  if (show(f, 1790, 2230)) r.push({x: EXP.x, y: EXP.y, w: 1360, h: 560});
  if (show(f, 2040, 2520)) r.push({x: RED.x, y: RED.y, w: 1360, h: 780});
  if (show(f, 2380, 2780)) r.push({x: ASK.x, y: ASK.y, w: 760, h: 840}, {x: CNS.x, y: CNS.y, w: 720, h: 440});
  if (show(f, 2580, 2790)) r.push({x: WALL.x + 1830, y: WALL.y + 1102, w: 340, h: 196}); // hero card only until the wall populates
  if (show(f, 2790, FINALE_AT)) r.push({x: WALL.x, y: WALL.y, w: 4000, h: 2400});
  return r;
};

const SIZE = 130;
// final pull-out: the rocket's depth tracks the camera so its on-screen size eases smoothly to the
// finale's opening size (~176 px) instead of ballooning while the camera is still close
const rocketPos = (f: number): [number, number, number] => {
  const p = JOURNEY.pos(f);
  if (f < 2790) return p;
  const c = cameraAt(f);
  const track = Math.max(150, 1500 - c.dolly - (SIZE * 1500) / 176);
  const w = tw(f, [2786, 2800], [0, 1], ease.move);
  return [p[0], p[1], p[2] + (track - p[2]) * w];
};
const World: React.FC = () => {
  const f = useCurrentFrame();
  const cam = cameraAt(f);
  // before launch: on the pad, with a 12-frame squat into the drop
  const squat = 12 * tw(f, [948, 960], [0, 1], ease.move);
  const p: [number, number, number] = f < 960 ? [PAD[0], PAD[1] + squat, 0] : rocketPos(f);
  let dir: [number, number, number] = f < 962 ? [0, -1, 0] : JOURNEY.tangent(f);
  // last stretch: it rises toward camera nose-up, so the silhouette stays the mark (not a nose-on dot)
  const up = tw(f, [2770, 2830], [0, 1], ease.move);
  dir = [dir[0] * (1 - up), dir[1] * (1 - up) - up, dir[2] * (1 - up)];
  const bank = f < 962 ? 0 : JOURNEY.bank(f) * (1 - up);
  const build = tw(f, [770, 900], [0, 1], (t) => t);
  // trail ends exactly at the tail, behind the body
  let pts = f >= 962 ? trailPoints(f) : [];
  if (pts.length > 4) {
    const n = Math.hypot(...dir) || 1;
    const tail = new THREE.Vector3(p[0] - (dir[0] / n) * 0.43 * SIZE, -(p[1] - (dir[1] / n) * 0.43 * SIZE), p[2] - (dir[2] / n) * 0.43 * SIZE);
    pts = [...pts.slice(0, -3), tail];
  }
  // the world whites out into cloud as the rocket rises: the finale opens inside that haze
  const haze = tw(f, [2836, 2878], [0, 1], ease.standard);
  return (
    <Stage
      cam={cam}
      world={<Moments f={f} rocketX={p[0]} />}
      rocket={{x: p[0], y: p[1], z: p[2], dir, bank, size: SIZE, visible: f >= 770, build}}
      three={pts.length > 2 ? <Contrail points={pts} radius={2.6} /> : null}
      occluders={occludersAt(f)}
      haze={haze}
    />
  );
};

const Copy: React.FC = () => (
  <>
    <CopyLine text="Lawyers show up at the start and at the end," at={250} out={462} y={64} size={60} />
    <CopyLine text="Rilin runs everything in between." at={548} out={705} y={64} size={60} />
    <CopyLine text="A business doesn't run on a legal document." at={1100} out={1293} align="left" x={120} y={52} size={54} />
    <CopyLine text="It runs on actions." at={1312} out={1407} align="left" x={120} y={52} size={54} />
    <CopyLine text="Owned, assigned, tracked." at={1440} out={1600} y={110} size={60} />
    <CopyLine text="Every action maps back to the clause it satisfies." at={1618} out={1816} y={110} size={56} />
    <CopyLine text="Exposure mapped across every contract, continuously." at={1840} out={2070} y={120} size={56} />
    <CopyLine text="Every new agreement drafted, reviewed and analysed in one place." at={2120} out={2370} y={56} size={50} />
    <CopyLine text="Ask Rilin anything," at={2440} out={2680} align="left" x={120} y={22} size={54} />
    <CopyLine text="know what impacts your business." at={2452} out={2680} align="left" x={120} y={82} size={54} />
    <CopyLine text="Tenant-isolated." at={2702} out={2800} y={104} size={60} />
    <CopyLine text="No model training." at={2716} out={2800} y={176} size={60} />
    <CopyLine text="Your data stays yours." at={2730} out={2800} y={248} size={60} />
  </>
);

// ---------- sound: music edit + licensed SFX, each placed by its measured sync point ----------
type Cue = {file: string; t: number; sync?: number; vol: number; trim?: number};
const SFX: Cue[] = [
  {file: 'ui-tick_kenney-interface-tick', t: 164 / 60, vol: 0.5}, // stamp lands
  {file: 'rocket-build_engine-ignition-rumble', t: 12, trim: 385, vol: 0.32}, // only over the 12–16 s build, peaking on the drop
  {file: 'rocket-launch_ignition-flames', t: 16, sync: 0.72, vol: 0.25},
  {file: 'impact_intro-presentation', t: 16, sync: 1.4, vol: 0.3},
  {file: 'rocket-launch_fast-rocket-whoosh', t: 16.3, sync: 0.89, vol: 0.3},
  ...[1095, 1430, 1885, 2192, NOTICE_LIT].map((fr) => ({file: 'whoosh-passby_futuristic-sweep', t: fr / 60, sync: 0.77, vol: 0.22})),
  ...[1470, 1500, 1530].map((fr) => ({file: 'ui-tick_kenney-interface-tick', t: fr / 60, vol: 0.35})), // owners assigned
  {file: 'ui-glass_kenney-interface-glass', t: 1620 / 60, vol: 0.5}, // DONE
  {file: 'ui-option_interface-select', t: 1650 / 60, vol: 0.3}, // DUE
  ...[1957, 1969].map((fr) => ({file: 'ui-select_kenney-interface-select', t: fr / 60, vol: 0.35})), // CAUTION → CRITICAL
  {file: 'ui-click_cool-interface-tone', t: 2250 / 60, vol: 0.55}, // Implement changes, on the beat
  {file: 'hit-bass_short-bass-hit', t: 2250 / 60, vol: 0.25},
  {file: 'ui-glass_kenney-interface-glass', t: NOTICE_LIT / 60, vol: 0.45}, // notice window date
  {file: 'whoosh-reverse_cinematic-fast', t: 2790 / 60, sync: 1.07, vol: 0.3}, // pull-out
  {file: 'whoosh_long-air-swoosh', t: 2884 / 60, sync: 0.8, vol: 0.16}, // into the clouds (kept low: the breakdown thins)
  {file: 'impact-logo_movie-logo-intro', t: 52, trim: 239, vol: 0.35}, // just its hit, on the burst
  {file: 'impact-sub_space-impact', t: 52, sync: 0.04, vol: 0.3},
  {file: 'ui-glass_kenney-interface-glass', t: 3420 / 60, vol: 0.4}, // logo settles
  {file: 'hit-bass_short-bass-hit', t: 3420 / 60, vol: 0.18},
];

const Sound: React.FC = () => (
  <>
    <Audio src={staticFile('audio/music.wav')} volume={0.85} startFrom={2} />
    {SFX.map((c, i) => (
      <Sequence key={i} from={Math.max(0, Math.round((c.t - (c.sync ?? 0)) * 60))}>
        <Audio src={staticFile(`audio/${c.file}.wav`)} volume={c.vol} startFrom={c.trim ?? 0} />
      </Sequence>
    ))}
  </>
);

export const FilmV2: React.FC = () => (
  <AbsoluteFill style={{background: COL.ground}}>
    <Sequence durationInFrames={FINALE_AT}>
      <World />
      <Copy />
    </Sequence>
    <Sequence from={FINALE_AT}>
      <Finale />
    </Sequence>
    <Sound />
  </AbsoluteFill>
);

// exported for the offline motion check
export const cameraAtForCheck = cameraAt;
export const JOURNEY_FOR_CHECK = {pos: (f: number) => rocketPos(f)};
