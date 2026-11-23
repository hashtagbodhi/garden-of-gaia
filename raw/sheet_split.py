# A sheet of several plants in a row (one Artlist image) -> one PNG per plant in raw/plantart/.
# usage: python3 raw/sheet_split.py <transcript.jsonl> <generationId>=key1,key2,... [more]
import os, re, sys, urllib.request
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SH = os.path.join(ROOT, 'raw', 'sheets'); OUT = os.path.join(ROOT, 'raw', 'plantart'); os.makedirs(SH, exist_ok=True); os.makedirs(OUT, exist_ok=True)
text = open(sys.argv[1], encoding='utf-8', errors='ignore').read().replace('\\"', '"').replace('\\\\', '\\')
found = {m.group(2): m.group(1).replace('\\u0026', '&') for m in re.finditer(r'"assetUrl":"(https://cms-toolkit-artifacts\.artlist\.io/[^"]+?)","generationId":"([0-9a-f-]{36})"', text)}
for pair in sys.argv[2:]:
    g, keys = pair.split('='); keys = keys.split(','); n = len(keys)
    f = os.path.join(SH, g + '.png')
    if not os.path.exists(f):
        if g not in found: print('MISSING', g); continue
        open(f, 'wb').write(urllib.request.urlopen(urllib.request.Request(found[g], headers={'User-Agent': 'Mozilla/5.0'}), timeout=120).read())
    im = Image.open(f).convert('RGBA'); a = np.array(im)[..., 3]
    # each cut is the emptiest column near where a boundary should fall (a faint glow can fill the gaps, so look for the valley)
    dense = (a > 90).sum(axis=0).astype(float); k = 21; smooth = np.convolve(dense, np.ones(k) / k, mode='same')
    xs = np.where(dense > 3)[0]; x0, x1 = xs.min(), xs.max(); step = (x1 - x0) / n; cuts = []
    for i in range(1, n):
        c = x0 + step * i; lo, hi = int(c - step * 0.4), int(c + step * 0.4); cuts.append(lo + int(np.argmin(smooth[lo:hi])))
    clean = all(smooth[c] < 2 for c in cuts); gaps = [(round(float(smooth[c]), 1), c) for c in cuts]
    edges = [0] + cuts + [im.width]
    for i, k in enumerate(keys):
        part = im.crop((edges[i], 0, edges[i + 1], im.height)); pa = np.array(part)[..., 3]; ys, px = np.where(pa > 24)
        part = part.crop((max(0, px.min() - 6), max(0, ys.min() - 6), min(part.width, px.max() + 7), min(part.height, ys.max() + 7)))
        part.save(os.path.join(OUT, k + '.png')); print(k, part.size, end='; ')
    print('\n ', g[:13], 'clean gaps' if clean else 'NO CLEAR GAPS, check by eye', gaps)
