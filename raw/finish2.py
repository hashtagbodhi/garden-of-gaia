# Artlist re-renders (already lit for the night garden, transparent) -> garden cut-outs, thumbnails and website cards.
import os, json, glob, numpy as np
from PIL import Image, ImageEnhance
cuts = json.load(open('src/cuts.json'))
done = []
for f in sorted(glob.glob('raw/regen/*.png')):
    h = os.path.basename(f)[:-4]
    im = Image.open(f).convert('RGBA'); a = np.array(im)[..., 3]
    ys, xs = np.where(a > 24)
    pad = 6
    box = (max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad + 1), min(im.height, ys.max() + pad + 1))
    crop = im.crop(box)
    cut = crop.copy(); cut.thumbnail((1200, 1200), Image.LANCZOS); cut.save(f'public/assets/cut/{h}.webp', quality=90, method=5)
    th = ImageEnhance.Brightness(crop).enhance(1.06); th.thumbnail((240, 240), Image.LANCZOS); th.save(f'public/assets/thumb/{h}.webp', quality=88)
    cd = ImageEnhance.Brightness(crop).enhance(1.04); cd.thumbnail((640, 640), Image.LANCZOS); cd.save(f'public/assets/card/{h}.webp', quality=86)
    cuts[h] = {'w': cut.width, 'h': cut.height}; done.append(h)
json.dump(cuts, open('src/cuts.json', 'w'))
print(len(done), 'replaced')
