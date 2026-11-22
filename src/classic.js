// The classic view: the same shop as the garden, as a conventional scrolling site.
import '@fontsource-variable/eb-garamond';
import '@fontsource-variable/eb-garamond/wght-italic.css';
import '@fontsource-variable/instrument-sans';
import '@fontsource/emilys-candy/latin-400.css';
import './classic.css';
import './sheet.css';
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
const photo = (p, i = 0) => typeof p === 'string' ? A(`assets/stock/${p}.webp`) : A(p.gallery[i] || p.gallery[0] || `assets/card/${p.handle}.webp`);
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
  basket.forEach((l, i) => {
    const { p, v } = variantIndex.get(l.id); const each = now(v.price, p); count += l.qty;
    const minus = el('button', { textContent: '−', ariaLabel: `One fewer ${p.name}` }), plus = el('button', { textContent: '+', ariaLabel: `One more ${p.name}` }), drop = el('button', { className: 'tc-drop', textContent: 'Remove', ariaLabel: `Remove ${p.name}` });
    minus.onclick = () => { l.qty--; if (l.qty < 1) basket = basket.filter((x) => x !== l); saveBasket(); };
    plus.onclick = () => { l.qty++; saveBasket(); };
    drop.onclick = () => { basket = basket.filter((x) => x !== l); saveBasket(); };
    const name = el('a', { className: 'n', href: `#p--${p.handle}`, textContent: p.name }); name.onclick = closeBasket;
    const li = el('li', { className: 'tc' }, el('div', { className: 'tc-art' }, el('img', { src: A(`assets/thumb/${p.handle}.webp`), alt: '' })),
      el('div', { className: 'tc-info' }, name, el('div', { className: 'v', textContent: [p.sub, p.handle !== CARD && v.title].filter(Boolean).join(' · ') }),
        el('div', { className: 'tc-row' }, el('div', { className: 'q' }, minus, el('span', { textContent: l.qty }), plus), el('div', { className: 'pr', textContent: money(+(each * l.qty).toFixed(2)) })), drop));
    li.style.setProperty('--i', i); ul.append(li);
  });
  $('#basket-count').textContent = count;
  $('#basket-n').textContent = count ? `· ${count} ${count === 1 ? 'item' : 'items'}` : '';
  const t = total(), left = FREE_SHIPPING_AT - t, pct = Math.min(100, (t / FREE_SHIPPING_AT) * 100);
  $('#basket-total').textContent = `$${t.toFixed(2)}`;
  $('#basket-note').textContent = basket.some((l) => variantIndex.get(l.id).p.sale) && SALE.pct ? `Prices include ${SALE.pct}% off, applied at checkout.` : '';
  $('#basket-empty').hidden = basket.length > 0; $('#basket-foot').hidden = !basket.length;
  // the free-shipping vine grows toward a flower as the basket fills
  $('#basket-ship').replaceChildren(el('span', { className: 'vine-t', textContent: !basket.length ? `Free U.S. shipping over ${money(FREE_SHIPPING_AT)}` : left > 0 ? `${money(+left.toFixed(2))} away from free U.S. shipping` : 'Free U.S. shipping is yours' }),
    el('div', { className: `vine-bar${left <= 0 ? ' done' : ''}` }, el('i', { style: `width:${pct}%` }), el('b', { className: 'vine-bud', style: `left:${pct}%` }), el('em', { className: 'vine-flower', textContent: '✿' })));
  $('#basket-checkout').href = `${STORE}/cart/${basket.map((l) => `${l.id}:${l.qty}`).join(',')}`;
  // a few things that would carry the basket to free shipping
  const inB = new Set(basket.map((l) => variantIndex.get(l.id).p)), price = (p) => now((p.variants.find((x) => x.available) || p.variants[0]).price, p);
  const pool = catalog.filter((p) => !inB.has(p) && p.handle !== CARD && price(p) > 0 && p.variants.some((x) => x.available));
  const picks = (left > 0 && basket.length ? pool.filter((p) => price(p) >= left).sort((x, y) => price(x) - price(y)) : best.filter((p) => !inB.has(p))).slice(0, 4);
  const more = $('#basket-more'); more.replaceChildren();
  if (picks.length) more.append(el('p', { className: 'label', textContent: left > 0 && basket.length ? 'Any of these brings free shipping' : 'Most loved' }), el('div', { className: 'more-row' }, ...picks.map((p) => {
    const add = el('button', { className: 'more-add', textContent: '+ Add', ariaLabel: `Add ${p.name} to basket` });
    add.onclick = () => addToBasket((p.variants.find((x) => x.available) || p.variants[0]).id, 1, p.name);
    const n = el('a', { className: 'n', href: `#p--${p.handle}`, textContent: p.name }); n.onclick = closeBasket;
    return el('div', { className: 'more-c' }, el('img', { src: A(`assets/thumb/${p.handle}.webp`), alt: '' }), el('div', {}, n, el('span', { className: 'pr', textContent: money(price(p)) })), add);
  })));
}
function openBasket() { renderBasket(); $('#basket').hidden = false; $('#scrim').hidden = false; document.body.classList.add('locked'); $('#basket-close').focus(); }
function closeBasket() { $('#basket').hidden = true; $('#scrim').hidden = true; document.body.classList.remove('locked'); }
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

