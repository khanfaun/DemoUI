p = 'scripts/char8_build_page.py'
s = open(p, encoding='utf8').read()
a = s.index("L = {'ch-of-hero'"); b = s.index("bbs = [b for b in")
s = s[:a] + '''L = {'ch-of-hero': 'final/character/hero/outfit/B_outfit.png',
     'ch-hair-r1': 'final/character/hero/hair/L_hair_r1.png', 'ch-face-r1': 'final/character/hero/hair/L_face_r1.png', 'ch-orn-r1': 'final/character/hero/hair/L_orn_r1.png',
     'ch-hands': 'final/character/hands/L_hands.png',
     # ELDER (70+): outfit with neck only + whole head cut from the same full figure (scripts elder1..elder4)
     'ch-of-e1': 'final/character/elder/outfit/O_e1.png', 'ch-head-e1': 'final/character/elder/hair/H_e1.png', 'ch-fm-e1': 'final/character/elder/hair/F_e1.png'}
import numpy as _np, cv2 as _cv
ims = {k: Image.open(v).convert('RGBA') for k, v in L.items()}
for st in ('r1',):                       # young hero: head = face + hair + ornament layers
    hd = Image.new('RGBA', ims['ch-face-' + st].size, (0, 0, 0, 0))
    for part in ('face', 'hair', 'orn'):
        hd.alpha_composite(ims['ch-%s-%s' % (part, st)])
    ims['ch-head-' + st] = hd
    _fa = (_np.asarray(ims['ch-face-' + st].getchannel('A')) > 40).astype(_np.uint8)
    _fa = _cv.GaussianBlur(_cv.dilate(_fa, _cv.getStructuringElement(_cv.MORPH_ELLIPSE, (25, 25))).astype(_np.float32), (0, 0), 4)
    _ha = _np.asarray(ims['ch-hair-' + st].getchannel('A')).astype(_np.float32)
    mv = Image.new('RGBA', hd.size, (255, 255, 255, 0)); mv.putalpha(Image.fromarray((_ha * (1 - _np.clip(_fa, 0, 1))).astype(_np.uint8))); ims['ch-hmv-' + st] = mv
    ims['ch-hm-' + st] = ims['ch-hair-' + st]
    for part in ('face', 'hair', 'orn'):
        del ims['ch-%s-%s' % (part, st)]
for st in ('e1',):                       # elder: whole head + soft face/ears ellipse -> swaying part = head minus face
    _ha = _np.asarray(ims['ch-head-' + st].getchannel('A')).astype(_np.float32)
    _fa = _np.asarray(ims.pop('ch-fm-' + st).getchannel('A')).astype(_np.float32) / 255
    mv = Image.new('RGBA', ims['ch-head-' + st].size, (255, 255, 255, 0)); mv.putalpha(Image.fromarray((_ha * (1 - _fa)).astype(_np.uint8))); ims['ch-hmv-' + st] = mv
''' + s[b:]
s = s.replace("for k, im in ims.items() if not (k.endswith('-e1') or k == 'ch-of-elder')]", "for k, im in ims.items() if not k.endswith('-e1')]")
s = s.replace("for k, im in pl.items():\n    d[k] = enc(im)", "for k, im in pl.items():\n    if k != 'ch-hm-r1': d[k] = enc(im)")
a = s.index("_he = pl['ch-hm-e1']"); b = s.index('\n', a)
s = s[:a] + "import json as _j; _fe = _j.load(open('ref/chain/elder_head.json'))['face_ellipse']; _pp = place(Image.new('RGBA', (1024, 1024)))\n" \
    "PVXE = ox + (_fe[0] - U[0]) * r; PVYE = oy + (_fe[1] - _fe[3] - U[1]) * r        # elder hair pivot: top of the forehead" + s[b:]
open(p, 'w', encoding='utf8').write(s)
print('ok')
