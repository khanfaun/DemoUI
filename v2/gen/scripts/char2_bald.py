from edit2 import edit2
from PIL import Image
T=" Transparent background, output a PNG image with alpha channel."
w=Image.new('RGBA',(1024,1024),(255,255,255,255)); w.alpha_composite(Image.open('ref/chain/seat_s82.png').convert('RGBA')); w.convert('RGB').save('ref/chain/seat_w.png')
for sd in (91,92):
    edit2('ref/chain/seat_w.png',"Make this exact same figure completely bald: remove all the hair and the hairpin from the head so the scalp is smooth bare skin, but keep the thick dark eyebrows, closed eyes, the same face, and keep the entire outfit, sash, tassels, bracers, boots, hands, pose, position and size exactly identical."+T,'ref/chain/bald_s%d.png'%sd,seed=sd)
