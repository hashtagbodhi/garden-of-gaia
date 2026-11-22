import numpy as np
from rembg import remove, new_session
from PIL import Image
from scipy import ndimage as ndi
s = new_session('birefnet-general-lite')
O = {'new-product-length-strength-ayurvedic-hair-oil-pre-wash-ritual-1oz-bottle-starter-exclusive': (0, .34, .2, .82, .82),
     'vampire-repellent-non-toxic-herbal-bug-spray': (0, .28, .3, .72, .83),
     'wildcrafted-mullein': (0, .15, 0, .85, .66),
     'frankincense-resin-boswellia-serrata': (3, 0, .5, .68, .93)}
for h, (i, x0, y0, x1, y1) in O.items():
    im = Image.open(f'raw/gal/{h}-{i}.jpg').convert('RGB'); W, H = im.size
    im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    cut = np.array(remove(im, session=s)); a = cut[..., 3]; solid = a > 110
    filled = ndi.binary_fill_holes(solid)
    cut = np.dstack([np.array(im), np.where(filled, np.maximum(a, np.where(filled & ~solid, 255, a)), 0).astype(np.uint8)])
    Image.fromarray(cut).save(f'raw/cut2/{h}.png'); print(h[:30])
