p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


rep("for (const s of STATIONS) { const a = el('a', { href: `#${s.id}`, textContent: s.name }); a.dataset.id = s.id; $('#places-list').append(a); }",
    "for (const s of STATIONS) { const i = el('i'); i.style.backgroundImage = `url(${A(`assets/img-s/${s.icon}.webp`)})`; const a = el('a', { href: `#${s.id}` }, i, el('span', { textContent: s.name })); a.dataset.id = s.id; $('#places-list').append(a); }\n$('#gifts-top').onclick = () => openIndex('gift25');")
rep("  $('#places-count').textContent =", "  document.querySelector('#places-list a[aria-current]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });\n  $('#places-count').textContent =")
open(p, 'w').write(s)

h = open('index.html').read()
a = '    <button id="index-open" class="text-link">Shop index</button>'
assert a in h
h = h.replace(a, '    <button id="gifts-top" class="text-link gifts-top">Gifts</button>\n' + a, 1)
open('index.html', 'w').write(h)

c = open('src/style.css').read()
c += """
/* ---- places: on desktop a line of names; on phones a strip of picture buttons ---- */
.places-list a i { display: none; }
.gifts-top { display: none; }
@media (max-width: 820px) {
  .gifts-top { display: inline; color: var(--glow); }
  .places { left: 0; right: 0; bottom: 0; padding: 10px 0 calc(10px + env(safe-area-inset-bottom, 0px)); border-top: 1px solid var(--rule); gap: 0; background: linear-gradient(180deg, rgba(5, 12, 21, .55), rgba(5, 12, 21, .92)); }
  #places-prev, #places-next, .places-count, .places .gifts { display: none; }
  .places-list { flex: 1; justify-content: flex-start; gap: 4px; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: none; padding: 0 var(--pad); }
  .places-list::-webkit-scrollbar { display: none; }
  .places-list a, .places-list a[aria-current="page"] { display: grid; justify-items: center; gap: 6px; flex: 0 0 auto; width: 74px; padding: 0; scroll-snap-align: center; font-family: var(--sans); font-size: .62rem; font-style: normal; font-weight: 550; letter-spacing: .06em; line-height: 1.15; text-align: center; color: var(--ink-3); white-space: normal; }
  .places-list a i { display: block; width: 46px; height: 46px; border-radius: 50%; background-size: 170%; background-position: center 35%; background-color: #0b1a28; box-shadow: 0 0 0 1px var(--rule); opacity: .7; transition: opacity .25s, box-shadow .25s, transform .25s; }
  .places-list a[aria-current="page"] { color: var(--ink); }
  .places-list a[aria-current="page"] i { opacity: 1; box-shadow: 0 0 0 2px var(--night), 0 0 0 4px var(--glow); transform: scale(1.06); }
  .place, body.lined .place { bottom: 104px; }
}
"""
open('src/style.css', 'w').write(c)
print('ok')
