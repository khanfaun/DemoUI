"""ELDER E1: the old man of ref_elder.png sitting in meditation, FULL figure (head + hair + beard + outfit + hands), eyes shut.
Head and outfit layers are both cut from this one image, so neck / hair / shoulders line up."""
import os
os.makedirs('preview', exist_ok=True)
from PIL import Image
from edit2 import edit2
T = " Transparent background, output a PNG image with alpha channel."
P = ("Picture 1 is a mannequin sitting cross-legged in meditation: copy its exact pose, exact position, exact size and exact hand placement. "
     "Draw the old man of Picture 2 (over 70 years old) in that pose: the same wrinkled face, the same long white hair combed back into a topknot with the small blue cap and the gold hairpin, "
     "long white hair falling behind his shoulders, the same long white beard and mustache hanging down over his chest. "
     "His eyes are fully shut: smooth closed eyelids with a thin eyelash line, no eyeball, no iris, no pupil; calm peaceful expression. "
     "He wears exactly the same outfit with all its fine details: teal-blue outer robe with gold-and-jade embroidered borders and shoulder panels, white inner robe with crossed collar, "
     "dark blue and gold embroidered belt with a hanging gold ornament and tassel, wide sleeves with white lining and ornate gold trim, long teal front panel with gold embroidery over a white under-skirt, black cloth shoes. "
     "He holds NO weapon; both hands rest on the knees in meditation mudra. Front view, full body.")
SEEDS = (331, 332, 333, 334)
for sd in SEEDS:
    edit2('ref/pose/mannequin_body_w.png', P + T, 'ref/chain/elder_full_s%d.png' % sd, ref2='ref/character/ref_elder.png', seed=sd)
sh = Image.new('RGB', (len(SEEDS) * 512, 512), (60, 110, 92))
for i, s in enumerate(SEEDS):
    im = Image.open('ref/chain/elder_full_s%d.png' % s).convert('RGBA').resize((512, 512), Image.LANCZOS); sh.paste(im, (i * 512, 0), im)
sh.save('preview/_elder_full.png')
