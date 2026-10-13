"""Audio analysis for candidate tracks.
usage: python -I analyze.py FFMPEG file1 [file2 ...]  -> prints JSON lines
Measures: duration, integrated loudness (BS.1770-ish), RMS per 0.5 s, tempo + beat
offset (spectral-flux autocorrelation + comb phase search), energy jumps, spectral balance.
"""
import json, os, subprocess, sys
import numpy as np
from scipy import signal

SR = 48000


def decode(ff, path):
    import tempfile
    from scipy.io import wavfile
    env = dict(os.environ, DYLD_LIBRARY_PATH=os.path.dirname(ff))
    with tempfile.TemporaryDirectory() as td:
        out = os.path.join(td, 'a.wav')
        subprocess.run([ff, '-v', 'error', '-y', '-i', path, '-vn', '-acodec', 'pcm_s16le',
                        '-ac', '2', '-ar', str(SR), out], env=env, check=True)
        sr, d = wavfile.read(out)
    return d.astype(np.float64) / 32768.0


def kweight(x):
    # BS.1770 pre-filter (48 kHz coefficients)
    b1 = [1.53512485958697, -2.69169618940638, 1.19839281085285]
    a1 = [1.0, -1.69065929318241, 0.73248077421585]
    b2 = [1.0, -2.0, 1.0]
    a2 = [1.0, -1.99004745483398, 0.99007225036621]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=0), axis=0)


def lufs(x):
    y = kweight(x)
    blk, hop = int(0.4 * SR), int(0.1 * SR)
    ms = []
    for s in range(0, len(y) - blk, hop):
        ms.append(np.mean(y[s:s + blk] ** 2, axis=0).sum())
    ms = np.array(ms)
    if len(ms) == 0:
        return -99.0
    l = -0.691 + 10 * np.log10(ms + 1e-12)
    g = ms[l > -70]
    if len(g) == 0:
        return -99.0
    rel = -0.691 + 10 * np.log10(g.mean()) - 10
    g2 = g[(-0.691 + 10 * np.log10(g + 1e-12)) > rel]
    return float(-0.691 + 10 * np.log10(g2.mean()))


def onset_env(mono, hop=512, n=2048):
    f, t, Z = signal.stft(mono, SR, nperseg=n, noverlap=n - hop, boundary=None, padded=False)
    mag = np.log1p(100 * np.abs(Z))
    flux = np.maximum(0, np.diff(mag, axis=1)).sum(axis=0)
    flux = np.concatenate([[0], flux])
    flux = flux - signal.medfilt(flux, 17)
    flux = np.maximum(flux, 0)
    return flux, SR / hop


def tempo(flux, fr, lo=70, hi=180):
    seg = flux - flux.mean()
    ac = signal.correlate(seg, seg, mode='full', method='fft')[len(seg) - 1:]
    ac /= ac[0] + 1e-12
    best = None
    cands = []
    for bpm10 in range(lo * 10, hi * 10 + 1, 1):
        bpm = bpm10 / 10
        lag = 60 * fr / bpm
        # sum of ac at multiples of the beat lag (helps reject half/double)
        sc = 0
        for k, w in ((1, 1.0), (2, 0.5), (4, 0.25)):
            L = lag * k
            i = int(L)
            if i + 1 < len(ac):
                sc += w * (ac[i] * (1 - (L - i)) + ac[i + 1] * (L - i))
        cands.append((sc, bpm))
    cands.sort(reverse=True)
    bpm = cands[0][1]
    # prefer range 95-130 if octave-related candidate is close in score
    for sc, b in cands[:40]:
        for m in (2, 0.5, 1.5, 2 / 3):
            pass
    return bpm, cands[0][0]


def beat_offset(flux, fr, bpm):
    period = 60 * fr / bpm
    best = (-1, 0)
    for ph in np.linspace(0, period, 120, endpoint=False):
        idx = np.arange(ph, len(flux) - 1, period)
        v = np.interp(idx, np.arange(len(flux)), flux).sum()
        if v > best[0]:
            best = (v, ph)
    return best[1] / fr


def main():
    ff = sys.argv[1]
    for path in sys.argv[2:]:
        x = decode(ff, path)
        dur = len(x) / SR
        mono = x.mean(axis=1)
        half = int(0.5 * SR)
        nb = int(np.ceil(len(mono) / half))
        rms = []
        for i in range(nb):
            s = mono[i * half:(i + 1) * half]
            rms.append(round(float(20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9)), 1))
        flux, fr = onset_env(mono)
        bpm, conf = tempo(flux, fr)
        off = beat_offset(flux, fr, bpm)
        # energy jumps: compare mean RMS(dB) of next 2 s vs previous 2 s
        r = np.array(rms)
        jumps = []
        for i in range(4, len(r) - 4):
            d = r[i:i + 4].mean() - r[i - 4:i].mean()
            if d > 3.0:
                jumps.append((i * 0.5, round(float(d), 1)))
        # collapse adjacent
        cj = []
        for t, d in jumps:
            if cj and t - cj[-1][0] <= 1.5:
                if d > cj[-1][1]:
                    cj[-1] = (t, d)
            else:
                cj.append((t, d))
        drops = []
        for i in range(4, len(r) - 4):
            d = r[i:i + 4].mean() - r[i - 4:i].mean()
            if d < -4.0:
                drops.append((i * 0.5, round(float(d), 1)))
        cd = []
        for t, d in drops:
            if cd and t - cd[-1][0] <= 1.5:
                if d < cd[-1][1]:
                    cd[-1] = (t, d)
            else:
                cd.append((t, d))
        # spectral balance
        f, P = signal.welch(mono, SR, nperseg=8192)
        def band(a, b):
            m = (f >= a) & (f < b)
            return P[m].sum()
        tot = P.sum() + 1e-20
        bands = {k: round(float(10 * np.log10(band(a, b) / tot + 1e-12)), 1) for k, (a, b) in {
            'sub<60': (20, 60), 'low60-250': (60, 250), 'mid250-2k': (250, 2000), 'hm2k-6k': (2000, 6000), 'air>6k': (6000, 20000)}.items()}
        side = (x[:, 0] - x[:, 1]) / 2
        width = float(np.sqrt(np.mean(side ** 2)) / (np.sqrt(np.mean(mono ** 2)) + 1e-12))
        peak = float(20 * np.log10(np.abs(x).max() + 1e-12))
        print(json.dumps({'file': os.path.basename(path), 'dur': round(dur, 2), 'lufs': round(lufs(x), 1),
                          'peak_dbfs': round(peak, 1), 'bpm': bpm, 'bpm_conf': round(float(conf), 3),
                          'beat0': round(float(off), 3), 'jumps': cj, 'drops': cd, 'bands': bands,
                          'width': round(width, 2), 'rms05': rms}), flush=True)


if __name__ == '__main__':
    main()
