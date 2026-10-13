"""Custom 60 s launch score for the Rilin film (Track B).

usage:  python sound/compose_score.py [out.wav]
        (needs numpy + scipy; default output sound/score-custom.wav)

120 BPM, 4/4, beat 1 at t = 0  ->  1 beat = 0.5 s = 30 frames @ 60 fps, 1 bar = 2 s.
Key D major; loop vi-IV-I-V (Bm9 - Gmaj9 - Dadd9 - Aadd9), rootless voicings
with automatic minimal-motion voice leading; breakdown Gmaj9 - Asus4 -> Dmaj9.

  0-8 s    bars 1-4    intro: felt piano broken chords + dark pad
  8-16 s   bars 5-8    build: resonant 16th arp opening, riser, kick from 12 s,
                       snare roll 14-15.75 s, pre-drop gap 15.75-16 s
  16 s                 LAUNCH hit, groove A (kick/hat/clap/bass/pad pump/stabs)
  24 s                 bell motif enters
  32-48 s  bars 17-24  groove B: arp, piano counter-line, open hats, wider pad
  48-52 s  bars 25-26  breakdown: drums out, filter closes, riser
  52 s                 FINAL HIT on Dmaj9, ring-out, silent by 59.8 s
"""
import sys
import wave
import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

SR = 48000
DUR = 60.0
N = int(DUR * SR)
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
rng = np.random.default_rng(20261012)


def T(bar, beat=0.0):
    return bar * BAR + beat * BEAT


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def bus():
    return np.zeros((2, N))


def pan(mono, p):
    a = (np.clip(p, -1, 1) + 1) * np.pi / 4
    return np.vstack([mono * np.cos(a), mono * np.sin(a)]) * np.sqrt(2)


def place(b, t0, sig):
    if sig.ndim == 1:
        sig = np.vstack([sig, sig])
    s0 = int(round(t0 * SR))
    if s0 >= N:
        return
    off = max(0, -s0)
    s0 = max(0, s0)
    e = min(N, s0 + sig.shape[1] - off)
    b[:, s0:e] += sig[:, off:off + e - s0]


def curve(points, log=False):
    """piecewise-linear (or log-linear) automation over the whole timeline"""
    t = np.arange(N) / SR
    xs = np.array([p[0] for p in points])
    ys = np.array([p[1] for p in points], dtype=float)
    if log:
        return np.exp(np.interp(t, xs, np.log(ys)))
    return np.interp(t, xs, ys)


# ---------------------------------------------------------------- DSP blocks
def rbj(kind, fc, q):
    fc = min(max(fc, 20.0), SR * 0.45)
    w = 2 * np.pi * fc / SR
    cw, sw = np.cos(w), np.sin(w)
    al = sw / (2 * q)
    if kind == 'lp':
        b = [(1 - cw) / 2, 1 - cw, (1 - cw) / 2]
    elif kind == 'hp':
        b = [(1 + cw) / 2, -(1 + cw), (1 + cw) / 2]
    else:  # band-pass, 0 dB peak
        b = [al, 0.0, -al]
    a = [1 + al, -2 * cw, 1 - al]
    return np.array(b) / a[0], np.array(a) / a[0]


def swept(x, fc, q=0.707, kind='lp', block=64):
    """biquad with cutoff updated every `block` samples, state carried across blocks"""
    n = len(x)
    fc = np.broadcast_to(np.asarray(fc, dtype=float), (n,)) if np.ndim(fc) == 0 else fc
    y = np.empty(n)
    zi = np.zeros(2)
    for s in range(0, n, block):
        e = min(n, s + block)
        b, a = rbj(kind, fc[(s + e) // 2], q)
        y[s:e], zi = signal.lfilter(b, a, x[s:e], zi=zi)
    return y


def sos(kind, fc, order=2):
    return signal.butter(order, fc, btype=kind, fs=SR, output='sos')


def adsr(n, a, d, s, r, gate):
    """per-voice ADSR: linear attack, exponential decay/release (time constants in s)"""
    t = np.arange(n) / SR
    env = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / d))
    g_level = s + (1 - s) * np.exp(-max(gate - a, 0) / d) if gate > a else gate / max(a, 1e-4)
    rel = t >= gate
    env[rel] = g_level * np.exp(-(t[rel] - gate) / r)
    return env


