# Download finished Artlist plant renders (read from this session's transcript) to raw/plantart/<key>.png
# usage: python3 raw/plant_pull.py <transcript.jsonl> key=generationId [key=generationId ...]
import os, re, sys, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'raw', 'plantart'); os.makedirs(OUT, exist_ok=True)
text = open(sys.argv[1], encoding='utf-8', errors='ignore').read().replace('\\"', '"').replace('\\\\', '\\')
found = {}
for m in re.finditer(r'"assetUrl":"(https://cms-toolkit-artifacts\.artlist\.io/[^"]+?)","generationId":"([0-9a-f-]{36})"', text):
    found[m.group(2)] = m.group(1).replace('\\u0026', '&')
for pair in sys.argv[2:]:
    k, g = pair.split('=')
    if g not in found: print('MISSING', k); continue
    dst = os.path.join(OUT, k + '.png')
    if os.path.exists(dst) and os.path.getsize(dst) > 50000: print('have', k); continue
    try:
        open(dst, 'wb').write(urllib.request.urlopen(urllib.request.Request(found[g], headers={'User-Agent': 'Mozilla/5.0'}), timeout=90).read()); print('ok', k, os.path.getsize(dst) // 1024, 'KB')
    except Exception as e:
        print('ERR', k, e)
