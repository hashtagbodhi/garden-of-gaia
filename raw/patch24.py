import json
p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


ICONS = sorted({v['ic'] for v in json.load(open('src/ingredients.json'))['plants'].values()} | {'flower', 'leaf', 'plant-2', 'cup', 'bottle', 'seedling'})
imports = '\n'.join(f"import ti_{n.replace('-', '_')} from '@tabler/icons/icons/outline/{n}.svg?raw';" for n in ICONS)
table = ', '.join(f"'{n}': ti_{n.replace('-', '_')}" for n in ICONS)

# swap the Phosphor section icons for Tabler, and add the plant icons
i0 = s.index("import icPlant from")
i1 = s.index("const ICON = {")
i2 = s.index("\n", i1)
s = s[:i0] + imports + f"\nimport ingredientData from './ingredients.json';\nconst TI = {{ {table} }};\nconst ICON = {{ plant: TI['plant-2'], cup: TI.cup, lotus: TI.flower, leaf: TI.leaf, package: TI.bottle, flower: TI.flower }};" + s[i2:]

# helpers
rep("function block(b) {", """const PLANTS = ingredientData.plants;
const plantsOf = (p) => (ingredientData.products[p.handle] || []).map((k) => ({ k, ...PLANTS[k] }));
const plantNames = (p, n = 3) => { const l = plantsOf(p).map((x) => x.n); return l.length ? (l.length > n ? `${l.slice(0, n).join(', ')} & more` : l.join(', ')) : ''; };
function icon(name) { const i = el('span', { className: 'ti', ariaHidden: 'true' }); i.innerHTML = TI[name] || TI.leaf; return i; }
function insideBlock(p) {
  const list = plantsOf(p);
  if (!list.length) return null;
  const sec = el('section', { className: 'inside', id: 'detail-inside' },
    el('p', { className: 'label', textContent: list.length === 1 ? 'The plant' : `${list.length} plants inside` }),
    el('h3', { className: 'h-serif', textContent: list.length === 1 ? 'What it is' : 'What’s inside' }));
  const ul = el('ul');
  for (const x of list) ul.append(el('li', {}, icon(x.ic), el('div', {}, el('p', { className: 'in-n' }, x.n, ...(x.b ? [el('em', { textContent: x.b })] : [])), el('p', { className: 'in-d', textContent: x.note }))));
  sec.append(ul);
  return sec;
}
function block(b) {""")
# product page: the plants first, right under the name, then the full list before the description
rep("  $('#detail-desc').replaceChildren(...prose(p));", """  const line = $('#detail-plants'), pl = plantsOf(p); line.replaceChildren(); line.hidden = !pl.length;
  pl.slice(0, 6).forEach((x) => { const b = el('button', { type: 'button' }, icon(x.ic), x.n); b.onclick = () => $('#detail-inside')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); line.append(b); });
  if (pl.length > 6) line.append(el('span', { className: 'more', textContent: `+${pl.length - 6} more` }));
  const ins = insideBlock(p); $('#detail-inside-slot').replaceChildren(...(ins ? [ins] : []));
  $('#detail-desc').replaceChildren(...prose(p));""")
# garden: lead with what's in it
rep("  $('#focus-name').textContent = it.p.name; $('#focus-price').textContent = [priceLabel(it.p), it.p.sub].filter(Boolean).join(' · ');",
    "  $('#focus-name').textContent = it.p.name; $('#focus-price').textContent = [priceLabel(it.p), plantNames(it.p) || it.p.sub].filter(Boolean).join(' · ');")
rep("el('small', { textContent: priceLabel(it.p) })", "el('small', { textContent: [priceLabel(it.p), plantNames(it.p, 2)].filter(Boolean).join(' · ') })")
# shop index rows: the plants instead of the marketing subtitle where we have them
rep("el('span', { className: 's', textContent: it.p.sub })", "el('span', { className: 's', textContent: plantNames(it.p, 4) || it.p.sub })")
open(p, 'w').write(s)

h = open('index.html').read()
a = '    <p id="detail-sub" class="sub"></p>'
assert a in h
h = h.replace(a, a + '\n    <div id="detail-plants" class="plants-line" aria-label="Plants inside"></div>', 1)
a = '    <div id="detail-desc" class="prose"></div>'
assert a in h
h = h.replace(a, '    <div id="detail-inside-slot"></div>\n' + a, 1)
open('index.html', 'w').write(h)

c = open('src/style.css').read()
c += """
/* ---- ingredient-led product pages ---- */
.ti { display: inline-grid; place-items: center; flex: none; }
.ti svg { width: 100%; height: 100%; fill: none !important; stroke: var(--glow); stroke-width: 1.35; }
.prose summary .ti, .prose summary svg { width: 24px; height: 24px; }
.prose summary svg { fill: none !important; stroke: var(--glow); stroke-width: 1.35; }
.plants-line { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }
.plants-line button { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px 5px 8px; border-radius: 999px; box-shadow: inset 0 0 0 1px var(--rule); font-family: var(--serif); font-style: italic; font-size: 1rem; line-height: 1.2; color: var(--ink); transition: box-shadow .2s; }
.plants-line button:hover { box-shadow: inset 0 0 0 1px var(--glow); }
.plants-line .ti { width: 18px; height: 18px; }
.plants-line .more { align-self: center; font-family: var(--sans); font-size: var(--t-small); color: var(--ink-3); padding-left: 4px; }
.inside { display: grid; gap: 6px; padding-top: 22px; margin-bottom: 8px; border-top: 1px solid var(--rule); max-width: 62ch; scroll-margin-top: 80px; }
.inside .label { color: var(--glow); }
.inside ul { list-style: none; margin: 10px 0 0; padding: 0; display: grid; }
.inside li { display: grid; grid-template-columns: 44px 1fr; gap: 14px; align-items: start; padding: 14px 0; border-top: 1px solid var(--rule); }
.inside li:first-child { border-top: 0; padding-top: 4px; }
.inside li .ti { width: 44px; height: 44px; padding: 9px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(185, 246, 85, .35); background: rgba(185, 246, 85, .06); }
.in-n { font-size: 1.28rem; line-height: 1.2; color: var(--ink); }
.in-n em { display: block; font-size: .95rem; color: var(--ink-3); margin-top: 1px; }
.in-d { margin-top: 5px; color: var(--ink-2); line-height: 1.45; }
.index-list .s { font-style: italic; font-family: var(--serif); font-size: .98rem; }
@media (max-width: 820px) {
  .inside li { grid-template-columns: 38px 1fr; gap: 12px; }
  .inside li .ti { width: 38px; height: 38px; padding: 8px; }
  .in-n { font-size: 1.18rem; }
}
"""
open('src/style.css', 'w').write(c)
print('ok', len(ICONS), 'icons')
