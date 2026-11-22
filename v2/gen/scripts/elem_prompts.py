import json, urllib.request, time, sys, os

H = "http://127.0.0.1:8000"
STY = "xianxia chinese fantasy mobile game art, painterly digital illustration, jade green and gold accents, highly detailed, clean"
ICON = "game item icon, single object centered, isolated on plain pure white background, "
WH = "isolated on plain pure white background, "
P = {}


def a(k, s, size, kind):
    P[k] = (s, size, kind)


it = {'ao-lam': 'blue cultivator robe', 'ao-tim': 'purple silk immortal robe with gold embroidery', 'ban-do': 'old rolled treasure map scroll', 'bi-kip': 'ancient martial arts manual book with glowing sword emblem', 'bua': 'yellow taoist teleport talisman paper with red runes', 'bua-ren': 'taoist talisman paper with green runes', 'co': 'ancient chinese bronze flag banner pennant', 'dai': 'jade belt with gold buckle', 'dan-do': 'glowing red elixir pill in small jade dish', 'dan-lam': 'glowing blue elixir pill in small jade dish', 'dan-luc': 'glowing green elixir pill in small jade dish', 'dan-tim': 'glowing purple elixir pill in small jade dish', 'dan-trang': 'glowing white pearl elixir pill with golden aura', 'dan-vang': 'glowing golden elixir pill in small jade dish', 'dong-tien': 'ancient chinese copper coin pile', 'giay': 'cloud-patterned cultivator boots', 'huyet-ngoc': 'blood red crystal jade gem', 'kiem': 'elegant flying sword with jade hilt and blue glow', 'lenh-bai': 'bronze sect token plaque', 'lenh-ngoc': 'jade sect token plaque with gold carving', 'linh-chi': 'giant glowing lingzhi reishi mushroom spirit herb', 'linh-thach': 'glowing cyan spirit stone crystal cluster', 'lo-dan': 'bronze alchemy cauldron furnace with fire', 'long-vu': 'long white crane feather with golden glow', 'luc-bao': 'green jade treasure ingot', 'mu': 'jade crown hat of cultivator', 'ngoc-boi': 'jade pendant carved with dragon pattern', 'nguyen-bao': 'gold yuanbao ingot', 'nhan': 'icy blue crystal ring', 'nhan-sam': 'red glowing ginseng root', 'quang-do': 'red glowing meteor iron ore chunk', 'quang-lam': 'dark blue mystic iron ore chunk', 'ruong': 'ornate wooden treasure chest with gold trim', 'sen': 'glowing pink lotus flower with dragon aura', 'thao-lam': 'icy blue glowing herb plant', 'thap': 'multi-tiered glazed pagoda treasure with colorful glow', 'trung': 'icy blue phoenix egg with frost', 'truc-thu': 'bamboo slip scroll bundle'}
for k, v in it.items():
    a('it-' + k, ICON + v + ", " + STY, (1024, 1024), 'icon')

sk = {'blood': 'blood red swirling energy orb', 'fire': 'blazing fire palm flame', 'heal': 'green healing spring leaf glow', 'ice': 'blue ice crystal shard burst', 'illusion': 'purple hypnotic eye swirl', 'meteor': 'falling meteor swords rain', 'palm': 'golden buddha palm hand', 'poison': 'green poison mist skull', 'qi': 'cyan swirling qi energy sphere', 'shield': 'golden protective barrier shield', 'sword': 'glowing blue sword slash', 'thunder': 'yellow lightning bolt blast', 'wind': 'white wind swirl gust'}
for k, v in sk.items():
    a('sk-' + k, 'skill icon, ' + v + ', circular emblem, ' + WH + STY, (1024, 1024), 'icon')

bd = {'chinh-dien': 'grand sect main hall chinese palace', 'dan-phong': 'alchemy pill room with cauldron', 'dong-thien': 'mountain cave dwelling with glowing entrance', 'linh-dien': 'spirit herb field garden with glowing plants', 'linh-thu': 'spirit beast den with mythical creature', 'luyen-khi': 'weapon forge hall with anvil', 'tang-kinh': 'scripture library pavilion with scrolls', 'truyen-cong': 'teaching hall pagoda with floating light', 'tu-linh': 'spirit gathering formation altar glowing circle', 'vo-truong': 'martial arena training ground platform'}
for k, v in bd.items():
    a('bd-' + k, 'isometric building icon, ' + v + ', floating small piece of land, ' + WH + STY, (1024, 1024), 'icon')

