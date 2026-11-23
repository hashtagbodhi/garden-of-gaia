# The wooden signs sheet (one Artlist image) -> public/assets/img/ui-*.webp
import os, numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
im = Image.open(os.path.join(ROOT, 'raw', 'sheets', 'signs.png')).convert('RGBA'); a = np.array(im)[..., 3]
ys = np.where((a > 40).sum(axis=1) > 0)[0]; split = max((ys[i + 1] - ys[i], ys[i]) for i in range(len(ys) - 1))[1] + 8
def cells(y0, y1):
    xs = np.where((a[y0:y1] > 40).sum(axis=0) > 0)[0]; cuts = [0] + [int((xs[i] + xs[i + 1]) / 2) for i in range(len(xs) - 1) if xs[i + 1] - xs[i] > 30] + [im.width]
    out = []
    for x0, x1 in zip(cuts, cuts[1:]):
        c = im.crop((x0, y0, x1, y1)); al = np.array(c)[..., 3]; yy, xx = np.where(al > 40); out.append(c.crop((xx.min() - 4, yy.min() - 4, xx.max() + 5, yy.max() + 5)))
    return out
top, bot = cells(0, split), cells(split, im.height); assert len(top) == 3 and len(bot) == 3, (len(top), len(bot))
for name, c, w in zip(['board', 'pill', 'banner', 'disc', 'tag', 'leaf'], top + bot, [900, 700, 760, 520, 360, 460]):
    c.thumbnail((w, 2000), Image.LANCZOS); c.save(os.path.join(ROOT, 'public', 'assets', 'img', f'ui-{name}.webp'), quality=90, method=5); print(name, c.size, round(c.width / c.height, 3))
