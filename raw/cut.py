import sys, os
from rembg import remove, new_session
from PIL import Image
s = new_session('isnet-general-use')
src, dst = 'raw/prod', 'raw/cut'
names = sys.argv[1:] or sorted(os.listdir(src))
for f in names:
    im = Image.open(os.path.join(src, f)).convert('RGB')
    out = remove(im, session=s)
    out.save(os.path.join(dst, f.replace('.jpg', '.png')))
print('done', len(names))
