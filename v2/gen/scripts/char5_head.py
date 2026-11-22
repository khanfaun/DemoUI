import json
import os as _os; _os.makedirs('preview', exist_ok=True)
from PIL import Image
from edit2 import edit2
box=(303,0,743,440); json.dump({'head':box},open('ref/chain/crops.json','w'))
full=Image.open('ref/chain/A_full.png').convert('RGBA')
c=full.crop(box).resize((1024,1024),Image.LANCZOS); w=Image.new('RGBA',c.size,(255,255,255,255)); w.alpha_composite(c); w.convert('RGB').save('ref/chain/head_ref.png')
T=" Keep the exact same position, size, angle and drawing style as the reference. Transparent background, output a PNG image with alpha channel."
P=("Draw ONLY the head of this character: just the face and the hair. Completely remove the neck, shoulders, chest, body and robe (transparent). "
   "Keep the same face, eyes gently closed, same eyebrows, same nose and lips, and the same long glossy black hair gathered in a small topknot with the gold hairpin and ribbon, with the long strands on both sides. "
   "Higher detail: fine individual hair strands with soft highlights, clean smooth skin shading, detailed gold ornament.")
for sd in (31,32,33):
    edit2('ref/chain/head_ref.png',P+T,'ref/chain/head_s%d.png'%sd,seed=sd)
x0,y0,x1,y1=box; hands=Image.open('final/character/hands/L_hands.webp').convert('RGBA'); tiles=[]
for s in (31,32,33):
    h=Image.open('ref/chain/head_s%d.png'%s).convert('RGBA').resize((x1-x0,y1-y0),Image.LANCZOS)
    cv=Image.new('RGBA',(1024,1024),(0,0,0,0)); cv.paste(h,(x0,y0),h)
    c=Image.new('RGBA',(1024,1024),(60,110,92,255)); c.alpha_composite(Image.open('final/character/hero/outfit/B_outfit.webp').convert('RGBA')); c.alpha_composite(cv); c.alpha_composite(hands)
    tiles.append(c.convert('RGB').crop((250,0,774,520)))
sh=Image.new('RGB',(3*524,520))
for i,t in enumerate(tiles): sh.paste(t,(i*524,0))
sh.save('preview/_headcomp.png')
