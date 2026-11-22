"""Elder outfit seated in the mannequin pose, bald + beardless (head comes from the head layer)."""
from edit2 import edit2
T = " Transparent background, output a PNG image with alpha channel."
P = ("Picture 1 is a mannequin sitting cross-legged in meditation: copy its exact pose, exact position, exact size and exact hand placement. "
     "Draw the figure of Picture 2 in that pose, but with a completely bald smooth head and NO beard, NO hair, NO cap, NO hairpin (bare scalp, clean-shaven, eyes closed, neutral face), "
     "wearing exactly the same outfit with all its fine details: teal-blue outer robe with gold-and-jade embroidered borders and shoulder panels, white inner robe with crossed collar, "
     "dark blue and gold embroidered belt with a hanging gold ornament and tassel, wide sleeves with white lining and ornate gold trim, long teal skirt panel with gold dragon embroidery over a white under-skirt, black cloth shoes. "
     "He holds NO weapon; both hands rest on the knees in meditation mudra. Front view, full body.")
for sd in (311, 312, 313):
    edit2('ref/pose/mannequin_body_w.png', P + T, 'ref/chain/elder_seat_s%d.png' % sd, ref2='ref/character/ref_elder.png', seed=sd)
from PIL import Image
sh = Image.new('RGB', (3 * 520, 520), (60, 110, 92))
for i, s in enumerate((311, 312, 313)):
    im = Image.open('ref/chain/elder_seat_s%d.png' % s).convert('RGBA').resize((520, 520)); sh.paste(im, (i * 520, 0), im)
sh.save('preview/_elder_seat.png')