def blep_saw(freq, phase0=0.0):
    """PolyBLEP band-limited sawtooth; freq is a per-sample array (Hz)"""
    dt = freq / SR
    ph = (phase0 + np.cumsum(dt) - dt) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    t = ph[m] / dt[m]
    y[m] -= t + t - t * t - 1
    m = ph > 1 - dt
    t = (ph[m] - 1) / dt[m]
    y[m] -= t * t + t + t + 1
    return y


def drift(n, depth=0.0012):
    t = np.arange(n) / SR
    return 1 + depth * np.sin(2 * np.pi * rng.uniform(0.15, 0.4) * t + rng.uniform(0, 6.28))


# ---------------------------------------------------------------- harmony
PC = {'C': 0, 'C#': 1, 'D': 2, 'E': 4, 'F#': 6, 'G': 7, 'A': 9, 'B': 11}
CHORDS = {  # rootless upper-structure pitch classes, root
    'Bm9': ([2, 6, 9, 1], 11),
    'Gmaj9': ([11, 2, 6, 9], 7),
    'Dadd9': ([2, 4, 6, 9], 2),
    'Aadd9': ([9, 11, 1, 4], 9),
    'Asus4': ([2, 4, 9, 11], 9),
    'Dmaj9': ([6, 9, 1, 4], 2),
}
LOOP = ['Bm9', 'Gmaj9', 'Dadd9', 'Aadd9']
BAR_CHORDS = [LOOP[b % 4] for b in range(24)] + ['Gmaj9', 'Asus4'] + ['Dmaj9'] * 4


def voice_lead(prev, pcs, lo=58, hi=77):
    """choose the voicing of `pcs` (one note per pc) with least total motion from prev"""
    import itertools
    opts = [[m for m in range(lo, hi + 1) if m % 12 == pc] for pc in pcs]
    best, bc = None, 1e9
    for combo in itertools.product(*opts):
        v = sorted(combo)
        if v[-1] - v[0] > 14 or min(np.diff(v)) < 1:
            continue
        c = sum(abs(a - b) for a, b in zip(v, prev)) + 0.15 * abs(np.mean(v) - 67)
        if c < bc:
            best, bc = v, c
    return best


VOICINGS = []
prev = [62, 66, 69, 73]
for name in BAR_CHORDS:
    prev = voice_lead(prev, CHORDS[name][0])
    VOICINGS.append(prev)


def bass_note(root_pc):
    m = 24 + root_pc
    while m < 31:
        m += 12
    return m


# ---------------------------------------------------------------- instruments
def piano(m, vel, dur, ring=1.6):
    """additive felt piano: inharmonic partials, per-partial two-stage decay,
    velocity-dependent brightness, detuned unison strings, felt hammer thump"""
    f0 = mtof(m)
    n = int((dur + ring) * SR)
    t = np.arange(n) / SR
    K = int(min(14, 7000 / f0))
    k = np.arange(1, K + 1)
    B = 0.00035
    fk = k * f0 * np.sqrt(1 + B * k * k)
    amp = k ** -1.5 * np.exp(-(k - 1) * f0 / (900 + 2600 * vel))
    tau0 = np.clip(2.6 * (220 / f0) ** 0.6, 0.7, 6.0)
    tau = tau0 / (1 + 0.45 * (k - 1))
    y = np.zeros(n)
    for i in range(K):
        env = 0.6 * np.exp(-t / (tau[i] * 0.22)) + 0.4 * np.exp(-t / tau[i])
        osc = np.sin(2 * np.pi * fk[i] * t)
        if i < 3:
            osc = 0.62 * osc + 0.38 * np.sin(2 * np.pi * fk[i] * 1.00045 * t + 0.7)
        y += amp[i] * env * osc
    y /= amp.sum()
    y *= 1 - np.exp(-t / 0.0035)  # felt: soft attack
    thump = signal.sosfilt(sos('lowpass', 500), rng.standard_normal(n)) * np.exp(-t / 0.012)
    y += thump * 0.25 * vel
    off = t > dur
    y[off] *= np.exp(-(t[off] - dur) / 0.35)  # soft damper
    return y * vel


