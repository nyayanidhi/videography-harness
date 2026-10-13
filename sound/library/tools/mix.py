"""Rough preview mix: music bed + SFX cues. usage: python -I mix.py FFMPEG plan.json"""
import sys, os, json
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analyze import decode, lufs, SR
from edit import write24
ff, plan = sys.argv[1], json.load(open(sys.argv[2]))
lib = plan['lib']
bed = decode(ff, os.path.join(lib, plan['bed'])) * 10 ** (plan.get('bed_db', 0) / 20)
N = int(60 * SR)
out = np.zeros((N, 2)); out[:min(N, len(bed))] += bed[:N]
for c in plan['cues']:
    x = decode(ff, os.path.join(lib, c['file']))
    # place so that the file's sync point lands on c['t']
    o0 = int(round((c['t'] - c.get('sync', 0.0)) * SR))
    i0 = 0
    if o0 < 0: i0, o0 = -o0, 0
    x = x[i0:] * 10 ** (c.get('db', 0) / 20)
    p = c.get('pan', 0.0)
    x = x * np.array([np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)]) * np.sqrt(2)
    m = min(len(x), N - o0)
    out[o0:o0 + m] += x[:m]
g = 10 ** ((plan.get('target_lufs', -14) - lufs(out)) / 20); out *= g
pk = np.abs(out).max()
if pk > 0.89: out *= 0.89 / pk  # keep headroom; this is a rough preview, not a master
write24(plan['out'], out)
print(plan['out'], 'LUFS', round(lufs(out), 1), 'peak', round(20 * np.log10(np.abs(out).max()), 1))
