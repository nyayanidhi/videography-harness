"""RILIN "ROOM": the sound engine. Every sound is synthesised here from first principles:
no samples, no libraries of recorded sound. numpy/scipy only. 48 kHz, float64 internally.
"""
import numpy as np
from scipy import signal

SR = 48000
RNG = np.random.default_rng(1209)


def secs(n):
    return int(round(n * SR))


def silence(dur):
    return np.zeros((secs(dur), 2))


def mono_to_stereo(x, pan=0.0):
    """Equal-power pan, pan in [-1, 1]."""
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def place(bus, x, t, gain=1.0):
    """Add stereo or mono signal x into stereo bus at time t (s)."""
    i = secs(t)
    if x.ndim == 1:
        x = mono_to_stereo(x)
    if i >= len(bus):
        return
    if i < 0:
        x = x[-i:]
        i = 0
    n = min(len(x), len(bus) - i)
    bus[i:i + n] += x[:n] * gain


def env_adsr(n, a, d, s, r, sus_len=None):
    """Linear-in-dB-ish ADSR with exponential segments; durations in seconds."""
    A, D, R = secs(a), secs(d), secs(r)
    S = n - A - D - R if sus_len is None else secs(sus_len)
    S = max(S, 0)
    e = np.concatenate([
        1 - np.exp(-5 * np.linspace(0, 1, max(A, 1))),
        s + (1 - s) * np.exp(-5 * np.linspace(0, 1, max(D, 1))),
        np.full(S, s),
        s * np.exp(-6 * np.linspace(0, 1, max(R, 1))),
    ])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def smooth_curve(t, keys):
    """Quintic-blended keyframes [(t, v), ...] evaluated at array t (matches the picture rig)."""
    out = np.full_like(t, keys[0][1], dtype=float)
    for (ta, va), (tb, vb) in zip(keys[:-1], keys[1:]):
        m = (t >= ta) & (t <= tb)
        x = (t[m] - ta) / (tb - ta)
        out[m] = va + (vb - va) * (x ** 3 * (x * (x * 6 - 15) + 10))
    out[t > keys[-1][0]] = keys[-1][1]
    return out


# ── filters ────────────────────────────────────────────────────────────────────────────
def bandpass(x, f, q):
    b, a = signal.iirpeak(min(f, SR / 2 * 0.95) / (SR / 2), q)
    return signal.lfilter(b, a, x, axis=0)


