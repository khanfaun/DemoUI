import re, json, base64, io, os, shutil
import os as _os; _os.makedirs('preview', exist_ok=True)
import numpy as np
from PIL import Image, ImageDraw

P = r'..\..\f-ngoc-hanh-trinh.html'
shutil.copy(P + '.bak2', P)
s = open(P, encoding='utf8').read()
m = re.search(r'window\.IMG=(\{.*?\});?\s*</script>', s, re.S); d = json.loads(m.group(1))
L = {'ch-of-hero': 'final/character/hero/outfit/B_outfit.webp',
     'ch-hair-r1': 'final/character/hero/hair/L_hair_r1.webp', 'ch-face-r1': 'final/character/hero/hair/L_face_r1.webp', 'ch-orn-r1': 'final/character/hero/hair/L_orn_r1.webp',
     'ch-hands': 'final/character/hands/L_hands.webp',
     # ELDER (70+): outfit with neck only + whole head cut from the same full figure (scripts elder1..elder4)
     'ch-of-e1': 'final/character/elder/outfit/O_e1.webp', 'ch-head-e1': 'final/character/elder/hair/H_e1.webp', 'ch-fm-e1': 'final/character/elder/hair/F_e1.webp'}
import numpy as _np, cv2 as _cv
ims = {k: Image.open(v).convert('RGBA') for k, v in L.items()}
for st in ('r1',):                       # young hero: head = face + hair + ornament layers
    hd = Image.new('RGBA', ims['ch-face-' + st].size, (0, 0, 0, 0))
    for part in ('face', 'hair', 'orn'):
        hd.alpha_composite(ims['ch-%s-%s' % (part, st)])
    ims['ch-head-' + st] = hd
    _fa = (_np.asarray(ims['ch-face-' + st].getchannel('A')) > 40).astype(_np.uint8)
    _fa = _cv.GaussianBlur(_cv.dilate(_fa, _cv.getStructuringElement(_cv.MORPH_ELLIPSE, (25, 25))).astype(_np.float32), (0, 0), 4)
    _ha = _np.asarray(ims['ch-hair-' + st].getchannel('A')).astype(_np.float32)
    mv = Image.new('RGBA', hd.size, (255, 255, 255, 0)); mv.putalpha(Image.fromarray((_ha * (1 - _np.clip(_fa, 0, 1))).astype(_np.uint8))); ims['ch-hmv-' + st] = mv
    ims['ch-hm-' + st] = ims['ch-hair-' + st]
    for part in ('face', 'hair', 'orn'):
        del ims['ch-%s-%s' % (part, st)]
for st in ('e1',):                       # elder: whole head + soft face/ears ellipse -> swaying part = head minus face
    _ha = _np.asarray(ims['ch-head-' + st].getchannel('A')).astype(_np.float32)
    _fa = _np.asarray(ims.pop('ch-fm-' + st).getchannel('A')).astype(_np.float32) / 255
    mv = Image.new('RGBA', ims['ch-head-' + st].size, (255, 255, 255, 0)); mv.putalpha(Image.fromarray((_ha * (1 - _fa)).astype(_np.uint8))); ims['ch-hmv-' + st] = mv
bbs = [b for b in [im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox() for k, im in ims.items() if not k.endswith('-e1')] if b]
U = (min(b[0] for b in bbs), min(b[1] for b in bbs), max(b[2] for b in bbs), max(b[3] for b in bbs))
W = 640; pad = 0.02; uw, uh = U[2] - U[0], U[3] - U[1]; r = min(W * (1 - 2 * pad) / uw, W * (1 - 2 * pad) / uh)
ox, oy = (W - round(uw * r)) // 2, (W - round(uh * r)) // 2


def place(im):
    c = im.crop(U).resize((round(uw * r), round(uh * r)), Image.LANCZOS)
    cv = Image.new('RGBA', (W, W), (0, 0, 0, 0)); cv.paste(c, (ox, oy), c); return cv


def enc(im, q=90):
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()


pl = {k: place(im) for k, im in ims.items()}
for k, im in pl.items():
    if k != 'ch-hm-r1': d[k] = enc(im)
pc = lambda v: round(v / W * 100, 2)
bbox = lambda im: im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()

