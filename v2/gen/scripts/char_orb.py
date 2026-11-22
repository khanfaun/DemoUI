import sys as _s; _s.path.insert(0, 'scripts')
from webpio import save_webp
"""Generate the two core-orb glow images (teal + gold-orange) with Qwen Image 2.1 Turbo text-to-image.
Output: final/character/orb/glow.webp (teal), final/character/orb/glow_gold.webp (gold).  Existing files are skipped; use --force to redo.
Run:  python scripts/char_orb.py [--force]
"""
import json, os, subprocess, sys, urllib.request

H = "http://127.0.0.1:8000"
UNET = 'qwen_image_2.1_turbo_int8_convrot.safetensors'
PE = 'qwen3.5_9b_qwen_image_2.1_pe_i2i.int8_convrot.safetensors'     # only needs to exist (prompt enhancer is switched off)
TR = ', transparent background, output a PNG image with alpha channel'
JOBS = {
    'glow': ('a glowing swirling teal qi energy vortex orb of light, bright white-cyan core, spiral energy wisps, soft radiant aura, centered, xianxia fantasy effect art, no object, no person' + TR, 31),
    'glow_gold': ('a glowing swirling golden orange qi energy vortex orb of light, blazing bright white-gold core, spiral fiery orange energy wisps, intense radiant aura, centered, xianxia fantasy effect art, no object, no person' + TR, 33),
}
force = '--force' in sys.argv
os.makedirs('final/character/orb', exist_ok=True)
for name, (prompt, seed) in JOBS.items():
    out = 'final/character/orb/%s.webp' % name
    if os.path.exists(out) and not force:
        print('skip', out); continue
    d = json.load(open('scripts/qwen_t2i.json', encoding='utf8'))          # Qwen Image 2.1 Turbo text-to-image template (UI format)
    for n in d['nodes']:
        if n['id'] == 13: n['widgets_values'] = ['1:1 (Square)', 1, 8]       # ResolutionSelector: 1:1, 1 megapixel
        if n['id'] == 459:
            wv = n['widgets_values']; wv[0] = prompt; wv[8] = seed; wv[9] = UNET; wv[12] = PE
        if n['id'] == 461: n['widgets_values'][0] = 'fnht_orb_' + name
    for sg in d['definitions']['subgraphs']:
        for n in sg['nodes']:
            if n['type'] == 'UNETLoader': n['widgets_values'][0] = UNET
            if n['id'] == 473: n['widgets_values'][0] = PE
    json.dump(d, open('_orb_wf.json', 'w', encoding='utf8'), ensure_ascii=False)
    subprocess.run(['comfy', '--skip-prompt', 'run', '--workflow', '_orb_wf.json', '--host', '127.0.0.1', '--port', '8000', '--wait', '--timeout', '900'], capture_output=True, text=True)
    got = None
    for pid, h in json.load(urllib.request.urlopen(H + '/history?max_items=4')).items():
        for node, o in h.get('outputs', {}).items():
            for im in o.get('images', []):
                if im['filename'].startswith('fnht_orb_' + name + '_') and im['type'] == 'output': got = im
    if not got:
        print('FAIL', name); continue
    save_webp(urllib.request.urlopen('%s/view?filename=%s&subfolder=%s&type=%s' % (H, got['filename'], got['subfolder'], got['type'])).read(), out)
    print('wrote', out)
if os.path.exists('_orb_wf.json'): os.remove('_orb_wf.json')