def lowpass(x, f, order=2):
    sos = signal.butter(order, min(f, SR / 2 * 0.95), 'low', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def highpass(x, f, order=2):
    sos = signal.butter(order, f, 'high', fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=0)


def svf_lowpass_sweep(x, fc, q=0.7):
    """Time-varying state-variable low-pass; fc is an array (Hz) per sample."""
    y = np.zeros_like(x)
    lp = bp = 0.0
    k = 1 / q
    g_arr = np.tan(np.pi * np.clip(fc, 20, SR * 0.45) / SR)
    for i in range(len(x)):
        g = g_arr[i]
        hp = (x[i] - (k + g) * bp - lp) / (1 + k * g + g * g)
        b = g * hp + bp
        l = g * b + lp
        bp = g * hp + b
        lp = g * b + l
        y[i] = l
    return y


# ── oscillators ────────────────────────────────────────────────────────────────────────
def additive_saw(freq, dur, nharm=None, phase_jitter=True, fmax=9000.0):
    """Band-limited saw from summed harmonics; freq may be an array (Hz per sample)."""
    n = secs(dur)
    f = np.broadcast_to(np.asarray(freq, float), (n,)).copy()
    ph = 2 * np.pi * np.cumsum(f) / SR
    out = np.zeros(n)
    top = int(fmax // max(f.min(), 1))
    nh = min(nharm or 999, max(top, 1))
    for k in range(1, nh + 1):
        p0 = RNG.uniform(0, 2 * np.pi) if phase_jitter else 0
        amp = 1.0 / k
        roll = np.clip(1 - (k * f) / fmax, 0, 1)  # fade harmonics as they near fmax
        out += amp * roll * np.sin(k * ph + p0)
    return out * 0.6


def sine(freq, dur, phase=0.0):
    n = secs(dur)
    f = np.broadcast_to(np.asarray(freq, float), (n,))
    return np.sin(2 * np.pi * np.cumsum(f) / SR + phase)


def pink(n):
    w = RNG.standard_normal(n)
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    return signal.lfilter(b, a, w) * 4


def brown(n):
    x = np.cumsum(RNG.standard_normal(n))
    x = highpass(x, 15)
    return x / (np.abs(x).max() + 1e-9)


# ── instruments ────────────────────────────────────────────────────────────────────────
def clock_tick(bright=1.0, detune=1.0, dur=0.35):
    """A mechanical tick: a 2 ms escapement click into a small resonant body (modal)."""
    n = secs(dur)
    t = np.arange(n) / SR
    click = RNG.standard_normal(n) * np.exp(-t / 0.0009)
    click = highpass(click, 1800)
    body = np.zeros(n)
    for f, d, a in [(1720, 0.022, 1.0), (2830, 0.016, 0.7), (4410, 0.011, 0.5), (6900, 0.006, 0.35), (210, 0.035, 0.5)]:
        body += a * np.sin(2 * np.pi * f * detune * t + RNG.uniform(0, 6.28)) * np.exp(-t / d)
    x = click * 0.6 * bright + body * 0.5
    return x / (np.abs(x).max() + 1e-9)


def glass(freq, dur=2.2, index=2.2, ratio=3.5):
    """FM bell/glass: the 'notification' tone, pure and slightly inharmonic."""
    n = secs(dur)
    t = np.arange(n) / SR
    ienv = index * np.exp(-t / 0.18)
    mod = np.sin(2 * np.pi * freq * ratio * t)
    car = np.sin(2 * np.pi * freq * t + ienv * mod)
    car += 0.25 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t / 0.25)
    e = (1 - np.exp(-t / 0.002)) * np.exp(-t / (dur * 0.33))
    return car * e


def sub_drone(freq, dur, beat=0.11):
    """Two slightly detuned sines an octave apart plus a fifth: felt, not heard."""
    n = secs(dur)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) + 0.55 * np.sin(2 * np.pi * (freq * 2 + beat) * t)
    x += 0.18 * np.sin(2 * np.pi * (freq * 3 - beat * 0.5) * t)
    return x / 1.7


def voice(f0, dur, vowel_keys, vib=0.004, breath=0.18):
    """Formant voice: glottal saw (vibrato + jitter) through parallel formant resonators.
    vowel_keys: [(t, 'a'|'o'|'u'|'e'), ...]; formants glide between vowels."""
    F = {'a': (730, 1090, 2440, 3400), 'o': (570, 840, 2410, 3300), 'u': (300, 870, 2240, 3200), 'e': (530, 1840, 2480, 3500), 'm': (280, 1200, 2200, 3200)}
    BW = (80, 110, 150, 220)
    n = secs(dur)
    t = np.arange(n) / SR
    jitter = lowpass(RNG.standard_normal(n), 6) * 0.004
    f = f0 * (1 + vib * np.sin(2 * np.pi * 5.1 * t) * np.clip(t / 1.5, 0, 1) + jitter)
    src = additive_saw(f, dur, fmax=7000)
    src = src + breath * highpass(RNG.standard_normal(n), 400) * 0.3
    out = np.zeros(n)
    # piecewise-constant formant blocks (crossfaded) for speed
    block = secs(0.05)
    times = [k[0] for k in vowel_keys]
    for fi in range(4):
        targets = np.array([F[k[1]][fi] for k in vowel_keys], float)
        fc = np.interp(t, times, targets) if len(times) > 1 else np.full(n, targets[0])
        y = np.zeros(n)
        for s0 in range(0, n, block):
            s1 = min(s0 + block * 2, n)
            seg = bandpass(src[s0:s1], fc[s0], fc[s0] / BW[fi])
            w = np.ones(s1 - s0)
            if s0 > 0:
                w[:block] = np.linspace(0, 1, block)[: s1 - s0]
            y[s0:s1] = y[s0:s1] * (1 - w) + seg * w if s0 > 0 else seg
        out += y * (1.0, 0.6, 0.25, 0.12)[fi]
    return out / (np.abs(out).max() + 1e-9)