_hm = pl['ch-hm-r1'].getchannel('A'); hb = _hm.point(lambda v: 255 if v > 10 else 0).getbbox(); fb = (hb[0], hb[1] + (hb[3]-hb[1])*0.25, hb[2], hb[3])
PVX, PVY = (fb[0] + fb[2]) / 2, hb[1] + (fb[1] - hb[1]) * 0.35      # hair pivot near the crown
import json as _j; _fe = _j.load(open('ref/chain/elder_head.json'))['face_ellipse']; _pp = place(Image.new('RGBA', (1024, 1024)))
PVXE = ox + (_fe[0] - U[0]) * r; PVYE = oy + (_fe[1] - _fe[3] - U[1]) * r        # elder hair pivot: top of the forehead
ob = bbox(pl['ch-of-hero']); ow, oh = ob[2] - ob[0], ob[3] - ob[1]
FLY = ob[3] - oh * 0.06; FRX, FRY = ow * 0.12, oh * 0.085; FLL, FLR = ob[0] + ow * 0.06, ob[2] - ow * 0.06
cx = (ob[0] + ob[2]) / 2
CHY = ob[1] + oh * 0.36; CRX, CRY = ow * 0.19, oh * 0.15             # chest region
GY = ob[1] + oh * 0.52
g = Image.open('final/character/orb/glow.webp').convert('RGBA'); g = g.crop(bbox(g))
gd = round(oh * 0.30); g = g.resize((gd, round(gd * g.height / g.width)), Image.LANCZOS)
gl = Image.new('RGBA', (W, W), (0, 0, 0, 0)); gl.paste(g, (round(cx) - g.width // 2, round(GY) - g.height // 2), g); d['ch-glow-teal'] = enc(gl)
g2 = Image.open('final/character/orb/glow_gold.webp').convert('RGBA'); g2 = g2.crop(bbox(g2)); g2 = g2.resize((gd, round(gd * g2.height / g2.width)), Image.LANCZOS)
gl2 = Image.new('RGBA', (W, W), (0, 0, 0, 0)); gl2.paste(g2, (round(cx) - g2.width // 2, round(GY) - g2.height // 2), g2); d['ch-glow-gold'] = enc(gl2)

c = Image.new('RGBA', (W, W), (0, 0, 0, 0))
for k in ('ch-of-hero', 'ch-head-r1', 'ch-hands'):
    c.alpha_composite(pl[k])
# small avatar keeps black hair look: darken the hair quickly
d['nv-nam'] = enc(c)
for k in ('nv-anim', 'nv-glow'):
    d.pop(k, None)
s = s[:m.start(1)] + json.dumps(d, ensure_ascii=False) + s[m.end(1):]


def ell(x, y, rx, ry, inside):
    a, b = ('#000', 'transparent') if inside else ('transparent', '#000')
    return 'radial-gradient(ellipse {}% {}% at {}% {}%,{} 72%,{} 100%)'.format(pc(rx), pc(ry), pc(x), pc(y), a, b)


def mask(v, composite=False):
    out = '-webkit-mask-image:{0};mask-image:{0};'.format(v)
    if composite:
        out += '-webkit-mask-composite:source-in;mask-composite:intersect;'
    return out


HC = {'black': [.30, '#1c1c26'], 'brown': [.56, '#7a4a26'], 'gold': [.95, '#d8a838'], 'red': [.60, '#b02a22'],
      'blue': [.58, '#2a50b0'], 'purple': [.58, '#6a38a8'], 'silver': [1, '']}
SW = {'black': '#1a1a22', 'brown': '#7a4a28', 'gold': '#d8b040', 'red': '#c0392b', 'blue': '#3a6fc0', 'purple': '#8a4fc0', 'silver': '#d6dae0'}
css = ''.join([
    '.doll3{position:absolute;left:50%;bottom:16%;height:64%;aspect-ratio:1;transform:translateX(-50%);pointer-events:none;filter:drop-shadow(0 10px 14px rgba(14,42,36,.35))}',
    '.doll3 img{position:absolute;inset:0;width:100%;height:100%;max-width:none}',
    '.doll3 .ost{', mask(','.join([ell(FLL, FLY, FRX, FRY, False), ell(FLR, FLY, FRX, FRY, False), ell(cx, CHY, CRX, CRY, False)]), True), '}',
    '.doll3 .ofl{', mask(ell(FLL, FLY, FRX, FRY, True)), 'transform-origin:{}% {}%;animation:flp 3.6s ease-in-out infinite}}'.format(pc(FLL + FRX * .9), pc(FLY - FRY * .9)),
    '.doll3 .ofr{', mask(ell(FLR, FLY, FRX, FRY, True)), 'transform-origin:{}% {}%;animation:flp 3.6s ease-in-out infinite reverse;animation-delay:-1.1s}}'.format(pc(FLR - FRX * .9), pc(FLY - FRY * .9)),
    '@keyframes flp{0%,100%{transform:rotate(-1.6deg)}50%{transform:rotate(1.6deg)}}',
    '.doll3 .och{', mask(ell(cx, CHY, CRX, CRY, True)), 'transform-origin:{}% {}%;animation:brz 4.2s ease-in-out infinite}}'.format(pc(cx), pc(CHY + CRY)),
    '@keyframes brz{0%,100%{transform:scale(1,1)}50%{transform:scale(1.014,1.024)}}',
    '.doll3 .hg{position:absolute;inset:0;isolation:isolate;-webkit-mask-size:100% 100%;mask-size:100% 100%}.doll3 .hg i{position:absolute;inset:0;-webkit-mask-size:100% 100%;mask-size:100% 100%}.doll3 .hg i.tn{mix-blend-mode:color}',
    '.doll3 .hair{{transform-origin:{}% {}%;animation:hsw 4.5s ease-in-out infinite}}'.format(pc(PVX), pc(PVY)),
    '.doll3 .hair.s-e1{{transform-origin:{}% {}%}}'.format(pc(PVXE), pc(PVYE)),
    '@keyframes hsw{0%,100%{transform:rotate(-0.6deg)}50%{transform:rotate(0.6deg)}}',
    '.doll3 .glw{{position:absolute;inset:0;transform-origin:{0}% {1}%}}.doll3 .gl{{transform-origin:{0}% {1}%;animation:gspin2 7s linear infinite}}@keyframes gspin2{{to{{transform:rotate(360deg)}}}}'.format(pc(cx), pc(GY)),
    '.doll3 .hal,.doll3 .hco{{position:absolute;left:{0}%;top:{1}%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);mix-blend-mode:screen;will-change:opacity,transform;pointer-events:none}}'.format(pc(cx), pc(GY)),
    '.doll3 .hal{{width:{0}%;animation:hbr 3.8s ease-in-out infinite}}.doll3 .hco{{width:{1}%;animation:hcr 3.8s ease-in-out infinite}}'.format(pc(gd * 2.0), pc(gd * 0.62)),
    '.doll3 .hal.teal{background:radial-gradient(circle,rgba(120,255,235,.85) 0%,rgba(40,225,205,.42) 30%,rgba(20,200,180,.14) 52%,rgba(20,200,180,0) 70%)}',
    '.doll3 .hal.gold{background:radial-gradient(circle,rgba(255,225,140,.95) 0%,rgba(255,165,40,.5) 30%,rgba(255,120,0,.18) 54%,rgba(255,110,0,0) 72%)}',
    '.doll3 .hco.teal{background:radial-gradient(circle,rgba(255,255,255,.95) 0%,rgba(210,255,250,.75) 28%,rgba(120,255,240,.25) 55%,rgba(120,255,240,0) 72%)}',
    '.doll3 .hco.gold{background:radial-gradient(circle,rgba(255,255,240,1) 0%,rgba(255,240,180,.85) 28%,rgba(255,200,90,.3) 55%,rgba(255,190,80,0) 72%)}',
    '@keyframes hbr{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(.92)}50%{opacity:.95;transform:translate(-50%,-50%) scale(1.06)}}',
    '@keyframes hcr{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(.9)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}',
    '.doll3 .hal.gold{animation-name:hbg}@keyframes hbg{0%,100%{opacity:.62;transform:translate(-50%,-50%) scale(.94)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}}',
    '.doll3 .hco.gold{animation-name:hcg}@keyframes hcg{0%,100%{opacity:.7;transform:translate(-50%,-50%) scale(.92)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.12)}}',
    '.doll3 .shd{{position:absolute;left:{0}%;top:{1}%;width:{2}%;height:{3}%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(ellipse at center,rgba(10,30,24,.42) 0%,rgba(10,30,24,.2) 45%,rgba(10,30,24,0) 72%)}}'.format(pc(cx), pc(ob[3] - oh * 0.035), pc(ow * 0.78), pc(oh * 0.11)),
    '.dm .doll3{bottom:22px;height:82%}',
    '.dev{position:absolute;top:6px;right:6px;z-index:60;font:600 9px Lexend,sans-serif}',
    '.dev>button{background:rgba(14,42,36,.8);color:#ffd88a;border:1px solid #c49a3e;border-radius:8px;padding:2px 8px}',
    '.dev .dp{display:none;margin-top:4px;background:rgba(251,250,243,.97);border:1px solid #c49a3e;border-radius:10px;padding:8px;width:170px;color:#18352f;box-shadow:0 4px 14px rgba(0,0,0,.3)}',
    '.dev.on .dp{display:block}.dev label{display:block;margin-top:5px;font-weight:500;color:#4f6f66}',
    '.dev select{width:100%;height:24px;margin-top:2px;border:1px solid #d9e3da;border-radius:6px;font:inherit;background:#fff}',
    '.dev .sw{display:flex;gap:3px;margin-top:3px}.dev .sw b{flex:1;height:16px;border-radius:5px;border:1px solid #0003;cursor:pointer}.dev .sw b.on{outline:2px solid #c49a3e;outline-offset:1px}',
])
s = s.replace('</style>', css + '</style>', 1)
s = s.replace('<img class="hero" id="hero"><img class="glow" id="glow">', '<div class="doll3" id="doll3"></div>')
dev = '<div class="dev" id="dev"><button onclick="$(\'dev\').classList.toggle(\'on\')">DEV</button><div class="dp"><label>Độ tuổi<select id="dvAge" onchange="setAge(this.value)"></select></label><label>Tóc + gương mặt<select id="dvHair" onchange="setCH(\'hair\',this.value)"></select></label><label>Trang phục<select id="dvOutfit" onchange="setCH(\'outfit\',this.value)"></select></label><label>Hạt châu<select onchange="setCH(\'orb\',this.value)"><option value="teal">Thanh ngọc</option><option value="gold">Kim hỏa</option></select></label></div></div>'
s = s.replace('<div class="toast" id="toast"></div>', '<div class="toast" id="toast"></div>' + dev, 1)
js = r"""window.AGES={teen:{n:'Thiếu niên (~16)',hair:[],outfit:[]},young:{n:'Thanh niên (20–30)',hair:[['r1','Búi nhỏ trâm vàng']],outfit:[['hero','Lục bào ngọc']]},middle:{n:'Trung niên (40–50)',hair:[],outfit:[]},elder:{n:'Lão giả (70+)',hair:[['e1','Tóc bạc râu dài, mũ ngọc']],outfit:[['e1','Thanh bào lão giả']]}};
window.CH={age:'young',outfit:'hero',hair:'r1',orb:'teal'};
function headG(c){const st=CH.hair,h=I('ch-head-'+st),v=I('ch-hmv-'+st),mv=`-webkit-mask-image:url(${v});mask-image:url(${v})`;return `<div class="hg ${c} s-${st}" style="${c?mv:''}"><img src="${h}"></div>`}
function dollHTML(){const o=I('ch-of-'+CH.outfit);return `<div class="shd"></div><img class="ost" src="${o}"><img class="ofl" src="${o}"><img class="ofr" src="${o}"><img class="och" src="${o}">`+headG('')+headG('hair')+`<div class="hal ${CH.orb}"></div><div class="glw"><img class="gl" src="${I('ch-glow-'+CH.orb)}"></div><div class="hco ${CH.orb}"></div><img src="${I('ch-hands')}">`}
function refreshDoll(){document.querySelectorAll('.doll3').forEach(e=>e.innerHTML=dollHTML())}
function setCH(k,v){CH[k]=v;refreshDoll()}
function devFill(){const a=$('dvAge');if(!a)return;const opt=(l,cur)=>l.map(([v,n])=>`<option value="${v}"${v===cur?' selected':''}>${n}</option>`).join('');
a.innerHTML=Object.entries(AGES).map(([k,g])=>`<option value="${k}"${k===CH.age?' selected':''}${g.hair.length?'':' disabled'}>${g.n}${g.hair.length?'':' – chưa có'}</option>`).join('');
$('dvHair').innerHTML=opt(AGES[CH.age].hair,CH.hair);$('dvOutfit').innerHTML=opt(AGES[CH.age].outfit,CH.outfit)}
function setAge(a){const g=AGES[a];if(!g||!g.hair.length)return;CH.age=a;CH.hair=g.hair[0][0];CH.outfit=g.outfit[0][0];devFill();refreshDoll()}
"""
HERO = "$('hero').src=I('nv-anim');$('glow').src=I('nv-glow');"
assert HERO in s
s = s.replace(HERO, "refreshDoll();devFill();", 1)
s = s.replace("// ---------- MÀN TU LUYỆN ----------", js + "// ---------- MÀN TU LUYỆN ----------", 1)
old = '<img class="h" src="${I(\'nv-nam\')}"><img class="h g" src="${I(\'nv-glow\')}">'
assert old in s
s = s.replace(old, '<div class="doll3">${dollHTML()}</div>', 1)
open(P, 'w', encoding='utf8').write(s)
print(os.path.getsize(P) // 1024, 'KB')

prev = Image.new('RGBA', (W, W), (60, 110, 92, 255))
for k in ('ch-of-hero', 'ch-head-r1', 'ch-hands'):
    prev.alpha_composite(pl[k])
prev.alpha_composite(gl2)
dd = ImageDraw.Draw(prev)
dd.ellipse((cx - CRX, CHY - CRY, cx + CRX, CHY + CRY), outline=(255, 0, 0, 255), width=2)
for x in (FLL, FLR):
    dd.ellipse((x - FRX, FLY - FRY, x + FRX, FLY + FRY), outline=(255, 255, 0, 255), width=2)
dd.ellipse((PVX - 4, PVY - 4, PVX + 4, PVY + 4), fill=(255, 0, 0, 255))
prev.convert('RGB').save('preview/_masks.png')
