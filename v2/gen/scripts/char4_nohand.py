from edit2 import edit2
from PIL import Image
T=" Keep everything else exactly identical: same outfit, same sash, same tassels, same boots, same bracers, same head, same pose, same position, same size. Transparent background, output a PNG image with alpha channel."
w=Image.new('RGBA',(1024,1024),(255,255,255,255)); w.alpha_composite(Image.open('ref/chain/A_outfit.png').convert('RGBA')); w.convert('RGB').save('ref/chain/A_outfit_w.png')
P="Remove BOTH hands completely from this figure: no hands, no fingers, no thumbs and no wrists skin at all. Each arm and its dark green gold-trimmed bracer simply ends at the end of the bracer with a clean straight cut-off edge, and the empty space beyond it is transparent (the knees and trousers stay visible behind)."
for sd in (101,102,103):
    edit2('ref/chain/A_outfit_w.png',P+T,'ref/chain/nohand_s%d.png'%sd,seed=sd)
hands=Image.open('final/character/hands/L_hands.webp').convert('RGBA')
sh=Image.new('RGB',(3*480,330),(60,110,92))
for i,s in enumerate((101,102,103)):
    c=Image.new('RGBA',(1024,1024),(60,110,92,255)); c.alpha_composite(Image.open('ref/chain/nohand_s%d.png'%s).convert('RGBA'))
    L=c.crop((100,600,420,820)).resize((480,330)); sh.paste(L.convert('RGB'),(i*480,0))
sh.save('preview/_nohand.png')