def organ(freqs, dur, drawbars=(1.0, 0.5, 0.75, 0.35, 0.25, 0.12), attack=1.8, release=3.0, wind=0.03):
    """Pipe organ: additive ranks (8', 16', 4', 2 2/3', 2', 1 3/5') with slow speech and wind."""
    n = secs(dur)
    t = np.arange(n) / SR
    ratios = (1.0, 0.5, 2.0, 3.0, 4.0, 5.0)
    out = np.zeros(n)
    for f in freqs:
        for r, a in zip(ratios, drawbars):
            det = 1 + RNG.uniform(-0.0006, 0.0006)
            out += a * np.sin(2 * np.pi * f * r * det * t + RNG.uniform(0, 6.28))
    out += wind * highpass(lowpass(RNG.standard_normal(n), 3000), 300) * len(freqs)
    e = np.clip(t / attack, 0, 1) ** 1.6 * np.clip((dur - t) / release, 0, 1)
    return out * e / (len(freqs) * 2.2)


def strings(freqs, dur, attack=2.5, release=3.0, bright=2200.0, ens=7):
    """Bowed-string ensemble pad: many detuned saws, bow-noise, low-passed body."""
    n = secs(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for f in freqs:
        for k in range(ens):
            det = 1 + RNG.uniform(-0.004, 0.004)
            vib = 1 + 0.0025 * np.sin(2 * np.pi * RNG.uniform(4.6, 5.6) * t + RNG.uniform(0, 6.28))
            out += additive_saw(f * det * vib, dur, fmax=bright * 2.5)
    out = lowpass(out, bright, order=2)
    out += 0.02 * bandpass(RNG.standard_normal(n), 2500, 2) * len(freqs)
    e = np.clip(t / attack, 0, 1) ** 1.4 * np.clip((dur - t) / release, 0, 1)
    return out * e / (len(freqs) * ens * 0.5)


def shepard(dur, rate=0.07, base=55.0, octaves=7, up=True):
    """Endless rising tone (Risset glissando): tension that never resolves."""
    n = secs(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for k in range(octaves):
        pos = (k + (rate * t if up else -rate * t)) % octaves  # octave position
        f = base * 2 ** pos
        amp = np.exp(-0.5 * ((pos - octaves / 2) / (octaves / 5)) ** 2)
        out += amp * np.sin(2 * np.pi * np.cumsum(f) / SR)
    return out / octaves * 2


def drum(freq=48.0, dur=3.5, mallet=1.0):
    """Huge low drum by modal synthesis: membrane modes (Bessel ratios) + pitch drop + skin."""
    n = secs(dur)
    t = np.arange(n) / SR
    modes = [(1.0, 1.0, 1.0), (1.594, 0.5, 0.6), (2.136, 0.35, 0.45), (2.296, 0.25, 0.4), (2.653, 0.18, 0.3), (2.918, 0.12, 0.25)]
    out = np.zeros(n)
    drop = 1 + 0.6 * np.exp(-t / 0.045)
    for r, a, dmul in modes:
        out += a * np.sin(2 * np.pi * np.cumsum(freq * r * drop) / SR) * np.exp(-t / (dur * 0.28 * dmul))
    skin = lowpass(RNG.standard_normal(n), 900) * np.exp(-t / 0.03) * 0.6 * mallet
    x = out + skin
    return np.tanh(x * 1.4) / np.tanh(1.4)


def boom(dur=5.0):
    """A sub drop: the low weight under a hit (sine pitch-drop + filtered noise thump)."""
    n = secs(dur)
    t = np.arange(n) / SR
    f = 30 + 55 * np.exp(-t / 0.12)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.4)
    x += lowpass(RNG.standard_normal(n), 120) * np.exp(-t / 0.25) * 0.5
    return x / (np.abs(x).max() + 1e-9)


def felt_key(freq, dur=4.0, vel=0.7):
    """Felt piano-like keys by modal synthesis: slightly stretched partials, soft hammer."""
    n = secs(dur)
    t = np.arange(n) / SR
    out = np.zeros(n)
    B = 0.00018
    for k in range(1, 14):
        fk = freq * k * np.sqrt(1 + B * k * k)
        if fk > 12000:
            break
        a = (1 / k ** 1.25) * (vel ** (k * 0.18))
        dk = 3.2 / (1 + 0.35 * k)
        out += a * np.sin(2 * np.pi * fk * t + RNG.uniform(0, 6.28)) * np.exp(-t / dk)
    hammer = lowpass(RNG.standard_normal(n), 2500) * np.exp(-t / 0.004) * 0.15
    e = 1 - np.exp(-t / 0.003)
    return (out + hammer) * e * vel


def air(dur, lo=60, hi=900, level=1.0):
    """Room tone of a vast concrete hall: band-limited moving noise."""
    n = secs(dur)
    x = pink(n)
    x = highpass(lowpass(x, hi), lo)
    mod = 0.7 + 0.3 * lowpass(RNG.standard_normal(n), 0.4) * 8
    return x * np.clip(mod, 0.2, 1.3) * level / (np.abs(x).max() + 1e-9)


# ── space ──────────────────────────────────────────────────────────────────────────────
def make_ir(rt60=4.8, predelay=0.03, size=1.0, damp_hz=5500, width=1.0, seed=7):
    """Our own hall impulse response: sparse early reflections + dense stereo-decorrelated
    exponential tail with frequency-dependent decay (highs die faster)."""
    rng = np.random.default_rng(seed)
    n = secs(rt60 * 1.3 + predelay)
    t = np.arange(n) / SR
    ir = np.zeros((n, 2))
    # early reflections from a big rectangular room
    for k in range(18):
        d = predelay + rng.uniform(0.004, 0.09) * size
        g = rng.uniform(0.25, 0.7) * np.exp(-d / 0.08)
        i = secs(d)
        if i < n:
            ir[i, 0] += g * rng.choice([-1, 1])
            ir[min(i + rng.integers(0, 40), n - 1), 1] += g * rng.choice([-1, 1])
    # late tail: lows decay at rt60, highs faster
    for ch in range(2):
        noise = rng.standard_normal(n)
        low = lowpass(noise, 700)
        mid = bandpass(noise, 2000, 0.7)
        high = highpass(noise, damp_hz)
        tail = low * np.exp(-6.9 * t / rt60) + 0.7 * mid * np.exp(-6.9 * t / (rt60 * 0.7)) + 0.35 * high * np.exp(-6.9 * t / (rt60 * 0.35))
        onset = np.clip((t - predelay) / 0.06, 0, 1)
        ir[:, ch] += tail * onset * 0.35
    ir[:, 1] = ir[:, 1] * width + ir[:, 0] * (1 - width)
    return ir / np.sqrt((ir ** 2).sum() / 2)


def reverb(x, ir, mix=0.35):
    """Stereo convolution reverb. x: (n, 2)."""
    wet = np.stack([signal.fftconvolve(x[:, 0], ir[:, 0]), signal.fftconvolve(x[:, 1], ir[:, 1])], axis=1)
    wet = wet[: len(x) + len(ir)]
    dry = np.pad(x, ((0, len(wet) - len(x)), (0, 0)))
    return dry * (1 - mix) + wet * mix


# ── master ─────────────────────────────────────────────────────────────────────────────
def k_weight(x):
    # BS.1770 K-weighting (pre-filter shelf + RLB high-pass), coefficients for 48 kHz
    b1, a1 = [1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=0), axis=0)


