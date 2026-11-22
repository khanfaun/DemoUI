"""Place the new hero head on the 1024 canvas, fade the cut strand ends, split into face / hair / ornament."""
import json
import numpy as np, cv2
from PIL import Image
S = 1024
x0, y0, x1, y1 = json.load(open('ref/chain/crops.json'))['head']
k = lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))
h = Image.open('ref/chain/headc_s202.png').convert('RGBA').resize((x1 - x0, y1 - y0), Image.LANCZOS)
cv = Image.new('RGBA', (S, S), (0, 0, 0, 0)); cv.paste(h, (x0, y0), h)
A = np.asarray(cv).astype(np.int32); R, G, B, AL = A[..., 0], A[..., 1], A[..., 2], A[..., 3]
fade = np.clip((y1 - np.arange(S)[:, None]) / 70.0, 0, 1)            # hair strands cut by the crop edge fade out
AL = (AL * fade).astype(np.int32)
skin = ((AL > 128) & (R > 140) & (R > G + 12) & (G > B + 4) & (R - B > 30)).astype(np.uint8)
n, lab, st, _ = cv2.connectedComponentsWithStats(skin)
big = 1 + int(np.argmax(st[1:, 4])); bx, by, bw, bh = st[big, :4]
face = np.zeros_like(skin)
for i in range(1, n):
    x, y, w, hh, a = st[i]
    if a > 40 and y < by + bh and y + hh > by and x > bx - bw * .35 and x + w < bx + bw * 1.35:
        face[lab == i] = 1
face = cv2.morphologyEx(face, cv2.MORPH_CLOSE, k(17))
ff = face.copy(); mk = np.zeros((S + 2, S + 2), np.uint8); cv2.floodFill(ff, mk, (0, 0), 1); face = face | (1 - ff)
face = cv2.morphologyEx(face, cv2.MORPH_OPEN, k(3))
hsv = cv2.cvtColor(A[..., :3].astype(np.uint8), cv2.COLOR_RGB2HSV).astype(int)
gold = ((AL > 60) & (hsv[..., 0] >= 12) & (hsv[..., 0] <= 36) & (hsv[..., 1] > 70) & (hsv[..., 2] > 90)).astype(np.uint8)
gold = gold & (1 - face); gold = cv2.morphologyEx(gold, cv2.MORPH_CLOSE, k(5))
nn, lb, stt, _ = cv2.connectedComponentsWithStats(gold); gg = np.zeros_like(gold)
for i in range(1, nn):
    if stt[i, 4] >= 25: gg[lb == i] = 1
orn = cv2.GaussianBlur(cv2.dilate(gg, k(3)).astype(np.float32), (0, 0), 0.7)
fa = cv2.GaussianBlur(face.astype(np.float32), (0, 0), 0.8)
alpha = AL.astype(np.float32) / 255; rgb = A[..., :3].astype(np.uint8)
Image.fromarray(np.dstack([rgb, (alpha * fa * 255).astype(np.uint8)])).save('final/character/hero/hair/L_face_r1.webp', 'WEBP', lossless=True, quality=100, method=4, exact=True)
Image.fromarray(np.dstack([rgb, (alpha * (1 - fa) * (1 - orn) * 255).astype(np.uint8)])).save('final/character/hero/hair/L_hair_r1.webp', 'WEBP', lossless=True, quality=100, method=4, exact=True)
Image.fromarray(np.dstack([rgb, (alpha * (1 - fa) * orn * 255).astype(np.uint8)])).save('final/character/hero/hair/L_orn_r1.webp', 'WEBP', lossless=True, quality=100, method=4, exact=True)
print('face px', int(face.sum()), 'ornament px', int(gg.sum()))
