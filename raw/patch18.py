p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# basket: a reminder of what each thing is, and a way back to it
rep("      el('div', {}, el('div', { className: 'n', textContent: p.name }), el('div', { className: 'v', textContent: [v.title, money(now(v.price, p))].filter(Boolean).join(' · ') })),",
    "      el('div', {}, nameBtn(p), el('div', { className: 'v', textContent: [p.sub, v.title && p.handle !== CARD ? v.title : ''].filter(Boolean).join(' · ') }), ...(about(p) ? [el('div', { className: 'd', textContent: about(p) })] : []), el('div', { className: 'pr', textContent: `${money(+(now(v.price, p) * l.qty).toFixed(2))}${l.qty > 1 ? ` · ${money(now(v.price, p))} each` : ''}` })),")
rep("function renderBasket() {", """const about = (p) => p.lede || p.sections.flatMap((x) => x.blocks).find((b) => b.k === 'p')?.t || '';
function nameBtn(p) {
  const b = el('button', { className: 'n', textContent: p.name });
  b.onclick = () => { const it = allItems.find((x) => x.p === p); $('#basket').hidden = true; if (it) { go(it.station.id); select(it); } };
  return b;
}
function renderBasket() {""")
# phone home screen: no eyebrow, centred
rep("  $('#place-label').replaceChildren(", "  $('#place-label').hidden = home && narrow.matches;\n  $('#place-label').replaceChildren(")
open(p, 'w').write(s)
c = open('src/style.css').read()
c += """
/* ---- basket lines: what you are buying ---- */
.lines li { align-items: start; grid-template-columns: 64px 1fr auto; padding: 18px 0; }
.lines img { width: 64px; height: 72px; }
.lines .n { font-family: var(--serif); font-size: 1.35rem; line-height: 1.15; text-align: left; }
.lines .n:hover { color: var(--glow); font-style: italic; }
.lines .v { font-family: var(--serif); font-style: italic; font-size: 1rem; color: var(--ink-2); margin-top: 2px; }
.lines .d { font-size: .98rem; line-height: 1.4; color: var(--ink-3); margin-top: 8px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; max-width: 46ch; }
.lines .pr { font-family: var(--sans); font-size: .86rem; font-weight: 600; color: var(--ink); margin-top: 8px; font-variant-numeric: tabular-nums; }
.lines .q { margin-top: 2px; }

/* ---- phones: the gate, centred ---- */
@media (max-width: 820px) {
  .place[data-home] { justify-items: center; text-align: center; left: var(--pad); right: var(--pad); width: auto; gap: 10px; }
  .place[data-home] h2 { font-size: 2.35rem; max-width: none; }
  .place[data-home] .lede { font-size: 1.08rem; line-height: 1.35; max-width: 31ch; text-wrap: balance; }
  .place[data-home] .row { justify-content: center; margin-top: 8px; }
}
"""
open('src/style.css', 'w').write(c)
print('ok')