def lufs(x):
    """Integrated loudness (BS.1770-4 with gating)."""
    y = k_weight(x)
    blk = secs(0.4)
    hop = secs(0.1)
    ms = []
    for s in range(0, len(y) - blk, hop):
        seg = y[s:s + blk]
        ms.append(np.mean(seg ** 2, axis=0).sum())
    ms = np.array(ms)
    if len(ms) == 0:
        return -70.0
    L = -0.691 + 10 * np.log10(ms + 1e-12)
    m = L > -70
    if not m.any():
        return -70.0
    rel = -0.691 + 10 * np.log10(ms[m].mean()) - 10
    m2 = m & (L > rel)
    return -0.691 + 10 * np.log10(ms[m2].mean())


def true_peak(x):
    up = signal.resample_poly(x, 4, 1, axis=0)
    return 20 * np.log10(np.abs(up).max() + 1e-12)


def limiter(x, ceiling_db=-1.2, release=0.12, lookahead=0.005):
    """Look-ahead peak limiter on the 4x oversampled envelope (true-peak safe-ish)."""
    c = 10 ** (ceiling_db / 20)
    up = signal.resample_poly(np.abs(x).max(axis=1), 4, 1)
    peak = np.maximum.reduceat(up, np.arange(0, len(up), 4))[: len(x)]
    la = secs(lookahead)
    # running max over the look-ahead window
    from scipy.ndimage import maximum_filter1d
    pk = maximum_filter1d(peak, size=la * 2 + 1, origin=-la if la > 0 else 0)
    g_target = np.minimum(1.0, c / (pk + 1e-12))
    g = np.empty_like(g_target)
    rel = np.exp(-1 / (release * SR))
    cur = 1.0
    for i in range(len(g_target)):
        tg = g_target[i]
        cur = tg if tg < cur else tg + (cur - tg) * rel
        g[i] = cur
    return x * g[:, None]


