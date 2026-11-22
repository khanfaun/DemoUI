"""Export every image the game shows (window.IMG in the page) as a .webp file, exactly as embedded.
Images that are not webp yet (png/jpg/gif) are converted to webp (quality 90, alpha kept); with --write they are also replaced in the page.
Usage (from v2/gen):  python scripts/export_webp.py [--page PATH] [--out DIR] [--write]
Default page ../../f-ngoc-hanh-trinh.html, output folder webp/ . Never deletes anything."""
import re, json, base64, io, os, sys
from PIL import Image

args = sys.argv[1:]
PAGE = args[args.index('--page') + 1] if '--page' in args else '../../f-ngoc-hanh-trinh.html'
OUT = args[args.index('--out') + 1] if '--out' in args else 'webp'
os.makedirs(OUT, exist_ok=True)
s = open(PAGE, encoding='utf8').read()
m = re.search(r'window\.IMG=(\{.*?\});?\s*</script>', s, re.S); d = json.loads(m.group(1))
n_same = n_conv = n_skip = 0; total = 0
for k, v in d.items():
    mm = re.match(r'data:image/([\w+.-]+);base64,(.*)', v, re.S)
    if not mm:
        print('skip (not a data URI):', k); n_skip += 1; continue
    kind, raw = mm.group(1), base64.b64decode(mm.group(2))
    if kind == 'webp':
        data = raw; n_same += 1
    else:
        im = Image.open(io.BytesIO(raw)); im = im.convert('RGBA' if ('A' in im.getbands() or 'transparency' in im.info) else 'RGB')
        b = io.BytesIO(); im.save(b, 'WEBP', quality=90, method=6); data = b.getvalue(); n_conv += 1
        print('converted %-16s %s -> webp  %d KB -> %d KB' % (k, kind, len(raw) // 1024, len(data) // 1024))
        d[k] = 'data:image/webp;base64,' + base64.b64encode(data).decode()
    safe = re.sub(r'[^\w.-]', '_', k)
    open(os.path.join(OUT, safe + '.webp'), 'wb').write(data); total += len(data)
print('keys %d: already webp %d, converted %d, skipped %d -> %s/ (%d KB)' % (len(d), n_same, n_conv, n_skip, OUT, total // 1024))
if '--write' in args and n_conv:
    s = s[:m.start(1)] + json.dumps(d, ensure_ascii=False) + s[m.end(1):]
    open(PAGE, 'w', encoding='utf8').write(s); print('page updated:', PAGE)
