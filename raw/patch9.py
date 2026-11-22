import json

SITE = '/home/user/research/site/'
sale = {p['handle'] for p in json.load(open(SITE + 'sale.json'))['products']}
raw = {p['handle']: p for p in json.load(open(SITE + 'products.json'))['products']}
cat = json.load(open('src/catalog.json'))
for c in cat:
    c['sale'] = c['handle'] in sale
    if c['handle'] == 'garden-of-gaia-gift-cards':   # keep the store's own order of amounts
        c['variants'] = [dict(id=v['id'], title=v['title'], price=float(v['price']), available=v['available']) for v in raw[c['handle']]['variants']]
        c['name'], c['sub'] = 'Gift Card', 'Any amount from $25 to $150'
json.dump(cat, open('src/catalog.json', 'w'), ensure_ascii=False)
print(sum(c['sale'] for c in cat), 'on sale of', len(cat))

p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# ---- the sale covers only the products in the store's sale collection; gift cards show their real range
rep("const now = (n) => +(n * (1 - (SALE.pct || 0) / 100)).toFixed(2);   // what the buyer pays today",
    "const now = (n, p) => (p?.sale ? +(n * (1 - (SALE.pct || 0) / 100)).toFixed(2) : n);   // what the buyer pays today\nconst CARD = 'garden-of-gaia-gift-cards';\nconst cardRange = (p) => { const v = p.variants.map((x) => parseFloat(x.title.replace(/[^0-9.]/g, ''))).filter(Boolean); return `${money(Math.min(...v))} to ${money(Math.max(...v))}`; };")
rep("const priceLabel = (p) => (p.variants[0].price !== p.variants.at(-1).price ? `From ${money(now(p.variants[0].price))}` : p.variants[0].price === 0 ? 'Free' : money(now(p.variants[0].price)));",
    "const priceLabel = (p) => (p.handle === CARD ? cardRange(p) : p.variants[0].price !== p.variants.at(-1).price ? `From ${money(now(p.variants[0].price, p))}` : p.variants[0].price === 0 ? 'Free' : money(now(p.variants[0].price, p)));")
rep("total += now(v.price) * l.qty; count += l.qty;", "total += now(v.price, p) * l.qty; count += l.qty;")
rep("money(now(v.price))].filter(Boolean)", "money(now(v.price, p))].filter(Boolean)")
rep("`$${(now(chosen.price) * qty).toFixed(2)}`, ...(SALE.pct && chosen.price ?", "`$${(now(chosen.price, selected.p) * qty).toFixed(2)}`, ...(SALE.pct && selected.p.sale && chosen.price ?")
rep("now(variantIndex.get(l.id).v.price) * l.qty, 0), left = FREE_SHIPPING_AT - total - now(chosen.price) * qty;",
    "now(variantIndex.get(l.id).v.price, variantIndex.get(l.id).p) * l.qty, 0), left = FREE_SHIPPING_AT - total - now(chosen.price, selected.p) * qty;")
rep("  $('#detail-ship').textContent = [SALE.note, left > 0 ?", "  $('#detail-ship').textContent = selected.p.handle === CARD ? 'Sent by email. Gift cards are not part of the sale.' : [selected.p.sale ? SALE.note : '', left > 0 ?")

# ---- gifts by what they actually cost today
rep("  const gift = filter.startsWith('gift');", "  const gift = filter.startsWith('gift'), G = { gift25: [0, 25, 'Under $25'], gift40: [25, 40, '$25 to $40'], gift75: [40, 75, '$40 to $75'] };")
rep("tab('gift25', 'Under $25'), tab('gift40', 'Under $40'), tab('gift75', 'Under $75'));", "tab('gift25', 'Under $25'), tab('gift40', '$25 to $40'), tab('gift75', '$40 to $75'));")
i0 = s.index("    const handles = gifts[filter.slice(4)] || [];")
i1 = s.index("  } else for (const st of STATIONS.filter(")
s = s[:i0] + """    const [lo, hi, title] = G[filter] || G.gift25;
    const cost = (it) => { const v = it.p.variants.find((x) => x.available) || it.p.variants[0]; return now(v.price, it.p); };
    const card = allItems.find((it) => it.p.handle === CARD);
    list.append(el('h3', { textContent: 'Let them choose' })); if (card) list.append(indexRow(card));
    list.append(el('h3', { textContent: `Gifts ${title.toLowerCase()}` }));
    allItems.filter((it) => it.p.handle !== CARD && cost(it) > lo && cost(it) <= hi).sort((a, b) => cost(a) - cost(b)).forEach((it) => list.append(indexRow(it)));
""" + s[i1:]
rep("import gifts from './gifts.json';\n", "")

# ---- search shared by the index and the menu
rep("$('#index-search').oninput = (e) => { const q = e.target.value.trim().toLowerCase(); $('#index-list').querySelectorAll('button').forEach((b) => { b.hidden = q && !b.textContent.toLowerCase().includes(q); }); };",
    "const searchIndex = (v) => { const q = v.trim().toLowerCase(); $('#index-list').querySelectorAll('button').forEach((b) => { b.hidden = !!q && !b.textContent.toLowerCase().includes(q); }); $('#index-list').querySelectorAll('h3').forEach((h) => { let n = h.nextElementSibling, any = false; while (n && n.tagName !== 'H3') { if (!n.hidden) any = true; n = n.nextElementSibling; } h.hidden = !any; }); };\n$('#index-search').oninput = (e) => searchIndex(e.target.value);\n$('#menu-search-form').onsubmit = (e) => { e.preventDefault(); const q = $('#menu-search').value; openIndex('all'); $('#index-search').value = q; searchIndex(q); };")

