p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# phones: stand a little further back so the product sits clear of the text below it
rep("  s.camPos = base.clone().addScaledVector(s.f, 7.6).setY(3.2);\n  s.camLook = base.clone().setY(2.7);", "  s.camPos = base.clone().addScaledVector(s.f, 9.4).setY(3.3);\n  s.camLook = base.clone().setY(2.75);")
rep("const perPx = (2 * 7.6 *", "const perPx = (2 * 9.4 *")
rep("innerHeight * (current?.items.length ? 0.105 : 0.17)", "innerHeight * (current?.items.length ? 0.15 : 0.17)")
rep("const i = el('i'); i.style.backgroundImage = `url(${A(`assets/img-s/${s.icon}.webp`)})`;", "const i = el('i'); i.style.backgroundImage = `url(${A(`assets/img-s/${s.id === 'gate' ? 'witch-face' : s.icon}.webp`)})`; if (s.id === 'gate') i.style.backgroundSize = 'cover';")
open(p, 'w').write(s)

c = open('src/style.css').read()
c += """
/* ---- headings in Henny Penny; lower headings stay in italic EB Garamond ---- */
h1, h2, .menu-big a, .place-menu button { font-family: 'Henny Penny', var(--serif); font-weight: 400; letter-spacing: 0; }
h1, h2 { line-height: 1.08; }
h1 em { font-family: var(--serif); }
.place-menu button:hover, .menu-big a:hover { font-style: normal; }
.h-serif, .faq summary, .rt { font-family: var(--serif); font-style: italic; }
.place h2 { font-size: clamp(2.4rem, 4.6vw, 4.2rem); }
.place[data-home] h2 { font-size: clamp(2.4rem, 4vw, 4rem); max-width: 10em; }
.entry h1 { font-size: clamp(2.6rem, 6.4vw, 6rem); }
.index-head h2 { font-size: clamp(2.6rem, 5.6vw, 5.4rem); }
.panel h2 { font-size: 2.8rem; }
.menu-big a { font-size: clamp(2rem, 3.8vw, 3.4rem); line-height: 1.2; }
.place-menu button { font-size: 1.7rem; }

@media (max-width: 820px) {
  .place h2, .place[data-home] h2 { font-size: 2.3rem; }
  .index-head h2 { font-size: 2.1rem; } .panel h2 { font-size: 2.3rem; }
  .menu-big a { font-size: 1.25rem; }

  /* ---- the product in front of you: one tight block ---- */
  .place, body.lined .place { bottom: 84px; left: var(--pad); right: var(--pad); width: auto; }
  .focus { gap: 0; }
  .focus .label { font-size: .64rem; letter-spacing: .16em; color: var(--glow); margin-bottom: 4px; }
  .focus-name { font-size: 2rem; line-height: 1.1; min-height: 0; padding: 0; display: block; }
  .focus .note { min-height: 0; margin-top: 4px; font-size: .86rem; line-height: 1.35; color: var(--ink-2); text-wrap: balance; }
  .focus-row { display: grid; grid-template-columns: 48px 1fr 48px; gap: 10px; width: 100%; margin-top: 14px; }
  .focus .btn { min-width: 0; width: 100%; min-height: 48px; }
  .focus .arrow { width: 48px; height: 48px; background: rgba(5, 12, 21, .5); }
  body.lined .place-menu { margin-top: 12px; gap: 0 16px; }
  body.lined .place-menu button { font-family: var(--serif); font-style: italic; font-size: 1.02rem; }
  .veil { background: linear-gradient(0deg, rgba(5, 12, 21, .96) 0, rgba(5, 12, 21, .88) 26%, rgba(5, 12, 21, .4) 40%, rgba(5, 12, 21, 0) 52%); }

  /* ---- places: icons only, the current one opens into a named pill ---- */
  .places { padding: 10px var(--pad) calc(10px + env(safe-area-inset-bottom, 0px)); background: rgba(5, 12, 21, .94); border-top: 1px solid var(--rule); }
  .places-list { gap: 8px; padding: 0; justify-content: space-between; align-items: center; }
  .places-list a, .places-list a[aria-current="page"] { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; width: auto; padding: 3px; border-radius: 999px; font-size: .78rem; letter-spacing: .02em; font-weight: 600; white-space: nowrap; }
  .places-list a span { display: none; }
  .places-list a i { width: 40px; height: 40px; opacity: .8; box-shadow: none; transform: none; }
  .places-list a[aria-current="page"] { flex: 1 1 auto; padding-right: 14px; background: rgba(185, 246, 85, .12); box-shadow: inset 0 0 0 1px var(--glow); color: var(--ink); }
  .places-list a[aria-current="page"] span { display: inline; overflow: hidden; text-overflow: ellipsis; }
  .places-list a[aria-current="page"] i { opacity: 1; box-shadow: none; transform: none; }
}
"""
open('src/style.css', 'w').write(c)
print('ok')
