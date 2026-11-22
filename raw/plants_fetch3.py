# Fallback for plants iNaturalist had no openly licensed photo for: Wikimedia Commons, open licences only.
# usage: python3 raw/plants_fetch3.py key "Search term" [key "Search term" ...]
import json, os, re, sys, time, urllib.parse, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'raw', 'plants2')
UA = {'User-Agent': 'shop-build-script/1.0 (static site build)'}
def get(url):
    err = None
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r: return r.read()
        except Exception as e:
            err = e; time.sleep(3 + i * 4)
    raise err
cp = os.path.join(OUT, 'credits.json'); credits = json.load(open(cp))
args = sys.argv[1:]
for k, term in zip(args[::2], args[1::2]):
    q = urllib.parse.urlencode({'action': 'query', 'format': 'json', 'generator': 'images', 'titles': term, 'gimlimit': 40, 'redirects': 1,
                                'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': 1024})
    pages = json.loads(get('https://en.wikipedia.org/w/api.php?' + q)).get('query', {}).get('pages', {})
    credits[k] = []; n = 0
    for p in sorted(pages.values(), key=lambda p: -p['imageinfo'][0].get('width', 0) if 'imageinfo' in p else 0):
        if 'imageinfo' not in p: continue
        ii = p['imageinfo'][0]; md = ii.get('extmetadata', {})
        lic = md.get('LicenseShortName', {}).get('value', '')
        if not re.match(r'^(CC0|Public domain|CC BY(-SA)? [0-9.]+)', lic) or ii.get('width', 0) < 700 or not ii.get('thumburl', '').lower().endswith(('.jpg', '.jpeg')): continue
        by = re.sub(r'<[^>]+>', '', md.get('Artist', {}).get('value', '')).strip()[:80]
        try:
            time.sleep(1.5); open(os.path.join(OUT, f'{k}-{n}.jpg'), 'wb').write(get(ii['thumburl']))
        except Exception as e:
            print(k, 'dl ERR', e); continue
        credits[k].append({'by': f'{by}, {lic}', 'lic': lic, 'src': ii.get('descriptionurl', '')}); n += 1
        if n >= 6: break
    print(k, term, n); json.dump(credits, open(cp, 'w'), indent=1); time.sleep(1.5)
