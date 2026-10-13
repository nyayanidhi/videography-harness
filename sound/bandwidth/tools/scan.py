"""Scan candidate tracks: tempo/grid, key, per-bar loudness, section points.
usage: python -I scan.py FFMPEG out.jsonl file1 [file2 ...]
Reuses decode/onset_env/lufs from sound/library/tools/analyze.py.
"""
import json, os, sys
import numpy as np
from scipy import signal
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', '..', 'library', 'tools'))
from analyze import decode, onset_env, lufs, tempo, SR

MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']


def chroma(mono):
    x = signal.resample_poly(mono, 1, 4); sr = SR / 4
    f, t, Z = signal.stft(x, sr, nperseg=8192, noverlap=6144)
    M = np.abs(Z)
    m = (f > 60) & (f < 2500)
    pc = (np.round(12 * np.log2(f[m] / 440)) + 9) % 12
    E = np.log1p(M[m] * 50)
    c = np.zeros((12, M.shape[1]))
    for k in range(12):
        c[k] = E[pc == k].sum(axis=0)
    return c, t


def key_of(cv):
    res = []
    for i in range(12):
        res.append((float(np.corrcoef(np.roll(MAJ, i), cv)[0, 1]), NAMES[i] + ' major'))
        res.append((float(np.corrcoef(np.roll(MIN, i), cv)[0, 1]), NAMES[i] + ' minor'))
    res.sort(reverse=True)
    return [(round(a, 2), b) for a, b in res[:3]]


def grid(flux, fr, lowflux, guess):
    n = np.arange(len(flux))
    def comb(f, bpm, ph):
        period = 60 * fr / bpm
        idx = np.arange(ph, len(f) - 1, period)
        return np.interp(idx, n, f).mean()
    best = (-1, 0, 0)
    for bpm in np.arange(guess - 1.0, guess + 1.0, 0.01):
        period = 60 * fr / bpm
        for ph in np.linspace(0, period, 32, endpoint=False):
            v = comb(flux, bpm, ph)
            if v > best[0]:
                best = (v, bpm, ph)
    _, bpm, ph = best
    period = 60 * fr / bpm
    phs = np.linspace(ph - 0.5, ph + 0.5, 41)
    ph = phs[np.argmax([comb(flux, bpm, p) for p in phs])]
    # pulse clarity: comb score on-grid vs off-grid (half-beat shifted)
    on = comb(flux, bpm, ph); off = comb(flux, bpm, ph + period / 2)
    scores = [comb(lowflux, bpm / 4, ph + k * period) for k in range(4)]
    db = int(np.argmax(scores))
    return float(bpm), float(ph / fr), float((ph + db * period) / fr), float(on / (off + 1e-9)), [round(float(s), 3) for s in scores]


def main():
    ff, outp = sys.argv[1], sys.argv[2]
    fo = open(outp, 'a')
    for path in sys.argv[3:]:
        try:
            x = decode(ff, path)
        except Exception as e:
            print('decode fail', path, e); continue
        mono = x.mean(axis=1)
        dur = len(mono) / SR
        flux, fr = onset_env(mono)
        sos = signal.butter(4, 150, 'low', fs=SR, output='sos')
        lowflux, _ = onset_env(signal.sosfilt(sos, mono))
        bpm0, conf = tempo(flux, fr, 60, 180)
        # fold into 85-170 preference window; keep both octave readings
        cand = bpm0
        while cand < 85: cand *= 2
        while cand > 170: cand /= 2
        bpm, beat0, bar0, clarity, dbs = grid(flux, fr, lowflux, cand)
        spb = 60 / bpm; bar = 4 * spb
        t = bar0 % bar
        bars = []
        while t + bar <= dur:
            s = mono[int(t * SR):int((t + bar) * SR)]
            lo = signal.sosfilt(sos, s)
            bars.append((round(t, 3), round(float(20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9)), 1),
                         round(float(20 * np.log10(np.sqrt(np.mean(lo ** 2)) + 1e-9)), 1)))
            t += bar
        r = np.array([b[1] for b in bars]) if bars else np.zeros(1)
        lo = np.array([b[2] for b in bars]) if bars else np.zeros(1)
        # section points: 2-bar mean vs previous 2-bar mean jump >= 2.5 dB (rms) or >= 5 dB (low band)
        secs = []
        for i in range(2, len(bars) - 1):
            d = r[i:i + 2].mean() - r[i - 2:i].mean()
            dl = lo[i:i + 2].mean() - lo[i - 2:i].mean()
            if abs(d) >= 2.5 or abs(dl) >= 5:
                if secs and i - secs[-1][0] <= 1:
                    if abs(d) > abs(secs[-1][2]): secs[-1] = (i, bars[i][0], round(float(d), 1), round(float(dl), 1))
                else:
                    secs.append((i, bars[i][0], round(float(d), 1), round(float(dl), 1)))
        c, ct = chroma(mono)
        k_all = key_of(c.mean(axis=1))
        loud = np.percentile(r, 90)
        f, P = signal.welch(mono, SR, nperseg=8192)
        cen = float((f * P).sum() / P.sum())
        side = (x[:, 0] - x[:, 1]) / 2
        width = float(np.sqrt(np.mean(side ** 2)) / (np.sqrt(np.mean(mono ** 2)) + 1e-12))
        rec = {'file': os.path.basename(path), 'dur': round(dur, 2), 'lufs': round(lufs(x), 1),
               'bpm_raw': bpm0, 'bpm': round(bpm, 2), 'pulse_clarity': round(clarity, 2), 'beat0': round(beat0, 3),
               'bar0': round(bar0, 3), 'downbeat_scores': dbs, 'frames_per_beat_60fps': round(3600 / bpm, 2),
               'key': k_all, 'centroid': round(cen), 'width': round(width, 2),
               'bar_p90_db': round(float(loud), 1), 'bar_range_db': round(float(loud - np.percentile(r, 10)), 1),
               'first_bars_rel_db': [round(float(v - loud), 1) for v in r[:12]],
               'sections': secs, 'bars': bars}
        fo.write(json.dumps(rec) + '\n'); fo.flush()
        print(f"{rec['file'][:38]:38} {dur:6.1f}s {rec['lufs']:6.1f}LU bpm {bpm:6.2f} (raw {bpm0}) clar {clarity:4.2f} key {k_all[0]} range {rec['bar_range_db']} secs {[(s[1], s[2]) for s in secs[:6]]}", flush=True)


if __name__ == '__main__':
    main()
