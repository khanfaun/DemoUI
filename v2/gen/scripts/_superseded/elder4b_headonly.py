"""ELDER E5b: redraw ONLY the head (face + hair + full beard + cap) on the full 1024 frame of the aligned figure, so position stays,
then measure its offset vs the original face (phase correlation) to make sure it sits on the neck."""
import numpy as np, cv2
from PIL import Image
from edit2 import edit2
S = 1024
T = " Keep the exact same position, size, angle and drawing style as the reference. Transparent background, output a PNG image with alpha channel."
P = ("Draw ONLY the head of this old man: the face, the long white hair, the whole long white beard and mustache down to its pointed tip, the blue cap with the gold hairpin. "
     "Completely remove the neck, shoulders, robe, belt, arms, hands, legs and everything else (transparent). "
     "Same face, same closed eyes, same wrinkles, same eyebrows; fine individual white hair strands.")
SEEDS = (361, 362, 363)
for sd in SEEDS:
    edit2('ref/chain/elder_A_full_w.png', P + T, 'ref/chain/elder_headonly_s%d.png' % sd, seed=sd)
F = np.asarray(Image.open('ref/chain/elder_A_full.png').convert('RGBA'))
box = (420, 90, 590, 240)                                   # face area
g = lambda a: cv2.cvtColor(a[box[1]:box[3], box[0]:box[2], :3], cv2.COLOR_RGB2GRAY).astype(np.float32)
O = np.asarray(Image.open('final/character/elder/outfit/O_e1.png').convert('RGBA'))
hands = Image.open('final/character/hands/L_hands.png').convert('RGBA')
sh = Image.new('RGB', (len(SEEDS) * 2 * 400, 560), (60, 110, 92))
for i, sd in enumerate(SEEDS):
    H = np.asarray(Image.open('ref/chain/elder_headonly_s%d.png' % sd).convert('RGBA'))
    (dx, dy), r = cv2.phaseCorrelate(g(F), g(H)); print(sd, 'offset', round(dx, 2), round(dy, 2), 'resp', round(r, 2))
    a = Image.new('RGBA', (S, S), (60, 110, 92, 255)); a.alpha_composite(Image.fromarray(H))
    b = Image.new('RGBA', (S, S), (60, 110, 92, 255)); b.alpha_composite(Image.fromarray(O)); b.alpha_composite(Image.fromarray(H)); b.alpha_composite(hands)
    sh.paste(a.convert('RGB').crop((312, 0, 712, 560)), (i * 800, 0)); sh.paste(b.convert('RGB').crop((312, 0, 712, 560)), (i * 800 + 400, 0))
sh.save('preview/_elder_headonly.png')
