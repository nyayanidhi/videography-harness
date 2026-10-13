import sys, os, json
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analyze import decode, lufs, SR
from edit import write24
ff, outdir = sys.argv[1], sys.argv[2]
for spec in sys.argv[3:]:
    src, name = spec.split('=>')
    x = decode(ff, src)
    a = np.abs(x).max(axis=1); pk = a.max()
    on = max(0, np.argmax(a > pk * 10 ** (-50 / 20)) - int(0.005 * SR))
    end = len(a) - np.argmax(a[::-1] > pk * 10 ** (-60 / 20))
    end = min(len(a), end + int(0.05 * SR))
    y = x[on:end].copy()
    f = min(int(0.05 * SR), len(y) // 4)
    y[-f:] *= np.linspace(1, 0, f)[:, None]
    y[:int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))[:, None]
    y *= 10 ** (-1 / 20) / np.abs(y).max()
    write24(os.path.join(outdir, name), y)
    print(json.dumps({'file': name, 'src': os.path.basename(src), 'dur': round(len(y) / SR, 2),
                      'sync_peak_s': round(float(np.argmax(np.abs(y).max(axis=1)) / SR), 2),
                      'lufs': round(lufs(y), 1) if len(y) > 0.5 * SR else None}))
