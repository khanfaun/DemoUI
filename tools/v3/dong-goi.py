# Đóng gói v3/src/*.html → v3/*.html, nhúng ảnh dạng base64 để mỗi tệp tự chạy được
import re, os, json, base64, glob
R = os.path.join(os.path.dirname(__file__), '..', '..', 'v3')
names = [os.path.basename(f)[:-5] for f in glob.glob(R + '/assets/*.webp')]
def data(n): return 'data:image/webp;base64,' + base64.b64encode(open(R + '/assets/' + n + '.webp', 'rb').read()).decode()
for f in glob.glob(R + '/src/*.html'):
    s = open(f, encoding='utf8').read()
    s = re.sub(r'url\(assets/([\w-]+)\.webp\)', lambda m: 'url(' + data(m.group(1)) + ')', s)
    used = sorted(n for n in names if re.search(r"['\"`]" + re.escape(n) + r"['\"`]", s))
    s = s.replace('<script>', '<script>window.IMG=' + json.dumps({n: data(n) for n in used}) + ';</script>\n<script>', 1)
    out = R + '/' + os.path.basename(f); open(out, 'w', encoding='utf8').write(s)
    print(os.path.basename(out), round(len(s) / 1e6, 2), 'MB', len(used), 'ảnh')
