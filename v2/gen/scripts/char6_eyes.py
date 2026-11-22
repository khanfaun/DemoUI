from edit2 import edit2
from PIL import Image
im=Image.open('ref/chain/head_s32.png').convert('RGBA'); w=Image.new('RGBA',im.size,(255,255,255,255)); w.alpha_composite(im); w.convert('RGB').save('ref/chain/head_s32_w.png')
T=" Keep everything else exactly identical: same face shape, same eyebrows, same nose and lips, same hair, same hairpin, same position, same size. Transparent background, output a PNG image with alpha channel."
P=("Close the eyes completely: both eyes are fully shut with smooth closed eyelids, a single thin dark eyelash line along each closed lid, no visible eyeball, no iris, no pupil and no white of the eye. "
   "Calm peaceful meditation expression.")
for sd in (201,202,203,204):
    edit2('ref/chain/head_s32_w.png',P+T,'ref/chain/headc_s%d.png'%sd,seed=sd)
fs=['ref/chain/head_s32.png']+['ref/chain/headc_s%d.png'%s for s in (201,202,203,204)]
sh=Image.new('RGB',(5*360,200),(60,110,92))
for i,f in enumerate(fs):
    im=Image.open(f).convert('RGBA'); w,h=im.size
    c=im.crop((int(w*.30),int(h*.30),int(w*.72),int(h*.50))).resize((356,196)); sh.paste(c,(i*360,0),c)
sh.save('preview/_eyes.png')