/* ---------- pieces ---------- */
function productCard(p, i = 0) {
  const col = COL[p.station], pl = plantsOf(p);
  const a = el('a', { className: `card tone-${col.tone}`, href: `#p--${p.handle}` },
    el('div', { className: 'card-art' }, el('div', { className: 'card-win' }, el('img', { src: photo(p), alt: '', loading: 'lazy', decoding: 'async' }), p.gallery[1] ? el('img', { className: 'alt', src: photo(p, 1), alt: '', loading: 'lazy', decoding: 'async' }) : null),
      el('span', { className: 'card-no', textContent: `No. ${String(catalog.indexOf(p) + 1).padStart(2, '0')}` }),
      p.sale && SALE.pct ? el('span', { className: 'badge' }, el('b', { textContent: `${SALE.pct}%` }), 'off') : null),
    el('div', { className: 'card-body' },
      el('p', { className: 'card-col', textContent: col.short }),
      el('h3', { className: 'card-name', textContent: p.name }),
      el('p', { className: 'card-plants', textContent: pl.length ? pl.slice(0, 3).map((x) => x.n).join(' · ') + (pl.length > 3 ? ` · +${pl.length - 3}` : '') : p.sub }),
      el('p', { className: 'card-price' }, priceLabel(p), p.sale && SALE.pct && p.variants[0].price ? el('s', { textContent: money(p.variants[0].price) }) : null)));
  a.style.setProperty('--tilt', `${((i % 5) - 2) * 0.35}deg`);
  return a;
}
const grid = (list, cls = '') => el('div', { className: `grid ${cls}` }, list.map(productCard));
function sectionHead(kicker, title, sub, link, cg, word) {
  const txt = el('div', { className: 'sh-text' }, el('p', { className: 'kicker', textContent: kicker }), el('h2', { textContent: title }), sub ? el('p', { className: 'sec-sub', textContent: sub }) : null, link ? el('a', { className: 'btn', href: link[1], textContent: link[0] }) : null);
  return el('header', { className: `sec-head${cg === false ? ' solo' : ''}` }, word !== false ? el('span', { className: 'bigword', ariaHidden: 'true', textContent: word || title }) : null, txt, cg === false ? null : collage(cg));
}
/* organised chaos: a cluster of product photos, garden art, stickers and moons beside every heading */
let collageN = 0;
const ARTS = ['fx3', 'fx6', 'fx1', 'fx4', 'fx5', 'fx0', 'plant8', 'fx7', 'fx2', 'plant4'];
const STICKERS = ['Small batch', 'Hand harvested', 'Farm direct', 'Made by hand', 'Organic', 'Sri Lanka', 'Full moon made', 'Loose leaf'];
const photoPool = () => catalog.filter((p) => p.handle !== CARD && p.gallery.length);
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const STOCK_NAMES = { 'tea-jars': 'Steep slow', 'blue-lilies': 'Blue lotus', 'blue-lotus-night': 'Night bloom', 'rope-incense': 'Sacred smoke', 'altar-crystals': 'The altar', 'green-valley': 'The hills' };
// a hand of tarot cards, fanned from one pivot. Tap or swipe to shuffle a card to the front; tap the front card to open it.
function collage(list, big = false) {
  const n = collageN++, pool = photoPool();
  const pick = (list && list.length ? list : [0, 1, 2, 3, 4].map((i) => pool[(n * 7 + i * 11) % pool.length])).filter((p, i, a) => p && a.indexOf(p) === i).slice(0, big ? 7 : 5);
  const N = pick.length, spread = N > 5 ? 10 : 12, mid = Math.floor(N / 2);
  const cards = pick.map((p, i) => {
    const stock = typeof p === 'string', name = stock ? STOCK_NAMES[p] || '' : p.name;
    const c = el(stock ? 'div' : 'a', stock ? { className: 'tarot' } : { className: 'tarot', href: `#p--${p.handle}` },
      el('span', { className: 't-num', textContent: ROMAN[i] }), el('img', { src: photo(p, !stock && (n + i) % 2 && p.gallery[1] ? 1 : 0), alt: '', decoding: 'async' }), el('span', { className: 't-name', textContent: name }));
    c.dataset.name = name; return c;
  });
  let order = cards.map((_, i) => i);   // order[slot] = card; the middle slot is the front of the hand
  const fan = el('div', { className: 'fan' }, cards);
  const cap = el('p', { className: 'fan-now', ariaLive: 'polite' });
  const arrange = () => {
    order.forEach((ci, slot) => {
      const c = cards[ci], front = slot === mid;
      c.style.setProperty('--a', `${(slot - mid) * spread}deg`); c.style.zIndex = String(N - Math.abs(slot - mid) * 2 + (front ? 10 : 0));
      c.classList.toggle('front', front); c.setAttribute('aria-hidden', front ? 'false' : 'true'); c.tabIndex = front ? 0 : -1;
      if (front) cap.replaceChildren(el('span', { textContent: c.dataset.name }), c.tagName === 'A' ? el('a', { href: c.getAttribute('href'), textContent: 'Open ✦' }) : '');
    });
  };
  const turn = (d) => { order = d > 0 ? [...order.slice(1), order[0]] : [order[order.length - 1], ...order.slice(0, -1)]; arrange(); };
  const bringFront = (ci) => { let guard = N; while (order[mid] !== ci && guard--) turn(order.indexOf(ci) > mid ? 1 : -1); };
  cards.forEach((c, ci) => c.addEventListener('click', (e) => { if (!c.classList.contains('front')) { e.preventDefault(); bringFront(ci); } }));
  // swipe across the hand to shuffle
  let sx = null;
  const wrap = el('div', { className: `collage${big ? ' big' : ''}` });
  wrap.addEventListener('pointerdown', (e) => { sx = e.clientX; }, { passive: true });
  wrap.addEventListener('pointerup', (e) => { if (sx != null && Math.abs(e.clientX - sx) > 28) { turn(e.clientX < sx ? 1 : -1); fan.dataset.swiped = '1'; setTimeout(() => { delete fan.dataset.swiped; }, 0); } sx = null; });
  wrap.addEventListener('click', (e) => { if (fan.dataset.swiped) { e.preventDefault(); e.stopPropagation(); } }, true);
  const shuffle = el('button', { className: 'fan-shuffle', type: 'button' }, el('span', { textContent: '⟲' }), 'Shuffle');
  shuffle.onclick = () => { fan.classList.remove('shuffling'); void fan.offsetWidth; fan.classList.add('shuffling'); setTimeout(() => turn(1), 180); };
  const prev = el('button', { className: 'fan-arrow', type: 'button', ariaLabel: 'Previous card', textContent: '←' }), next = el('button', { className: 'fan-arrow', type: 'button', ariaLabel: 'Next card', textContent: '→' });
  prev.onclick = () => turn(-1); next.onclick = () => turn(1);
  arrange();
  wrap.append(el('img', { className: 'cg-art', src: A(`assets/img/${ARTS[(n * 3) % ARTS.length]}.webp`), alt: '', loading: 'lazy', decoding: 'async' }), fan, moons('cg-moon'),
    el('div', { className: 'fan-ctl' }, prev, shuffle, next), cap);
  return wrap;
}
// fill a page banner: products of that page in a fanned collage, a giant outlined word and the garden along its hem
function dress(head, list, word) {
  if (!head) return;
  head.classList.add('dressed');
  head.append(el('span', { className: 'bigword', ariaHidden: 'true', textContent: word }), collage(list, true), edge(['plant5', 'fx7', 'plant8', 'fx0', 'plant5', 'fx6', 'plant4', 'fx2', 'plant5'], 'ph-edge'), ribbon([word, 'Small batch', 'Hand harvested', 'Farm direct'], 'r1 ph-rib'));
}
const ribbon = (words, cls = '') => el('div', { className: `ribbon ${cls}`, ariaHidden: 'true' }, el('div', { className: 'ribbon-track' }, [0, 1].map(() => el('div', { className: 'ribbon-set' }, [...words, ...words].map((w, i) => el('span', {}, w, el('i', { textContent: '✿✦☾❀✺'[i % 5] })))))));
const ribbons = (a, b) => el('div', { className: 'ribbons', ariaHidden: 'true' }, ribbon(a, 'r1'), ribbon(b, 'r2'));
const MOON = ['M', 'W1', 'H1', 'G1', 'F', 'G2', 'H2', 'W2'];
function moons(cls = '') {
  const one = (k, i) => { const x = 12 + i * 30; if (k === 'M') return `<circle cx="${x}" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.2"/>`; if (k === 'F') return `<circle cx="${x}" cy="12" r="9" fill="currentColor"/>`; const lit = { W1: 0.25, H1: 0.5, G1: 0.75, G2: 0.75, H2: 0.5, W2: 0.25 }[k], left = k.endsWith('2'); const rx = Math.abs(1 - 2 * lit) * 9, sweepOut = left ? 0 : 1; return `<circle cx="${x}" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M${x} 3 A9 9 0 0 ${sweepOut} ${x} 21 A${rx} 9 0 0 ${lit > 0.5 ? 1 - sweepOut : sweepOut} ${x} 3Z" fill="currentColor"/>`; };
  return html('div', `moons ${cls}`, `<svg viewBox="0 0 ${MOON.length * 30 - 6} 24" aria-hidden="true">${MOON.map(one).join('')}</svg>`);
}
const sun = (cls = '') => html('div', `sun ${cls}`, `<svg viewBox="0 0 200 200" aria-hidden="true">${Array.from({ length: 24 }, (_, i) => `<path d="M100 100 L${100 + 96 * Math.cos((i * 15 - 3) * Math.PI / 180)} ${100 + 96 * Math.sin((i * 15 - 3) * Math.PI / 180)} L${100 + 96 * Math.cos((i * 15 + 3) * Math.PI / 180)} ${100 + 96 * Math.sin((i * 15 + 3) * Math.PI / 180)}Z" fill="currentColor" opacity="${i % 2 ? .5 : 1}"/>`).join('')}<circle cx="100" cy="100" r="40" fill="currentColor"/><circle cx="100" cy="100" r="30" fill="none" stroke="var(--bg)" stroke-width="2"/><path d="M78 100 Q100 82 122 100 Q100 118 78 100Z" fill="var(--bg)"/><circle cx="100" cy="100" r="7" fill="currentColor"/></svg>`);
const stamp = (text, ic = 'flower', cls = '') => el('div', { className: `stamp ${cls}`, ariaHidden: 'true' }, html('span', 'stamp-ring', `<svg viewBox="0 0 120 120"><defs><path id="ring-${cls || 'a'}" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><text><textPath href="#ring-${cls || 'a'}" textLength="288" lengthAdjust="spacing">${text}</textPath></text></svg>`), icon(ic, 'ti stamp-ic'));
// a strip of the garden's plants, standing along the bottom edge of a block
const edge = (names, cls = '') => el('div', { className: `edge ${cls}`, ariaHidden: 'true' }, names.map((n, i) => { const im = el('img', { src: A(`assets/img/${n}.webp`), alt: '', loading: 'lazy', decoding: 'async' }); im.style.setProperty('--i', i); return im; }));
const deco = (name, cls) => el('img', { className: `deco ${cls}`, src: A(`assets/img/${name}.webp`), alt: '', loading: 'lazy', decoding: 'async' });
function reviewCard(r, withProduct) {
  const p = byHandle[r.handle];
  return el('figure', { className: 'quote' }, el('p', { className: 'stars', textContent: stars(r.score), ariaLabel: `${r.score} out of 5` }), r.title ? el('p', { className: 'q-t', textContent: r.title }) : null, el('blockquote', { textContent: r.body }),
    el('figcaption', {}, r.author, r.verified ? ' · Verified buyer' : '', withProduct && p ? el('a', { href: `#p--${p.handle}`, textContent: ` · ${p.name}` }) : null));
}

