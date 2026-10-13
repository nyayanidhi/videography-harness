"""Refine tempo/grid and print section map. usage: python -I refine.py FFMPEG bpm_guess file"""
import sys, os
import numpy as np
from scipy import signal
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analyze import decode, onset_env, SR

ff, guess, path = sys.argv[1], float(sys.argv[2]), sys.argv[3]
x = decode(ff, path)
mono = x.mean(axis=1)
flux, fr = onset_env(mono)
# low-band flux for downbeat (kick) detection
sos = signal.butter(4, 150, 'low', fs=SR, output='sos')
lowflux, _ = onset_env(signal.sosfilt(sos, mono))
n = np.arange(len(flux))


def comb(f, bpm, ph):
    period = 60 * fr / bpm
    idx = np.arange(ph, len(f) - 1, period)
    return np.interp(idx, n, f).mean()


best = (-1, 0, 0)
for bpm in np.arange(guess - 1.5, guess + 1.5, 0.01):
    period = 60 * fr / bpm
    for ph in np.linspace(0, period, 48, endpoint=False):
        v = comb(flux, bpm, ph)
        if v > best[0]:
            best = (v, bpm, ph)
_, bpm, ph = best
period = 60 * fr / bpm
# fine phase
phs = np.linspace(ph - 0.5, ph + 0.5, 41)
ph = phs[np.argmax([comb(flux, bpm, p) for p in phs])]
beat0 = ph / fr
# downbeat: which of 4 beat phases has the most low-band energy
scores = [comb(lowflux, bpm / 4, ph + k * period) for k in range(4)]
db = int(np.argmax(scores))
bar0 = (ph + db * period) / fr
spb = 60 / bpm
print(f'file={os.path.basename(path)} dur={len(mono)/SR:.2f}s bpm={bpm:.2f} beat0={beat0:.3f}s downbeat0={bar0:.3f}s bar={4*spb:.3f}s')
print('downbeat-phase scores', [round(float(s), 3) for s in scores])
# per-bar RMS dB
bar = 4 * spb
t = bar0 % bar
rows = []
while t + bar <= len(mono) / SR:
    s = mono[int(t * SR):int((t + bar) * SR)]
    lo = signal.sosfilt(sos, s)
    rows.append((t, 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9), 20 * np.log10(np.sqrt(np.mean(lo ** 2)) + 1e-9)))
    t += bar
print('bar-start  rms  low<150   (one line per bar; * marks >=3 dB jump vs prev bar, v marks >=3 dB fall)')
prev = None
for i, (t, r, l) in enumerate(rows):
    mark = ''
    if prev is not None:
        if r - prev >= 3: mark = '*'
        elif prev - r >= 3: mark = 'v'
        elif l - prevl >= 6: mark = 'k'  # bass/kick enters
    print(f'{i+1:3d} {t:7.2f} {r:6.1f} {l:6.1f} {mark}')
    prev, prevl = r, l
# tail
r = []
for k in range(int(len(mono) / SR * 2) - 30, int(len(mono) / SR * 2)):
    s = mono[int(k * SR / 2):int((k + 1) * SR / 2)]
    r.append(round(float(20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9)), 1))
print('last 15 s per 0.5 s:', r)
