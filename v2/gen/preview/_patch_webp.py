import re, glob
LS = ", 'WEBP', lossless=True, quality=100, method=4, exact=True)"
changed = []
for p in glob.glob('scripts/*.py'):
    if p.endswith(('final_to_webp.py', 'webpio.py', 'export_webp.py')): continue
    s0 = s = open(p, encoding='utf8').read()
    # writers: .save('final/....png')  ->  lossless webp
    s = re.sub(r"\.save\('(final/[^']+)\.png'\)", lambda m: ".save('%s.webp'%s" % (m.group(1), LS), s)
    # raw bytes from ComfyUI written to final/ -> convert right away
    s = s.replace("open('final/elements/%s.png' % k, 'wb').write(d)",
                  "save_webp(d, 'final/elements/%s.webp' % k)   # ComfyUI gives PNG bytes -> lossless webp, no PNG kept")
    s = s.replace("    open(out, 'wb').write(urllib.request.urlopen(", "    save_webp(urllib.request.urlopen(")
    if 'save_webp(' in s and 'from webpio import save_webp' not in s:
        s = "import sys as _s; _s.path.insert(0, 'scripts')\nfrom webpio import save_webp\n" + s
    # readers / existence checks / docs: any other final/...png path -> .webp
    s = re.sub(r"(final/[\w/%.-]*?)\.png", r"\1.webp", s)
    if s != s0:
        open(p, 'w', encoding='utf8').write(s); changed.append(p)
print(changed)
