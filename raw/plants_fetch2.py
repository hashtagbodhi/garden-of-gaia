# Curated species photos from iNaturalist (taxon photos), openly licensed only (CC0 / CC BY / CC BY-SA / public domain).
# usage: python3 raw/plants_fetch2.py [key ...] -> raw/plants2/<key>-<n>.jpg + credits.json
import json, os, sys, time, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'raw', 'plants2'); os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'shop-build-script/1.0'}
TAXON = {
    'hibiscus': 'Hibiscus sabdariffa', 'rose': 'Rosa', 'skullcap': 'Scutellaria', 'valerian': 'Valeriana', 'dandelion': 'Taraxacum', 'white-lotus': 'Nymphaea', 'lavender': 'Lavandula', 'marshmallow': 'Althaea', 'cardamom': 'Zingiberaceae', 'star-anise': 'Illicium', 'cacao': 'Theobroma', 'sage': 'Salvia officinalis', 'oud': 'Aquilaria malaccensis',
    'spruce': 'Picea abies', 'birch': 'Betula pendula', 'lilac': 'Syringa vulgaris', 'acv': 'Malus domestica', 'cacao-bean': 'Theobroma cacao',
    'peppermint': 'Mentha', 'black-sage': 'Salvia mellifera', 'dragons-blood': 'Dracaena draco', 'benzoin': 'Styrax',
    'rosemary': 'Salvia rosmarinus', 'oat-straw': 'Avena sativa', 'lime': 'Citrus × aurantiifolia', 'geranium': 'Pelargonium graveolens',
    'frankincense': 'Boswellia sacra', 'black-tea': 'Camellia sinensis', 'beeswax': 'Apis mellifera', 'orange': 'Citrus × sinensis', 'lemon': 'Citrus × limon',
}
SKIP = {'tallow', 'magnesium'}
OK = {'cc0', 'cc-by', 'cc-by-sa', 'pd', None}

def get(url):
    err = None
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r: return r.read()
        except Exception as e:
            err = e; time.sleep(2 + i * 3)
    raise err

plants = json.load(open(os.path.join(ROOT, 'src', 'ingredients.json')))['plants']
keys = sys.argv[1:] or list(plants)
cp = os.path.join(OUT, 'credits.json'); credits = json.load(open(cp)) if os.path.exists(cp) else {}
for k in keys:
    if k in SKIP: continue
    name = TAXON.get(k) or plants[k]['b'].split('&')[0].replace('spp.', '').strip()
    try:
        res = json.loads(get('https://api.inaturalist.org/v1/taxa?' + urllib.parse.urlencode({'q': name, 'per_page': 1})))['results']
        if not res: print(k, name, 'NO TAXON'); continue
        t = json.loads(get(f"https://api.inaturalist.org/v1/taxa/{res[0]['id']}"))['results'][0]
    except Exception as e:
        print(k, 'ERR', e); continue
    credits[k] = []; n = 0
    for tp in t.get('taxon_photos', []):
        ph = tp['photo']
        if ph.get('license_code') not in OK or not ph.get('medium_url'): continue
        try:
            open(os.path.join(OUT, f'{k}-{n}.jpg'), 'wb').write(get(ph['medium_url'].replace('medium', 'large')))
            credits[k].append({'by': ph.get('attribution', ''), 'lic': ph.get('license_code') or 'pd', 'src': ph.get('native_page_url') or f"https://www.inaturalist.org/photos/{ph['id']}"}); n += 1
        except Exception as e:
            print(k, 'dl ERR', e)
        if n >= 8: break
    print(k, '|', t['name'], '|', n); json.dump(credits, open(cp, 'w'), indent=1); time.sleep(1.1)
