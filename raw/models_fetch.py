# Poly Haven (CC0) photo-scanned models for the herb grove: gltf + bin + colour texture only (the garden is unlit).
import json, os, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'models'); os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'shop-build-script/1.0'}
MODELS = {'dandelion': 'dandelion_01', 'nettle': 'nettle_plant', 'ginger': 'food_ginger_01', 'lime': 'food_lime_01', 'lemon': 'lemon', 'acv': 'food_apple_01'}
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r: return r.read()
info = {}
for key, slug in MODELS.items():
    files = json.loads(get(f'https://api.polyhaven.com/files/{slug}'))
    g = files['gltf']['1k']['gltf']
    doc = json.loads(get(g['url']))
    # keep only the base colour: drop normal / roughness maps so the download stays small
    used = set()
    for m in doc.get('materials', []):
        m.pop('normalTexture', None); m.pop('occlusionTexture', None)
        pbr = m.get('pbrMetallicRoughness', {}); pbr.pop('metallicRoughnessTexture', None)
        if 'baseColorTexture' in pbr: used.add(doc['textures'][pbr['baseColorTexture']['index']]['source'])
    d = os.path.join(OUT, key); os.makedirs(d, exist_ok=True); size = 0
    for rel, f in g.get('include', {}).items():
        base = os.path.basename(rel)
        is_tex = rel.startswith('textures/')
        if is_tex and not any(doc['images'][i]['uri'] == rel for i in used): continue
        data = get(f['url']); size += len(data)
        os.makedirs(os.path.dirname(os.path.join(d, rel)), exist_ok=True); open(os.path.join(d, rel), 'wb').write(data)
    open(os.path.join(d, 'model.gltf'), 'w').write(json.dumps(doc))
    a = json.loads(get(f'https://api.polyhaven.com/info/{slug}'))
    info[key] = {'slug': slug, 'name': a['name'], 'by': list(a['authors'].keys()), 'kb': size // 1024}
    print(key, info[key])
json.dump(info, open(os.path.join(ROOT, 'src', 'models.json'), 'w'), indent=1)
