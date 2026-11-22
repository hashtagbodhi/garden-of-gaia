# The chosen photo for each grove plant -> public/assets/plants/<key>.webp (3:4) + src/plants.json (credit line)
import json, os, re
from PIL import Image, ImageOps
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'raw', 'plants2'); OUT = os.path.join(ROOT, 'public', 'assets', 'plants'); os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT): os.unlink(os.path.join(OUT, f))
PICK = {   # only photos under an open licence (CC0, CC BY, CC BY-SA), checked by eye for the right plant
    'blue-lotus': 3, 'hibiscus': 2, 'butterfly-pea': 2, 'lavender': 2, 'calendula': 1, 'rose': 0, 'saffron': 0, 'ylang-ylang': 4, 'geranium': 0,
    'damiana': 1, 'mullein': 5, 'moringa': 3, 'soursop': 0, 'skullcap': 0, 'lemon-balm': 0, 'peppermint': 0, 'wild-dagga': 1, 'white-sage': 1,
    'black-sage': 2, 'rosemary': 0, 'eucalyptus': 7, 'black-tea': 0, 'dandelion': 0, 'milk-thistle': 6, 'turmeric': 3, 'ginger': 1,
    'cinnamon': 0, 'black-pepper': 2, 'black-seed': 1, 'annatto': 6, 'elderberry': 1, 'orange': 3, 'lime': 1, 'reishi': 0,
    'cacao': 2, 'cacao-bean': 0, 'frankincense': 1, 'sandalwood': 0, 'spruce': 4, 'birch': 1, 'lilac': 0, 'almond-oil': 0,
    'witch-hazel': 0, 'oat-straw': 2, 'acv': 1,
}
FOCUS = {'lavender': (0.5, 0.6), 'birch': (0.5, 0.4)}
credits = json.load(open(os.path.join(SRC, 'credits.json'))); out = {}
for k, i in PICK.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, f'{k}-{i}.jpg'))).convert('RGB')
    im = ImageOps.fit(im, (600, 800), Image.LANCZOS, centering=FOCUS.get(k, (0.5, 0.5)))
    im.save(os.path.join(OUT, f'{k}.webp'), quality=82, method=6)
    c = credits[k][i]; assert 'all rights reserved' not in c['by'], k
    by = re.sub(r'\s+', ' ', c['by']).strip()
    by = re.sub(r',?\s*uploaded by.*$', '', by)
    out[k] = {'by': by, 'src': c['src']}
json.dump(out, open(os.path.join(ROOT, 'src', 'plants.json'), 'w'), indent=1, ensure_ascii=False)
print(len(out), 'plants'); print(list(out.items())[:3])
