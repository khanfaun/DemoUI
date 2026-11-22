"""Elder outfit: align to existing hands (B3 logic) then remove hands (B4 logic). Chosen seat seed 312."""
import numpy as np, cv2, os
from PIL import Image
from edit2 import edit2
S = 1024; SEAT = 'ref/chain/elder_seat_s312.png'
exec(open('scripts/char3_align.py').read().split('old=hand_centres')[0].split('S=1024')[1])   # reuse hand_centres()
old = hand_centres(Image.open('final/character/hands/L_hands.png'), lower=0.5, skin_only=False)
new = hand_centres(Image.open(SEAT), lower=0.5)
(o1, o2), (n1, n2) = old, new
s = np.linalg.norm(o2 - o1) / np.linalg.norm(n2 - n1); t = (o1 + o2) / 2 - s * (n1 + n2) / 2
M = np.array([[s, 0, t[0]], [0, s, t[1]]], np.float32); print('scale', round(s, 3), 't', t)
im = np.asarray(Image.open(SEAT).convert('RGBA'))
Image.fromarray(cv2.warpAffine(im, M, (S, S), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))).save('ref/chain/elder_A_outfit.png')
w = Image.new('RGBA', (S, S), (255, 255, 255, 255)); w.alpha_composite(Image.open('ref/chain/elder_A_outfit.png').convert('RGBA')); w.convert('RGB').save('ref/chain/elder_A_outfit_w.png')
T = " Keep everything else exactly identical: same outfit, same belt, same tassel, same shoes, same sleeves, same pose, same position, same size. Transparent background, output a PNG image with alpha channel."
P = ("Remove BOTH hands completely from this figure: no hands, no fingers, no thumbs and no wrist skin at all. Each wide sleeve with its white lining and gold trim simply ends at the cuff with a clean cut-off edge, "
     "and the empty space beyond it is transparent (the knees and trousers stay visible behind).")
for sd in (321, 322, 323):
    edit2('ref/chain/elder_A_outfit_w.png', P + T, 'ref/chain/elder_nohand_s%d.png' % sd, seed=sd)
sh = Image.new('RGB', (3 * 480, 330), (60, 110, 92))
for i, sd in enumerate((321, 322, 323)):
    c = Image.new('RGBA', (S, S), (60, 110, 92, 255)); c.alpha_composite(Image.open('ref/chain/elder_nohand_s%d.png' % sd).convert('RGBA'))
    sh.paste(c.crop((100, 600, 420, 820)).resize((480, 330)).convert('RGB'), (i * 480, 0))
sh.save('preview/_elder_nohand.png')
