p = 'src/main.js'
s = open(p).read()
a = "import '@fontsource-variable/instrument-sans';"
assert a in s
s = s.replace(a, a + "\nimport '@fontsource/henny-penny/latin-400.css';", 1)
open(p, 'w').write(s)
c = open('src/style.css').read()
c += """
/* ---- product name on the product page ---- */
#detail-name { font-family: 'Henny Penny', var(--serif); font-weight: 400; letter-spacing: 0; line-height: 1.12; font-size: clamp(2.3rem, 3.9vw, 3.6rem); padding-top: .12em; }
#detail-name.long { font-size: clamp(1.9rem, 2.9vw, 2.7rem); line-height: 1.15; }
@media (max-width: 820px) { #detail-name { font-size: 2.3rem; } #detail-name.long { font-size: 1.85rem; } }
"""
open('src/style.css', 'w').write(c)
print('ok')
