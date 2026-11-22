"""ELDER E4: remove the hands from the neck-only outfit (hands come from the shared layer). Also reports drift vs the aligned full figure."""
import os, shutil
import numpy as np, cv2
from PIL import Image
from edit2 import edit2
S = 1024
NECK = 'ref/chain/elder_neck_s342.png'          # chosen in E3


def drift(a, b, y0=560, y1=1000):
    """translation of b relative to a, measured on the lower body (should stay unchanged)."""
    g = lambda p: cv2.cvtColor(np.asarray(Image.open(p).convert('RGB')), cv2.COLOR_RGB2GRAY)[y0:y1].astype(np.float32)
    (dx, dy), r = cv2.phaseCorrelate(g(a), g(b)); return round(dx, 2), round(dy, 2), round(r, 2)


print('neck vs full drift', drift('ref/chain/elder_A_full.png', NECK))
w = Image.new('RGBA', (S, S), (255, 255, 255, 255)); w.alpha_composite(Image.open(NECK).convert('RGBA')); w.convert('RGB').save('ref/chain/elder_neck_w.png')
T = " Keep everything else exactly identical: same outfit, same neck, same belt, same tassel, same shoes, same sleeves, same pose, same position, same size. Transparent background, output a PNG image with alpha channel."
P = ("Remove BOTH hands completely from this figure: no hands, no fingers, no thumbs and no wrist skin at all. Each wide sleeve with its white lining and gold trim simply ends at the cuff with a clean edge, "
     "and the empty space beyond it is transparent (the knees and trousers stay visible behind).")
SEEDS = (351, 352, 353)
for sd in SEEDS:
    edit2('ref/chain/elder_neck_w.png', P + T, 'ref/chain/elder_nohand_s%d.png' % sd, seed=sd)
for sd in SEEDS:
    print(sd, 'drift', drift(NECK, 'ref/chain/elder_nohand_s%d.png' % sd))
hands = Image.open('final/character/hands/L_hands.webp').convert('RGBA')
sh = Image.new('RGB', (len(SEEDS) * 512, 512), (60, 110, 92))
for i, sd in enumerate(SEEDS):
    c = Image.new('RGBA', (S, S), (60, 110, 92, 255)); c.alpha_composite(Image.open('ref/chain/elder_nohand_s%d.png' % sd).convert('RGBA')); c.alpha_composite(hands)
    sh.paste(c.convert('RGB').resize((512, 512), Image.LANCZOS), (i * 512, 0))
sh.save('preview/_elder_nohand.png')
