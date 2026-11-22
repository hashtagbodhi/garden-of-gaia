# Fetch real, licence-free (CC0) photos of every grove plant from iNaturalist.
# usage: python3 raw/plants_fetch.py [key ...]   -> raw/plants/<key>-<n>.jpg + raw/plants/credits.json
import json, os, sys, time, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'raw', 'plants'); os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'shop-build-script/1.0'}
# what to look for when the catalogue name is not a single species (or not a plant)
TAXON = {
    'hibiscus': 'Hibiscus sabdariffa', 'rose': 'Rosa damascena', 'sage': 'Salvia officinalis', 'oud': 'Aquilaria malaccensis',
    'spruce': 'Picea abies', 'birch': 'Betula pendula', 'lilac': 'Syringa vulgaris', 'acv': 'Malus domestica', 'cacao-bean': 'Theobroma cacao',
    'peppermint': 'Mentha piperita', 'black-sage': 'Salvia mellifera', 'dragons-blood': 'Dracaena draco', 'benzoin': 'Styrax officinalis',
    'rosemary': 'Salvia rosmarinus', 'oat-straw': 'Avena sativa', 'lime': 'Citrus aurantiifolia', 'geranium': 'Pelargonium graveolens',
    'frankincense': 'Boswellia sacra', 'black-tea': 'Camellia sinensis', 'beeswax': 'Apis mellifera',
}
SKIP = {'tallow', 'magnesium'}

def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r: return r.read()
        except Exception as e:
            time.sleep(2 + i * 3); err = e
    raise err

def photos(name, n=6):
    q = urllib.parse.urlencode({'taxon_name': name, 'photo_license': 'cc0', 'quality_grade': 'research', 'order_by': 'votes', 'per_page': 30, 'photos': 'true'})
    res = json.loads(get('https://api.inaturalist.org/v1/observations?' + q))['results']
    out = []
    for o in res:
        for ph in o.get('photos', [])[:1]:
            if ph.get('license_code') == 'cc0' and ph.get('url'):
                out.append({'url': ph['url'].replace('square', 'large'), 'by': ph.get('attribution', ''), 'obs': o['id'], 'faves': o.get('faves_count', 0)})
    return out[:n]

plants = json.load(open(os.path.join(ROOT, 'src', 'ingredients.json')))['plants']
keys = sys.argv[1:] or list(plants)
cp = os.path.join(OUT, 'credits.json'); credits = json.load(open(cp)) if os.path.exists(cp) else {}
for k in keys:
    if k in SKIP: continue
    name = TAXON.get(k) or plants[k]['b'].split('&')[0].replace('spp.', '').replace('×', '').strip()
    try:
        got = photos(name)
    except Exception as e:
        print(k, 'ERR', e); continue
    credits[k] = []
    for i, ph in enumerate(got):
        try:
            open(os.path.join(OUT, f'{k}-{i}.jpg'), 'wb').write(get(ph['url'])); credits[k].append(ph)
        except Exception as e:
            print(k, i, 'dl ERR', e)
    print(k, name, len(credits[k])); json.dump(credits, open(cp, 'w'), indent=1); time.sleep(1.1)