/* ---------- pages ---------- */
function home() {
  const m = [];
  m.push(hero());
  m.push(ribbons(['Hand harvested', 'Farm direct from Sri Lanka', 'Small batch', 'Organic & pesticide-free', 'Brewed under the full moon'], ['Blue lotus', 'Butterfly pea', 'Hibiscus', 'Moringa', 'Ceylon cinnamon', 'Turmeric', 'Frankincense']));
  // promises
  m.push(el('section', { className: 'promises tone-marigold' }, sun('pr-sun'), ...[['leaf', 'Organic & pesticide-free', 'Grown in rich soil and hand harvested. Our Blue Lotus is tested and backed by a COA.'], ['plant-2', 'Farmer direct', 'Direct trade with multigenerational regenerative farmers in Sri Lanka. No middlemen.'], ['flower', 'Made in-house', 'Signature blends like Butterfly Chai and Full Spectrum Hibiscus, made by hand in small batches.']].map(([ic, t, d]) => el('div', { className: 'promise' }, icon(ic), el('h3', { textContent: t }), el('p', { textContent: d })))));
  // shop by collection
  m.push(el('section', { className: 'sec tone-cream cols-sec scal' }, deco('fx0', 'c-d0 sway'), deco('fx6', 'c-d1 sway'), sectionHead('Shop by ritual', 'The whole apothecary', 'Five corners of the garden, each with its own character.', null, ORDER.map((k) => catalog.find((p) => p.station === k && p.gallery.length)), 'Apothecary'),
    el('div', { className: 'cols' }, ...ORDER.map((id) => { const c = COL[id], all = catalog.filter((p) => p.station === id); const hero = byHandle[{ tea: 'butterfly-chai-organic-whole-spice-blend-ceylon-black-tea', potions: 'blue-water-lily-tincture', pond: 'blue-water-lily-flowers-organic-whole-flower', altar: 'brass-resin-burner-w-wooden-handle' }[id]];
      return el('a', { className: `col split tone-${c.tone}${hero ? '' : ' no-photo'}`, href: `#shop-${id}` },
        el('div', { className: 'col-text' }, icon(c.icon, 'ti col-ic'), el('h3', { textContent: c.name }), el('p', { textContent: c.blurb }), el('span', { className: 'col-n', textContent: `${all.length} ${all.length === 1 ? 'item' : 'items'}` }), el('span', { className: 'col-go', textContent: `Shop ${c.short.toLowerCase()} →` })),
        hero ? el('div', { className: 'col-photo' }, el('img', { src: photo(hero), alt: '', loading: 'lazy', decoding: 'async' })) : null); }))));
  // best loved
  m.push(el('section', { className: 'sec tone-plum loved scal' }, deco('fx3', 'l-d0 sway'), deco('fx4', 'l-d1 sway'), deco('bfly3', 'l-d2 fl'), sectionHead('Fresh from the apothecary', 'Most loved', null, ['Shop all', '#shop'], best.slice(4), 'Adored'), grid(best)));
  m.push(ribbons(['Steep slow', 'Stay rooted', 'Made by hand', 'Nothing you can’t pronounce'], ['Teas', 'Potions', 'Pantry', 'Ritual', 'Gifts']));
  // plants
  const featured = ['blue-lotus', 'hibiscus', 'butterfly-pea', 'moringa', 'cinnamon', 'turmeric', 'lavender', 'frankincense', 'soursop', 'mullein', 'saffron', 'calendula'];
  m.push(el('section', { className: 'sec tone-moss plants-sec' }, deco('plant1', 'p-d0 sway'), deco('fx7', 'p-d1'), sectionHead('Ingredient led', 'Meet the plants', 'Every product starts with a plant. Find the ones you love and see everything we make with them.', ['All plants', '#plants'], null, 'Botanica'),
    el('div', { className: 'plant-grid' }, featured.map((k) => plantTile(k)))));
  // story
  m.push(el('section', { className: 'story-band scal' }, deco('fx5', 's-d0 sway'), stamp('GROWN SLOW ✦ HARVESTED BY HAND ✦ ', 'plant-2', 's-stamp'),
    el('div', { className: 'story-photos' }, el('img', { className: 'sp0', src: A('assets/img/story-harvest.webp'), alt: 'Four people standing in a lake holding freshly picked blue water lilies' }), el('img', { className: 'sp1', src: A('assets/img/story-blue-lotus-1.webp'), alt: 'A blue water lily among lily pads' }), el('img', { className: 'sp2', src: A('assets/img/story-blue-lotus-2.webp'), alt: 'A pale water lily opening on dark water' })),
    el('div', { className: 'story-copy' }, el('p', { className: 'kicker', textContent: 'Grown slow. Harvested by hand.' }), el('h2', { textContent: 'From our family lakes to your cup' }), el('p', { textContent: 'Every flower, root and spice comes directly from regenerative family farms in Sri Lanka that carry generations of Ayurvedic know-how. No middlemen, no fillers, nothing you can’t pronounce.' }), el('p', { textContent: RECIPROCITY.t }), el('a', { className: 'btn', href: '#story', textContent: 'Read our story' }))));
  // brew
  m.push(el('section', { className: 'sec tone-lotus brew scal' }, sun('b-sun'), deco('fx1', 'b-d0 sway'), deco('pond', 'b-d1 spin-slow'), sectionHead('Steep slow. Stay rooted.', 'Brew it your way', null, null, [catalog.find((p) => p.station === 'tea'), 'tea-jars', ...catalog.filter((p) => p.station === 'tea').slice(3, 5)], 'Steep'), el('ol', { className: 'brew-steps' }, ...[['steam', 'Hot cup', 'Steep 1–2 tsp in just-boiled water for 5–7 minutes. Add honey and lemon if you like.'], ['droplet', 'Cold brew', 'Steep overnight in the fridge for a strong infusion. Pour over a glass of ice.'], ['sun', 'Sun brew', 'Fill a jar with herbs and water and let the sunshine do the work for 3–4 hours.']].map(([ic, t, d]) => el('li', {}, icon(ic), el('h3', { textContent: t }), el('p', { textContent: d })))), el('a', { className: 'btn', href: '#shop-tea', textContent: 'Shop loose leaf' })));
  // reviews
  m.push(el('section', { className: 'sec tone-hibiscus kind scal' }, html('span', 'big-q', '“'), deco('fx6', 'k-d0 sway'), deco('bfly1', 'k-d1 fl'), sectionHead(`${stars(5)} 5.0 from ${reviews.length} reviews`, 'In their words', null, ['Read them all', '#reviews'], [...new Set(reviews.map((r) => byHandle[r.handle]).filter(Boolean))].slice(0, 4), 'Love'), el('div', { className: 'quotes' }, reviews.filter((r) => r.body.length > 60).slice(0, 6).map((r) => reviewCard(r, true)))));
  // gifts
  m.push(ribbons(['Give a gift that keeps on giving', 'Gift cards', 'Under $25'], ['Wholesale', 'The Elixir Bar', 'Ritual sets']));
  m.push(giftsBand());
  // wholesale + elixir
  m.push(el('section', { className: 'sec duo tone-night scal' },
    el('a', { className: 'duo-card tone-hibiscus', href: '#wholesale' }, el('p', { className: 'kicker', textContent: 'For shops, cafés and makers' }), el('h3', { textContent: 'Wholesale herbs' }), el('p', { textContent: 'Farm-direct organic herbs and our own line at wholesale prices, with COA.' }), el('span', { className: 'btn', textContent: 'Find out more' })),
    el('a', { className: 'duo-card tone-marigold', href: '#elixir' }, el('p', { className: 'kicker', textContent: 'For your next event' }), el('h3', { textContent: 'The Elixir Bar' }), el('p', { textContent: 'Bring our mocktail and elixir bar to your celebration.' }), el('span', { className: 'btn', textContent: 'Book the bar' }))));
  m.push(faqBlock());
  return m;
}
function hero() {
  const L = (name, cls, d) => { const i = el('img', { className: `hl ${cls}`, src: A(`assets/img/${name}.webp`), alt: '', decoding: 'async' }); i.style.setProperty('--d', d); return i; };
  const flies = el('div', { className: 'hl flies' }, Array.from({ length: 34 }, (_, i) => { const f = el('i'); f.style.cssText = `left:${(i * 37 + 11) % 100}%;top:${(i * 53 + 7) % 92}%;animation-delay:${-((i * 1.3) % 9).toFixed(1)}s;animation-duration:${6 + (i % 5)}s;--s:${1 + (i % 3) * .6}`; return f; }));
  flies.style.setProperty('--d', .45);
  const sky = el('div', { className: 'hl h-sky', style: `background-image:url(${A('assets/img/sky.webp')})` }); sky.style.setProperty('--d', .08);
  const rays = el('div', { className: 'hl h-rays' }); rays.style.setProperty('--d', .2);
  const fav = ['blue-water-lily-flowers-organic-whole-flower', 'butterfly-chai-organic-whole-spice-blend-ceylon-black-tea', 'hathors-ease-blue-lotus-magnesium-whipped-tallow-balm'].map((h) => byHandle[h]);
  const scene = el('div', { className: 'hero-scene', ariaHidden: 'true' }, sky, rays,
    L('banyan', 'h-banyan', .18), L('fx2', 'h-willow', .3), L('fx1', 'h-bells', .38), L('gate', 'h-gate', .42), L('witch-present', 'h-sarah', .5),
    L('fx6', 'h-orchid', .6), L('fx7', 'h-mush', .75), L('plant8', 'h-hib', .9), L('fx4', 'h-moons', .55), L('fx0', 'h-fern', .85), L('plant5', 'h-grass', 1.1), L('plant5', 'h-grass2', 1.1),
    L('bfly0', 'h-b0 fl', .7), L('bfly4', 'h-b1 fl', .8), L('bfly2', 'h-b2 fl', .6), flies, el('div', { className: 'h-shade' }));
  const sec = el('section', { className: 'hero' }, scene,
    el('div', { className: 'hero-copy' },
      moons('h-moon'),
      el('p', { className: 'kicker', textContent: 'Organic herbal teas, tinctures and ritual tools' }),
      el('h1', { textContent: 'Reconnecting you with your roots' }),
      el('p', { className: 'lede', textContent: 'Small-batch herbal teas, potions and whole flowers, hand harvested from regenerative family farms in Sri Lanka. Loose leaf, farm-direct, nothing you can’t pronounce.' }),
      el('div', { className: 'row' }, el('a', { className: 'btn btn-main', href: '#shop', textContent: 'Shop the apothecary' }), el('a', { className: 'btn btn-glow', href: './', textContent: 'Walk the 3D garden' })),
      el('div', { className: 'h-fav' }, el('p', { className: 'kicker', textContent: 'Most loved right now' }), el('div', { className: 'h-cards' }, fav.map((p, i) => el('a', { className: 'h-card', href: `#p--${p.handle}`, style: `--r:${(i - 1) * 5}deg` }, el('img', { src: photo(p), alt: '' }), el('span', { textContent: p.name })))))),
    stamp('FARM DIRECT ✦ SRI LANKA ✦ SMALL BATCH ✦ ', 'flower', 'h-stamp'));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer: fine)').matches) {
    sec.addEventListener('pointermove', (e) => { const r = sec.getBoundingClientRect(); sec.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3)); sec.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
    sec.addEventListener('pointerleave', () => { sec.style.setProperty('--mx', 0); sec.style.setProperty('--my', 0); });
  }
  return sec;
}
function plantTile(k) {
  const x = PLANTS[k], n = productsWith(k).length;
  return el('a', { className: 'plant', href: `#plant--${k}` }, icon(x.ic), el('h3', { textContent: x.n }), x.b ? el('p', { className: 'bot', textContent: x.b }) : null, el('p', { className: 'pn', textContent: `${n} ${n === 1 ? 'product' : 'products'}` }));
}
function giftsBand() {
  return el('section', { className: 'sec tone-marigold gifts-band scal' }, sun('g-sun'), deco('bfly5', 'g-d0 fl'), deco('fx8', 'g-d1'), sectionHead('Give a gift that keeps on giving', 'Gifts by budget', 'Thoughtful finds at every price, or let them choose with a gift card.', null, false, 'Gifts'),
    el('div', { className: 'gift-tiles' }, ...[['25', 'Under $25'], ['40', '$25 to $40'], ['75', '$40 to $75']].map(([k, t]) => el('a', { className: 'gift-tile', href: `#gifts-${k}` }, el('span', { className: 'gt-pics' }, giftList(k).filter((p) => p.gallery.length).slice(0, 3).map((p) => el('img', { src: photo(p), alt: '', loading: 'lazy' }))), el('span', { className: 'gt-n', textContent: t }), el('span', { className: 'gt-s', textContent: `${giftList(k).length} ideas` }))),
    ),
    el('a', { className: 'gift-solo', href: `#p--${CARD}` }, el('img', { src: A(`assets/cut/${CARD}.webp`), alt: 'Garden of Gaia gift card' }), el('span', { className: 'gs-k', textContent: 'Or let them choose' }), el('span', { className: 'gs-t', textContent: 'The gift card' }), el('span', { className: 'gs-s', textContent: `${cardRange(byHandle[CARD])}, sent by email` })));
}
function giftList(k) {
  const [lo, hi] = { 25: [0, 25], 40: [25, 40], 75: [40, 75] }[k];
  const cost = (p) => now((p.variants.find((v) => v.available) || p.variants[0]).price, p);
  return catalog.filter((p) => p.handle !== CARD && cost(p) > lo && cost(p) <= hi).sort((a, b) => cost(a) - cost(b));
}
function faqBlock() {
  return el('section', { className: 'sec faq tone-cream scal' }, el('div', { className: 'faq-grid' },
    el('div', {}, sectionHead('Good to know', 'Questions, answered', null, null, false, 'Ask'), el('div', { className: 'faq-list' }, FAQ.map(([q, a]) => el('details', {}, el('summary', { textContent: q }), el('p', { textContent: a }))))),
    el('aside', { className: 'faq-art' }, el('img', { className: 'fa-table', src: A('assets/img/teatable.webp'), alt: '', loading: 'lazy' }), el('div', { className: 'fa-card tone-moss' }, el('img', { className: 'fa-face', src: A('assets/img/witch-face.webp'), alt: '' }), el('h3', { textContent: 'Still wondering?' }), el('p', { textContent: 'Write to us and we’ll help you find the right blend.' }), el('p', { className: 'sel', textContent: EMAIL }), el('a', { className: 'btn', href: '#hello', textContent: 'Say hello' })), stamp('ASK THE APOTHECARY ✦ ', 'leaf', 'fa-stamp'))));
}
function shop(id, q = '') {
  const c = COL[id];
  let list = id ? catalog.filter((p) => p.station === id) : catalog;
  if (q) { const t = q.toLowerCase(); list = catalog.filter((p) => `${p.name} ${p.sub} ${plantsOf(p).map((x) => x.n).join(' ')}`.toLowerCase().includes(t)); }
  const head = el('section', { className: `page-head tone-${c ? c.tone : 'night'}` }, sun('ph-sun'), deco(c ? { tea: 'fx1', potions: 'fx3', pond: 'pond', altar: 'altar', roots: 'fx8' }[id] : 'gate', 'ph-d0'), deco('bfly1', 'ph-d1 fl'), 
    el('p', { className: 'kicker', textContent: q ? 'Search' : c ? 'Collection' : 'The whole apothecary' }), el('h1', { textContent: q ? `“${q}”` : c ? c.name : 'Shop all' }), el('p', { className: 'lede', textContent: q ? `${list.length} ${list.length === 1 ? 'match' : 'matches'} across products and plants` : c ? c.blurb : `${catalog.length} things, all made with care.` }));
  const tabs = el('nav', { className: 'tabs', ariaLabel: 'Collections' }, el('a', { href: '#shop', textContent: 'All', ariaCurrent: !id && !q ? 'page' : null }), ORDER.map((k) => el('a', { href: `#shop-${k}`, textContent: COL[k].short, ariaCurrent: k === id ? 'page' : null })));
  const search = el('form', { className: 'search', role: 'search' }, el('label', { htmlFor: 'q', className: 'kicker', textContent: 'Search by product or plant' }), el('input', { id: 'q', type: 'search', value: q, placeholder: 'Blue lotus, chai, sage…', autocomplete: 'off' }));
  search.onsubmit = (e) => { e.preventDefault(); const v = $('#q').value.trim(); location.hash = v ? `#search--${encodeURIComponent(v)}` : '#shop'; };
  const body = el('section', { className: 'sec tone-cream shop scal' }, el('div', { className: 'shop-tools' }, tabs, search), list.length ? grid(list) : el('p', { className: 'empty', textContent: 'Nothing matches that yet. Try a plant name like lavender or hibiscus.' }));
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
  const top = el('section', { className: `pp pp-${col.tone}` }, deco('fx0', 'pp-d0 sway'), deco('bfly2', 'pp-d1 fl'), el('div', { className: `pp-gallery tone-${col.tone}` }, el('div', { className: 'pp-frame' }, main, p.sale && SALE.pct ? el('span', { className: 'badge' }, el('b', { textContent: `${SALE.pct}%` }), 'off') : null), imgs.length > 1 ? thumbs : null, stamp('SMALL BATCH ✦ HAND MADE ✦ ', COL[p.station].icon, 'pp-stamp')), buy);
  const out = [top];
  if (pl.length) out.push(el('section', { className: 'sec tone-moss inside' }, deco('plant1', 'in-d0 sway'), deco('fx7', 'in-d1'), sectionHead(pl.length === 1 ? 'The plant' : `${pl.length} plants inside`, pl.length === 1 ? 'What it is' : 'What’s inside', null, null, [p, ...catalog.filter((x) => x.station === p.station && x !== p && x.gallery.length).slice(0, 3)]), el('div', { className: 'inside-grid' }, pl.map((x) => el('a', { className: 'ing', href: `#plant--${x.k}` }, icon(x.ic), el('h3', { textContent: x.n }), x.b ? el('p', { className: 'bot', textContent: x.b }) : null, el('p', { textContent: x.note }))))));
  const extra = imgs.slice(1, 3).length ? imgs.slice(1, 3) : imgs.slice(0, 1);
  const aside = el('aside', { className: 'pp-aside' }, el('div', { className: 'pa-photos' }, extra.map((src, i) => el('img', { className: `pa-${i}`, src: A(src), alt: '', loading: 'lazy' }))),
    el('div', { className: 'pa-card tone-' + col.tone }, moons('pa-moon'), el('h3', { textContent: 'The apothecary promise' }), el('ul', {}, [['leaf', 'Organic, pesticide-free plants'], ['plant-2', 'Direct from family farms in Sri Lanka'], ['flower', 'Mixed by hand in small batches'], ['seedling', 'Nothing you can’t pronounce']].map(([ic, t]) => el('li', {}, icon(ic), t)))));
  out.push(ribbons([p.name, col.name, 'Small batch', 'Hand harvested'], pl.length ? pl.map((x) => x.n) : ['Farm direct', 'Sri Lanka', 'Made by hand']));
  out.push(el('section', { className: 'sec tone-cream details scal' }, el('div', { className: 'details-in' }, p.lede ? el('p', { className: 'first', textContent: p.lede }) : null, p.sections.filter((s) => s.blocks.length).map((s, i) => el('details', { open: i < 2 }, el('summary', {}, icon(s.icon === 'cup' ? 'cup' : s.icon === 'package' ? 'bottle' : s.icon === 'lotus' ? 'flower' : s.icon === 'plant' ? 'plant-2' : s.icon || 'leaf'), el('span', { textContent: s.title })), blocks(s.blocks)))),
    el('p', { className: 'fine', textContent: 'These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare professional before use if pregnant, nursing, or on medication.' }), aside));
  const w = reviewData.wholesale[p.handle];
  if (w) out.push(el('section', { className: 'sec tone-hibiscus duo-one' }, el('p', { className: 'kicker', textContent: 'Wholesale' }), el('h2', { textContent: w.h }), el('p', { className: 'sec-sub', textContent: w.t }), el('a', { className: 'btn', href: `${STORE}/pages/wholesale-blue-water-lily`, target: '_blank', rel: 'noopener', textContent: 'Apply for wholesale' })));
  out.push(el('section', { className: 'sec tone-plum kind scal', id: 'pp-reviews' }, html('span', 'big-q', '“'), deco('fx3', 'k-d0 sway'), sectionHead(own.length ? `${stars(Math.round(avg))} ${avg} out of 5` : 'Kind words from the garden', own.length ? 'In their words' : 'What people say', own.length ? null : 'No reviews for this one yet. Here is what people say about the rest of the garden.'), el('div', { className: 'quotes' }, (own.length ? own : reviews.slice(0, 3)).map((r) => reviewCard(r, !own.length)))));
  const related = catalog.filter((x) => x.station === p.station && x !== p).slice(0, 4);
  if (related.length) out.push(el('section', { className: `sec tone-${col.tone} loved scal` }, deco('fx4', 'l-d1 sway'), sectionHead('From the same corner of the garden', `More ${COL[p.station].short.toLowerCase()}`, null, [`Shop ${COL[p.station].short.toLowerCase()}`, `#shop-${p.station}`]), grid(related, 'grid-4')));
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
  return [el('section', { className: `page-head tone-${tone}` }, deco('flower4', 'ph-d0'), deco('bfly0', 'ph-d1'), el('p', { className: 'kicker', textContent: 'The Garden of Gaia' }), el('h1', { textContent: i.title }), body.querySelector('.lede') ? el('p', { className: 'lede', textContent: body.querySelector('.lede').textContent }) : null), el('section', { className: 'sec tone-cream info' }, body)];
}

