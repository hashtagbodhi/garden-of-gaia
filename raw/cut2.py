import sys, os, numpy as np
from rembg import remove, new_session
from PIL import Image
from scipy import ndimage as ndi
s = new_session(sys.argv[1] if len(sys.argv) > 1 else 'birefnet-general')
src, dst = 'raw/gal', 'raw/cut2'
names = sorted(f for f in os.listdir(src) if f.endswith('-0.jpg'))
for f in names:
    out_f = os.path.join(dst, f.replace('-0.jpg', '.png'))
    if os.path.exists(out_f): continue
    im = Image.open(os.path.join(src, f)).convert('RGB')
    cut = np.array(remove(im, session=s))
    a = cut[..., 3]
    solid = a > 110
    lab, n = ndi.label(solid)
    if n:
        sizes = ndi.sum(solid, lab, range(1, n + 1)); big = sizes.max()
        keep = np.isin(lab, [i + 1 for i, v in enumerate(sizes) if v > big * 0.04])   # drop stray islands
        filled = ndi.binary_fill_holes(keep)                                            # no see-through holes inside a product
        a = np.where(filled, np.maximum(a, np.where(filled & ~solid, 255, a)), 0).astype(np.uint8)
        rgb = np.array(im); cut = np.dstack([rgb, a])
    Image.fromarray(cut).save(out_f)
    print(f, flush=True)
print('done')
