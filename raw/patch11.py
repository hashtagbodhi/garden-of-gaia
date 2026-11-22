f = open('raw/finish.py').read()
a = "    crop = Image.fromarray(grade(im[y0:y1 + 1, x0:x1 + 1]))"
assert a in f
f = f.replace(a, """    plain = Image.fromarray(im[y0:y1 + 1, x0:x1 + 1])          # ungraded, for bright list thumbnails
    th = ImageEnhance.Color(ImageEnhance.Brightness(plain).enhance(1.08)).enhance(1.06); th.thumbnail((240, 240), Image.LANCZOS)
    th.save(f'public/assets/thumb/{h}.webp', quality=88)
""" + a)
f = f.replace("from PIL import Image\n", "from PIL import Image, ImageEnhance\n", 1)
f = f.replace("os.makedirs('public/assets/cut', exist_ok=True)", "os.makedirs('public/assets/cut', exist_ok=True); os.makedirs('public/assets/thumb', exist_ok=True)")
a = "im.save(f'public/assets/cut/{h}.webp', quality=90); out[h] = {'w': im.width, 'h': im.height}"
assert a in f
f = f.replace(a, a + "; t2 = im.copy(); t2.thumbnail((240, 240), Image.LANCZOS); t2.save(f'public/assets/thumb/{h}.webp', quality=90)")
open('raw/finish.py', 'w').write(f)

p = 'src/main.js'
s = open(p).read()
a = "const cutUrl = (p) => A(`assets/cut/${p.handle}.webp`);"
assert a in s
s = s.replace(a, a + "\nconst thumbUrl = (p) => A(`assets/thumb/${p.handle}.webp`);   // bright, ungraded, for lists")
for old in ["el('img', { src: cutUrl(p), alt: '' })", "el('img', { src: cutUrl(it.p), alt: '', loading: 'lazy' })"]:
    assert old in s, old
    s = s.replace(old, old.replace('cutUrl', 'thumbUrl'))
open(p, 'w').write(s)

c = open('src/style.css').read()
c += """
/* ---- list thumbnails: bright product on a pale tile so it reads on the dark page ---- */
.index-list img, .lines img { box-sizing: border-box; padding: 5px; border-radius: 12px; object-fit: contain; background: radial-gradient(circle at 50% 35%, #fbf7ec 0, #e9dfc8 70%, #d9cdb0 100%); box-shadow: 0 1px 0 rgba(255, 255, 255, .5) inset, 0 6px 18px rgba(0, 0, 0, .35); }
.index-list img { width: 52px; height: 58px; }
.index-list button { grid-template-columns: 52px 1fr auto; }
.lines img { width: 60px; height: 68px; }
.lines li { grid-template-columns: 60px 1fr auto; }
@media (max-width: 820px) {
  .index-list img { width: 68px; height: 74px; padding: 6px; border-radius: 14px; }
  .index-list button { grid-template-columns: 68px 1fr auto; min-height: 88px; }
}
"""
open('src/style.css', 'w').write(c)
pk = open('raw/pack.cjs').read().replace("['img', 'img-s', 'cut', 'audio', 'gal']", "['img', 'img-s', 'cut', 'thumb', 'audio', 'gal']")
open('raw/pack.cjs', 'w').write(pk)
print('ok')
