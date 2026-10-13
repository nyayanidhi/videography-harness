"""Listen with numbers: loudness curve, silence check, and a spectrogram image."""
import json, os, sys, wave
import numpy as np
from scipy import signal
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
from synth import SR, k_weight
from qa import write_png

def read(path):
    with wave.open(path) as w:
        n = w.getnframes(); raw = w.readframes(n)
    b = np.frombuffer(raw, np.uint8).reshape(-1, 3)
    x = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16))
    x = np.where(x >= 2**23, x - 2**24, x) / 2**23
    return x.reshape(-1, 2)

x = read(sys.argv[1]); T = json.load(open(sys.argv[2]))
y = k_weight(x)
hop = SR // 2
def st(i, win):  # loudness of window ending at i
    seg = y[max(0, i - win):i]
    return -0.691 + 10 * np.log10(np.mean(seg ** 2, axis=0).sum() + 1e-12)
print('short-term loudness (3 s window), every 2 s:')
row = []
for k in range(1, int(len(x) / SR / 2) + 1):
    i = k * 2 * SR
    row.append(f'{k*2:>3}s {st(i, 3*SR):6.1f}')
for r in range(0, len(row), 6): print('   '.join(row[r:r+6]))
for a0, a1 in T['silences']:
    seg = x[int(a0*SR)+200:int(a1*SR)-200]
    print(f'silence {a0}-{a1}: peak {20*np.log10(np.abs(seg).max()+1e-12):.1f} dBFS')
for name, t in [('hit', T['grid0']), ('press', T['press']), ('settle', T['end']['settle'])]:
    seg = x[int(t*SR):int((t+0.3)*SR)]
    pre = x[int((t-0.5)*SR):int(t*SR)]
    print(f'{name} @{t}: peak {20*np.log10(np.abs(seg).max()+1e-12):.1f} dBFS (0.5 s before: {20*np.log10(np.abs(pre).max()+1e-12):.1f})')
# spectrogram 0–8 kHz, log magnitude
m = x.mean(1)
f, tt, S = signal.spectrogram(m, SR, nperseg=4096, noverlap=4096-1200)
S = 10*np.log10(S[f < 8000] + 1e-12)
S = np.clip((S + 110) / 80, 0, 1)
img = (np.flipud(S) * 255).astype(np.uint8)
# resample to 1600 wide x 500 tall
from scipy.ndimage import zoom
img = zoom(img, (500 / img.shape[0], 1600 / img.shape[1]), order=1)
rgb = np.stack([img, (img * 0.85).astype(np.uint8), (img * 0.6).astype(np.uint8)], -1)
for c in T['cuts']:
    col = int(c / (len(m) / SR) * 1600); rgb[:, col] = [0, 180, 200]
write_png(sys.argv[3], rgb)
print('spectrogram →', sys.argv[3])
