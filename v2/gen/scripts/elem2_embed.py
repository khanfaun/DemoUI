"""Embed the 86 game element images (final/elements/*.webp) into window.IMG of the game page, resized to each key's display size.
Only the game keys are touched (bd-, cau-, dd-, de-, it-, mo-, mt-, sk-); the character keys (ch-*, nv-nam) are left alone.
Run:  python scripts/elem2_embed.py                  (dry run: compares with what the page already contains, writes nothing)
      python scripts/elem2_embed.py --write          (updates ../../f-ngoc-hanh-trinh.html)
      python scripts/elem2_embed.py --write --base   (updates the base page ../../f-ngoc-hanh-trinh.html.bak2 that char8_build_page.py starts from)
"""
import base64, io, json, re, sys
import numpy as np
from PIL import Image

PAGE = '../../f-ngoc-hanh-trinh.html.bak2' if '--base' in sys.argv else '../../f-ngoc-hanh-trinh.html'
s = open(PAGE, encoding='utf8').read()
m = re.search(r'window\.IMG=(\{.*?\});?\s*</script>', s, re.S)
d = json.loads(m.group(1))
GAME = [k for k in d if not k.startswith(('ch-', 'nv-'))]


def decode(v): return Image.open(io.BytesIO(base64.b64decode(v.split(',', 1)[1]))).convert('RGBA')
def encode(im): b = io.BytesIO(); im.save(b, 'WEBP', quality=88, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()


def build(key, w, h):
    im = Image.open('final/elements/%s.webp' % key).convert('RGBA')
    if key.startswith('dd-'):                                      # scenes: fill the frame (cover + centre crop)
        r = max(w / im.width, h / im.height); im = im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)
        l, t = (im.width - w) // 2, (im.height - h) // 2
        return im.crop((l, t, l + w, t + h)).convert('RGB').convert('RGBA')
    pad = 0.05
    bb = im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    if bb: im = im.crop(bb)                                         # icons / characters: trim transparent margin, fit with padding
    r = min(w * (1 - 2 * pad) / im.width, h * (1 - 2 * pad) / im.height)
    im = im.resize((max(1, round(im.width * r)), max(1, round(im.height * r))), Image.LANCZOS)
    cv = Image.new('RGBA', (w, h), (0, 0, 0, 0)); cv.paste(im, ((w - im.width) // 2, (h - im.height) // 2), im); return cv


diffs = []
for k in GAME:
    cur = decode(d[k]); new = build(k, *cur.size)
    flat = lambda im: np.asarray(Image.alpha_composite(Image.new('RGBA', im.size, (128, 128, 128, 255)), im).convert('RGB')).astype(float)
    diffs.append(float(np.abs(flat(cur) - flat(new)).mean()))      # compared over mid-grey so transparent pixels do not count
    if '--write' in sys.argv: d[k] = encode(new)
print('keys', len(GAME), '| mean abs RGB difference vs page: avg %.1f, max %.1f' % (np.mean(diffs), np.max(diffs)))
if '--write' in sys.argv:
    open(PAGE, 'w', encoding='utf8').write(s[:m.start(1)] + json.dumps(d, ensure_ascii=False) + s[m.end(1):]); print('page updated')
