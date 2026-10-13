"""Bar-accurate 60 s edits of library tracks.
usage: python -I edit.py FFMPEG plan.json
plan: {"src": path, "out": path, "dur": 60.0, "target_lufs": -14,
       "segments": [{"at": film_s, "from": track_s, "len": s, "fi": s, "fo": s, "gain_db": 0}],
       "ring": {"at": film_s, "from": track_s, "len": s, "rt60": s, "wet_db": -4}  (optional)
       "fade_end": [start_s, end_s]}
Segments are mixed with equal-power fades (fi/fo) so splices on downbeats overlap cleanly.
"""
import json, os, sys
import numpy as np
from scipy import signal
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analyze import decode, lufs, SR


def write24(path, x):
    import wave
    y = np.clip(x, -1, 1 - 1 / 8388608)
    i = (y * 8388607).astype('<i4')
    b = i.tobytes()
    a = np.frombuffer(b, dtype=np.uint8).reshape(-1, 4)[:, :3].tobytes()
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(3); w.setframerate(SR); w.writeframes(a)


def fades(n, fi, fo):
    e = np.ones(n)
    a, b = int(fi * SR), int(fo * SR)
    if a > 0:
        e[:a] = np.sin(np.linspace(0, np.pi / 2, a))
    if b > 0:
        e[n - b:] *= np.cos(np.linspace(0, np.pi / 2, b))
    return e


def main():
    ff, plan = sys.argv[1], json.load(open(sys.argv[2]))
    src = decode(ff, plan['src'])
    N = int(plan.get('dur', 60.0) * SR)
    out = np.zeros((N, 2))
    for s in plan['segments']:
        a, f, L = s['at'], s['from'], s['len']
        fi, fo = s.get('fi', 0.03), s.get('fo', 0.03)
        # extend by fo so the outgoing fade overlaps the next segment's fade-in
        i0 = int(round(f * SR)); n = int(round((L + fo) * SR))
        o0 = int(round(a * SR))
        if i0 < 0:  # leading silence (track starts after film 0)
            o0 -= i0; n += i0; i0 = 0
        seg = src[i0:i0 + n].copy()
        n = len(seg)
        seg *= fades(n, fi, fo)[:, None] * 10 ** (s.get('gain_db', 0) / 20)
        m = min(n, N - o0)
        out[o0:o0 + m] += seg[:m]
    r = plan.get('ring')
    if r:
        i0 = int(r['from'] * SR); n = int(r['len'] * SR); o0 = int(r['at'] * SR)
        hit = src[i0:i0 + n].copy()
        hit *= fades(n, 0.005, r.get('fo', 0.12))[:, None]
        rng = np.random.default_rng(7)
        T = r.get('rt60', 4.0) * 1.3
        t = np.arange(int(T * SR)) / SR
        env = 10 ** (-3 * t / r.get('rt60', 4.0))
        ir = rng.standard_normal((len(t), 2)) * env[:, None]
        # darken the tail over time: crossfade between full-band and low-passed noise
        sos = signal.butter(2, 2500, 'low', fs=SR, output='sos')
        lp = signal.sosfilt(sos, ir, axis=0)
        k = np.clip(t / 1.5, 0, 1)[:, None]
        ir = ir * (1 - k) + lp * k * 1.8
        ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]  # pre-delay softening
        ir /= np.sqrt((ir ** 2).sum(axis=0))
        wet = np.stack([signal.fftconvolve(hit[:, c], ir[:, c]) for c in range(2)], axis=1)
        wet *= 10 ** (r.get('wet_db', -4) / 20) * np.sqrt(np.mean(hit ** 2)) / (np.sqrt(np.mean(wet[: n] ** 2)) + 1e-12)
        g = 10 ** (r.get('gain_db', 0) / 20)
        m = min(n, N - o0); out[o0:o0 + m] += hit[:m] * g
        m = min(len(wet), N - o0); out[o0:o0 + m] += wet[:m] * g
    fe = plan.get('fade_end')
    if fe:
        a, b = int(fe[0] * SR), int(fe[1] * SR)
        out[a:b] *= np.cos(np.linspace(0, np.pi / 2, b - a))[:, None] ** 2
        out[b:] = 0
    # loudness normalise to target with a transparent look-ahead peak limiter (ceiling -1 dBFS)
    from scipy.ndimage import maximum_filter1d, uniform_filter1d
    def limit(y, ceil=10 ** (-1 / 20)):
        la = int(0.004 * SR)
        pk = maximum_filter1d(np.abs(y).max(axis=1), size=4 * la + 1)
        g = np.minimum(1.0, ceil / (pk + 1e-12))
        g = uniform_filter1d(g, size=2 * la + 1)
        rel = np.exp(-1 / (0.08 * SR))
        from scipy.signal import lfilter
        gr = 1 - g
        gr = np.maximum(gr, lfilter([1 - rel], [1, -rel], gr))
        return y * (1 - gr)[:, None]
    for _ in range(3):
        L = lufs(out)
        out *= 10 ** ((plan.get('target_lufs', -14) - L) / 20)
        out = limit(out)
    out = np.clip(out, -10 ** (-1 / 20), 10 ** (-1 / 20))
    write24(plan['out'], out)
    half = int(0.5 * SR)
    env = [round(float(20 * np.log10(np.sqrt(np.mean(out[i:i + half] ** 2)) + 1e-9)), 1) for i in range(0, N, half)]
    print(json.dumps({'out': plan['out'], 'lufs': round(lufs(out), 1), 'peak': round(float(20 * np.log10(np.abs(out).max())), 1), 'rms05': env}))


if __name__ == '__main__':
    main()