def bell(m, vel, dur=1.2):
    """two-operator FM bell/e-piano tine with decaying index"""
    f = mtof(m)
    n = int((dur + 1.5) * SR)
    t = np.arange(n) / SR
    idx = 1.6 * vel * np.exp(-t / 0.14) + 0.22
    y = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * 2 * f * t))
    y += 0.12 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t / 0.08)
    env = (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.9)
    off = t > dur
    env[off] *= np.exp(-(t[off] - dur) / 0.3)
    return y * env * vel


def pluck(m, vel, cutoff, dur=0.16):
    """2 detuned PolyBLEP saws -> resonant LP with its own decaying filter envelope"""
    f = mtof(m)
    n = int((dur + 0.25) * SR)
    t = np.arange(n) / SR
    x = blep_saw(np.full(n, f * 2 ** (-6 / 1200)), rng.random()) + \
        blep_saw(np.full(n, f * 2 ** (6 / 1200)), rng.random())
    fc = np.minimum(cutoff * (1 + 3.0 * np.exp(-t / 0.05)), 7000)
    y = swept(x * 0.5, fc, q=1.6, kind='lp', block=64)
    return y * adsr(n, 0.002, 0.12, 0.25, 0.06, dur) * vel


def pad_note(m, gate, rel=1.4, a=0.7, spread=0.75, cents=9):
    """3 detuned PolyBLEP saws with slow drift, spread across the stereo field"""
    n = int((gate + rel * 4) * SR)
    f = mtof(m)
    out = np.zeros((2, n))
    for d, p in zip((-cents, 0, cents), (-spread, 0, spread)):
        x = blep_saw(f * 2 ** (d / 1200) * drift(n), rng.random())
        out += pan(x, p)
    return out * adsr(n, a, 1.5, 0.75, rel, gate) / 3


def kick(vel=1.0):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * (46 * t + (128 - 46) * 0.032 * (1 - np.exp(-t / 0.032)))
    body = np.sin(ph) * np.exp(-t / 0.16) * (1 - np.exp(-t / 0.0012))
    click = signal.sosfilt(sos('bandpass', [1200, 4500]), rng.standard_normal(n)) * np.exp(-t / 0.0025) * 0.35
    return np.tanh(1.6 * (body + click)) / np.tanh(1.6) * vel


