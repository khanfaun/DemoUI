"""ELDER E5: cut the head (face + hair + beard + cap) straight out of the aligned full figure by comparing it with the neck-only outfit.
No redraw -> head, hair and shoulders line up exactly with the outfit. Also writes the outfit and a static-face mask.
Outputs (final/character/elder/):  outfit/O_e1.webp  hair/H_e1.webp (whole head)  hair/F_e1.webp (face+ears mask, white)"""
import os, json
import numpy as np, cv2
from PIL import Image
S = 1024
FULL, NECK, NOHAND = 'ref/chain/elder_A_full.png', 'ref/chain/elder_neck_s342.png', 'ref/chain/elder_nohand_s351.png'
os.makedirs('final/character/elder/hair', exist_ok=True); os.makedirs('final/character/elder/outfit', exist_ok=True)
k = lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))
F = np.asarray(Image.open(FULL).convert('RGBA')).astype(np.int32)
N = np.asarray(Image.open(NECK).convert('RGBA')).astype(np.int32)


def onwhite(a):
    al = a[..., 3:4] / 255.0; return a[..., :3] * al + 255 * (1 - al)


d = np.abs(onwhite(F) - onwhite(N)).max(-1)
yy = np.mgrid[0:S, 0:S][0]
above = ((F[..., 3] > 100) & (N[..., 3] < 100))                      # head pixels above the neck cut
diff = (d > 40) & (yy < 560)                                           # hair / beard over the robe
m = (above | diff).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, k(3)); m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k(9))
n, lab, st, _ = cv2.connectedComponentsWithStats(m)
seed_ids = set(np.unique(lab[above & (lab > 0)]).tolist())
keep = np.zeros_like(m)
for i in seed_ids:
    if st[i, 4] > 200: keep[lab == i] = 1
ff = keep.copy(); mk = np.zeros((S + 2, S + 2), np.uint8); cv2.floodFill(ff, mk, (0, 0), 1); keep = keep | (1 - ff)   # fill holes
# the white beard over the white inner robe is invisible to the diff -> close the beard with the convex hull of its detected part
R0, G0, B0 = F[..., 0], F[..., 1], F[..., 2]
sk = ((keep > 0) & (R0 > 150) & (R0 > G0 + 12) & (G0 > B0 + 4) & (R0 - B0 > 30)).astype(np.uint8)
n2, lab2, st2, _ = cv2.connectedComponentsWithStats(sk); j = 1 + int(np.argmax(st2[1:, 4])); sx, sy, sw, shh = st2[j, :4]
chin = sy + shh                                                        # bottom of the face skin
band = np.zeros_like(keep); band[chin - 10:, int(sx + sw * 0.05):int(sx + sw * 0.95)] = 1
pts = cv2.findNonZero((keep & band).astype(np.uint8))
hull = np.zeros_like(keep); cv2.fillConvexPoly(hull, cv2.convexHull(pts), 1)
print('chin', chin, 'beard hull bbox', cv2.boundingRect(pts))
keep = keep | hull
soft = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 1.2)
head_a = (F[..., 3] * soft).clip(0, 255).astype(np.uint8)
head = np.dstack([F[..., :3].astype(np.uint8), head_a])
Image.fromarray(head).save('final/character/elder/hair/H_e1.webp', 'WEBP', lossless=True, quality=100, method=4, exact=True)
bb = Image.fromarray(head_a).point(lambda v: 255 if v > 10 else 0).getbbox(); print('head bbox', bb)

# face + ears (static part): skin pixels inside the head, biggest blob near the top, as a soft ellipse
R, G, B = F[..., 0], F[..., 1], F[..., 2]
skin = ((keep > 0) & (R > 150) & (R > G + 12) & (G > B + 4) & (R - B > 30) & (yy < bb[1] + (bb[3] - bb[1]) * 0.6)).astype(np.uint8)
skin = cv2.morphologyEx(skin, cv2.MORPH_OPEN, k(3))
n, lab, st, cen = cv2.connectedComponentsWithStats(skin); i = 1 + int(np.argmax(st[1:, 4])); fx, fy, fw, fh = st[i, :4]
xs = np.where(skin.any(0))[0]; ear_l, ear_r = xs.min(), xs.max()                     # ears are separate skin blobs on the sides
FX, FY = fx + fw / 2, fy + fh / 2; FRX = max(fw / 2, (ear_r - ear_l) / 2) + 8; FRY = fh / 2 + 18
xx = np.mgrid[0:S, 0:S][1]
face = ((((xx - FX) / FRX) ** 2 + ((yy - FY) / FRY) ** 2) <= 1).astype(np.float32)
face = cv2.GaussianBlur(face, (0, 0), 3)
fm = np.dstack([np.full((S, S, 3), 255, np.uint8), (face * 255).astype(np.uint8)])
Image.fromarray(fm).save('final/character/elder/hair/F_e1.webp', 'WEBP', lossless=True, quality=100, method=4, exact=True)
json.dump({'face_ellipse': [round(float(FX)), round(float(FY)), round(float(FRX)), round(float(FRY))], 'head_bbox': bb}, open('ref/chain/elder_head.json', 'w'))
print('face ellipse', round(FX), round(FY), round(FRX), round(FRY))
Image.open(NOHAND).save('final/character/elder/outfit/O_e1.webp', 'WEBP', lossless=True, quality=100, method=4, exact=True)

# previews: head alone / head over outfit + hands / original full
hands = Image.open('final/character/hands/L_hands.webp').convert('RGBA')
def bg(): return Image.new('RGBA', (S, S), (60, 110, 92, 255))
a = bg(); a.alpha_composite(Image.fromarray(head))
b = bg(); b.alpha_composite(Image.open(NOHAND).convert('RGBA')); b.alpha_composite(Image.fromarray(head)); b.alpha_composite(hands)
c = bg(); c.alpha_composite(Image.open(FULL).convert('RGBA'))
sh = Image.new('RGB', (3 * 600, 640))
for i, im in enumerate((a, b, c)): sh.paste(im.convert('RGB').crop((212, 0, 812, 640)), (i * 600, 0))
sh.save('preview/_elder_head.png')
