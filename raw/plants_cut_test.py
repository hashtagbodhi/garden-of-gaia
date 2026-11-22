import sys, glob, os
from PIL import Image
from rembg import remove, new_session
os.chdir('/home/user/garden-of-gaia/raw/plants2')
s = new_session('isnet-general-use')
fs = sorted(glob.glob('lavender-*.jpg') + glob.glob('calendula-*.jpg') + glob.glob('turmeric-*.jpg') + glob.glob('damiana-*.jpg') + glob.glob('frankincense-*.jpg'))
W = 300; sheet = Image.new('RGB', (W * 6, W * 12), (12, 16, 30))
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB'); im.thumbnail((W, W))
    cut = remove(im, session=s)
    r, c = (i // 6) * 2, i % 6
    sheet.paste(im, (c * W, r * W)); sheet.paste(cut, (c * W, (r + 1) * W), cut)
sheet.save('/home/user/garden-of-gaia/raw/_cut-test.jpg', quality=80); print('ok')
