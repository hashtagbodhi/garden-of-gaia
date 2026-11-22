h = open('index.html').read()
a = '    <span>The Garden of Gaia</span><small>Apothecary</small>'
assert a in h
h = h.replace(a, '    <img src="./assets/img/logo.webp" alt="Garden of Gaia Apothecary" width="130" height="86">')
open('index.html', 'w').write(h)
c = open('src/style.css').read()
c += """
/* ---- logo ---- */
.mark img { display: block; height: 78px; width: auto; filter: drop-shadow(0 1px 10px rgba(5, 12, 21, .8)); }
.top { padding-bottom: 30px !important; }
@media (max-width: 820px) { .mark img { height: 54px; } }
"""
open('src/style.css', 'w').write(c)
print('ok')
