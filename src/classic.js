// The classic view: the same shop as the garden, as a conventional scrolling site.
import '@fontsource-variable/eb-garamond';
import '@fontsource-variable/eb-garamond/wght-italic.css';
import '@fontsource-variable/instrument-sans';
import '@fontsource/emilys-candy/latin-400.css';
import './classic.css';
import catalog from './catalog.json';
import reviewData from './reviews.json';
import ingredientData from './ingredients.json';
import { STATIONS, INFO, STORE, FREE_SHIPPING_AT, SALE, FAQ, RECIPROCITY, EMAIL, INSTAGRAM } from './content.js';

const ICONS = import.meta.glob('./icons/*.svg', { query: '?raw', import: 'default', eager: true });
const TI = Object.fromEntries(Object.entries(ICONS).map(([k, v]) => [k.replace('./icons/', '').replace('.svg', ''), v]));

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids.flat().filter((k) => k != null && k !== false)); return n; };
const html = (tag, cls, inner) => { const n = el(tag, { className: cls }); n.innerHTML = inner; return n; };
const A = (p) => import.meta.env.BASE_URL + p.replace(/^\//, '');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } } };
store.set('gaia-view', 'classic');

/* ---------- data ---------- */
const CARD = 'garden-of-gaia-gift-cards';
const money = (n) => (n % 1 ? `$${n.toFixed(2)}` : `$${n}`);
const now = (n, p) => (p?.sale ? +(n * (1 - (SALE.pct || 0) / 100)).toFixed(2) : n);
const cardRange = (p) => { const v = p.variants.map((x) => parseFloat(x.title.replace(/[^0-9.]/g, ''))).filter(Boolean); return `${money(Math.min(...v))} to ${money(Math.max(...v))}`; };
const priceLabel = (p) => (p.handle === CARD ? cardRange(p) : p.variants[0].price !== p.variants.at(-1).price ? `From ${money(now(p.variants[0].price, p))}` : p.variants[0].price === 0 ? 'Free' : money(now(p.variants[0].price, p)));
const byHandle = Object.fromEntries(catalog.map((p) => [p.handle, p]));
const PLANTS = ingredientData.plants;
const plantsOf = (p) => (ingredientData.products[p.handle] || []).map((k) => ({ k, ...PLANTS[k] }));
const productsWith = (k) => catalog.filter((p) => (ingredientData.products[p.handle] || []).includes(k));
const ALIAS = { 'sweet-dreamz-loose-leaf-sleepy-tea-blend': 'sweet-dreamz-sleep-support-loose-leaf-tea-blend', 'cleansing-lungs-respiratory-digestion-immunity-herbal-tea-blend': 'cleansing-lungs-respiratory-digestion-immunity-loose-leaf-herbal-tea' };
const reviews = reviewData.reviews.map((r) => ({ ...r, handle: ALIAS[r.handle] || r.handle })).sort((a, b) => b.date.localeCompare(a.date));
const reviewsFor = (h) => reviews.filter((r) => r.handle === h);
const stars = (n) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
const COL = {
  tea: { name: 'Loose leaf teas', short: 'Teas', tone: 'marigold', icon: 'cup', blurb: 'Blends mixed by hand in small batches, and whole flowers from our family farms.' },
  potions: { name: 'Potions of Peace', short: 'Potions', tone: 'plum', icon: 'bottle', blurb: 'Tinctures, sprays, oils and whipped tallow, curated in-house over full moon cycles.' },
  pond: { name: 'The Divine Pantry', short: 'Pantry', tone: 'lotus', icon: 'flower', blurb: 'Sacred flowers, herbs and leaves, hand harvested in Sri Lanka.' },
  altar: { name: 'Smoke & ritual', short: 'Ritual', tone: 'hibiscus', icon: 'flame', blurb: 'Sage, smudges, palo santo, resins and cacao butter candles.' },
  roots: { name: 'Gifts & guides', short: 'Gifts', tone: 'moss', icon: 'leaf', blurb: 'Gift cards and our free Divine Pantry guide.' },
};
const ORDER = ['tea', 'potions', 'pond', 'altar', 'roots'];
const icon = (name, cls = 'ti') => html('span', cls, TI[name] || TI.leaf);
const cardImg = (p) => A(`assets/card/${p.handle}.webp`);
const best = ['blue-water-lily-flowers-organic-whole-flower', 'butterfly-chai-organic-whole-spice-blend-ceylon-black-tea', 'hathors-ease-blue-lotus-magnesium-whipped-tallow-balm', 'full-spectrum-hibiscus-flower-premium-loose-leaf-tea', 'blue-water-lily-tincture', 'cleansing-lungs-respiratory-digestion-immunity-loose-leaf-herbal-tea', 'golden-sticky-chai-haldi-doodh-paste-golden-milk', 'rainbow-body-cosmic-herbal-blend'].map((h) => byHandle[h]).filter(Boolean);

/* ---------- basket (shared with the garden) ---------- */
const variantIndex = new Map();
catalog.forEach((p) => p.variants.forEach((v) => variantIndex.set(String(v.id), { p, v })));
let basket = store.get('gaia-basket', []).filter((l) => variantIndex.has(l.id));
const total = () => basket.reduce((a, l) => { const { p, v } = variantIndex.get(l.id); return a + now(v.price, p) * l.qty; }, 0);
function saveBasket() { store.set('gaia-basket', basket); renderBasket(); }
function addToBasket(id, qty, name) {
  const line = basket.find((l) => l.id === String(id));
  if (line) line.qty += qty; else basket.push({ id: String(id), qty });
  saveBasket(); toast(`${name} is in your basket`);
  const c = $('#basket-count'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
}
function renderBasket() {
  const ul = $('#basket-items'); ul.replaceChildren();
  let count = 0;
  for (const l of basket) {
    const { p, v } = variantIndex.get(l.id); count += l.qty;
    const minus = el('button', { textContent: '−', ariaLabel: `One fewer ${p.name}` }), plus = el('button', { textContent: '+', ariaLabel: `One more ${p.name}` });
    minus.onclick = () => { l.qty--; if (l.qty < 1) basket = basket.filter((x) => x !== l); saveBasket(); };
    plus.onclick = () => { l.qty++; saveBasket(); };
    const name = el('a', { className: 'n', href: `#p--${p.handle}`, textContent: p.name }); name.onclick = closeBasket;
    ul.append(el('li', {}, el('img', { src: A(`assets/thumb/${p.handle}.webp`), alt: '' }),
      el('div', {}, name, el('p', { className: 'v', textContent: [p.sub, p.handle !== CARD && v.title].filter(Boolean).join(' · ') }), el('p', { className: 'pr', textContent: money(+(now(v.price, p) * l.qty).toFixed(2)) })),
      el('div', { className: 'q' }, minus, el('span', { textContent: l.qty }), plus)));
  }
  $('#basket-count').textContent = count;
  const t = total(), left = FREE_SHIPPING_AT - t;
  $('#basket-total').textContent = `$${t.toFixed(2)}`;
  $('#basket-empty').hidden = basket.length > 0; $('#basket-foot').hidden = !basket.length;
  const ship = $('#basket-ship'); ship.hidden = !basket.length;
  ship.replaceChildren(el('p', { textContent: left > 0 ? `${money(+left.toFixed(2))} away from free U.S. shipping` : 'You have free U.S. shipping' }), el('div', { className: 'bar' }, el('i', { style: `width:${Math.min(100, (t / FREE_SHIPPING_AT) * 100)}%` })));
  $('#basket-checkout').href = `${STORE}/cart/${basket.map((l) => `${l.id}:${l.qty}`).join(',')}`;
}
function openBasket() { renderBasket(); $('#basket').hidden = false; $('#scrim').hidden = false; document.body.classList.add('locked'); $('#basket-close').focus(); }
function closeBasket() { $('#basket').hidden = true; $('#scrim').hidden = true; document.body.classList.remove('locked'); }
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

/* ---------- pieces ---------- */
function productCard(p, i = 0) {
  const col = COL[p.station], pl = plantsOf(p);
  const a = el('a', { className: `card tone-${col.tone}`, href: `#p--${p.handle}` },
    el('div', { className: 'card-art' }, el('img', { src: cardImg(p), alt: '', loading: 'lazy', decoding: 'async' }), p.sale && SALE.pct ? el('span', { className: 'badge', textContent: `${SALE.pct}% off` }) : null),
    el('div', { className: 'card-body' },
      el('p', { className: 'card-col', textContent: col.short }),
      el('h3', { className: 'card-name', textContent: p.name }),
      el('p', { className: 'card-plants', textContent: pl.length ? pl.slice(0, 3).map((x) => x.n).join(' · ') + (pl.length > 3 ? ` · +${pl.length - 3}` : '') : p.sub }),
      el('p', { className: 'card-price' }, priceLabel(p), p.sale && SALE.pct && p.variants[0].price ? el('s', { textContent: money(p.variants[0].price) }) : null)));
  a.style.setProperty('--tilt', `${((i % 5) - 2) * 0.35}deg`);
  return a;
}
const grid = (list, cls = '') => el('div', { className: `grid ${cls}` }, list.map(productCard));
function sectionHead(kicker, title, sub, link) {
  return el('header', { className: 'sec-head' }, el('p', { className: 'kicker', textContent: kicker }), el('h2', { textContent: title }), sub ? el('p', { className: 'sec-sub', textContent: sub }) : null, link ? el('a', { className: 'btn', href: link[1], textContent: link[0] }) : null);
}
const deco = (name, cls) => el('img', { className: `deco ${cls}`, src: A(`assets/img/${name}.webp`), alt: '', loading: 'lazy', decoding: 'async' });
function reviewCard(r, withProduct) {
  const p = byHandle[r.handle];
  return el('figure', { className: 'quote' }, el('p', { className: 'stars', textContent: stars(r.score), ariaLabel: `${r.score} out of 5` }), r.title ? el('p', { className: 'q-t', textContent: r.title }) : null, el('blockquote', { textContent: r.body }),
    el('figcaption', {}, r.author, r.verified ? ' · Verified buyer' : '', withProduct && p ? el('a', { href: `#p--${p.handle}`, textContent: ` · ${p.name}` }) : null));
}

/* ---------- pages ---------- */
function home() {
  const m = [];
  // hero: a collage of the garden
  m.push(el('section', { className: 'hero' },
    el('div', { className: 'hero-sky', style: `background-image:url(${A('assets/img/sky.webp')})` }),
    el('div', { className: 'hero-copy' },
      el('p', { className: 'kicker', textContent: 'Organic herbal teas, tinctures and ritual tools' }),
      el('h1', { textContent: 'Reconnecting you with your roots' }),
      el('p', { className: 'lede', textContent: 'Small-batch herbal teas, potions and whole flowers, hand harvested from regenerative family farms in Sri Lanka. Loose leaf, farm-direct, nothing you can’t pronounce.' }),
      el('div', { className: 'row' }, el('a', { className: 'btn btn-main', href: '#shop', textContent: 'Shop the apothecary' }), el('a', { className: 'alt-link', href: './', textContent: 'Or walk the 3D garden' }))),
    el('div', { className: 'hero-art', ariaHidden: 'true' },
      el('img', { className: 'h-witch', src: A('assets/img/witch-present.webp'), alt: '' }),
      ...['blue-water-lily-flowers-organic-whole-flower', 'butterfly-chai-organic-whole-spice-blend-ceylon-black-tea', 'hathors-ease-blue-lotus-magnesium-whipped-tallow-balm', 'blue-water-lily-tincture'].map((h, i) => el('img', { className: `h-p h-p${i}`, src: cardImg(byHandle[h]), alt: '' })),
      deco('flower0', 'h-f0'), deco('flower1', 'h-f1'), deco('flower4', 'h-f2'), deco('bfly0', 'h-b0'), deco('bfly2', 'h-b1')),
    el('div', { className: 'stamp', ariaHidden: 'true' }, html('span', 'stamp-ring', `<svg viewBox="0 0 120 120"><defs><path id="ring" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><text><textPath href="#ring">FARM DIRECT ✦ SRI LANKA ✦ SMALL BATCH ✦ </textPath></text></svg>`), icon('flower', 'ti stamp-ic'))));
  // promises
  m.push(el('section', { className: 'promises tone-marigold' }, ...[['leaf', 'Organic & pesticide-free', 'Grown in rich soil and hand harvested. Our Blue Lotus is tested and backed by a COA.'], ['plant-2', 'Farmer direct', 'Direct trade with multigenerational regenerative farmers in Sri Lanka. No middlemen.'], ['flower', 'Made in-house', 'Signature blends like Butterfly Chai and Full Spectrum Hibiscus, made by hand in small batches.']].map(([ic, t, d]) => el('div', { className: 'promise' }, icon(ic), el('h3', { textContent: t }), el('p', { textContent: d })))));
  // shop by collection
  m.push(el('section', { className: 'sec' }, sectionHead('Shop by ritual', 'The whole apothecary', 'Five corners of the garden, each with its own character.'),
    el('div', { className: 'cols' }, ...ORDER.map((id) => { const c = COL[id], list = catalog.filter((p) => p.station === id); return el('a', { className: `col tone-${c.tone}`, href: `#shop-${id}` }, icon(c.icon, 'ti col-ic'), el('h3', { textContent: c.name }), el('p', { textContent: c.blurb }), el('span', { className: 'col-n', textContent: `${list.length} ${list.length === 1 ? 'item' : 'items'}` }), el('div', { className: 'col-peek' }, list.slice(0, 3).map((p) => el('img', { src: A(`assets/thumb/${p.handle}.webp`), alt: '', loading: 'lazy' })))); }))));
  // best loved
  m.push(el('section', { className: 'sec tone-cream' }, sectionHead('Fresh from the apothecary', 'Most loved', null, ['Shop all', '#shop']), grid(best)));
  // plants
  const featured = ['blue-lotus', 'hibiscus', 'butterfly-pea', 'moringa', 'cinnamon', 'turmeric', 'lavender', 'frankincense', 'soursop', 'mullein', 'saffron', 'calendula'];
  m.push(el('section', { className: 'sec tone-moss plants-sec' }, deco('plant1', 'p-d0'), deco('fx3', 'p-d1'), sectionHead('Ingredient led', 'Meet the plants', 'Every product starts with a plant. Find the ones you love and see everything we make with them.', ['All plants', '#plants']),
    el('div', { className: 'plant-grid' }, featured.map((k) => plantTile(k)))));
  // story
  m.push(el('section', { className: 'story-band' },
    el('div', { className: 'story-photos' }, el('img', { className: 'sp0', src: A('assets/img/story-harvest.webp'), alt: 'Four people standing in a lake holding freshly picked blue water lilies' }), el('img', { className: 'sp1', src: A('assets/img/story-blue-lotus-1.webp'), alt: 'A blue water lily among lily pads' }), el('img', { className: 'sp2', src: A('assets/img/story-blue-lotus-2.webp'), alt: 'A pale water lily opening on dark water' })),
    el('div', { className: 'story-copy' }, el('p', { className: 'kicker', textContent: 'Grown slow. Harvested by hand.' }), el('h2', { textContent: 'From our family lakes to your cup' }), el('p', { textContent: 'Every flower, root and spice comes directly from regenerative family farms in Sri Lanka that carry generations of Ayurvedic know-how. No middlemen, no fillers, nothing you can’t pronounce.' }), el('p', { textContent: RECIPROCITY.t }), el('a', { className: 'btn', href: '#story', textContent: 'Read our story' }))));
  // brew
  m.push(el('section', { className: 'sec tone-lotus brew' }, sectionHead('Steep slow. Stay rooted.', 'Brew it your way'), el('ol', { className: 'brew-steps' }, ...[['steam', 'Hot cup', 'Steep 1–2 tsp in just-boiled water for 5–7 minutes. Add honey and lemon if you like.'], ['droplet', 'Cold brew', 'Steep overnight in the fridge for a strong infusion. Pour over a glass of ice.'], ['sun', 'Sun brew', 'Fill a jar with herbs and water and let the sunshine do the work for 3–4 hours.']].map(([ic, t, d]) => el('li', {}, icon(ic), el('h3', { textContent: t }), el('p', { textContent: d })))), el('a', { className: 'btn', href: '#shop-tea', textContent: 'Shop loose leaf' })));
  // reviews
  m.push(el('section', { className: 'sec tone-plum' }, sectionHead(`${stars(5)} 5.0 from ${reviews.length} reviews`, 'In their words', null, ['Read them all', '#reviews']), el('div', { className: 'quotes' }, reviews.filter((r) => r.body.length > 60).slice(0, 6).map((r) => reviewCard(r, true)))));
  // gifts
  m.push(giftsBand());
  // wholesale + elixir
  m.push(el('section', { className: 'sec duo' },
    el('a', { className: 'duo-card tone-hibiscus', href: '#wholesale' }, el('p', { className: 'kicker', textContent: 'For shops, cafés and makers' }), el('h3', { textContent: 'Wholesale herbs' }), el('p', { textContent: 'Farm-direct organic herbs and our own line at wholesale prices, with COA.' }), el('span', { className: 'btn', textContent: 'Find out more' })),
    el('a', { className: 'duo-card tone-marigold', href: '#elixir' }, el('p', { className: 'kicker', textContent: 'For your next event' }), el('h3', { textContent: 'The Elixir Bar' }), el('p', { textContent: 'Bring our mocktail and elixir bar to your celebration.' }), el('span', { className: 'btn', textContent: 'Book the bar' }))));
  m.push(faqBlock());
  return m;
}
function plantTile(k) {
  const x = PLANTS[k], n = productsWith(k).length;
  return el('a', { className: 'plant', href: `#plant--${k}` }, icon(x.ic), el('h3', { textContent: x.n }), x.b ? el('p', { className: 'bot', textContent: x.b }) : null, el('p', { className: 'pn', textContent: `${n} ${n === 1 ? 'product' : 'products'}` }));
}
function giftsBand() {
  return el('section', { className: 'sec tone-hibiscus gifts-band' }, deco('bfly5', 'g-d0'), sectionHead('Give a gift that keeps on giving', 'Gifts by budget'),
    el('div', { className: 'gift-tiles' }, ...[['25', 'Under $25'], ['40', '$25 to $40'], ['75', '$40 to $75']].map(([k, t]) => el('a', { className: 'gift-tile', href: `#gifts-${k}` }, el('span', { className: 'gt-n', textContent: t }), el('span', { className: 'gt-s', textContent: `${giftList(k).length} ideas` }))),
      el('a', { className: 'gift-tile gift-card', href: `#p--${CARD}` }, el('img', { src: cardImg(byHandle[CARD]), alt: '' }), el('span', { className: 'gt-s', textContent: 'Or let them choose: a gift card' }))));
}
function giftList(k) {
  const [lo, hi] = { 25: [0, 25], 40: [25, 40], 75: [40, 75] }[k];
  const cost = (p) => now((p.variants.find((v) => v.available) || p.variants[0]).price, p);
  return catalog.filter((p) => p.handle !== CARD && cost(p) > lo && cost(p) <= hi).sort((a, b) => cost(a) - cost(b));
}
function faqBlock() {
  return el('section', { className: 'sec faq tone-cream' }, sectionHead('Good to know', 'Questions, answered'), el('div', { className: 'faq-list' }, FAQ.map(([q, a]) => el('details', {}, el('summary', { textContent: q }), el('p', { textContent: a })))));
}
function shop(id, q = '') {
  const c = COL[id];
  let list = id ? catalog.filter((p) => p.station === id) : catalog;
  if (q) { const t = q.toLowerCase(); list = catalog.filter((p) => `${p.name} ${p.sub} ${plantsOf(p).map((x) => x.n).join(' ')}`.toLowerCase().includes(t)); }
  const head = el('section', { className: `page-head tone-${c ? c.tone : 'night'}` }, deco(c ? 'flower4' : 'flower0', 'ph-d0'), deco('bfly1', 'ph-d1'),
    el('p', { className: 'kicker', textContent: q ? 'Search' : c ? 'Collection' : 'The whole apothecary' }), el('h1', { textContent: q ? `“${q}”` : c ? c.name : 'Shop all' }), el('p', { className: 'lede', textContent: q ? `${list.length} ${list.length === 1 ? 'match' : 'matches'} across products and plants` : c ? c.blurb : `${catalog.length} things, all made with care.` }));
  const tabs = el('nav', { className: 'tabs', ariaLabel: 'Collections' }, el('a', { href: '#shop', textContent: 'All', ariaCurrent: !id && !q ? 'page' : null }), ORDER.map((k) => el('a', { href: `#shop-${k}`, textContent: COL[k].short, ariaCurrent: k === id ? 'page' : null })));
  const search = el('form', { className: 'search', role: 'search' }, el('label', { htmlFor: 'q', className: 'kicker', textContent: 'Search by product or plant' }), el('input', { id: 'q', type: 'search', value: q, placeholder: 'Blue lotus, chai, sage…', autocomplete: 'off' }));
  search.onsubmit = (e) => { e.preventDefault(); const v = $('#q').value.trim(); location.hash = v ? `#search--${encodeURIComponent(v)}` : '#shop'; };
  const body = el('section', { className: 'sec tone-cream shop' }, el('div', { className: 'shop-tools' }, tabs, search), list.length ? grid(list) : el('p', { className: 'empty', textContent: 'Nothing matches that yet. Try a plant name like lavender or hibiscus.' }));
  return [head, body];
}
function product(p) {
  const col = COL[p.station], pl = plantsOf(p), own = reviewsFor(p.handle);
  let chosen = p.variants.find((v) => v.available) || p.variants[0], qty = 1, photo = 0;
  const imgs = p.gallery.length ? p.gallery : [`assets/card/${p.handle}.webp`];
  const main = el('img', { className: 'pp-main', src: A(imgs[0]), alt: p.title });
  const thumbs = el('div', { className: 'pp-thumbs' }, imgs.map((src, i) => { const b = el('button', { ariaLabel: `Photo ${i + 1}`, ariaCurrent: i === 0 ? 'true' : null }, el('img', { src: A(src), alt: '', loading: 'lazy' })); b.onclick = () => { photo = i; main.src = A(src); thumbs.querySelectorAll('button').forEach((x, j) => x.setAttribute('aria-current', String(j === i))); }; return b; }));
  const price = el('p', { className: 'pp-price' }), ship = el('p', { className: 'pp-ship' }), qv = el('output', { textContent: '1' });
  const add = el('button', { className: 'btn btn-main', type: 'button' });
  const sync = () => {
    price.replaceChildren(chosen.price === 0 ? 'Free' : `$${(now(chosen.price, p) * qty).toFixed(2)}`, p.sale && SALE.pct && chosen.price ? el('s', { textContent: `$${(chosen.price * qty).toFixed(2)}` }) : '', p.sale && SALE.pct && chosen.price ? el('em', { textContent: `${SALE.pct}% off` }) : '');
    qv.textContent = qty; add.disabled = !chosen.available; add.textContent = chosen.available ? 'Add to basket' : 'Sold out';
    const left = FREE_SHIPPING_AT - total() - now(chosen.price, p) * qty;
    ship.textContent = p.handle === CARD ? 'Sent by email. Gift cards are not part of the sale.' : [p.sale ? SALE.note : '', left > 0 ? `Adding this leaves you ${money(+left.toFixed(2))} away from free U.S. shipping.` : 'With this in your basket, U.S. shipping is free.'].filter(Boolean).join(' ');
    variants.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.id === String(chosen.id))));
  };
  const variants = el('div', { className: 'pp-variants', role: 'radiogroup', ariaLabel: 'Size', hidden: p.variants.length < 2 }, p.variants.map((v) => { const b = el('button', { type: 'button', textContent: v.title || 'One size', disabled: !v.available }); b.setAttribute('role', 'radio'); b.dataset.id = v.id; b.onclick = () => { chosen = v; sync(); }; return b; }));
  const minus = el('button', { type: 'button', textContent: '−', ariaLabel: 'One fewer' }), plus = el('button', { type: 'button', textContent: '+', ariaLabel: 'One more' });
  minus.onclick = () => { qty = Math.max(1, qty - 1); sync(); }; plus.onclick = () => { qty++; sync(); };
  add.onclick = () => addToBasket(chosen.id, qty, p.name);
  sync();
  const avg = own.length ? (own.reduce((a, r) => a + r.score, 0) / own.length).toFixed(1) : null;
  const buy = el('div', { className: `pp-buy tone-${col.tone}-soft` },
    el('a', { className: 'kicker', href: `#shop-${p.station}`, textContent: col.name }),
    el('h1', { className: 'pp-name', textContent: p.name }),
    p.sub ? el('p', { className: 'pp-sub', textContent: p.sub }) : null,
    avg ? el('a', { className: 'pp-rating', href: '#pp-reviews', textContent: `${stars(Math.round(avg))} ${avg} · ${own.length} review${own.length > 1 ? 's' : ''}` }) : null,
    pl.length ? el('div', { className: 'chips' }, pl.slice(0, 8).map((x) => el('a', { className: 'chip', href: `#plant--${x.k}` }, icon(x.ic), x.n))) : null,
    price, variants, el('div', { className: 'pp-row' }, el('div', { className: 'qty' }, minus, qv, plus), add), ship,
    el('ul', { className: 'pp-promises' }, ['Sourced direct from farmers in Sri Lanka', 'Regenerative agriculture partners', 'Organic loose leaf herbs'].map((t) => el('li', { textContent: t }))));
  const top = el('section', { className: 'pp' }, el('div', { className: `pp-gallery tone-${col.tone}` }, main, imgs.length > 1 ? thumbs : null), buy);
  const out = [top];
  if (pl.length) out.push(el('section', { className: 'sec tone-moss inside' }, sectionHead(pl.length === 1 ? 'The plant' : `${pl.length} plants inside`, pl.length === 1 ? 'What it is' : 'What’s inside'), el('div', { className: 'inside-grid' }, pl.map((x) => el('a', { className: 'ing', href: `#plant--${x.k}` }, icon(x.ic), el('h3', { textContent: x.n }), x.b ? el('p', { className: 'bot', textContent: x.b }) : null, el('p', { textContent: x.note }))))));
  out.push(el('section', { className: 'sec tone-cream details' }, el('div', { className: 'details-in' }, p.lede ? el('p', { className: 'first', textContent: p.lede }) : null, p.sections.filter((s) => s.blocks.length).map((s, i) => el('details', { open: i < 2 }, el('summary', {}, icon(s.icon === 'cup' ? 'cup' : s.icon === 'package' ? 'bottle' : s.icon === 'lotus' ? 'flower' : s.icon === 'plant' ? 'plant-2' : s.icon || 'leaf'), el('span', { textContent: s.title })), blocks(s.blocks)))),
    el('p', { className: 'fine', textContent: 'These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare professional before use if pregnant, nursing, or on medication.' })));
  const w = reviewData.wholesale[p.handle];
  if (w) out.push(el('section', { className: 'sec tone-hibiscus duo-one' }, el('p', { className: 'kicker', textContent: 'Wholesale' }), el('h2', { textContent: w.h }), el('p', { className: 'sec-sub', textContent: w.t }), el('a', { className: 'btn', href: `${STORE}/pages/wholesale-blue-water-lily`, target: '_blank', rel: 'noopener', textContent: 'Apply for wholesale' })));
  out.push(el('section', { className: 'sec tone-plum', id: 'pp-reviews' }, sectionHead(own.length ? `${stars(Math.round(avg))} ${avg} out of 5` : 'Kind words from the garden', own.length ? 'In their words' : 'What people say', own.length ? null : 'No reviews for this one yet. Here is what people say about the rest of the garden.'), el('div', { className: 'quotes' }, (own.length ? own : reviews.slice(0, 3)).map((r) => reviewCard(r, !own.length)))));
  const related = catalog.filter((x) => x.station === p.station && x !== p).slice(0, 4);
  if (related.length) out.push(el('section', { className: 'sec tone-cream' }, sectionHead('From the same corner of the garden', `More ${COL[p.station].short.toLowerCase()}`, null, [`Shop ${COL[p.station].short.toLowerCase()}`, `#shop-${p.station}`]), grid(related, 'grid-4')));
  out.push(faqBlock());
  return out;
}
function blocks(list) {
  const out = []; let ul = null;
  for (const b of list) {
    if (b.k === 'li') { if (!ul) { ul = el('ul'); out.push(ul); } ul.append(b.term ? el('li', {}, el('b', { textContent: `${b.term}. ` }), b.t) : el('li', { textContent: b.t })); continue; }
    ul = null;
    if (b.k === 'dt') out.push(el('p', { className: 'dt' }, el('b', { textContent: b.term }), el('span', { textContent: b.t })));
    else if (b.k === 'note' && b.t.includes('•')) out.push(el('ul', { className: 'tags' }, b.t.split('•').map((x) => x.trim()).filter(Boolean).map((x) => el('li', { textContent: x }))));
    else out.push(el('p', { className: b.k === 'note' ? 'aside' : '', textContent: b.t }));
  }
  return out;
}
function plantsPage() {
  const used = Object.keys(PLANTS).filter((k) => productsWith(k).length).sort((a, b) => PLANTS[a].n.localeCompare(PLANTS[b].n));
  return [el('section', { className: 'page-head tone-moss' }, deco('plant3', 'ph-d0'), deco('flower2', 'ph-d1'), el('p', { className: 'kicker', textContent: 'Ingredient led' }), el('h1', { textContent: 'The plants' }), el('p', { className: 'lede', textContent: `${used.length} flowers, leaves, roots, spices and resins we work with. Pick one to see everything made with it.` })),
    el('section', { className: 'sec tone-cream' }, el('div', { className: 'plant-grid big' }, used.map(plantTile)))];
}
function plantPage(k) {
  const x = PLANTS[k], list = productsWith(k);
  return [el('section', { className: 'page-head tone-moss plant-head' }, deco('flower0', 'ph-d0'), deco('bfly3', 'ph-d1'), icon(x.ic, 'ti big-ic'), el('p', { className: 'kicker', textContent: x.b || 'Plant' }), el('h1', { textContent: x.n }), el('p', { className: 'lede', textContent: x.note }), el('a', { className: 'alt-link', href: '#plants', textContent: 'All plants' })),
    el('section', { className: 'sec tone-cream' }, sectionHead(`${list.length} ${list.length === 1 ? 'product' : 'products'}`, `Made with ${x.n.toLowerCase()}`), grid(list))];
}
function giftsPage(k) {
  const list = k ? giftList(k) : null, t = { 25: 'Under $25', 40: '$25 to $40', 75: '$40 to $75' }[k];
  return [el('section', { className: 'page-head tone-hibiscus' }, deco('bfly5', 'ph-d0'), deco('flower1', 'ph-d1'), el('p', { className: 'kicker', textContent: 'Give a gift that keeps on giving' }), el('h1', { textContent: k ? `Gifts ${t.toLowerCase()}` : 'Gifts' }), el('p', { className: 'lede', textContent: 'Prices shown are what you pay today.' })),
    k ? el('section', { className: 'sec tone-cream' }, el('nav', { className: 'tabs' }, ['25', '40', '75'].map((g) => el('a', { href: `#gifts-${g}`, ariaCurrent: g === k ? 'page' : null, textContent: { 25: 'Under $25', 40: '$25 to $40', 75: '$40 to $75' }[g] })), el('a', { href: `#p--${CARD}`, textContent: 'Gift card' })), grid(list)) : giftsBand()];
}
function infoPage(id) {
  const i = INFO.find((x) => x.id === id);
  if (id === 'reviews') return [el('section', { className: 'page-head tone-plum' }, el('p', { className: 'kicker', textContent: `${stars(5)} 5.0 from ${reviews.length} reviews` }), el('h1', { textContent: 'Kind words' })), el('section', { className: 'sec tone-plum' }, el('div', { className: 'quotes' }, reviews.map((r) => reviewCard(r, true))))];
  const tone = { story: 'moss', brew: 'lotus', wholesale: 'hibiscus', elixir: 'marigold', hello: 'night' }[id] || 'night';
  const body = html('div', 'info-body', i.html.replace(/assets\//g, A('assets/')).replace(/href="#(tea|pond)"/g, 'href="#shop-$1"'));
  return [el('section', { className: `page-head tone-${tone}` }, deco('flower4', 'ph-d0'), deco('bfly0', 'ph-d1'), el('p', { className: 'kicker', textContent: 'The Garden of Gaia' }), el('h1', { textContent: i.title })), el('section', { className: 'sec tone-cream info' }, body)];
}

/* ---------- chrome ---------- */
function footer() {
  const f = $('#foot');
  f.replaceChildren(
    el('div', { className: 'foot-top' }, el('img', { src: A('assets/img/logo.webp'), alt: 'Garden of Gaia Apothecary', className: 'foot-logo' }), el('p', { className: 'foot-line', textContent: 'Steep slow. Stay rooted.' }), el('a', { className: 'btn', href: './', textContent: 'Walk the 3D garden' })),
    el('div', { className: 'foot-cols' },
      el('div', {}, el('h3', { textContent: 'Shop' }), el('ul', {}, el('li', {}, el('a', { href: '#shop', textContent: 'Shop all' })), ORDER.map((k) => el('li', {}, el('a', { href: `#shop-${k}`, textContent: COL[k].name }))), el('li', {}, el('a', { href: '#gifts', textContent: 'Gifts' })), el('li', {}, el('a', { href: '#plants', textContent: 'The plants' })))),
      el('div', {}, el('h3', { textContent: 'About' }), el('ul', {}, INFO.map((i) => el('li', {}, el('a', { href: `#${i.id}`, textContent: i.title }))), el('li', {}, el('a', { href: '#reviews', textContent: 'Kind words' })))),
      el('div', {}, el('h3', { textContent: 'Help and policies' }), el('ul', {}, [['Refund policy', 'policies/refund-policy'], ['Privacy policy', 'policies/privacy-policy'], ['Terms of service', 'policies/terms-of-service'], ['Contact information', 'policies/contact-information'], ['Wholesale application', 'pages/wholesale-blue-water-lily']].map(([t, u]) => el('li', {}, el('a', { href: `${STORE}/${u}`, target: '_blank', rel: 'noopener', textContent: t }))), el('li', {}, el('a', { href: INSTAGRAM, target: '_blank', rel: 'noopener', textContent: 'Instagram' })))),
      el('div', {}, el('h3', { textContent: 'Stay connected' }), el('p', { textContent: 'Herbal rituals, new blends and 10% off your first order.' }), el('a', { className: 'btn', href: STORE, target: '_blank', rel: 'noopener', textContent: 'Join the newsletter' }), el('p', { className: 'fine' }, 'Write to us at ', el('span', { className: 'sel', textContent: EMAIL })))),
    el('p', { className: 'fine foot-fine', textContent: `© 2026 The Garden of Gaia Apothecary. ${SALE.line || ''}` }));
}
function route() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'home';
  const [a, b] = h.split('--');
  let page, title = 'The Garden of Gaia Apothecary';
  if (a === 'home') page = home();
  else if (a === 'shop') page = shop(null);
  else if (a.startsWith('shop-')) { page = shop(a.slice(5)); title = `${COL[a.slice(5)]?.name} | ${title}`; }
  else if (a === 'search') page = shop(null, b || '');
  else if (a === 'p' && byHandle[b]) { page = product(byHandle[b]); title = `${byHandle[b].name} | ${title}`; }
  else if (a === 'plants') page = plantsPage();
  else if (a === 'plant' && PLANTS[b]) { page = plantPage(b); title = `${PLANTS[b].n} | ${title}`; }
  else if (a === 'gifts') page = giftsPage(null);
  else if (a.startsWith('gifts-')) page = giftsPage(a.slice(6));
  else if (INFO.some((i) => i.id === a) || a === 'reviews') page = infoPage(a);
  else page = home();
  $('#main').replaceChildren(...page.filter(Boolean));
  document.title = a === 'home' ? 'The Garden of Gaia Apothecary | Organic Herbal Teas & Tinctures' : title;
  document.querySelectorAll('#nav a').forEach((x) => x.setAttribute('aria-current', String(x.getAttribute('href') === `#${a}` || (a === 'p' && x.getAttribute('href') === `#shop-${byHandle[b]?.station}`))));
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (location.hash && location.hash !== '#home') $('#main').focus({ preventScroll: true });
}
const closeMenu = () => { document.body.classList.remove('nav-open'); $('#menu-btn').setAttribute('aria-expanded', 'false'); };

/* ---------- boot ---------- */
$('#ticker').append(...Array.from({ length: 2 }, () => el('div', { className: 'ticker-set' }, [SALE.line, 'Organic & pesticide-free', 'Farm-direct from Sri Lanka', 'Made in-house in small batches', `Free U.S. shipping over $${FREE_SHIPPING_AT}`].filter(Boolean).map((t) => el('span', {}, t, el('i', { textContent: '✦' }))))));
$('#basket-open').onclick = openBasket; $('#basket-close').onclick = closeBasket; $('#scrim').onclick = closeBasket;
$('#menu-btn').onclick = () => { const o = document.body.classList.toggle('nav-open'); $('#menu-btn').setAttribute('aria-expanded', String(o)); };
$('#to-garden').onclick = () => store.set('gaia-view', 'garden');
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeBasket(); closeMenu(); } });
addEventListener('hashchange', route);
addEventListener('scroll', () => $('#head').classList.toggle('scrolled', scrollY > 30), { passive: true });
footer(); renderBasket(); route();
if (!store.get('gaia-21', false)) { $('#age').hidden = false; document.body.classList.add('locked'); $('#age-yes').focus(); }
$('#age-yes').onclick = () => { store.set('gaia-21', true); $('#age').hidden = true; document.body.classList.remove('locked'); };
$('#age-no').onclick = () => { $('#age-denied').hidden = false; $('#age-yes').hidden = true; $('#age-no').hidden = true; };
window.__ready = true;
