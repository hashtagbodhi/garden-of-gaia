import os, numpy as np
from rembg import remove, new_session
from PIL import Image
from scipy import ndimage as ndi
s = new_session('birefnet-general-lite')
O = {'new-product-length-strength-ayurvedic-hair-oil-pre-wash-ritual-1oz-bottle-starter-exclusive': (.34, .2, .82, .82),
     'vampire-repellent-non-toxic-herbal-bug-spray': (.28, .3, .72, .83),
     'wildcrafted-mullein': (.15, 0, .85, .66),
     'frankincense-resin-boswellia-serrata': (0, .55, 1, .97)}
for f in sorted(os.listdir('raw/hi')):
    h = f[:-4]; out_f = f'raw/cut3/{h}.png'
    if os.path.exists(out_f): continue
    im = Image.open('raw/hi/' + f).convert('RGB'); W, H = im.size
    if h in O: x0, y0, x1, y1 = O[h]; im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    small = im.copy(); small.thumbnail((1400, 1400), Image.LANCZOS)
    a = np.array(remove(small, session=s))[..., 3]
    solid = a > 110; lab, n = ndi.label(solid)
    if n:
        sizes = ndi.sum(solid, lab, range(1, n + 1)); big = sizes.max()
        keep = np.isin(lab, [i + 1 for i, v in enumerate(sizes) if v > big * 0.04]); filled = ndi.binary_fill_holes(keep)
        a = np.where(filled, np.maximum(a, np.where(filled & ~solid, 255, a)), 0).astype(np.uint8)
    A = Image.fromarray(a).resize(im.size, Image.LANCZOS)      # full-resolution colour, model's mask
    im.putalpha(A); im.save(out_f); print(h[:40], im.size, flush=True)
print('done')
