h = open('index.html').read()
a = '    <h1 id="entry-title">The Garden of Gaia <em>Apothecary</em></h1>'
assert a in h
h = h.replace(a, '    <h1 id="entry-title" class="entry-logo"><img src="./assets/img/logo.webp" alt="Garden of Gaia Apothecary" width="520" height="350"></h1>')
open('index.html', 'w').write(h)
c = open('src/style.css').read()
c += """
/* ---- entry: the logo itself ---- */
.entry-logo { margin: 0; line-height: 0; }
.entry-logo img { display: block; width: min(440px, 74vw); height: auto; filter: drop-shadow(0 2px 24px rgba(5, 12, 21, .8)); }
"""
open('src/style.css', 'w').write(c)
s = open('raw/shot.cjs').read()
if "shot('entry')" not in s:
    s = s.replace("  await p.click('#enter-yes'); await p.waitForTimeout(4500); await shot('gate');", "  await p.waitForTimeout(800); await shot('entry');\n  await p.click('#enter-yes'); await p.waitForTimeout(4500); await shot('gate');")
    open('raw/shot.cjs', 'w').write(s)
print('ok')
