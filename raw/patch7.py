p = 'src/main.js'
s = open(p).read()
a = "innerHeight * (current?.items.length ? 0.2 : 0.2)"
assert a in s
s = s.replace(a, "innerHeight * (current?.items.length ? 0.105 : 0.17)")   # leave headroom so Sarah's face clears the header
open(p, 'w').write(s)
c = open('src/style.css').read()
c += """
/* ---- phones: a lighter, shorter header shade so it never sits over Sarah's face ---- */
@media (max-width: 820px) {
  .top { background: linear-gradient(180deg, rgba(5, 12, 21, .8) 0, rgba(5, 12, 21, .45) 60%, rgba(5, 12, 21, 0) 100%); padding-bottom: 14px !important; }
  .veil { background: linear-gradient(0deg, rgba(5, 12, 21, .92) 0, rgba(5, 12, 21, .5) 24%, rgba(5, 12, 21, 0) 46%); }
  body.reading .top { background: linear-gradient(180deg, rgba(5, 12, 21, .96) 0, rgba(5, 12, 21, .85) 70%, rgba(5, 12, 21, 0) 100%); }
}
"""
open('src/style.css', 'w').write(c)
print('ok')
