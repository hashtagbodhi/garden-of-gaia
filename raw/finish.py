import os, json, numpy as np
from PIL import Image, ImageEnhance
from scipy import ndimage as ndi
out = {}


def grade(im):
    """Sit a daylight product photo in the moonlit garden: cooler and deeper, a cool rim from the moon, a warm bounce from the lanterns."""
    rgb = im[..., :3].astype(np.float32) / 255.0
    a = im[..., 3].astype(np.float32) / 255.0
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    rgb = lum[..., None] * 0.1 + rgb * 0.9
    rgb = np.power(rgb, 1.1) * np.array([0.88, 0.94, 1.03], np.float32)
    k = max(2, int(im.shape[0] * 0.012))
    soft = ndi.gaussian_filter(a, k * 0.8)
    moon = np.clip(a - np.roll(np.roll(soft, k, 0), k, 1), 0, 1)       # edges facing upper-left
    lamp = np.clip(a - np.roll(np.roll(soft, -k, 0), -k, 1), 0, 1)     # edges facing lower-right
    rgb += ndi.gaussian_filter(moon, 1.2)[..., None] * np.array([0.42, 0.72, 1.0], np.float32) * 0.5
    rgb += ndi.gaussian_filter(lamp, 1.2)[..., None] * np.array([1.0, 0.66, 0.34], np.float32) * 0.2
    out_im = im.copy()
    out_im[..., :3] = (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
    return out_im

os.makedirs('public/assets/cut', exist_ok=True); os.makedirs('public/assets/thumb', exist_ok=True); os.makedirs('public/assets/card', exist_ok=True)
for f in sorted(os.listdir('raw/cut3')):
    h = f[:-4]
    im = np.array(Image.open('raw/cut3/' + f).convert('RGBA'))
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
    plain = Image.fromarray(im[y0:y1 + 1, x0:x1 + 1])          # ungraded, for bright list thumbnails
    th = ImageEnhance.Color(ImageEnhance.Brightness(plain).enhance(1.08)).enhance(1.06); th.thumbnail((240, 240), Image.LANCZOS)
    th.save(f'public/assets/thumb/{h}.webp', quality=88)
    cd = ImageEnhance.Color(ImageEnhance.Brightness(plain).enhance(1.05)).enhance(1.05); cd.thumbnail((640, 640), Image.LANCZOS); cd.save(f'public/assets/card/{h}.webp', quality=84)   # classic site product cards
    crop = Image.fromarray(grade(im[y0:y1 + 1, x0:x1 + 1]))
    crop.thumbnail((1200, 1200), Image.LANCZOS)
    crop.save(f'public/assets/cut/{h}.webp', quality=88, method=5)
    out[h] = {'w': crop.width, 'h': crop.height}
for h, src in [('garden-of-gaia-gift-cards', 'raw/obj-card.png'), ('free-guide-creating-your-own-divine-pantry', 'raw/obj-book.png')]:
    im = Image.open(src).convert('RGBA'); im.thumbnail((900, 900), Image.LANCZOS); im.save(f'public/assets/cut/{h}.webp', quality=90); out[h] = {'w': im.width, 'h': im.height}; t2 = im.copy(); t2.thumbnail((240, 240), Image.LANCZOS); t2.save(f'public/assets/thumb/{h}.webp', quality=90); t3 = im.copy(); t3.thumbnail((640, 640), Image.LANCZOS); t3.save(f'public/assets/card/{h}.webp', quality=88)
json.dump(out, open('src/cuts.json', 'w'))
print(len(out))