/* ---------- chrome ---------- */
function footer() {
  const f = $('#foot');
  const group = (title, kids, cls = '') => { const d = el('details', { className: `fg ${cls}`, open: true }, el('summary', {}, el('h3', { textContent: title })), ...kids); return d; };
  const links = (list) => el('ul', { className: 'fl' }, list.map(([t, h, ext]) => el('li', {}, el('a', ext ? { href: h, target: '_blank', rel: 'noopener', textContent: t } : { href: h, textContent: t }))));
  const top = el('button', { className: 'to-top', type: 'button', textContent: 'Back to top ↑' }); top.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
  const plantKeys = ['blue-lotus', 'hibiscus', 'butterfly-pea', 'moringa', 'cinnamon', 'turmeric', 'lavender', 'frankincense', 'mullein', 'calendula'].filter((k) => PLANTS[k]);
  f.replaceChildren(edge(['plant5', 'fx7', 'plant8', 'fx0', 'plant4', 'fx6', 'plant5', 'fx1', 'plant2', 'fx7', 'plant5'], 'foot-edge'),
    el('div', { className: 'foot-top' }, el('a', { className: 'foot-logo', href: '#home', ariaLabel: 'The Garden of Gaia Apothecary, home' }), el('p', { className: 'foot-line', textContent: 'Steep slow. Stay rooted.' }), el('div', { className: 'foot-acts' }, el('a', { className: 'btn btn-glow', href: './', textContent: 'Walk the 3D garden' }), top)),
    el('div', { className: 'foot-grid' },
      group('Shop the apothecary', [el('ul', { className: 'f-cols' }, ORDER.map((k) => { const l = catalog.filter((p) => p.station === k); const pic = l.find((p) => p.gallery.length); return el('li', {}, el('a', { href: `#shop-${k}` }, pic ? el('img', { src: photo(pic), alt: '', loading: 'lazy' }) : null, el('span', { className: 'fc-n', textContent: COL[k].name }), el('span', { className: 'fc-c', textContent: `${l.length}` }))); })), links([['Shop all', '#shop'], ['Gifts by budget', '#gifts'], ['Gift cards', `#p--${CARD}`]])], 'f-shop'),
      group('Shop by plant', [el('div', { className: 'f-chips' }, plantKeys.map((k) => el('a', { className: 'f-chip', href: `#plant--${k}` }, icon(PLANTS[k].ic), PLANTS[k].n)), el('a', { className: 'f-chip all', href: '#plants', textContent: 'All plants →' }))], 'f-plants'),
      group('About us', [links([...INFO.map((i) => [i.title, `#${i.id}`]), ['Kind words', '#reviews']])], 'f-about'),
      group('Help', [links([['Refund policy', `${STORE}/policies/refund-policy`, 1], ['Privacy policy', `${STORE}/policies/privacy-policy`, 1], ['Terms of service', `${STORE}/policies/terms-of-service`, 1], ['Contact information', `${STORE}/policies/contact-information`, 1], ['Wholesale application', `${STORE}/pages/wholesale-blue-water-lily`, 1]])], 'f-help'),
      el('div', { className: 'f-news' }, el('h3', { textContent: 'Join the garden' }), el('p', { textContent: 'Herbal rituals, new blends and 10% off your first order.' }), el('a', { className: 'btn btn-main', href: STORE, target: '_blank', rel: 'noopener', textContent: 'Join the newsletter' }), el('p', { className: 'fine' }, 'Write to us at ', el('span', { className: 'sel', textContent: EMAIL })), el('a', { className: 'f-ig', href: INSTAGRAM, target: '_blank', rel: 'noopener', textContent: 'Follow us on Instagram' }))),
    el('div', { className: 'foot-fine' }, el('p', { className: 'fine', textContent: `© 2026 The Garden of Gaia Apothecary. ${SALE.line || ''}` }), el('p', { className: 'fine', textContent: 'These statements have not been evaluated by the FDA. Our products are not intended to diagnose, treat, cure, or prevent any disease.' })));
  const fold = () => f.querySelectorAll('details.fg').forEach((d) => { d.open = innerWidth > 760; });
  fold(); addEventListener('resize', fold);
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
  document.querySelectorAll('#main .sec, #main .page-head, #main .story-band').forEach((sec, k) => sec.prepend(el('div', { className: 'sec-flies', ariaHidden: 'true' }, Array.from({ length: 12 }, (_, i) => { const f = el('i'); f.style.cssText = `left:${(i * 41 + k * 17) % 100}%;top:${(i * 59 + k * 23) % 96}%;animation-delay:-${((i * 1.7 + k) % 8).toFixed(1)}s;animation-duration:${6 + ((i + k) % 5)}s`; return f; }))));
  const ph = $('#main .page-head');
  if (a === 'shop' || a === 'search') dress(ph, b ? catalog.filter((p) => `${p.name} ${p.sub}`.toLowerCase().includes((b || '').toLowerCase())) : best, b ? 'Found' : 'Apothecary');
  else if (a.startsWith('shop-')) { const st = { pond: ['blue-lilies'], altar: ['rope-incense', 'altar-crystals'], tea: ['tea-jars'] }[a.slice(5)] || [], l = catalog.filter((p) => p.station === a.slice(5)); dress(ph, [l[0], st[0], l[1], l[2], st[1], l[3]].filter(Boolean).concat(l.slice(4)), COL[a.slice(5)]?.short || 'Shop'); }
  else if (a === 'plants') dress(ph, [best[0], 'blue-lotus-night', best[1], best[2], 'blue-lilies', best[3]], 'Botanica');
  else if (a === 'plant') dress(ph, productsWith(b), PLANTS[b]?.n || 'Plant');
  else if (a.startsWith('gifts')) dress(ph, a === 'gifts' ? [byHandle[CARD], ...giftList('25').slice(0, 5)] : giftList(a.slice(6)), 'Gifts');
  else if (ph) dress(ph, a === 'story' ? ['green-valley', best[0], 'blue-lilies', best[1], best[5], best[3]] : [...new Set(reviews.map((r) => byHandle[r.handle]).filter(Boolean))], { story: 'Roots', brew: 'Steep', wholesale: 'Wholesale', elixir: 'Elixir', hello: 'Hello', reviews: 'Love' }[a] || 'Gaia');
  document.title = a === 'home' ? 'The Garden of Gaia Apothecary | Organic Herbal Teas & Tinctures' : title;
  document.querySelectorAll('#nav a').forEach((x) => x.setAttribute('aria-current', String(x.getAttribute('href') === `#${a}` || (a === 'p' && x.getAttribute('href') === `#shop-${byHandle[b]?.station}`))));
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (location.hash && location.hash !== '#home') $('#main').focus({ preventScroll: true });
}
const closeMenu = () => { document.body.classList.remove('nav-open'); $('#menu-btn').setAttribute('aria-expanded', 'false'); };