def master(x, target_lufs=-16.0, ceiling=-1.2):
    x = highpass(x, 22, order=4)
    # mono below 120 Hz
    lo = lowpass(x, 120, order=4)
    lom = lo.mean(axis=1, keepdims=True)
    x = x - lo + np.repeat(lom, 2, axis=1)
    for _ in range(3):
        gain = 10 ** ((target_lufs - lufs(x)) / 20)
        x = limiter(x * gain, ceiling)
    return x


def write_wav(path, x):
    from scipy.io import wavfile
    y = np.clip(x, -1, 1)
    y = (y * (2 ** 23 - 1)).astype(np.int32)
    # 24-bit packed
    import wave
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(3)
        w.setframerate(SR)
        b = y.astype('<i4').tobytes()
        packed = bytearray()
        arr = np.frombuffer(b, dtype=np.uint8).reshape(-1, 4)[:, :3]
        w.writeframes(arr.tobytes())


# ── fast band-limited saw (PolyBLEP), vectorised ───────────────────────────────────────
def blep_saw(freq, n, phase0=0.0):
    f = np.broadcast_to(np.asarray(freq, float), (n,))
    dt = f / SR
    ph = (phase0 + np.cumsum(dt)) % 1.0
    y = 2 * ph - 1
    m = ph < dt
    t = ph[m] / dt[m]
    y[m] -= t + t - t * t - 1
    m2 = ph > 1 - dt
    t2 = (ph[m2] - 1) / dt[m2]
    y[m2] -= t2 * t2 + t2 + t2 + 1
    return y


def string_note(freq, dur, attack=0.6, release=1.2, bright=2400.0, ens=5, detune=0.005, vib=0.003):
    """One bowed note from a small ensemble (stereo)."""
    n = secs(dur + release)
    t = np.arange(n) / SR
    out = np.zeros((n, 2))
    for k in range(ens):
        d = 1 + RNG.uniform(-detune, detune)
        v = 1 + vib * np.sin(2 * np.pi * RNG.uniform(4.6, 5.8) * t + RNG.uniform(0, 6.28)) * np.clip(t / 0.8, 0, 1)
        x = blep_saw(freq * d * v, n, RNG.uniform(0, 1))
        pan = (k / max(ens - 1, 1)) * 1.4 - 0.7
        out += mono_to_stereo(x, pan)
    out = lowpass(out, bright, order=2)
    out = lowpass(out, bright * 1.8, order=2)
    env = np.clip(t / attack, 0, 1) ** 1.5
    rel = np.clip((dur + release - t) / release, 0, 1) ** 1.3
    env = env * np.where(t < dur, 1.0, rel)
    return out * env[:, None] / ens
