"""Qwen Image 2.1 Turbo edit with ONE or TWO reference images (Picture 1 / Picture 2)."""
import json, os, subprocess, urllib.request

H = "http://127.0.0.1:8000"
UNET = 'qwen_image_2.1_turbo_int8_convrot.safetensors'
PE = 'qwen3.5_9b_qwen_image_2.1_pe_i2i.int8_convrot.safetensors'


def upload(path):
    subprocess.run(['curl', '-s', '-F', 'image=@' + path, '-F', 'overwrite=true', H + '/upload/image'], capture_output=True)
    return os.path.basename(path)


def edit2(ref1, prompt, out, ref2=None, seed=5, size=1024):
    if os.path.exists(out):
        return
    d = json.load(open('scripts/qwen_edit.json', encoding='utf8'))
    name = os.path.basename(out)[:-4]
    n1 = upload(ref1)
    for n in d['nodes']:
        if n['id'] == 470: n['widgets_values'][0] = n1
        if n['id'] == 461: n['widgets_values'][0] = 'fnht_h_' + name
        if n['id'] == 459:
            wv = n['widgets_values']; wv[1] = prompt; wv[8] = size; wv[9] = size; wv[11] = seed; wv[12] = UNET; wv[17] = PE
    if ref2:
        n2 = upload(ref2)
        d['nodes'].append({'id': 9001, 'type': 'LoadImage', 'pos': [0, 0], 'size': [200, 100], 'flags': {}, 'order': 0, 'mode': 0,
                           'inputs': [], 'outputs': [{'name': 'IMAGE', 'type': 'IMAGE', 'links': [9001]}, {'name': 'MASK', 'type': 'MASK', 'links': None}],
                           'properties': {'Node name for S&R': 'LoadImage'}, 'widgets_values': [n2, 'image']})
        d['links'].append([9001, 9001, 0, 459, 8, 'IMAGE'])
        for n in d['nodes']:
            if n['id'] == 459: n['inputs'][8]['link'] = 9001
    for sg in d['definitions']['subgraphs']:
        for n in sg['nodes']:
            if n['type'] == 'UNETLoader': n['widgets_values'][0] = UNET
            if n['id'] == 477: n['widgets_values'][0] = PE
    json.dump(d, open('_h_wf.json', 'w', encoding='utf8'), ensure_ascii=False)
    r = subprocess.run(['comfy', '--skip-prompt', 'run', '--workflow', '_h_wf.json', '--host', '127.0.0.1', '--port', '8000', '--wait', '--timeout', '900'], capture_output=True, text=True)
    got = None
    hist = json.load(urllib.request.urlopen(H + '/history?max_items=4'))
    for pid, hh in hist.items():
        for node, o in hh.get('outputs', {}).items():
            for im in o.get('images', []):
                if im['filename'].startswith('fnht_h_' + name + '_') and im['type'] == 'output': got = im
    if not got:
        print('FAIL', name, (r.stdout + r.stderr)[-400:]); return
    open(out, 'wb').write(urllib.request.urlopen('%s/view?filename=%s&subfolder=%s&type=%s' % (H, got['filename'], got['subfolder'], got['type'])).read())
    print(name, flush=True)