/* ---------- boot ---------- */
$('#ticker').append(...Array.from({ length: 2 }, () => el('div', { className: 'ticker-set' }, [SALE.line, 'Organic & pesticide-free', 'Farm-direct from Sri Lanka', 'Made in-house in small batches', `Free U.S. shipping over $${FREE_SHIPPING_AT}`].filter(Boolean).map((t) => el('span', {}, t, el('i', { textContent: '✦' }))))));
$('#basket-open').onclick = openBasket; $('#basket-close').onclick = closeBasket; $('#scrim').onclick = closeBasket; $('#basket-tab').onclick = closeBasket; $('#basket-shop').onclick = closeBasket;
$('#menu-btn').onclick = () => { const o = document.body.classList.toggle('nav-open'); $('#menu-btn').setAttribute('aria-expanded', String(o)); };
$('#to-garden').onclick = () => store.set('gaia-view', 'garden');
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeBasket(); closeMenu(); } });
addEventListener('hashchange', route);
addEventListener('scroll', () => $('#head').classList.toggle('scrolled', scrollY > 30), { passive: true });
footer(); renderBasket(); route();
if (!store.get('gaia-21', false)) { $('#age').hidden = false; document.body.classList.add('locked'); $('#age-yes').focus(); }
$('#age-yes').onclick = () => { store.set('gaia-21', true); $('#age').hidden = true; document.body.classList.remove('locked'); };
$('#age-no').onclick = () => { $('#age-denied').hidden = false; $('#age-yes').hidden = true; $('#age-no').hidden = true; };