a('cau-kiep', 'glowing orb with thunder lightning tribulation clouds inside, magic crystal ball, ' + WH + STY, (1024, 1024), 'icon')
a('cau-ma', 'dark purple orb with demonic red mist and eyes inside, magic crystal ball, ' + WH + STY, (1024, 1024), 'icon')
a('cau-tu', 'glowing teal spirit orb with calm light and lotus inside, magic crystal ball, ' + WH + STY, (1024, 1024), 'icon')
a('dai-da', 'circular meditation platform stone formation with glowing jade runes seen from slightly above, wide, ' + WH + STY, (1536, 512), 'icon')

dd = {'ha-lam': 'peaceful riverside forest valley', 'hoa-diem': 'blood red volcanic forbidden land with flames', 'nguyet-ho': 'moonlit floating celestial palace lake', 'thac': 'ancient sword tomb with giant swords stuck in ground', 'thanh-son': 'green misty mountain range with beasts', 'tuyet': 'frozen snow mountain peak', 'u-coc': 'dark purple demonic abyss valley with mist'}
for k, v in dd.items():
    a('dd-' + k, 'landscape scene, ' + v + ', ' + STY, (1216, 832), 'scene')

ch = "full body standing character, front view, " + WH + STY + ", "
dt = {0: 'old wise male elder cultivator with white beard in blue robes', 1: 'beautiful female sect leader in white and gold robes', 2: 'young graceful female cultivator in pink robes', 3: 'young male outer disciple in grey robes', 4: 'cheerful teenage male disciple in green robes', 6: 'young female alchemist in teal robes'}
for k, v in dt.items():
    a('de-tu-%d' % k, ch + v, (1024, 1024), 'icon')

a('mo-huyet-ma', "menacing blood demon avatar bust portrait, red mist, horns, " + WH + STY, (1024, 1024), 'icon')
a('mo-kim-giap', "golden armored celestial immortal bust portrait, majestic, " + WH + STY, (1024, 1024), 'icon')
a('mo-tam-ma', "dark purple heart-demon ghostly bust portrait, ethereal, " + WH + STY, (1024, 1024), 'icon')

mt = {'crane': 'majestic white immortal crane flying with clouds', 'phoenix': 'icy blue phoenix with frost wings flying', 'sword': 'flying sword with glowing aura and clouds', 'turtle': 'giant divine black turtle with jade shell'}
for k, v in mt.items():
    a('mt-' + k, v + ', ' + WH + STY, (1216, 832), 'icon')

a('nv-nam', 'handsome young male cultivator hero standing with a sword, long black hair in topknot, jade green and white robes, full body, front view, ' + WH + STY, (1024, 1024), 'icon')

NEG = "text, watermark, signature, blurry, low quality, cropped, multiple objects, deformed"


def wf(p, size, seed, pre):
    return {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": "juggernautXL_v9Rdphoto2Lightning.safetensors"}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"text": p, "clip": ["1", 1]}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"text": NEG, "clip": ["1", 1]}},
        "4": {"class_type": "EmptyLatentImage", "inputs": {"width": size[0], "height": size[1], "batch_size": 1}},
        "5": {"class_type": "KSampler", "inputs": {"seed": seed, "steps": 6, "cfg": 2.0, "sampler_name": "dpmpp_sde", "scheduler": "karras", "denoise": 1.0, "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0]}},
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage", "inputs": {"filename_prefix": pre, "images": ["6", 0]}},
    }


def post(path, data):
    r = urllib.request.Request(H + path, json.dumps(data).encode(), {'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(r))


if __name__ == '__main__':
    os.makedirs('raw', exist_ok=True)
    only = sys.argv[1:]
    for i, (k, (p, size, kind)) in enumerate(P.items()):
        if only and k not in only:
            continue
        if os.path.exists('raw/%s.png' % k):
            continue
        pid = post('/prompt', {"prompt": wf(p, size, 1000 + i, 'fnht_' + k)})['prompt_id']
        while True:
            h = json.load(urllib.request.urlopen(H + '/history/' + pid))
            if pid in h:
                break
            time.sleep(1)
        o = h[pid]['outputs']['7']['images'][0]
        d = urllib.request.urlopen("%s/view?filename=%s&subfolder=%s&type=%s" % (H, o['filename'], o['subfolder'], o['type'])).read()
        open('raw/%s.png' % k, 'wb').write(d)
        print(k, flush=True)
