# The shipping-bar sprite sheet (one Artlist image) -> public/assets/img/ship-*.webp
import os, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
im = Image.open(os.path.join(ROOT, 'raw', 'sheets', 'vine.png')).convert('RGBA'); a = np.array(im)[..., 3]
rows = (a > 40).sum(axis=1); ys = np.where(rows > 0)[0]
# the widest empty band between the garland and the row of objects
gaps = [(ys[i + 1] - ys[i], ys[i]) for i in range(len(ys) - 1) if ys[i + 1] - ys[i] > 20]; split = max(gaps)[1] + 10
def trim(box, pad=6):
    c = im.crop(box); al = np.array(c)[..., 3]; yy, xx = np.where(al > 40)
    return c.crop((max(0, xx.min() - pad), max(0, yy.min() - pad), min(c.width, xx.max() + pad + 1), min(c.height, yy.max() + pad + 1)))
out = {'vine': trim((0, 0, im.width, split))}
low = a[split:]; cols = (low > 40).sum(axis=0); xs = np.where(cols > 0)[0]
cuts = [0] + [int((xs[i] + xs[i + 1]) / 2) for i in range(len(xs) - 1) if xs[i + 1] - xs[i] > 40] + [im.width]
assert len(cuts) == 5, cuts
for name, x0, x1 in zip(['bud', 'bloom', 'fly', 'twig'], cuts, cuts[1:]): out[name] = trim((x0, split, x1, im.height))
H = {'vine': 150, 'bud': 150, 'bloom': 260, 'fly': 190, 'twig': 44}
for k, c in out.items():
    c.thumbnail((4000, H[k]), Image.LANCZOS); c.save(os.path.join(ROOT, 'public', 'assets', 'img', f'ship-{k}.webp'), quality=90, method=5); print(k, c.size)
