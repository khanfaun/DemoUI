"""ELDER version. Place the new hero head on the 1024 canvas, fade the cut strand ends, split into face / hair / ornament."""
import json
import numpy as np, cv2
from PIL import Image
S = 1024
x0, y0, x1, y1 = (303, 0, 743, 440)   # same head box as the first hero
k = lambda n: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (n, n))
h = Image.open('ref/chain/elder_s302.png').convert('RGBA').resize((x1 - x0, y1 - y0), Image.LANCZOS)
cv = Image.new('RGBA', (S, S), (0, 0, 0, 0)); cv.paste(h, (x0, y0), h)
A = np.asarray(cv).astype(np.int32); R, G, B, AL = A[..., 0], A[..., 1], A[..., 2], A[..., 3]
fade = np.clip((y1 - np.arange(S)[:, None]) / 70.0, 0, 1)            # hair strands cut by the crop edge fade out
AL = (AL * fade).astype(np.int32)
# geometric face region (elder: colour split is unreliable because of the white beard/mustache)
FX, FY, FRX, FRY = 513, 150, 63, 80
yy, xx = np.mgrid[0:S, 0:S]
face = (((xx - FX) / FRX) ** 2 + ((yy - FY) / FRY) ** 2 <= 1).astype(np.uint8)
hsv = cv2.cvtColor(A[..., :3].astype(np.uint8), cv2.COLOR_RGB2HSV).astype(int)
gold = ((AL > 60) & (hsv[..., 0] >= 15) & (hsv[..., 0] <= 36) & (hsv[..., 1] > 70) & (hsv[..., 2] > 90) & (yy < 75)).astype(np.uint8)
gold = cv2.morphologyEx(gold, cv2.MORPH_CLOSE, k(5))
nn, lb, stt, _ = cv2.connectedComponentsWithStats(gold); gg = np.zeros_like(gold)
for i in range(1, nn):
    if stt[i, 4] >= 25: gg[lb == i] = 1
orn = cv2.GaussianBlur(cv2.dilate(gg, k(3)).astype(np.float32), (0, 0), 0.7)
fa = cv2.GaussianBlur(face.astype(np.float32), (0, 0), 3)
alpha = AL.astype(np.float32) / 255; rgb = A[..., :3].astype(np.uint8)
Image.fromarray(np.dstack([rgb, (alpha * fa * 255).astype(np.uint8)])).save('final/character/hero/hair/L_face_e1.png')
Image.fromarray(np.dstack([rgb, (alpha * (1 - fa) * (1 - orn) * 255).astype(np.uint8)])).save('final/character/hero/hair/L_hair_e1.png')
Image.fromarray(np.dstack([rgb, (alpha * (1 - fa) * orn * 255).astype(np.uint8)])).save('final/character/hero/hair/L_orn_e1.png')
print('face px', int(face.sum()), 'ornament px', int(gg.sum()))

Image.fromarray(np.dstack([rgb, AL.astype(np.uint8)])).save('final/character/hero/hair/L_headfull_e1.png')   # un-split head (no seams)
