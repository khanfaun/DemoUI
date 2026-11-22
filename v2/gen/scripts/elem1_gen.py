import sys as _s; _s.path.insert(0, 'scripts')
from webpio import save_webp
"""Generate raw art with Qwen Image 2.1 Turbo (template workflow) -> final/elements/*.webp (lossless, no PNG kept)"""
import json, os, subprocess, sys, time, urllib.request
import elem_prompts as gen  # prompts dict P

H = "http://127.0.0.1:8000"
os.makedirs('final/elements', exist_ok=True)
tpl = json.load(open('scripts/qwen_t2i.json', encoding='utf8'))
UNET = 'qwen_image_2.1_turbo_int8_convrot.safetensors'
PE = 'qwen3.5_9b_qwen_image_2.1_pe_i2i.int8_convrot.safetensors'
only = sys.argv[1:]

for i, (k, (p, size, kind)) in enumerate(gen.P.items()):
    if only and k not in only:
        continue
    if os.path.exists('final/elements/%s.webp' % k):
        continue
    ratio = '1:1 (Square)'
    if size[0] / size[1] > 2.5:
        ratio = '21:9 (Ultrawide)'
    elif size[0] > size[1]:
        ratio = '3:2 (Photo)'
    t0 = time.time()
    for n in tpl['nodes']:
        if n['id'] == 13:
            n['widgets_values'] = [ratio, 1, 8]
        if n['id'] == 459:
            wv = n['widgets_values']
            wv[0] = p if kind == 'scene' else p.replace('isolated on plain pure white background', 'transparent background') + ', transparent background, output a PNG image with alpha channel'
            wv[9] = UNET
            wv[8] = 1000 + i
            wv[12] = PE
        if n['id'] == 461:
            n['widgets_values'][0] = 'fnht_q_' + k
    for sg in tpl['definitions']['subgraphs']:
        for n in sg['nodes']:
            if n['type'] == 'UNETLoader':
                n['widgets_values'][0] = UNET
            if n['id'] == 473:
                n['widgets_values'][0] = PE
    json.dump(tpl, open('_q_wf.json', 'w', encoding='utf8'), ensure_ascii=False)
    r = subprocess.run(['comfy', '--skip-prompt', 'run', '--workflow', '_q_wf.json', '--host', '127.0.0.1', '--port', '8000', '--wait', '--timeout', '900'], capture_output=True, text=True)
    got = None
    hist = json.load(urllib.request.urlopen(H + '/history?max_items=4'))
    for pid, h in hist.items():
        for node, o in h.get('outputs', {}).items():
            for im in o.get('images', []):
                if im['filename'].startswith('fnht_q_' + k + '_') and im['type'] == 'output':
                    got = im
    if not got:
        print('FAIL', k, (r.stdout + r.stderr)[-400:], flush=True)
        continue
    d = urllib.request.urlopen('%s/view?filename=%s&subfolder=%s&type=%s' % (H, got['filename'], got['subfolder'], got['type'])).read()
    save_webp(d, 'final/elements/%s.webp' % k)   # ComfyUI gives PNG bytes -> lossless webp, no PNG kept
    print(k, round(time.time() - t0, 1), 's', flush=True)
