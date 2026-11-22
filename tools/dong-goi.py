# Gộp ảnh vào thẳng file HTML để mỗi bản chạy độc lập: v2/src/*.html → v2/*.html
import re, base64, os, glob, json
ROOT = os.path.join(os.path.dirname(__file__), '..', 'v2')
A = os.path.join(ROOT, 'assets')
names = {os.path.splitext(f)[0] for f in os.listdir(A) if f.endswith('.webp')}
data = lambda n: 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(A, n + '.webp'), 'rb').read()).decode()
for src in sorted(glob.glob(os.path.join(ROOT, 'src', '*.html'))):
    s = open(src, encoding='utf-8').read()
    css_used = set(re.findall(r'url\(assets/([\w-]+)\.webp\)', s))
    s = re.sub(r'url\(assets/([\w-]+)\.webp\)', lambda m: 'url(' + data(m.group(1)) + ')', s)
    used = sorted(n for n in names if re.search(r"['\"`]" + re.escape(n) + r"['\"`]", s))
    s = s.replace('<script>', '<script>window.IMG=' + json.dumps({n: data(n) for n in used}) + ';</script>\n<script>', 1)
    out = os.path.join(ROOT, os.path.basename(src)); open(out, 'w', encoding='utf-8').write(s)
    print(os.path.basename(out), len(used), 'ảnh JS +', len(css_used), 'ảnh CSS,', round(os.path.getsize(out) / 1024), 'KB')
