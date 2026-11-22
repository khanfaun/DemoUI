import numpy as np, cv2
import os as _os; _os.makedirs('preview', exist_ok=True)
from PIL import Image
S=1024
def hand_centres(img, lower=0.55, min_area=500, skin_only=True):
    a=np.asarray(img.convert('RGBA')).astype(int); R,G,B,A=[a[...,i] for i in range(4)]
    m=(A>128)
    if skin_only: m&=(R>150)&(R>G+12)&(G>B+4)&(R-B>30)
    m[:int(S*lower)]=False; m[int(S*0.9):]=False
    n,lab,st,cen=cv2.connectedComponentsWithStats(m.astype(np.uint8))
    comps=sorted([(st[i,4],cen[i]) for i in range(1,n) if st[i,4]>min_area],key=lambda t:-t[0])[:2]
    comps=sorted([c for _,c in comps],key=lambda c:c[0]); return comps
old=hand_centres(Image.open('final/character/hands/L_hands.webp'),lower=0.5,skin_only=False)
new=hand_centres(Image.open('ref/chain/bald_s91.png'),lower=0.5)
print('old hands',old,'new hands',new)
(o1,o2),(n1,n2)=old,new
s=np.linalg.norm(o2-o1)/np.linalg.norm(n2-n1)
# map: p_old = s*p_new + t, using midpoints
t=(o1+o2)/2 - s*(n1+n2)/2
M=np.array([[s,0,t[0]],[0,s,t[1]]],np.float32); print('scale',round(s,3),'t',t)
for src,dst in (('ref/chain/bald_s91.png','ref/chain/A_outfit.png'),('ref/chain/seat_s82.png','ref/chain/A_full.png')):
    im=np.asarray(Image.open(src).convert('RGBA'))
    out=cv2.warpAffine(im,M,(S,S),flags=cv2.INTER_LANCZOS4,borderMode=cv2.BORDER_CONSTANT,borderValue=(0,0,0,0))
    Image.fromarray(out).save(dst)
hands=Image.open('final/character/hands/L_hands.webp').convert('RGBA')
c=Image.new('RGBA',(S,S),(60,110,92,255)); c.alpha_composite(Image.open('ref/chain/A_outfit.png')); c.alpha_composite(hands)
c.convert('RGB').resize((700,700)).save('preview/_aligned.png')
z=c.convert('RGB'); L=z.crop((100,600,420,820)).resize((480,330)); R=z.crop((620,600,940,820)).resize((480,330))
sh=Image.new('RGB',(960,330)); sh.paste(L,(0,0)); sh.paste(R,(480,0)); sh.save('preview/_aligned_hands.png')
