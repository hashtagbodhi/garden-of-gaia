import os, json, numpy as np
from PIL import Image
from scipy import ndimage as ndi
out = {}
os.makedirs('public/assets/cut', exist_ok=True)
for f in sorted(os.listdir('raw/cut2')):
    h = f[:-4]
    im = np.array(Image.open('raw/cut2/' + f).convert('RGBA'))
    a = im[..., 3]; solid = a > 110
    lab, n = ndi.label(solid)
    if n > 1:
        sizes = ndi.sum(solid, lab, range(1, n + 1)); big = sizes.max()
        keep = np.isin(lab, [i + 1 for i, v in enumerate(sizes) if v >= big * 0.45])   # the product, not props beside it
        a = np.where(keep, a, 0).astype(np.uint8); solid = keep
    rows = solid.sum(1); cols = solid.sum(0); mr = rows.max()
    ys = np.where(rows > 0)[0]; y0, y1 = ys[0], ys[-1]
    while y1 > y0 and rows[y1] < mr * 0.3: y1 -= 1          # drop thin stand legs and ragged tails
    while y0 < y1 and rows[y0] < mr * 0.2: y0 += 1
    xs = np.where(solid[y0:y1 + 1].sum(0) > 0)[0]; x0, x1 = xs[0], xs[-1]
    im[..., 3] = a
    crop = Image.fromarray(im[y0:y1 + 1, x0:x1 + 1])
    crop.thumbnail((900, 900), Image.LANCZOS)
    crop.save(f'public/assets/cut/{h}.webp', quality=88, method=5)
    out[h] = {'w': crop.width, 'h': crop.height}
for h, src in [('garden-of-gaia-gift-cards', 'raw/obj-card.png'), ('free-guide-creating-your-own-divine-pantry', 'raw/obj-book.png')]:
    im = Image.open(src).convert('RGBA'); im.thumbnail((900, 900), Image.LANCZOS); im.save(f'public/assets/cut/{h}.webp', quality=90); out[h] = {'w': im.width, 'h': im.height}
json.dump(out, open('src/cuts.json', 'w'))
print(len(out))