/* ---------- butterflies, with the soft sound of their wings ---------- */
let actx = null, soundOn = store.get('gaia-csound', true);
const syncSound = () => { $('#sound-btn').setAttribute('aria-pressed', String(soundOn)); $('#sound-btn').classList.toggle('off', !soundOn); $('#nav-sound').textContent = `Garden sounds: ${soundOn ? 'on' : 'off'}`; };
const toggleSound = () => { soundOn = !soundOn; store.set('gaia-csound', soundOn); syncSound(); unlock(); if (soundOn) flutter(0); };
$('#sound-btn').onclick = toggleSound; $('#nav-sound').onclick = toggleSound; syncSound();
function unlock() { if (actx) { if (actx.state === 'suspended') actx.resume(); return; } try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; } }
addEventListener('pointerdown', unlock, { once: true }); addEventListener('keydown', unlock, { once: true });
function flutter(pan = 0, vol = 1) {
  if (!soundOn || !actx || actx.state !== 'running') return;
  const dur = .45 + Math.random() * .35, sr = actx.sampleRate, buf = actx.createBuffer(1, Math.floor(sr * dur), sr), d = buf.getChannelData(0), f = 14 + Math.random() * 8;
  for (let i = 0; i < d.length; i++) { const t = i / sr, env = Math.sin(Math.PI * t / dur) ** 2, flap = Math.max(0, Math.sin(2 * Math.PI * f * t)) ** 3; d[i] = (Math.random() * 2 - 1) * env * flap; }
  const src = actx.createBufferSource(); src.buffer = buf;
  const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100 + Math.random() * 900; bp.Q.value = .8;
  const g = actx.createGain(); g.gain.value = .045 * vol;
  const p = actx.createStereoPanner ? actx.createStereoPanner() : null; if (p) p.pan.value = Math.max(-1, Math.min(1, pan));
  src.connect(bp); bp.connect(g); (p ? (g.connect(p), p) : g).connect(actx.destination); src.start();
}
(function butterflies() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = $('#flutters'), n = innerWidth < 760 ? 2 : 4, mouse = { x: -999, y: -999 };
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  const bs = Array.from({ length: n }, (_, i) => { const im = el('img', { src: A(`assets/img/bfly${[0, 2, 4, 1, 3, 5][i]}.webp`), alt: '' }), w = el('span', { className: 'bf' }, im); w.style.setProperty('--s', `${(innerWidth < 760 ? 20 : 24) + (i % 3) * 6}px`); im.style.animationDuration = `${.16 + (i % 3) * .04}s`; box.append(w); return { w, x: Math.random() * innerWidth, y: 120 + Math.random() * (innerHeight - 200), a: Math.random() * 6.28, v: .6 + Math.random() * .5, t: Math.random() * 100, dart: 0, next: performance.now() + 4000 + Math.random() * 9000 }; });
  let last = performance.now();
  const step = (now) => {
    const dt = Math.min(50, now - last) / 16.7; last = now;
    for (const b of bs) {
      b.t += .01 * dt; b.a += (Math.sin(b.t * 3.1) + Math.sin(b.t * 1.7 + 2)) * .035 * dt;
      const cx = innerWidth / 2 - b.x, cy = innerHeight / 2 - b.y, edge = b.x < 60 || b.x > innerWidth - 60 || b.y < 110 || b.y > innerHeight - 60;
      if (edge) b.a += Math.sign(Math.sin(Math.atan2(cy, cx) - b.a)) * .08 * dt;
      const mx = b.x - mouse.x, my = b.y - mouse.y;
      if (mx * mx + my * my < 90 * 90 && b.dart < 5) { b.a = Math.atan2(my, mx); b.dart = 40; flutter((b.x / innerWidth) * 2 - 1, .9); }
      if (now > b.next) { b.dart = 30; b.next = now + 7000 + Math.random() * 12000; if (Math.random() < .55) flutter((b.x / innerWidth) * 2 - 1, .6); }
      const sp = b.v * (b.dart > 0 ? 3.2 : 1); b.dart = Math.max(0, b.dart - dt);
      b.x += Math.cos(b.a) * sp * dt; b.y += Math.sin(b.a) * sp * dt + Math.sin(b.t * 9) * .4;
      b.w.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${(Math.cos(b.a) * 18).toFixed(1)}deg)`;
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();
window.__ready = true;
