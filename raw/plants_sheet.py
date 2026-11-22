import glob, json, os, sys
from PIL import Image, ImageDraw
os.chdir('/home/user/garden-of-gaia/raw/plants2')
keys = list(json.load(open('/home/user/garden-of-gaia/src/ingredients.json'))['plants'])
keys = [k for k in keys if glob.glob(f'{k}-*.jpg')]
T = 190; per = 11
for si in range(0, len(keys), per):
    part = keys[si:si + per]
    sheet = Image.new('RGB', (T * 8 + 10, (T + 22) * len(part)), (20, 20, 30)); d = ImageDraw.Draw(sheet)
    for r, k in enumerate(part):
        d.text((4, r * (T + 22) + 3), k, fill=(255, 230, 120))
        for f in sorted(glob.glob(f'{k}-*.jpg'))[:8]:
            i = int(f.rsplit('-', 1)[1][:-4])
            try: im = Image.open(f).convert('RGB')
            except Exception: continue
            im.thumbnail((T, T)); sheet.paste(im, (i * T, r * (T + 22) + 20)); d.text((i * T + 4, r * (T + 22) + 22), str(i), fill=(255, 255, 255))
    sheet.save(f'/home/user/garden-of-gaia/raw/_ps{si // per}.jpg', quality=72)
print(len(keys), 'plants')