# ---- menu places as picture tiles
rep("places.replaceChildren(...STATIONS.map((x) => el('li', {}, el('a', { href: `#${x.id}`, textContent: x.name }))));",
    "places.replaceChildren(...STATIONS.map((x) => el('li', {}, el('a', { href: `#${x.id}` }, el('img', { src: A(`assets/img-s/${x.icon}.webp`), alt: '', loading: 'lazy' }), el('span', { textContent: x.name })))));\n  $('#menu-search').value = '';")
open(p, 'w').write(s)

h = open('index.html').read()


def hrep(a, b):
    global h
    assert a in h, a[:70]
    h = h.replace(a, b, 1)


hrep('    <div class="menu-cols">', '''    <form id="menu-search-form" class="search menu-search" role="search"><label class="label" for="menu-search">Search the shop</label><input id="menu-search" type="search" placeholder="Blue lotus, chai, sage…" autocomplete="off" enterkeyhint="search"></form>
    <div class="menu-cols">''')
hrep('''        <li><button data-act="gift25">Gifts under $25</button></li>
        <li><button data-act="gift40">Gifts under $40</button></li>
        <li><button data-act="gift75">Gifts under $75</button></li>
        <li><a href="#roots--garden-of-gaia-gift-cards">Gift cards</a></li>''',
     '''        <li><button data-act="gift25">Gifts under $25</button></li>
        <li><button data-act="gift40">Gifts $25 to $40</button></li>
        <li><button data-act="gift75">Gifts $40 to $75</button></li>
        <li><a href="#roots--garden-of-gaia-gift-cards">Gift cards</a></li>''')
hrep('      <label class="search"><span class="label">Search</span><input id="index-search"', '      <div class="index-tools">\n      <label class="search"><span class="label">Search</span><input id="index-search"')
hrep('      <div id="index-gifts" class="index-filter" role="tablist" aria-label="Gifts by budget"></div>', '      <div id="index-gifts" class="index-filter" role="tablist" aria-label="Gifts by budget"></div>\n      </div>')
open('index.html', 'w').write(h)

c = open('src/style.css').read()
c += """
/* ---- menu: search, picture tiles for places ---- */
.menu-search { max-width: 520px; }
.menu-big a { display: flex; align-items: center; gap: 18px; }
.menu-big img { width: 54px; height: 54px; border-radius: 50%; object-fit: cover; object-position: center 30%; background: #0b1a28; box-shadow: inset 0 0 0 1px var(--rule); flex: none; }
.index-tools { display: grid; gap: 4px; }
@media (max-width: 820px) {
  /* menu: shop first, places as a two-column grid of tiles, links in two columns */
  .menu-in { gap: 22px; padding-bottom: 60px; }
  .menu-cols { gap: 26px; }
  .menu-cols > div:nth-child(2) { order: -1; }
  .menu-big { grid-template-columns: 1fr 1fr; gap: 10px; }
  .menu-big a { flex-direction: column; align-items: flex-start; gap: 8px; padding: 12px; border-radius: 14px; box-shadow: inset 0 0 0 1px var(--rule); font-size: 1.35rem; line-height: 1.1; color: var(--ink); }
  .menu-big a:hover { padding-left: 12px; }
  .menu-big img { width: 100%; height: 86px; border-radius: 9px; object-position: center 35%; }
  .menu-mid { grid-template-columns: 1fr 1fr; column-gap: 16px; }
  .menu-mid a, .menu-mid button { font-size: 1.25rem; line-height: 1.25; padding: 9px 0; border-bottom: 1px solid var(--rule); width: 100%; }
  .menu-small { grid-template-columns: 1fr 1fr; column-gap: 16px; }
  .menu ul + .label { margin-top: 24px; }
  /* product list: compact head, search and filters pinned, bigger rows */
  .index-in { gap: 14px; padding-top: 74px; }
  .index-head { gap: 6px; }
  .index-head h2 { font-size: 2.2rem; }
  .index-head .lede { display: none; }
  .index-head .back { margin-bottom: 0; }
  .index-tools { position: sticky; top: 62px; z-index: 5; margin: 0 calc(var(--pad) * -1); padding: 6px var(--pad) 8px; background: var(--night); border-bottom: 1px solid var(--rule); }
  .index-tools .search .label { display: none; }
  .index-tools .search input { font-size: 1.15rem; padding: 6px 0; }
  .index-filter { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; gap: 0 18px; margin: 0 calc(var(--pad) * -1); padding: 0 var(--pad); }
  .index-filter::-webkit-scrollbar { display: none; }
  .index-filter button, .index-filter .label { flex: none; white-space: nowrap; }
  .index-list h3 { padding: 22px 0 8px; }
  .index-list button { grid-template-columns: 58px 1fr auto; gap: 14px; padding: 12px 0; min-height: 76px; }
  .index-list img { width: 58px; height: 62px; }
  .index-list .n { font-size: 1.32rem; }
  .index-list .s { font-size: .78rem; line-height: 1.3; }
  .index-list .p { font-size: .9rem; font-weight: 600; color: var(--ink); }
}
"""
open('src/style.css', 'w').write(c)
print('ok')