def clap(vel=1.0, bright=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    nz = rng.standard_normal(n)
    env = np.zeros(n)
    for k, dt in enumerate((0.0, 0.009, 0.018)):
        tt = t - dt
        env += np.where(tt >= 0, np.exp(-np.maximum(tt, 0) / 0.004), 0) * (0.6 if k < 2 else 1)
    tail = np.where(t >= 0.018, np.exp(-np.maximum(t - 0.018, 0) / 0.075), 0)
    x = nz * (env * 0.7 + tail)
    x = signal.sosfilt(sos('bandpass', [700 * bright, 2600 * bright]), x)
    body = np.sin(2 * np.pi * 185 * t) * np.exp(-t / 0.05) * 0.35
    return (x * 1.8 + body) * vel


def hat(vel=1.0, open_=False):
    n = int((0.45 if open_ else 0.12) * SR)
    t = np.arange(n) / SR
    x = signal.sosfilt(sos('highpass', 6500, 4), rng.standard_normal(n))
    x = signal.sosfilt(sos('lowpass', 13000), x)
    return x * np.exp(-t / (0.16 if open_ else 0.022)) * (1 - np.exp(-t / 0.0006)) * vel


def sub_bass(m, gate, vel=1.0):
    f = mtof(m)
    n = int((gate + 0.3) * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * f * t
    x = np.sin(ph) + 0.18 * np.sin(2 * ph) + 0.06 * np.sin(3 * ph)
    saw = signal.sosfilt(sos('lowpass', 380), blep_saw(np.full(n, f), 0.0)) * 0.35
    return np.tanh(1.3 * (x + saw)) * adsr(n, 0.006, 0.4, 0.85, 0.05, gate) * vel


def riser(t0, t1, f0, f1, gain):
    n = int((t1 - t0) * SR)
    u = np.linspace(0, 1, n)
    fc = f0 * (f1 / f0) ** u
    out = np.vstack([swept(rng.standard_normal(n), fc, 1.4, 'bp', 128),
                     swept(rng.standard_normal(n), fc * 1.07, 1.4, 'bp', 128)])
    env = u ** 2.4 * np.minimum(1, (1 - u) * n / (0.015 * SR))
    return out * env * gain


def impact(size=1.0):
    n = int((1.2 + 3.0 * size) * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * (34 * t + (78 - 34) * 0.08 * (1 - np.exp(-t / 0.08)))
    boom = np.sin(ph) * np.exp(-t / (0.5 + 0.9 * size)) * (1 - np.exp(-t / 0.002))
    thud = signal.sosfilt(sos('lowpass', 900), rng.standard_normal(n)) * np.exp(-t / 0.06) * 0.6
    crash = np.vstack([signal.sosfilt(sos('bandpass', [3000, 9000]), rng.standard_normal(n)),
                       signal.sosfilt(sos('bandpass', [3000, 9000]), rng.standard_normal(n))])
    crash *= np.exp(-t / (0.8 + 1.4 * size)) * (1 - np.exp(-t / 0.004)) * 0.13
    mono = np.tanh(1.4 * (boom + thud))
    return np.vstack([mono, mono]) + crash


def pingpong(st, delay=0.375, fb=0.38, taps=5):
    mono = st.mean(axis=0)
    out = np.zeros_like(st)
    D = int(delay * SR)
    for i in range(1, taps + 1):
        if i * D >= N:
            break
        ch = 1 if i % 2 else 0
        out[ch, i * D:] += mono[:N - i * D] * fb ** i
    return signal.sosfilt(sos('lowpass', 3200), out, axis=1)


def make_ir(seed, length=3.6):
    """stereo-decorrelated synthetic hall IR: 3 bands with different RT60, early taps, pre-delay"""
    r = np.random.default_rng(seed)
    n = int(length * SR)
    t = np.arange(n) / SR
    ir = np.zeros(n)
    for (kind, fc), rt in ((('lowpass', 400), 2.6), (('bandpass', [400, 3500]), 2.1), (('highpass', 3500), 0.9)):
        ir += signal.sosfilt(sos(kind, fc), r.standard_normal(n)) * 10 ** (-3 * t / rt)
    ir *= 1 - np.exp(-t / 0.018)
    for _ in range(10):
        ir[int(r.uniform(0.006, 0.07) * SR)] += r.uniform(-1, 1) * 2.5
    ir = np.concatenate([np.zeros(int(0.024 * SR)), ir])
    return ir / np.sqrt(np.sum(ir ** 2))


# ---------------------------------------------------------------- arrangement
dry = {k: bus() for k in ('drums', 'bass', 'pad', 'keys', 'bell', 'arp', 'fx')}
send = bus()  # reverb send

KICKS = [T(6, b) for b in range(4)] + [T(7, b) for b in range(3)] + \
        [T(bar, b) for bar in range(8, 24) for b in range(4)]
FINAL_HIT = T(26)
LAUNCH = T(8)

# --- drums
for tk in KICKS:
    v = 0.3 if tk < LAUNCH else 0.5
    k = kick(v)
    if tk < LAUNCH:
        k = signal.sosfilt(sos('lowpass', 900), k)
    place(dry['drums'], tk, k)
place(dry['drums'], FINAL_HIT, kick(0.6))

for bar in range(8, 24):
    for b in (1, 3):
        c = pan(clap(0.55 * rng.uniform(0.92, 1.0)), 0.04)
        place(dry['drums'], T(bar, b), c)
        place(send, T(bar, b), c * 0.55)
    for e in range(8):
        beat = e * 0.5
        if e % 2 == 1:
            open_ = bar >= 16 and e == 7
            h = pan(hat(0.24 if not open_ else 0.15, open_) * rng.uniform(0.85, 1.0), 0.25)
            place(dry['drums'], T(bar, beat), h)
        elif bar >= 16:
            place(dry['drums'], T(bar, beat), pan(hat(0.05 * rng.uniform(0.7, 1.0)), -0.3))
    if bar >= 16:  # 16th shaker ghosts
        for s in (1, 3, 5, 7, 9, 11, 13, 15):
            place(dry['drums'], T(bar, s * 0.25), pan(hat(0.03 * rng.uniform(0.6, 1.0)), -0.45))

# snare roll 14.0 -> 15.75 (accelerating, crescendo, brightening), fill at 31-32
roll = [14 + i * 0.25 for i in range(4)] + [15 + i * 0.125 for i in range(4)] + [15.5 + i * 0.0625 for i in range(4)]
for i, tr in enumerate(roll):
    u = i / (len(roll) - 1)
    c = pan(clap(0.12 + 0.35 * u, 0.8 + 0.5 * u), 0.0)
    place(dry['drums'], tr, c)
    place(send, tr, c * 0.4)
for i in range(4):
    c = clap(0.12 + 0.08 * i, 1.1)
    place(dry['drums'], T(15, 3) + i * 0.125, pan(c, 0.1))

# --- bass
for bar in range(6, 8):  # build: sustained root, low
    place(dry['bass'], T(bar), sub_bass(bass_note(CHORDS[BAR_CHORDS[bar]][1]), 1.9 if bar == 6 else 1.7, 0.45))
for bar in range(8, 24):
    m = bass_note(CHORDS[BAR_CHORDS[bar]][1])
    for e in range(8):
        mm = m + 12 if (bar >= 16 and e == 7) else m
        place(dry['bass'], T(bar, e * 0.5), sub_bass(mm, 0.2, 0.8 if e % 2 else 0.95))
for bar in (24, 25):
    place(dry['bass'], T(bar), sub_bass(bass_note(CHORDS[BAR_CHORDS[bar]][1]), 1.85, 0.4))
place(dry['bass'], FINAL_HIT, sub_bass(bass_note(2), 3.0, 0.9))

# --- pad (+ an octave-below root for warmth)
for bar in range(26):
    gate = 2.05
    for m in VOICINGS[bar]:
        place(dry['pad'], T(bar), pad_note(m, gate, spread=0.95 if 16 <= bar < 24 else 0.7))
    place(dry['pad'], T(bar), pad_note(bass_note(CHORDS[BAR_CHORDS[bar]][1]) + 12, gate, spread=0.2) * 0.6)
for m in VOICINGS[26] + [VOICINGS[26][0] + 12]:
    place(dry['pad'], FINAL_HIT, pad_note(m, 2.5, rel=1.3, a=0.05, spread=1.0))
place(dry['pad'], FINAL_HIT, pad_note(bass_note(2) + 12, 2.5, rel=1.3, a=0.05, spread=0.2) * 0.7)

# --- felt piano
def broken(bar, vel, top=False):
    v = VOICINGS[bar]
    root = bass_note(CHORDS[BAR_CHORDS[bar]][1]) + 12
    place(dry['keys'], T(bar), pan(piano(root, vel * 0.9, 1.9), -0.25))
    for beat, i in ((1.0, 1), (1.5, 2), (2.5, 3), (3.0, 2)):
        place(dry['keys'], T(bar, beat), pan(piano(v[i], vel * rng.uniform(0.8, 1.0), 2.0 - beat * 0.5 + 0.3), (v[i] - 64) / 24))
    if top:
        place(dry['keys'], T(bar, 3.5), pan(piano(v[3] + 12, vel * 0.55, 0.6), 0.3))

for bar in range(0, 8):
    broken(bar, 0.55 if bar < 4 else 0.45, top=bar in (2, 3, 6))
for bar in range(8, 24):  # tresillo chord stabs 3+3+2
    for beat in (0.0, 1.5, 3.0):
        for m in VOICINGS[bar]:
            place(dry['keys'], T(bar, beat), pan(piano(m, 0.33, 0.28, ring=0.8), (m - 66) / 20))
for bar in range(16, 24):  # counter-line, an octave up
    v = VOICINGS[bar]
    for beat, i in ((0.5, 3), (1.0, 2), (2.5, 3), (3.25, 1)):
        place(dry['keys'], T(bar, beat), pan(piano(v[i] + 12, 0.24, 0.35), 0.35 if i % 2 else -0.35))
for bar in (24, 25):
    broken(bar, 0.5, top=True)
# final chord: low octave + spread Dmaj9
for m, vv in ((38, 0.7), (50, 0.6)):
    place(dry['keys'], FINAL_HIT, pan(piano(m, vv, 4.5, ring=3), -0.2))
for m in VOICINGS[26] + [VOICINGS[26][-1] + 12]:
    place(dry['keys'], FINAL_HIT + 0.012 * (m % 5), pan(piano(m, 0.55, 4.5, ring=3), (m - 66) / 18))

# --- bell motif (enters 24 s), 4-bar phrase aligned with the chord loop
MOTIF = [  # (bar offset, beat, midi, dur beats)
    (0, 0.0, 78, 1.5), (0, 1.5, 76, 0.5), (0, 2.0, 78, 0.5), (0, 2.5, 81, 1.5),
    (1, 0.0, 81, 1.5), (1, 1.5, 78, 0.5), (1, 2.0, 74, 2.0),
    (2, 0.0, 76, 1.5), (2, 1.5, 78, 0.5), (2, 2.0, 81, 0.5), (2, 2.5, 83, 1.5),
    (3, 0.0, 81, 1.5), (3, 1.5, 76, 0.5), (3, 2.0, 76, 2.0),
]
for start in (12, 16, 20):
    for bo, beat, m, d in MOTIF:
        b = pan(bell(m, 0.5, d * BEAT), 0.12)
        place(dry['bell'], T(start + bo, beat), b)
        place(send, T(start + bo, beat), b * 0.7)
        if start == 20:  # last pass: doubled by piano an octave down
            place(dry['keys'], T(start + bo, beat), pan(piano(m - 12, 0.3, d * BEAT), 0.1))
for m, dt in ((81, 0.0), (86, 0.09), (90, 0.18)):  # sonic-logo ping on the final hit
    b = pan(bell(m, 0.55, 2.0), (m - 86) / 8)
    place(dry['bell'], FINAL_HIT + 0.25 + dt, b)
    place(send, FINAL_HIT + 0.25 + dt, b * 0.9)

# --- arps: build (8-15.75 s, cutoff opening) and groove B
SEQ = [0, 1, 2, 3, 4, 3, 2, 1]
for bar in list(range(4, 8)) + list(range(16, 24)):
    v = VOICINGS[bar] + [VOICINGS[bar][0] + 12]
    for s in range(16):
        t0 = T(bar, s * 0.25)
        if 15.75 <= t0 < 16:
            continue
        if bar < 8:
            u = (t0 - 8) / 7.75
            cut, vel = 260 * (3200 / 260) ** u, 0.22 + 0.35 * u
        else:
            cut, vel = 1700, 0.3 + 0.08 * (s % 4 == 0)
        p = pan(pluck(v[SEQ[s % 8]], vel, cut), 0.4 if s % 2 else -0.4)
        place(dry['arp'], t0, p)
        place(send, t0, p * 0.35)

# --- fx
place(dry['fx'], 9.5, riser(9.5, 15.75, 300, 7000, 0.26))
place(dry['fx'], 48.5, riser(48.5, 52.0, 250, 4500, 0.18))
place(dry['fx'], LAUNCH, impact(0.6) * 0.75)
place(send, LAUNCH, impact(0.6) * 0.25)
place(dry['fx'], FINAL_HIT, impact(1.0) * 0.85)
place(send, FINAL_HIT, impact(1.0) * 0.35)

# ---------------------------------------------------------------- mix
env = np.zeros(N)  # sidechain detector from kick times
for tk in KICKS:
    s = int(tk * SR)
    n = min(int(0.48 * SR), N - s)
    tau = np.arange(n) / SR
    shape = np.where(tau < 0.005, tau / 0.005, np.exp(-(tau - 0.005) / 0.11))
    env[s:s + n] = np.maximum(env[s:s + n], shape)
duck = lambda depth: 1 - depth * env

pad_fc = curve([(0, 420), (8, 520), (15.75, 2800), (16, 2300), (32, 2500), (32.05, 3300),
                (48, 3300), (50.5, 560), (52, 600), (52.05, 3400), (55, 1500), (60, 700)], log=True)
pad = np.vstack([swept(dry['pad'][c], pad_fc, 0.9, 'lp', 256) for c in (0, 1)])
pad_g = curve([(0, 0.32), (8, 0.36), (15.70, 1.0), (15.76, 0.08), (15.99, 0.08), (16.01, 0.85),
               (32, 0.85), (32.05, 1.0), (48, 1.0), (48.3, 0.55), (52, 0.55), (52.01, 1.25), (60, 1.25)])
pad *= pad_g * 0.24 * duck(0.6)

keys_fc = curve([(0, 2800), (16, 2800), (16.01, 4200), (48, 4200), (50.5, 1300), (51.99, 1300), (52, 4500), (60, 4500)], log=True)
keys_g = curve([(0, 0.6), (8, 0.6), (15.75, 0.75), (16, 1.0), (48, 1.0), (48.3, 0.7), (52, 0.7), (52.01, 1.0), (60, 1.0)])
keys = np.vstack([swept(dry['keys'][c], keys_fc, 0.7, 'lp', 256) for c in (0, 1)]) * 0.62 * keys_g * duck(0.25)
bass_l = signal.sosfilt(sos('highpass', 30), dry['bass'], axis=1) * 0.26 * duck(0.85)
bell_b = dry['bell'] * 0.30
bell_b += pingpong(bell_b) * 0.55
arp = dry['arp'] * 0.42 * duck(0.4)
arp += pingpong(arp, fb=0.3) * 0.4
drums = dry['drums'] * 0.62
fx = dry['fx']

send_all = send * 0.22 + 0.25 * keys + 0.30 * pad
wet = np.vstack([signal.oaconvolve(send_all[0], make_ir(11))[:N],
                 signal.oaconvolve(send_all[1], make_ir(23))[:N]])
wet = signal.sosfilt(sos('highpass', 170), wet, axis=1)
wet = signal.sosfilt(sos('lowpass', 7500), wet, axis=1) * duck(0.3)

mix = drums + bass_l + pad + keys + bell_b + arp + fx + wet * 0.55

if '--stems' in sys.argv:  # per-stem level / spectral balance in the groove (32-48 s)
    a, b = int(32 * SR), int(48 * SR)
    fr = np.fft.rfftfreq(b - a, 1 / SR)
    for name, x in (('drums', drums), ('bass', bass_l), ('pad', pad), ('keys', keys), ('bell', bell_b),
                    ('arp', arp), ('fx', fx), ('wet', wet * 0.55)):
        seg = x[:, a:b].mean(axis=0)
        sp = np.abs(np.fft.rfft(seg)) ** 2
        lo, mid, hi = (sp[fr < 150].sum(), sp[(fr >= 150) & (fr < 1000)].sum(), sp[fr >= 1000].sum())
        print(f'  {name:6s} rms {20*np.log10(np.sqrt(np.mean(seg**2))+1e-9):6.1f} dB  '
              f'<150 {lo:9.3g}  150-1k {mid:9.3g}  >1k {hi:9.3g}')
mix = signal.sosfilt(sos('highpass', 26), mix, axis=1)

t = np.arange(N) / SR
fade = np.ones(N)
f0, f1 = 56.8, 59.8
m = (t >= f0) & (t < f1)
fade[m] = np.cos((t[m] - f0) / (f1 - f0) * np.pi / 2) ** 2
fade[t >= f1] = 0
mix *= fade


# ---------------------------------------------------------------- mastering
def lufs(x):
    """ITU-R BS.1770-4 integrated loudness (48 kHz K-weighting, gated)"""
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    y = signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=1), axis=1)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    p = np.array([np.sum(np.mean(y[:, i:i + blk] ** 2, axis=1)) for i in range(0, x.shape[1] - blk, hop)])
    p = p[p > 10 ** ((-70 + 0.691) / 10)]
    rel = 10 * np.log10(np.mean(p)) - 0.691 - 10
    p = p[p > 10 ** ((rel + 0.691) / 10)]
    return 10 * np.log10(np.mean(p)) - 0.691


def limiter(x, thr):
    pk = np.max(np.abs(x), axis=0)
    g = np.minimum(1.0, thr / np.maximum(pk, 1e-9))
    W = int(0.008 * SR)
    g = uniform_filter1d(minimum_filter1d(g, 2 * W + 1), W)
    return np.clip(x * g, -thr, thr)


def true_peak(x):
    return np.max(np.abs(signal.resample_poly(x, 4, 1, axis=1)))


mix = np.tanh(mix * 1.1) / 1.1  # gentle bus saturation
TARGET, CEIL = -14.0, 10 ** (-1.3 / 20)
gain = 10 ** ((TARGET - lufs(mix)) / 20)
for _ in range(4):
    out = limiter(mix * gain, CEIL)
    gain *= 10 ** ((TARGET - lufs(out)) / 20)
out = limiter(mix * gain, CEIL)
tp = true_peak(out)
if tp > 10 ** (-1.0 / 20):
    out *= 10 ** (-1.0 / 20) / tp


# ---------------------------------------------------------------- write + report
def write24(path, x):
    d = rng.uniform(-0.5, 0.5, x.shape) + rng.uniform(-0.5, 0.5, x.shape)  # TPDF dither
    ints = np.clip(np.round(x.T * 8388607 + d.T), -8388608, 8388607).astype('<i4')
    raw = ints.reshape(-1, 1).view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        w.writeframes(raw)


args = [a for a in sys.argv[1:] if not a.startswith('--')]
path = args[0] if args else 'sound/score-custom.wav'
write24(path, out)

print(f'wrote {path}: {DUR}s {SR} Hz 24-bit stereo')
print('voicings:', {i: (BAR_CHORDS[i], VOICINGS[i]) for i in (0, 1, 2, 3, 24, 25, 26)})
print(f'integrated loudness {lufs(out):.1f} LUFS, sample peak {20*np.log10(np.max(np.abs(out))):.2f} dBFS, '
      f'true peak {20*np.log10(true_peak(out)):.2f} dBTP, NaN={np.isnan(out).any()}')
h = int(0.5 * SR)
rms = [20 * np.log10(np.sqrt(np.mean(out[:, i:i + h] ** 2)) + 1e-9) for i in range(0, N, h)]
print('RMS dBFS per 0.5 s (rows of 8 s):')
for r in range(0, 120, 16):
    print(f'  {r/2:5.1f}s ' + ' '.join(f'{v:6.1f}' for v in rms[r:r + 16]))
spec = np.abs(np.fft.rfft(out.mean(axis=0))) ** 2
fr = np.fft.rfftfreq(N, 1 / SR)
tot = spec.sum()
for lo, hi in ((20, 150), (150, 1000), (1000, 6000), (6000, 24000)):
    print(f'  band {lo:>5}-{hi:<5} Hz: {100*spec[(fr >= lo) & (fr < hi)].sum()/tot:5.1f}% energy')
