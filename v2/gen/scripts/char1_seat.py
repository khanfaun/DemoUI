from edit2 import edit2
T=" Transparent background, output a PNG image with alpha channel."
P=("Picture 1 is a mannequin sitting cross-legged in meditation: copy its exact pose, exact position, exact size and exact hand placement. "
   "Draw the character of Picture 2 in that pose: the same handsome face, the same long black hair with the small topknot and the gold hairpin with a ribbon, and the exact same outfit with all its fine details: "
   "layered jade-green and white robe with gold embroidered trim and dragon patterns, the green sash with gold knot ornaments and hanging jade tassels, dark green gold-trimmed bracers on both forearms, "
   "wide white translucent sleeves, green trousers and black boots with gold trim. He holds NO weapon and NO sword; both hands rest on the knees in meditation mudra. Front view, eyes closed, full body.")
for sd in (81,82,83):
    edit2('ref/pose/mannequin_body_w.png',P+T,'ref/chain/seat_s%d.png'%sd,ref2='ref/character/ref_standing.png',seed=sd)
