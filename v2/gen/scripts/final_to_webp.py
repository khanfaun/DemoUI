"""Convert every PNG in final/ (_superseded/ skipped) to LOSSLESS webp next to it, check pixel-identical, then delete the PNG.
A PNG is deleted ONLY when its webp reopens pixel-identical (RGBA). Broken/half-written webp files are redone.
Usage (from v2/gen):  python scripts/final_to_webp.py [--keep-png]"""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, 'scripts')
from webpio import save_webp

keep = '--keep-png' in sys.argv
n = bad = deleted = 0
for root, dirs, files in os.walk('final'):
    dirs[:] = [d for d in dirs if d != '_superseded']
    for f in sorted(files):
        if not f.lower().endswith('.png'): continue
        src = os.path.join(root, f); dst = src[:-4] + '.webp'
        a = np.asarray(Image.open(src).convert('RGBA'))
        ok = False
        for attempt in range(2):
            if attempt or not os.path.exists(dst):
                save_webp(Image.open(src), dst)
            try:
                b = np.asarray(Image.open(dst).convert('RGBA')); ok = a.shape == b.shape and np.array_equal(a, b)
            except Exception:
                ok = False
            if ok: break
        n += 1
        if not ok:
            bad += 1; print('NOT IDENTICAL, PNG kept:', src, flush=True); continue
        if not keep:
            os.remove(src); deleted += 1
        print('ok', dst, flush=True)
left = sum(1 for r, ds, fs in os.walk('final') if '_superseded' not in r for x in fs if x.lower().endswith('.png'))
print('%d PNG checked, %d not identical, %d PNG deleted, PNG left in final/ (without _superseded): %d' % (n, bad, deleted, left))
