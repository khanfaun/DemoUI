"""ELDER E2: align the chosen full figure to the shared hands layer, then E3: remove the head (keep only the neck)."""
import sys
import numpy as np, cv2
from PIL import Image
from edit2 import edit2
S = 1024
FULL = 'ref/chain/elder_full_s333.png'          # chosen in E1


def hand_centres(img, lower=0.5, min_area=500, skin_only=True):
    a = np.asarray(img.convert('RGBA')).astype(int); R, G, B, A = [a[..., i] for i in range(4)]
    m = (A > 128)
    if skin_only: m &= (R > 150) & (R > G + 12) & (G > B + 4) & (R - B > 30)
    m[:int(S * lower)] = False; m[int(S * 0.9):] = False
    n, lab, st, cen = cv2.connectedComponentsWithStats(m.astype(np.uint8))
    comps = sorted([(st[i, 4], cen[i]) for i in range(1, n) if st[i, 4] > min_area], key=lambda t: -t[0])[:2]
    return sorted([c for _, c in comps], key=lambda c: c[0])


(o1, o2) = hand_centres(Image.open('final/character/hands/L_hands.webp'), skin_only=False)
(n1, n2) = hand_centres(Image.open(FULL))
s = np.linalg.norm(o2 - o1) / np.linalg.norm(n2 - n1); t = (o1 + o2) / 2 - s * (n1 + n2) / 2
M = np.array([[s, 0, t[0]], [0, s, t[1]]], np.float32); print('scale', round(s, 3), 't', t.round(1))
im = np.asarray(Image.open(FULL).convert('RGBA'))
Image.fromarray(cv2.warpAffine(im, M, (S, S), flags=cv2.INTER_LANCZOS4, borderValue=(0, 0, 0, 0))).save('ref/chain/elder_A_full.png')
w = Image.new('RGBA', (S, S), (255, 255, 255, 255)); w.alpha_composite(Image.open('ref/chain/elder_A_full.png')); w.convert('RGB').save('ref/chain/elder_A_full_w.png')

T = " Keep everything else exactly identical: same outfit, same collar, same belt, same sleeves, same hands, same pose, same position, same size. Transparent background, output a PNG image with alpha channel."
P = ("Remove the whole head of this figure: no face, no hair, no beard, no mustache, no cap and no hairpin at all. "
     "Keep only the bare neck rising from the collar, ending with a clean flat cut a little above the collar; everything above it is transparent. "
     "Where the long beard and hair covered the chest and shoulders, draw the robe normally: the white crossed inner collar and the teal robe with its gold embroidered borders.")
SEEDS = (341, 342, 343)
for sd in SEEDS:
    edit2('ref/chain/elder_A_full_w.png', P + T, 'ref/chain/elder_neck_s%d.png' % sd, seed=sd)
sh = Image.new('RGB', (len(SEEDS) * 512, 512), (60, 110, 92))
for i, sd in enumerate(SEEDS):
    c = Image.open('ref/chain/elder_neck_s%d.png' % sd).convert('RGBA').crop((256, 0, 768, 512)); sh.paste(c, (i * 512, 0), c)
sh.save('preview/_elder_neck.png')
