"""Film QA: decode a render with Remotion's bundled ffmpeg and measure it.

usage:
  python3.11 -I tools/qa.py sheet  video.mp4 out.png [every_n_frames] [cols]
  python3.11 -I tools/qa.py motion video.mp4 [cuts_s,comma,separated]
  python3.11 -I tools/qa.py frames video.mp4 outdir t1,t2,...   (full-res PNG stills)

motion: per-frame mean abs luminance difference (proxy for image change) plus a global
optical-flow estimate (phase correlation) → screen speed px/frame and its change between
frames (judder/pop detector). Flags spikes that aren't at declared cuts.
"""
import os
import subprocess
import sys
import zlib
import struct
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFDIR = os.path.join(ROOT, 'node_modules', '@remotion', 'compositor-darwin-arm64')
FF = os.path.join(FFDIR, 'ffmpeg')
ENV = dict(os.environ, DYLD_LIBRARY_PATH=FFDIR)


def probe(path):
    out = subprocess.run([os.path.join(FFDIR, 'ffprobe'), '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_frames', '-of', 'csv=p=0', path], capture_output=True, text=True, env=ENV).stdout.strip()
    w, h, r, n = out.split(',')
    a, b = r.split('/')
    return int(w), int(h), float(a) / float(b), int(n) if n.isdigit() else None


def frames(path, w, h, gray=True):
    pix = 'gray' if gray else 'rgb24'
    ch = 1 if gray else 3
    p = subprocess.Popen([FF, '-v', 'error', '-i', path, '-vf', f'scale={w}:{h}', '-f', 'image2pipe', '-c:v', 'rawvideo', '-pix_fmt', pix, '-'], stdout=subprocess.PIPE, env=ENV)
    size = w * h * ch
    while True:
        buf = p.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, np.uint8).reshape(h, w, ch) if ch == 3 else np.frombuffer(buf, np.uint8).reshape(h, w)


def write_png(path, img):
    h, w = img.shape[:2]
    if img.ndim == 2:
        img = np.stack([img] * 3, -1)
    raw = b''.join(b'\x00' + img[y].tobytes() for y in range(h))
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 6)) + chunk(b'IEND', b'')
    open(path, 'wb').write(png)


def sheet(path, out, every=24, cols=5):
    W, H, fps, _ = probe(path)
    tw, th = 384, int(384 * H / W) // 2 * 2
    tiles = [f.copy() for i, f in enumerate(frames(path, tw, th, gray=False)) if i % every == 0]
    rows = (len(tiles) + cols - 1) // cols
    canvas = np.zeros((rows * (th + 4), cols * (tw + 4), 3), np.uint8)
    for k, t in enumerate(tiles):
        r, c = divmod(k, cols)
        canvas[r * (th + 4):r * (th + 4) + th, c * (tw + 4):c * (tw + 4) + tw] = t
    write_png(out, canvas)
    print(f'{len(tiles)} tiles, every {every} frames ({every / fps:.2f}s)')


def phase_shift(a, b):
    """Global translation between two frames by phase correlation (sub-pixel-ish)."""
    A = np.fft.fft2(a * np.hanning(a.shape[0])[:, None] * np.hanning(a.shape[1])[None, :])
    B = np.fft.fft2(b * np.hanning(b.shape[0])[:, None] * np.hanning(b.shape[1])[None, :])
    R = A * np.conj(B)
    R /= np.abs(R) + 1e-9
    r = np.fft.ifft2(R).real
    y, x = np.unravel_index(np.argmax(r), r.shape)
    if y > a.shape[0] // 2:
        y -= a.shape[0]
    if x > a.shape[1] // 2:
        x -= a.shape[1]
    return x, y


def motion(path, cuts=()):
    W, H, fps, _ = probe(path)
    w, h = 480, int(480 * H / W) // 2 * 2
    scale = W / w
    prev = None
    diffs, shifts = [], []
    for f in frames(path, w, h):
        g = f.astype(np.float32)
        if prev is not None:
            diffs.append(np.abs(g - prev).mean())
            shifts.append(phase_shift(prev, g))
        prev = g
    d = np.array(diffs)
    s = np.array(shifts, float) * scale
    speed = np.hypot(s[:, 0], s[:, 1])
    cut_frames = {int(round(c * fps)) - 1 for c in cuts}
    med = np.median(d) + 1e-6
    print(f'{len(d) + 1} frames @ {fps:g} fps; diff median {med:.2f}, p95 {np.percentile(d, 95):.2f}, max {d.max():.2f}')
    print(f'global screen speed px/frame: median {np.median(speed):.1f}, p95 {np.percentile(speed, 95):.1f}, max {speed.max():.1f}')
    flagged = []
    for i in range(2, len(d) - 2):
        local = np.median(d[max(0, i - 6):i + 7])
        if d[i] > 3.0 * local + 1.0 and i not in cut_frames:
            flagged.append((i + 1, d[i], local))
    for i in range(1, len(speed)):
        if abs(speed[i] - speed[i - 1]) > 6 and i not in cut_frames and (i - 1) not in cut_frames:
            flagged.append((i + 1, speed[i], speed[i - 1]))
    print('per-second diff:', ' '.join(f'{d[int(k * fps):int((k + 1) * fps)].mean():.1f}' for k in range(int(len(d) / fps))))
    if flagged:
        print('FLAGS (frame, value, local):')
        for fl in flagged[:40]:
            print('  ', fl[0], f'{fl[1]:.2f}', f'{fl[2]:.2f}', f't={fl[0] / fps:.2f}s')
    else:
        print('no pops/judder flags')


def stills(path, outdir, times):
    W, H, fps, _ = probe(path)
    want = {int(round(float(t) * fps)): t for t in times}
    os.makedirs(outdir, exist_ok=True)
    for i, f in enumerate(frames(path, W, H, gray=False)):
        if i in want:
            write_png(os.path.join(outdir, f'f{i:05d}.png'), f)


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'sheet':
        sheet(sys.argv[2], sys.argv[3], int(sys.argv[4]) if len(sys.argv) > 4 else 24, int(sys.argv[5]) if len(sys.argv) > 5 else 5)
    elif cmd == 'motion':
        motion(sys.argv[2], [float(c) for c in sys.argv[3].split(',')] if len(sys.argv) > 3 and sys.argv[3] else [])
    elif cmd == 'frames':
        stills(sys.argv[2], sys.argv[3], sys.argv[4].split(','))
