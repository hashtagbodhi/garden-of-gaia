# Artlist plant renders (transparent PNG) -> public/assets/plantart/<key>.webp, trimmed to the plant, + src/plantart.json (sizes)
import glob, json, os
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'plantart'); os.makedirs(OUT, exist_ok=True)
meta = {}
for f in sorted(glob.glob(os.path.join(ROOT, 'raw', 'plantart', '*.png'))):
    k = os.path.basename(f)[:-4]
    im = Image.open(f).convert('RGBA'); a = np.array(im)[..., 3]
    ys, xs = np.where(a > 24); pad = 8
    im = im.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad + 1), min(im.height, ys.max() + pad + 1)))
    im.thumbnail((1000, 1000), Image.LANCZOS)
    im.save(os.path.join(OUT, k + '.webp'), quality=88, method=5)
    meta[k] = {'w': im.width, 'h': im.height}
json.dump(meta, open(os.path.join(ROOT, 'src', 'plantart.json'), 'w'))
print(len(meta), 'plants', meta)
