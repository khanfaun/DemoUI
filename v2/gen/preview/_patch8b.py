p = 'scripts/char8_build_page.py'
lines = open(p, encoding='utf8').read().split('\n')
DEV = r'''dev = '<div class="dev" id="dev"><button onclick="$(\'dev\').classList.toggle(\'on\')">DEV</button><div class="dp"><label>Độ tuổi<select id="dvAge" onchange="setAge(this.value)"></select></label><label>Tóc + gương mặt<select id="dvHair" onchange="setCH(\'hair\',this.value)"></select></label><label>Trang phục<select id="dvOutfit" onchange="setCH(\'outfit\',this.value)"></select></label><label>Hạt châu<select onchange="setCH(\'orb\',this.value)"><option value="teal">Thanh ngọc</option><option value="gold">Kim hỏa</option></select></label></div></div>' '''.rstrip()
JS = r'''js = r"""window.AGES={teen:{n:'Thiếu niên (~16)',hair:[],outfit:[]},young:{n:'Thanh niên (20–30)',hair:[['r1','Búi nhỏ trâm vàng']],outfit:[['hero','Lục bào ngọc']]},middle:{n:'Trung niên (40–50)',hair:[],outfit:[]},elder:{n:'Lão giả (70+)',hair:[['e1','Tóc bạc râu dài, mũ ngọc']],outfit:[['e1','Thanh bào lão giả']]}};
window.CH={age:'young',outfit:'hero',hair:'r1',orb:'teal'};
function headG(c){const st=CH.hair,h=I('ch-head-'+st),v=I('ch-hmv-'+st),mv=`-webkit-mask-image:url(${v});mask-image:url(${v})`;return `<div class="hg ${c} s-${st}" style="${c?mv:''}"><img src="${h}"></div>`}
function dollHTML(){const o=I('ch-of-'+CH.outfit);return `<div class="shd"></div><img class="ost" src="${o}"><img class="ofl" src="${o}"><img class="ofr" src="${o}"><img class="och" src="${o}">`+headG('')+headG('hair')+`<div class="hal ${CH.orb}"></div><div class="glw"><img class="gl" src="${I('ch-glow-'+CH.orb)}"></div><div class="hco ${CH.orb}"></div><img src="${I('ch-hands')}">`}
function refreshDoll(){document.querySelectorAll('.doll3').forEach(e=>e.innerHTML=dollHTML())}
function setCH(k,v){CH[k]=v;refreshDoll()}
function devFill(){const a=$('dvAge');if(!a)return;const opt=(l,cur)=>l.map(([v,n])=>`<option value="${v}"${v===cur?' selected':''}>${n}</option>`).join('');
a.innerHTML=Object.entries(AGES).map(([k,g])=>`<option value="${k}"${k===CH.age?' selected':''}${g.hair.length?'':' disabled'}>${g.n}${g.hair.length?'':' – chưa có'}</option>`).join('');
$('dvHair').innerHTML=opt(AGES[CH.age].hair,CH.hair);$('dvOutfit').innerHTML=opt(AGES[CH.age].outfit,CH.outfit)}
function setAge(a){const g=AGES[a];if(!g||!g.hair.length)return;CH.age=a;CH.hair=g.hair[0][0];CH.outfit=g.outfit[0][0];devFill();refreshDoll()}
"""'''
for i, l in enumerate(lines):
    if l.startswith("dev = '<div class=\"dev\""): lines[i] = DEV
    if l.startswith("js = 'window.CH="): lines[i] = JS
s = '\n'.join(lines)
s = s.replace('s = s.replace(HERO, "refreshDoll();", 1)', 's = s.replace(HERO, "refreshDoll();devFill();", 1)')
open(p, 'w', encoding='utf8').write(s)
print('ok', 'devFill();' in s)
