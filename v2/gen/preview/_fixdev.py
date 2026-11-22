import re
p = 'scripts/char8_build_page.py'
s = open(p, encoding='utf8').read()
new = r'''dev = '<div class="dev" id="dev"><button onclick="$(\'dev\').classList.toggle(\'on\')">DEV</button><div class="dp"><label>Tóc + gương mặt<select onchange="setCH(\'hair\',this.value)"><option value="r1">Thanh niên, búi nhỏ trâm vàng</option><option value="e1">Lão giả, tóc bạc râu dài</option></select></label><label>Trang phục<select onchange="setCH(\'outfit\',this.value)"><option value="hero">Lục bào ngọc</option><option value="elder">Thanh bào lão giả</option></select></label><label>Hạt châu<select onchange="setCH(\'orb\',this.value)"><option value="teal">Thanh ngọc</option><option value="gold">Kim hỏa</option></select></label></div></div>'
'''
lines = s.split('\n')
i = next(k for k, l in enumerate(lines) if l.startswith("dev = '<div class=\"dev\""))
lines[i] = new.rstrip('\n')
open(p, 'w', encoding='utf8').write('\n'.join(lines))
