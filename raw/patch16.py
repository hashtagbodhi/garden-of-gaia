p = 'src/main.js'
s = open(p).read()
a = "  closeOverlays(true); $('#info').hidden = false; document.body.classList.add('reading');"
assert a in s
s = s.replace(a, a + "\n  paged = narrow.matches; document.body.classList.toggle('paged', paged);   // phones: a full page, like a product", 1)
open(p, 'w').write(s)
c = open('src/style.css').read()
c += """
/* ---- phones: story pages are full pages too, and the way back never scrolls away ---- */
.reviews li::before { display: none !important; }
.reviews li { padding-left: 0 !important; }
@media (max-width: 820px) {
  #info.column { top: 0; height: 100dvh; background: var(--night); animation-name: fade; }
  #info .column-in, #detail .column-in { padding-top: 70px; }
  .column .back { position: sticky; top: 0; z-index: 6; justify-self: stretch; order: -3; margin: 0 calc(var(--pad) * -1); padding: 12px var(--pad); background: linear-gradient(180deg, var(--night) 78%, rgba(5, 12, 21, 0)); }
  body.paged .top { background: var(--night); padding-bottom: 6px !important; }
  #info .prose { border-top: 0; padding-top: 4px; }
}
"""
open('src/style.css', 'w').write(c)
t = open('raw/shot.cjs').read()
if "shot('story2')" not in t:
    t = t.replace("await shot('story');", "await shot('story'); await p.evaluate(() => document.querySelector('#info .column-in').scrollTo(0, 900)); await p.waitForTimeout(300); await shot('story2');")
    open('raw/shot.cjs', 'w').write(t)
print('ok')
