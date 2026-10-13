"""RILIN "ROOM": the score. Composed to picture from out/room/timeline.json.

usage: python3.11 -I sound/room/score.py out/room/timeline.json public/room/score.wav [--stems DIR]

Key: D minor, resolving to D major when the room opens. 80 BPM from the hit (34.5 s).
Motif: A – D – F#, read from the Rilin mark (tall pillars → A, base blocks → D,
outer angles → F#). The wall opens on those notes; the sonic logo is the same three.
Act I is out of time: every notification on screen is a tick of the clock.
At the hit, the clock snaps onto the grid: chaos becomes rhythm.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import *  # noqa

T = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
STEMS = sys.argv[sys.argv.index('--stems') + 1] if '--stems' in sys.argv else None
L = T['length'] + 0.5
N = secs(L)
G0 = T['grid0']
B = T['beat']
BAR = 4 * B


def hz(name):
    names = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}
    n, o = name[:-1], int(name[-1])
    midi = 12 * (o + 1) + names[n]
    return 440.0 * 2 ** ((midi - 69) / 12)


def db(x):
    return 10 ** (x / 20)


bus = {k: np.zeros((N, 2)) for k in ['ticks', 'glass', 'drone', 'voice', 'shepard', 'pulse', 'strings', 'pad', 'organ', 'keys', 'hits', 'stone', 'fx']}
# reverb sends per bus (hall), applied at the end
SEND = {'ticks': 0.28, 'glass': 0.55, 'drone': 0.2, 'voice': 0.6, 'shepard': 0.35, 'pulse': 0.3, 'strings': 0.38, 'pad': 0.45, 'organ': 0.5, 'keys': 0.5, 'hits': 0.3, 'stone': 0.35, 'fx': 0.4}
GAIN = {'ticks': 1.0, 'glass': 1.0, 'drone': 1.0, 'voice': 1.0, 'shepard': 1.0, 'pulse': 1.0, 'strings': 1.0, 'pad': 1.0, 'organ': 1.0, 'keys': 1.0, 'hits': 1.0, 'stone': 1.0, 'fx': 1.0}
rng = np.random.default_rng(31)

# ═════ ACT I · the work around the work (out of time) ═══════════════════════════════════
# black: one tick
place(bus['ticks'], clock_tick(1.2, 0.92, 0.5), 0.45, db(-8))

# the hall breathes: sub drone + room tone
d = sub_drone(hz('D1'), 33.0)
t = np.arange(len(d)) / SR
d *= smooth_curve(t, [(0, 0), (0.6, 0), (5, 0.55), (22.5, 0.75), (32.9, 1.0), (33.0, 0)])
place(bus['drone'], d, 0.0, db(-12))
a = air(33.0, level=1.0)
a *= smooth_curve(np.arange(len(a)) / SR, [(0, 0), (1.0, 0), (4, 1), (33, 1)])
place(bus['drone'], np.stack([a, np.roll(a, 977)], 1), 0.0, db(-30))

# every notification is a tick of the clock; the close ones ring like glass
PENTA = ['D6', 'F6', 'G6', 'A6', 'C7', 'D7', 'A5', 'F5']
for p in T['pings']:
    if p['t'] >= 33.0:
        continue
    near = 1.0 / (1.0 + p['dist'] / 22.0)
    shot = p['shot']
    lvl = {'A·nave': -15, 'B·face': -12, 'C·up': -19}.get(shot, -18)
    g = db(lvl) * (0.55 + 0.9 * near) * (1.0 if p['onScreen'] else 0.45)
    tick = clock_tick(0.8 + rng.uniform(0, 0.5), rng.uniform(0.85, 1.15), 0.3)
    place(bus['ticks'], mono_to_stereo(tick, p['pan'] * 0.85), p['t'], g)
    ring = (shot == 'B·face' and p['onScreen']) or rng.uniform() < 0.32
    if ring:
        f = hz(PENTA[rng.integers(len(PENTA))])
        gl = glass(f, 1.6 + rng.uniform(0, 0.8), index=1.6, ratio=3.01 + rng.uniform(0, 0.6))
        place(bus['glass'], mono_to_stereo(gl, p['pan'] * 0.9), p['t'], db(-27 if shot != 'B·face' else -22) * (0.6 + near))

# the human presence: a low hum under the first titles, a strained line under the chase
v1 = voice(hz('A3'), 7.6, [(0, 'm'), (2.5, 'u'), (5.0, 'o'), (7.6, 'o')], vib=0.003, breath=0.25)
v1 *= smooth_curve(np.arange(len(v1)) / SR, [(0, 0), (2.0, 1), (5.8, 0.85), (7.6, 0)])
place(bus['voice'], mono_to_stereo(v1, -0.15), 6.0, db(-22))
v2 = voice(hz('F4'), 10.3, [(0, 'u'), (3, 'o'), (6, 'a'), (10.3, 'a')], vib=0.006, breath=0.3)
v2 *= smooth_curve(np.arange(len(v2)) / SR, [(0, 0), (2.5, 0.7), (8, 1.0), (10.29, 1.0), (10.3, 0)])
place(bus['voice'], mono_to_stereo(v2, 0.12), 22.7, db(-24))

# endless rising tension under the chase
sh = shepard(21.0, rate=0.055, base=40.0, octaves=8)
sh *= smooth_curve(np.arange(len(sh)) / SR, [(0, 0), (6, 0.25), (15, 0.6), (20.9, 1.0), (21.0, 0)])
place(bus['shepard'], np.stack([sh, np.roll(sh, 311)], 1), 12.0, db(-17))

# a heartbeat that quickens as the work closes in (shot C)
tb = 22.6
while tb < 32.9:
    k = (tb - 22.6) / 10.3
    place(bus['pulse'], drum(56, 0.9, mallet=0.4) * 0.8, tb, db(-17 + 6 * k))
    tb += 1.05 - 0.78 * k

# ═════ ACT II · order (80 BPM from the hit) ═════════════════════════════════════════════
place(bus['hits'], drum(41, 6.0, 1.2), G0, db(-8))
place(bus['hits'], boom(6.0), G0, db(-11))

CHORDS = {
    'Dm': ['D3', 'A3', 'D4', 'F4'], 'Bb': ['Bb2', 'F3', 'Bb3', 'D4'], 'Gm': ['G2', 'D3', 'G3', 'Bb3'], 'F': ['F2', 'C3', 'F3', 'A3'],
    'C': ['C3', 'G3', 'C4', 'E4'], 'A': ['A2', 'E3', 'A3', 'C#4'], 'D': ['D3', 'A3', 'D4', 'F#4'], 'G': ['G2', 'D3', 'G3', 'B3'],
    'D/F#': ['F#2', 'A3', 'D4', 'F#4'], 'Bm': ['B2', 'F#3', 'B3', 'D4'],
}
# bar → chord (bar 0 = the hit at 34.5 s)
PROG = ['Dm', 'Dm', 'Bb', 'Gm', 'Dm', 'Bb', 'Gm', 'F', 'F', 'C', 'Dm', 'Bb',  # Act II (34.5–70.5)
        'D', 'D', 'G', 'D/F#', 'Bm', 'G', 'D', 'D']  # Act III (70.5–)
bar_t = lambda i: G0 + i * BAR

# ostinato: eighth-note pulse on chord tones; dynamics follow the story
def ost_level(t):
    return float(smooth_curve(np.array([t]), [(34.5, -27), (38, -24), (46.0, -19), (46.5, -29), (54.8, -26), (55.5, -18), (58.5, -19), (64.5, -15), (70.0, -12), (70.5, -14), (85.5, -20), (91.4, -26)])[0])

PAT = [0, 1, 2, 1, 3, 1, 2, 1]
for i, ch in enumerate(PROG[:19]):
    tones = CHORDS[ch]
    for k in range(8):
        tt = bar_t(i) + k * (B / 2)
        if tt >= 91.4:
            break
        f = hz(tones[PAT[k]].replace('2', '3') if PAT[k] == 0 else tones[PAT[k]])
        nt = string_note(f, B / 2 * 0.62, attack=0.012, release=0.16, bright=2100, ens=3, vib=0.0)
        acc = 1.0 if k % 2 == 0 else 0.72
        place(bus['strings'], nt, tt, db(ost_level(tt)) * acc)

# the clock, now in time: ticks snap onto the grid and fade as order settles (shot D)
for k in range(int((46.5 - G0) / (B / 4))):
    tt = G0 + k * B / 4
    accent = 1.0 if k % 4 == 0 else (0.55 if k % 2 == 0 else 0.32)
    lv = db(-17) * accent * float(smooth_curve(np.array([tt]), [(34.5, 1.0), (40.5, 0.8), (46.4, 0.0)])[0])
    if lv > 1e-4:
        place(bus['ticks'], mono_to_stereo(clock_tick(0.9, 1.0 + 0.04 * (k % 4 == 0), 0.25), 0.25 * np.sin(k)), tt, lv)

# sustained pads from the first claim on
def pad(ch, t0, dur, lvl, bright=1600, attack=1.6):
    for nm in CHORDS[ch]:
        place(bus['pad'], string_note(hz(nm), dur, attack=attack, release=2.2, bright=bright, ens=4), t0, db(lvl))

for i, ch in enumerate(PROG[2:12], start=2):
    t0 = bar_t(i)
    if 46.5 <= t0 < 55.5:
        pad(ch, t0, BAR, -31, bright=1100)
    else:
        pad(ch, t0, BAR, -26 if t0 < 58 else -23)

# the monoliths slide: stone on stone, low, panned to their side
for m in T['moves']:
    n = secs(m['dur'] + 1.5)
    tt = np.arange(n) / SR
    rum = lowpass(brown(n), 140) * 0.8 + 0.35 * bandpass(RNG.standard_normal(n), 320, 1.2) * 0.25
    env = smooth_curve(tt, [(0, 0), (0.9, 1), (m['dur'] * 0.7, 0.8), (m['dur'] + 1.4, 0)])
    near = 1.0 / (1.0 + m['dist'] / 30)
    place(bus['stone'], mono_to_stereo(rum * env, m['side'] * 0.75), m['t'], db(-20) * (0.5 + near))

# each lane of light: a glass note, climbing the scale — order makes a melody
SCALE = ['D5', 'E5', 'F5', 'G5', 'A5', 'Bb5', 'C6', 'D6', 'E6', 'F6']
lanes = sorted(T['lanes'], key=lambda l: l['t'])
order = sorted(set(l['t'] for l in lanes))
for l in lanes:
    idx = order.index(l['t'])
    f = hz(SCALE[min(idx, len(SCALE) - 1)])
    place(bus['glass'], mono_to_stereo(glass(f, 2.6, index=1.2, ratio=2.0), l['side'] * 0.6), l['t'], db(-31))

# ── the desk (shot E): intimate. keys, the sheet, the decision
KEYS_E = [(46.5, 'D4'), (47.25, 'F4'), (48.0, 'A4'), (49.5, 'Bb3'), (50.25, 'D4'), (51.0, 'F4'), (52.5, 'G3'), (53.25, 'Bb3'), (54.0, 'D4')]
for tt, nm in KEYS_E:
    place(bus['keys'], mono_to_stereo(felt_key(hz(nm), 4.0, 0.55), -0.1), tt, db(-20))
P = T['panel']
# the strike: a pen across paper
n = secs(0.9)
sc = bandpass(RNG.standard_normal(n), 2600, 1.4) * np.exp(-np.arange(n) / SR / 0.5) * np.clip(np.arange(n) / SR / 0.05, 0, 1)
place(bus['fx'], mono_to_stereo(sc, 0.3), P['strike'], db(-30))
# the insertion writes in: a soft shimmer that climbs
for k in range(9):
    tt = P['insert'][0] + k * (P['insert'][1] - P['insert'][0]) / 9
    place(bus['glass'], mono_to_stereo(glass(hz(['A5', 'C6', 'D6', 'F6', 'A6', 'C7', 'D7', 'F7', 'A7'][k]), 0.9, index=0.6, ratio=2.0), 0.2), tt, db(-34))
place(bus['glass'], mono_to_stereo(glass(hz('A5'), 2.4, index=0.8, ratio=2.0), 0.0), P['matched'], db(-24))
# the reach: held breath, a single sustained note rising in the strings
place(bus['pad'], string_note(hz('C5'), 1.5, attack=1.2, release=0.15, bright=2600, ens=4), 54.0, db(-25))
# the press: a click, the floor drops, the music lifts to F major
n = secs(0.06)
click = highpass(RNG.standard_normal(n), 1500) * np.exp(-np.arange(n) / SR / 0.004)
place(bus['fx'], mono_to_stereo(click, 0.25), T['press'] - 0.008, db(-12))
place(bus['hits'], boom(5.0), T['press'], db(-4))
place(bus['hits'], drum(46, 5.0, 0.9), T['press'], db(-7))
place(bus['organ'], organ([hz('F2'), hz('C3'), hz('F3'), hz('A3')], 6.0, attack=0.4, release=3.0), T['press'], db(-14))
place(bus['glass'], mono_to_stereo(glass(hz('C6'), 3.0, index=0.9, ratio=2.0), 0.15), P['approved'], db(-23))
place(bus['glass'], mono_to_stereo(glass(hz('F6'), 3.0, index=0.9, ratio=2.0), 0.25), P['approved'] + 0.375, db(-25))

# ── the hand-off (shot F): a streak of glass that runs to the next person
h = T['handoff']
n = secs(h['dur'] + 0.6)
tt = np.arange(n) / SR
f = 400 * 2 ** (np.clip(tt / h['dur'], 0, 1) * 2.0)
streak = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + lowpass(bandpass(RNG.standard_normal(n), 2200, 2.5), 4000) * 0.035
streak *= smooth_curve(tt, [(0, 0), (0.3, 1), (h['dur'], 0.9), (h['dur'] + 0.6, 0)])
place(bus['fx'], np.stack([streak * np.linspace(0.9, 0.3, n), streak * np.linspace(0.4, 1.0, n)], 1), h['t'], db(-28))
place(bus['glass'], mono_to_stereo(glass(hz('A5'), 3.5, index=1.0, ratio=2.0), 0.4), h['t'] + h['dur'], db(-20))
place(bus['glass'], mono_to_stereo(glass(hz('E6'), 3.0, index=0.8, ratio=2.0), 0.4), T['financeStand'], db(-26))
# the organ enters as the frame opens
place(bus['organ'], organ([hz('D2'), hz('A2')], 6.0 + 0.5, attack=4.5, release=0.6, wind=0.02), 64.5, db(-20))

# ═════ ACT III · room ═══════════════════════════════════════════════════════════════════
# D major: the arrival
place(bus['organ'], organ([hz('D2'), hz('A2'), hz('D3'), hz('F#3'), hz('A3')], 15.5, attack=1.2, release=4.0), 70.5, db(-4))
place(bus['hits'], drum(39, 6.0, 0.8), 70.5, db(-8))
for i in range(12, 18):
    pad(PROG[i], bar_t(i), BAR, -15, bright=2400, attack=1.0)
# the wall opens on the motif: A – D – F#
MOTIF = ['A4', 'D4', 'F#4']
for r, nm in zip(T['reveals'], MOTIF):
    place(bus['keys'], mono_to_stereo(felt_key(hz(nm), 5.0, 0.8), 0.0), r['t'], db(-13))
    place(bus['keys'], mono_to_stereo(felt_key(hz(nm) / 2, 5.0, 0.7), 0.0), r['t'], db(-19))
    place(bus['hits'], drum(52, 3.0, 0.6), r['t'], db(-15))
    place(bus['stone'], mono_to_stereo(lowpass(brown(secs(2.6)), 160) * np.exp(-np.arange(secs(2.6)) / SR / 1.2), 0.0), r['t'], db(-17))
# the warm sun: the full swell, the voice soars
place(bus['organ'], organ([hz('D3'), hz('F#3'), hz('A3'), hz('D4'), hz('A4')], 9.0, attack=3.5, release=4.0, drawbars=(1.0, 0.6, 0.85, 0.5, 0.4, 0.2)), 76.4, db(-3))
v3 = voice(hz('A4'), 12.0, [(0, 'u'), (2.5, 'o'), (5.0, 'a'), (12.0, 'a')], vib=0.005, breath=0.15)
v3 *= smooth_curve(np.arange(len(v3)) / SR, [(0, 0), (3.0, 0.8), (6.5, 1.0), (10.5, 0.7), (12.0, 0)])
place(bus['voice'], mono_to_stereo(v3, 0.0), 75.6, db(-17))
for nm in ['D4', 'F#4', 'A4', 'D5']:
    place(bus['pad'], string_note(hz(nm), 7.5, attack=3.0, release=4.0, bright=3200, ens=5), 77.0, db(-15))
# standing (shot H): it thins; then true silence; then one high note under the last line
for i in range(17, 19):
    pad(PROG[i], bar_t(i), BAR, -27, bright=1500)
place(bus['voice'], mono_to_stereo(voice(hz('A4'), 5.2, [(0, 'u'), (5.2, 'o')], vib=0.004, breath=0.2) * smooth_curve(np.arange(secs(5.2)) / SR, [(0, 0), (1.2, 1), (4.0, 0.8), (5.2, 0)]), 0.0), 92.05, db(-25))
for tt, nm in [(92.4, 'A4'), (93.15, 'D5'), (93.9, 'F#5')]:
    place(bus['keys'], mono_to_stereo(felt_key(hz(nm), 4.0, 0.45), 0.0), tt, db(-24))
# the window, held: a low warm pad under the dissolve
place(bus['organ'], organ([hz('D2'), hz('A2'), hz('D3')], 4.4, attack=1.5, release=1.2, wind=0.015), 97.6, db(-22))

# ── the sonic logo: A – D – F#, landing on D major at the settle
E = T['end']
lock0, lock1 = E['lockup']
logo = [(lock0, 'A4'), (lock0 + (E['settle'] - lock0) / 2, 'D5'), (E['settle'], 'F#5')]
for tt, nm in logo:
    place(bus['keys'], mono_to_stereo(felt_key(hz(nm), 6.0, 0.75), 0.0), tt, db(-15))
    place(bus['glass'], mono_to_stereo(glass(hz(nm) * 2, 3.5, index=0.7, ratio=2.0), 0.0), tt, db(-29))
place(bus['organ'], organ([hz('D2'), hz('A2'), hz('D3'), hz('F#3'), hz('A3'), hz('D4')], 4.6, attack=0.08, release=3.6), E['settle'], db(-20))
for nm in ['D3', 'A3', 'D4', 'F#4']:
    place(bus['pad'], string_note(hz(nm), 1.6, attack=0.05, release=3.2, bright=2600, ens=5), E['settle'], db(-26))
place(bus['hits'], boom(4.0), E['settle'], db(-21))

# ═════ mix ══════════════════════════════════════════════════════════════════════════════
print('mixing...')
dry = np.zeros((N, 2))
send = np.zeros((N, 2))
for k, x in bus.items():
    dry += x * GAIN[k]
    send += x * GAIN[k] * SEND[k]
ir = make_ir(rt60=5.2, predelay=0.035, size=1.4, damp_hz=5200)
wet = np.stack([signal.fftconvolve(send[:, 0], ir[:, 0])[:N], signal.fftconvolve(send[:, 1], ir[:, 1])[:N]], 1)
mix = dry + wet * 0.85

# true silences: the cut to silence after the chase, and the breath before the last line.
gate = np.ones(N)
tt = np.arange(N) / SR
for a0, a1 in T['silences']:
    m = (tt >= a0) & (tt < a1)
    gate[m] = 0.0
    # 4 ms ramps at the edges (no clicks), the hit itself starts after a1
    r = secs(0.004)
    i0, i1 = secs(a0), secs(a1)
    gate[max(i0 - r, 0):i0] = np.linspace(1, 0, min(r, i0))
    gate[i1:i1 + r] = np.linspace(0, 1, r)
# but the reverb of the material *after* each silence must not leak back: the gate is applied
# to the mix, so tails from before the silence are cut (a hard cut, like a picture cut)
mix *= gate[:, None]
# fade the tail into silence
mix *= smooth_curve(tt, [(0, 1), (T['length'] - 2.5, 1), (T['length'], 0)])[:, None]

if STEMS:
    os.makedirs(STEMS, exist_ok=True)
    for k, x in bus.items():
        write_wav(os.path.join(STEMS, f'{k}.wav'), np.clip(x * 0.5, -1, 1))

print('mastering...')
m = master(mix, target_lufs=-16.0, ceiling=-1.2)
# re-apply gate after mastering so limiter release can't fill the silences
m *= gate[:, None]
os.makedirs(os.path.dirname(OUT), exist_ok=True)
write_wav(OUT, m)
print(f'wrote {OUT}: {len(m) / SR:.2f}s, {lufs(m):.1f} LUFS, true peak {true_peak(m):.2f} dBTP')
