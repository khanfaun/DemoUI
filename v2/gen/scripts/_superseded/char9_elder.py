"""Elder head (face + white hair + long beard + cap/hairpin), eyes closed, from ref/character/ref_elder.png."""
import json, os
os.makedirs('preview', exist_ok=True)
from PIL import Image
from edit2 import edit2
src = (352, 0, 672, 320)           # crop box in the 1024 standing ref
full = Image.open('ref/character/ref_elder.png').convert('RGBA')
c = full.crop(src).resize((1024, 1024), Image.LANCZOS)
w = Image.new('RGBA', c.size, (255, 255, 255, 255)); w.alpha_composite(c); w.convert('RGB').save('ref/chain/elder_head_ref.png')
T = " Keep the exact same position, size, angle and drawing style as the reference. Transparent background, output a PNG image with alpha channel."
P = ("Draw ONLY the head of this old man: the face, the long white hair, the long white beard and mustache, the blue cap with the gold hairpin on the topknot. "
     "Completely remove the neck, shoulders, chest, body and robe (transparent); the beard ends in a natural point. "
     "Same face, same wrinkles, same eyebrows, nose and lips. His eyes are fully shut: smooth closed eyelids with a single thin dark eyelash line, "
     "no visible eyeball, no iris, no pupil. Calm peaceful meditation expression. Higher detail: fine individual white hair strands, soft highlights, detailed gold ornament.")
for sd in (301, 302, 303, 304):
    edit2('ref/chain/elder_head_ref.png', P + T, 'ref/chain/elder_s%d.png' % sd, seed=sd)
box = (303, 0, 743, 440); x0, y0, x1, y1 = box
hands = Image.open('final/character/hands/L_hands.png').convert('RGBA'); tiles = []
for s in (301, 302, 303, 304):
    h = Image.open('ref/chain/elder_s%d.png' % s).convert('RGBA').resize((x1 - x0, y1 - y0), Image.LANCZOS)
    cv = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0)); cv.paste(h, (x0, y0), h)
    cc = Image.new('RGBA', (1024, 1024), (60, 110, 92, 255)); cc.alpha_composite(Image.open('final/character/hero/outfit/B_outfit.png').convert('RGBA')); cc.alpha_composite(cv); cc.alpha_composite(hands)
    tiles.append(cc.convert('RGB').crop((250, 0, 774, 520)))
sh = Image.new('RGB', (4 * 524, 520))
for i, t in enumerate(tiles): sh.paste(t, (i * 524, 0))
sh.save('preview/_elder_comp.png')
