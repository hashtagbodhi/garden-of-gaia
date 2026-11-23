// The classic view: the same shop as the garden, as a conventional scrolling site.
import '@fontsource-variable/eb-garamond';
import '@fontsource-variable/eb-garamond/wght-italic.css';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/cinzel';
import '@fontsource/dm-serif-display/400.css';
import '@fontsource/dm-serif-display/400-italic.css';
import './classic.css';
import './sheet.css';
import './riviera.css';
import catalog from './catalog.json';
import reviewData from './reviews.json';
import ingredientData from './ingredients.json';
import { STATIONS, INFO, STORE, FREE_SHIPPING_AT, SALE, FAQ, RECIPROCITY, EMAIL, INSTAGRAM, TIKTOK, FACEBOOK } from './content.js';
import { openConsult, closeConsult, mountAsk, usesOf } from './consult.js';
import { runTicker } from './ticker.js';
import plantPhotos from './plants.json';
import plantArt from './plantart.json';
import { PLANT_USES, USE_GROUPS, groupsOf, photoCredit } from './plantdata.js';

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
    el('div', { className: `vine-bar${left <= 0 ? ' done' : ''}` }, el('i', { style: `--p:${pct}%` }), el('b', { className: 'vine-bud', style: `left:${pct}%` }), el('em', { className: 'vine-flower', textContent: '✿' })));
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
      p.sale && SALE.pct ? el('span', { className: 'badge' }, el('b', { textContent: `${SALE.pct}%` }), el('i', { textContent: 'off' })) : null),
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
  // shop by collection
  m.push(el('section', { className: 'sec tone-cream cols-sec scal' }, deco('fx0', 'c-d0 sway'), deco('fx6', 'c-d1 sway'), sectionHead('Shop by ritual', 'The whole apothecary', 'Four corners of the garden, each with its own character.', null, ORDER.map((k) => catalog.find((p) => p.station === k && p.gallery.length)), 'Apothecary'),
    el('div', { className: 'cols' }, ...ORDER.filter((id) => id !== 'roots').map((id) => { const c = COL[id], all = catalog.filter((p) => p.station === id); const hero = byHandle[{ tea: 'butterfly-chai-organic-whole-spice-blend-ceylon-black-tea', potions: 'blue-water-lily-tincture', pond: 'blue-water-lily-flowers-organic-whole-flower', altar: 'brass-resin-burner-w-wooden-handle' }[id]];
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
  // a shorter home: the shelves, what is loved, gifts and kind words. The longer reads keep their own pages, one row of doors away
  const drop = ['plants-sec', 'story-band', 'brew', 'duo', 'faq'], keep = [];
  let ribbonsSeen = 0;
  for (const sec of m) {
    if (!sec) continue;
    if (drop.some((c) => sec.classList.contains(c))) continue;
    if (sec.classList.contains('ribbons') && ribbonsSeen++) continue;
    sec.querySelectorAll('.sec-head .collage').forEach((c) => { c.closest('.sec-head').classList.add('solo'); c.remove(); });   // no hands of cards here: they sent people off in every direction
    const q = sec.querySelector('.quotes'); if (q) [...q.children].slice(3).forEach((x) => x.remove());
    keep.push(sec);
  }
  const door = (href, ic, t, d) => el('a', { className: 'door', href }, icon(ic), el('b', { textContent: t }), el('span', { textContent: d }), el('i', { ariaHidden: 'true', textContent: '→' }));
  keep.push(el('section', { className: 'sec doors tone-night' }, el('div', { className: 'doors-in' },
    door('#plants', 'leaf', 'Meet the plants', `${Object.keys(PLANTS).length} flowers, roots and spices`), door('#story', 'sun', 'Our story', 'From our family lakes to your cup'),
    door('#brew', 'steam', 'Brew it your way', 'Hot, cold or in the sun'), door('#wholesale', 'droplet', 'Wholesale & Elixir Bar', 'For shops, cafés and events'))));
  return keep;
}
// what the shop stands by: shown at the foot of every page, above the fine print
const promisesRow = () => el('section', { className: 'promises tone-marigold' }, sun('pr-sun'), ...[['leaf', 'Organic & pesticide-free', 'Grown in rich soil and hand harvested. Our Blue Lotus is tested and backed by a COA.'], ['plant-2', 'Farmer direct', 'Direct trade with multigenerational regenerative farmers in Sri Lanka. No middlemen.'], ['flower', 'Made in-house', 'Signature blends like Butterfly Chai and Full Spectrum Hibiscus, made by hand in small batches.']].map(([ic, t, d]) => el('div', { className: 'promise' }, icon(ic), el('h3', { textContent: t }), el('p', { textContent: d }))));
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
      el('div', { className: 'row' }, el('a', { className: 'btn btn-main', href: '#shop', textContent: 'Shop the apothecary' }), el('a', { className: 'btn btn-glow', href: './#grove', textContent: 'Shop by plants' })),
      el('div', { className: 'h-fav' }, el('p', { className: 'kicker', textContent: 'Most loved right now' }), el('div', { className: 'h-cards' }, fav.map((p, i) => el('a', { className: 'h-card', href: `#p--${p.handle}`, style: `--r:${(i - 1) * 5}deg` }, el('img', { src: photo(p), alt: '' }), el('span', { textContent: p.name })))))),
    stamp('FARM DIRECT ✦ SRI LANKA ✦ SMALL BATCH ✦ ', 'flower', 'h-stamp'));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer: fine)').matches) {
    sec.addEventListener('pointermove', (e) => { const r = sec.getBoundingClientRect(); sec.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3)); sec.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
    sec.addEventListener('pointerleave', () => { sec.style.setProperty('--mx', 0); sec.style.setProperty('--my', 0); });
  }
  return sec;
}
// the plant's own face: its photograph in a round frame, or its mark when we have no photograph yet
const plantFace = (k, cls = '') => (plantPhotos[k]
  ? el('span', { className: `pface ${cls}` }, el('img', { src: A(`assets/plants/${k}.webp`), alt: '', loading: 'lazy', decoding: 'async' }))
  : plantArt[k] ? el('span', { className: `pface painted ${cls}` }, el('img', { src: A(`assets/plantart/${k}.webp`), alt: '', loading: 'lazy', decoding: 'async' }))
  : el('span', { className: `pface no ${cls}` }, icon(PLANTS[k].ic)));
function plantTile(k) {
  const x = PLANTS[k], n = productsWith(k).length, u = PLANT_USES[k] || [];
  const a = el('a', { className: 'plant', href: `#plant--${k}` }, plantFace(k), el('h3', { textContent: x.n }), x.b ? el('p', { className: 'bot', textContent: x.b }) : null,
    u.length ? el('p', { className: 'puses' }, u.slice(0, 2).map((t) => el('span', { textContent: t }))) : null, el('p', { className: 'pn', textContent: `${n} ${n === 1 ? 'product' : 'products'} →` }));
  a.dataset.name = `${x.n} ${x.b || ''} ${u.join(' ')}`.toLowerCase(); a.dataset.groups = groupsOf(k).join('|');
  return a;
}
function giftsBand() {
  // one clear question (how much do you want to spend?) and four equal answers; the gift card is simply the fourth
  const tile = (href, pics, name, sub, cls = '') => el('a', { className: `gift-tile ${cls}`, href }, el('span', { className: 'gt-pics' }, pics), el('span', { className: 'gt-n', textContent: name }), el('span', { className: 'gt-s' }, sub, el('i', { ariaHidden: 'true', textContent: ' →' })));
  return el('section', { className: 'sec tone-marigold gifts-band clean scal' }, sectionHead('Give a gift that keeps on giving', 'Gifts by budget', 'Pick a budget and we will show what fits. Not sure? Send a gift card.', null, false, 'Gifts'),
    el('div', { className: 'gift-tiles' },
      ...[['25', 'Under $25'], ['40', '$25 to $40'], ['75', '$40 to $75']].map(([k, t]) => tile(`#gifts-${k}`, giftList(k).filter((p) => p.gallery.length).slice(0, 3).map((p) => el('img', { src: photo(p), alt: '', loading: 'lazy' })), t, `${giftList(k).length} ideas`)),
      tile(`#p--${CARD}`, [el('img', { src: A(`assets/cut/${CARD}.webp`), alt: '', loading: 'lazy' })], 'Gift card', `${cardRange(byHandle[CARD])}, by email`, 'gt-card')));
}
function giftList(k) {
  const [lo, hi] = { 25: [0, 25], 40: [25, 40], 75: [40, 75] }[k];
  const cost = (p) => now((p.variants.find((v) => v.available) || p.variants[0]).price, p);
  return catalog.filter((p) => p.handle !== CARD && cost(p) > lo && cost(p) <= hi).sort((a, b) => cost(a) - cost(b));
}
function faqBlock() {
  return el('section', { className: 'sec faq tone-cream scal' }, el('div', { className: 'faq-grid' },
    el('div', {}, sectionHead('Good to know', 'Questions, answered', null, null, false, 'Ask'), el('div', { className: 'faq-list' }, FAQ.map(([q, a]) => el('details', {}, el('summary', { textContent: q }), el('p', { textContent: a }))))),
    el('aside', { className: 'faq-art' }, el('img', { className: 'fa-table', src: A('assets/img/teatable.webp'), alt: '', loading: 'lazy' }), el('div', { className: 'fa-card tone-moss' }, el('img', { className: 'fa-face', src: A('assets/img/witch-face.webp'), alt: '' }), el('h3', { textContent: 'Still wondering?' }), el('p', { textContent: 'Answer five questions and Sarah will choose a ritual for you, or write to us.' }), el('button', { className: 'btn', type: 'button', textContent: 'Ask Sarah ✦', onclick: () => askSarah() }), el('p', { className: 'sel', textContent: EMAIL })), stamp('ASK THE APOTHECARY ✦ ', 'leaf', 'fa-stamp'))));
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
  const top = el('section', { className: `pp pp-${col.tone}` }, deco('fx0', 'pp-d0 sway'), deco('bfly2', 'pp-d1 fl'), el('div', { className: 'pp-gallery pp-stack' }, imgs.map((src, i) => el('figure', { className: `pp-shot${i === 0 ? ' first' : ''}` }, el('img', { src: A(src), alt: i === 0 ? p.title : '', loading: i ? 'lazy' : 'eager', decoding: 'async' }), i === 0 ? p.sale && SALE.pct ? el('span', { className: 'badge' }, el('b', { textContent: `${SALE.pct}%` }), el('i', { textContent: 'off' })) : null : null))), buy);
  const crumbs = el('nav', { className: 'crumbs', ariaLabel: 'You are here' }, el('a', { className: 'cr-back', href: `#shop-${p.station}`, textContent: `← ${col.name}` }), el('span', { className: 'cr-trail' }, el('a', { href: '#shop', textContent: 'Shop all' }), ' / ', el('a', { href: `#shop-${p.station}`, textContent: col.short || col.name }), ' / ', el('b', { textContent: p.name })));
  const out = [crumbs, top];
  if (pl.length) out.push(el('section', { className: 'sec tone-moss inside' }, deco('plant1', 'in-d0 sway'), deco('fx7', 'in-d1'), sectionHead(pl.length === 1 ? 'The plant' : `${pl.length} plants inside`, pl.length === 1 ? 'What it is' : 'What’s inside', null, null, [p, ...catalog.filter((x) => x.station === p.station && x !== p && x.gallery.length).slice(0, 3)]), el('div', { className: 'inside-grid' }, pl.map((x) => el('a', { className: 'ing', href: `#plant--${x.k}` }, plantFace(x.k, 'sm'), el('h3', { textContent: x.n }), x.b ? el('p', { className: 'bot', textContent: x.b }) : null, el('p', { textContent: x.note }), (PLANT_USES[x.k] || []).length ? el('p', { className: 'puses' }, PLANT_USES[x.k].slice(0, 3).map((t) => el('span', { textContent: t }))) : null)))));
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
  // ---- a tighter page: buy box, then one sticky row of jumps (Details, Inside, Reviews, More), each section short ----
  const page = out.filter((x) => x && !x.classList.contains('ribbons') && !x.classList.contains('duo-one'));
  const find = (c) => page.find((x) => x.classList.contains(c));
  const det = find('details'), ins = find('inside'), rev = find('kind'), more = find('loved');
  if (det) { det.id = 'pp-details'; det.querySelector('.pp-aside')?.remove(); det.querySelectorAll('details').forEach((d, i) => { d.open = i === 0; }); }
  if (ins) ins.id = 'pp-inside'; if (more) more.id = 'pp-more';
  if (rev) { const q = [...rev.querySelectorAll('.quotes > *')]; q.slice(3).forEach((x) => x.remove()); if (own.length > 3) rev.append(el('a', { className: 'btn pp-allrev', href: '#reviews', textContent: `Read all ${reviews.length} reviews` })); }
  // details first (what it is, how to use it), then what is inside, then reviews and neighbours
  const order = [crumbs, top, null, det, ins, rev, more].filter((x) => x !== undefined);
  const jump = (id, label) => { const b = el('button', { type: 'button', textContent: label }); b.onclick = () => document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); return b; };
  const tabs = el('nav', { className: 'pp-tabs', ariaLabel: 'On this page' }, el('div', { className: 'pp-tabs-in' }, det ? jump('pp-details', 'Details') : null, ins ? jump('pp-inside', pl.length === 1 ? 'The plant' : `Inside (${pl.length})`) : null, rev ? jump('pp-reviews', own.length ? `Reviews (${own.length})` : 'Reviews') : null, more ? jump('pp-more', 'More like this') : null));
  const hh = $('#head').offsetHeight; top.style.setProperty('--buy-top', `${hh + 56}px`); tabs.style.setProperty('--pp-top', `${hh}px`); document.documentElement.style.setProperty('--head-h3', `${hh + 56}px`);
  // the next one along the same shelf, so nobody has to go back to move on
  const shelf = catalog.filter((x) => x.station === p.station), nx = shelf[(shelf.indexOf(p) + 1) % shelf.length];
  if (nx && nx !== p) crumbs.append(el('a', { className: 'cr-next', href: `#p--${nx.handle}` }, el('small', { textContent: 'Next' }), el('span', { textContent: nx.name }), ' →'));
  // phones: once the Add button scrolls away, a slim bar keeps it within reach
  const barPrice = el('b', { textContent: price.firstChild?.textContent || '' }), barAdd = el('button', { type: 'button', className: 'btn btn-main', textContent: add.textContent, disabled: add.disabled });
  const bar = el('div', { className: 'pp-bar', ariaHidden: 'true' }, el('span', { className: 'pp-bar-n' }, el('small', { textContent: p.name }), barPrice), barAdd);
  barAdd.onclick = () => add.click();
  new MutationObserver(() => { barPrice.textContent = price.firstChild?.textContent || ''; }).observe(price, { childList: true, characterData: true, subtree: true });
  new MutationObserver(() => { barAdd.textContent = add.textContent; barAdd.disabled = add.disabled; }).observe(add, { childList: true, characterData: true, subtree: true, attributes: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { const on = !e.isIntersecting && e.boundingClientRect.top < 0 && bar.isConnected; bar.classList.toggle('on', on); document.body.classList.toggle('buybar-on', on); }).observe(add);
  return [...order.map((x) => (x === null ? tabs : x)).filter(Boolean), bar];
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
  // plants we can show a photograph of come first, then by how many things we make with them
  const used = Object.keys(PLANTS).filter((k) => productsWith(k).length).sort((a, b) => (plantPhotos[b] ? 1 : 0) - (plantPhotos[a] ? 1 : 0) || productsWith(b).length - productsWith(a).length || PLANTS[a].n.localeCompare(PLANTS[b].n));
  const tiles = used.map(plantTile), grid2 = el('div', { className: 'plant-grid big' }, tiles), none = el('p', { className: 'plant-none', hidden: true, textContent: 'No plant matches that yet. Try another word, or ask Sarah.' });
  let group = '', q = '';
  const count = el('p', { className: 'plant-count', ariaLive: 'polite' });
  const apply = () => { let n = 0; tiles.forEach((t) => { const ok = (!group || t.dataset.groups.split('|').includes(group)) && (!q || t.dataset.name.includes(q)); t.hidden = !ok; if (ok) n++; }); none.hidden = n > 0; count.textContent = `${n} ${n === 1 ? 'plant' : 'plants'}${group ? ` for ${group.toLowerCase()}` : ''}`; };
  const chips = ['', ...Object.keys(USE_GROUPS)].map((g) => { const b = el('button', { type: 'button', className: `pf-chip${g ? '' : ' on'}`, textContent: g || 'All plants' }); b.onclick = () => { group = g; chips.forEach((c) => c.classList.toggle('on', c === b)); apply(); }; return b; });
  const search = el('input', { type: 'search', className: 'pf-search', placeholder: 'Search a plant or a need: lavender, sleep, digestion…', ariaLabel: 'Search the plants' });
  search.oninput = () => { q = search.value.trim().toLowerCase(); apply(); };
  const ask = el('button', { type: 'button', className: 'pf-ask', textContent: 'Not sure? Ask Sarah ✦' }); ask.onclick = () => askSarah();
  apply();
  return [el('section', { className: 'page-head tone-moss' }, deco('plant3', 'ph-d0'), deco('flower2', 'ph-d1'), el('p', { className: 'kicker', textContent: 'Ingredient led' }), el('h1', { textContent: 'The plants' }), el('p', { className: 'lede', textContent: `${used.length} flowers, leaves, roots, spices and resins we work with. Find a plant by name, or by what you need it for.` })),
    el('section', { className: 'sec tone-cream plants-all' }, el('div', { className: 'plant-tools' }, search, el('div', { className: 'pf-chips', role: 'group', ariaLabel: 'What it is for' }, chips), el('div', { className: 'pf-row' }, count, ask)), grid2, none)];
}
function plantPage(k) {
  const x = PLANTS[k], list = productsWith(k), ph = plantPhotos[k], u = PLANT_USES[k] || [], gs = groupsOf(k);
  // other plants people reach for, for the same reasons
  const kin = Object.keys(PLANTS).filter((o) => o !== k && productsWith(o).length && groupsOf(o).some((g) => gs.includes(g))).sort((a, b) => (plantPhotos[b] ? 1 : 0) - (plantPhotos[a] ? 1 : 0) || groupsOf(b).filter((g) => gs.includes(g)).length - groupsOf(a).filter((g) => gs.includes(g)).length).slice(0, 4);
  const goods = el('ul', { className: 'plant-goods' }, list.map((pr) => {
    const v = pr.variants.find((z) => z.available) || pr.variants[0], uses = usesOf(pr.handle);
    const add = el('button', { type: 'button', className: 'pg-add', textContent: v.available ? '+ Add' : 'Sold out', disabled: !v.available });
    add.onclick = (e) => { e.preventDefault(); addToBasket(v.id, 1, pr.name); add.textContent = 'Added ✓'; setTimeout(() => { add.textContent = '+ Add'; }, 1600); };
    return el('li', {}, el('a', { className: 'pg-img', href: `#p--${pr.handle}`, ariaLabel: pr.name }, el('img', { src: photo(pr, 0), alt: '', loading: 'lazy' })),
      el('div', {}, el('a', { className: 'pg-name', href: `#p--${pr.handle}`, textContent: pr.name }), el('span', { className: 'pg-meta', textContent: [`${pr.variants.length > 1 ? 'From ' : ''}$${now(Math.min(...pr.variants.map((z) => z.price)), pr).toFixed(2)}`, pr.sub].filter(Boolean).join(' · ') }), uses.length ? el('em', { className: 'pg-use', textContent: `For ${uses.join(', ').toLowerCase()}` }) : null), add);
  }));
  return [el('section', { className: `page-head tone-moss plant-head${ph ? ' has-photo' : ''}` }, deco('flower0', 'ph-d0'), deco('bfly3', 'ph-d1'),
      ph ? el('figure', { className: 'plant-photo' }, el('img', { src: A(`assets/plants/${k}.webp`), alt: x.n }), el('figcaption', {}, 'Photo: ', el('a', { href: ph.src, target: '_blank', rel: 'noopener', textContent: photoCredit(ph) }))) : icon(x.ic, 'ti big-ic'),
      el('div', { className: 'plant-words' }, el('a', { className: 'alt-link plant-back', href: '#plants', textContent: '← All plants' }), el('p', { className: 'kicker', textContent: x.b || 'Plant' }), el('h1', { textContent: x.n }), el('p', { className: 'lede', textContent: x.note }),
        u.length ? el('div', { className: 'plant-uses' }, el('span', { className: 'pu-l', textContent: 'Traditionally used for' }), u.map((t) => el('b', { textContent: t }))) : null,
        el('a', { className: 'btn', href: '#plant-goods', textContent: `See ${list.length} ${list.length === 1 ? 'product' : 'products'} ↓`, onclick: (e) => { e.preventDefault(); document.querySelector('.plant-goods')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }))),
    el('section', { className: 'sec tone-cream plant-shop' }, sectionHead(`${list.length} ${list.length === 1 ? 'product' : 'products'}`, `Made with ${x.n.toLowerCase()}`, null, null, list.filter((z) => z.gallery.length)), goods,
      null),
    kin.length ? el('section', { className: 'sec tone-moss plant-kin' }, sectionHead('Keep wandering', 'Plants for the same reasons', null, ['All plants', '#plants']), el('div', { className: 'plant-grid' }, kin.map(plantTile))) : null].filter(Boolean);
}
function giftsPage(k) {
  const list = k ? giftList(k) : null, t = { 25: 'Under $25', 40: '$25 to $40', 75: '$40 to $75' }[k];
  return [el('section', { className: 'page-head tone-hibiscus' }, deco('bfly5', 'ph-d0'), deco('flower1', 'ph-d1'), el('p', { className: 'kicker', textContent: 'Give a gift that keeps on giving' }), el('h1', { textContent: k ? `Gifts ${t.toLowerCase()}` : 'Gifts' }), el('p', { className: 'lede', textContent: 'Prices shown are what you pay today.' })),
    k ? el('section', { className: 'sec tone-cream' }, el('nav', { className: 'tabs' }, ['25', '40', '75'].map((g) => el('a', { href: `#gifts-${g}`, ariaCurrent: g === k ? 'page' : null, textContent: { 25: 'Under $25', 40: '$25 to $40', 75: '$40 to $75' }[g] })), el('a', { href: `#p--${CARD}`, textContent: 'Gift card' })), grid(list)) : giftsBand()];
}
function infoPage(id) {
  const i = INFO.find((x) => x.id === id);
  if (id === 'reviews') return [el('section', { className: 'page-head tone-plum' }, el('p', { className: 'kicker', textContent: `${stars(5)} 5.0 from ${reviews.length} reviews` }), el('h1', { textContent: 'Kind words' })), el('section', { className: 'sec tone-plum' }, el('div', { className: 'quotes' }, reviews.map((r, i) => { const c = reviewCard(r, true); if (i >= 9) c.classList.add('later'); return c; })), reviews.length > 9 ? (() => { const b = el('button', { type: 'button', className: 'btn more-reviews', textContent: `Show all ${reviews.length} reviews` }); b.onclick = () => { b.closest('.sec').classList.add('all'); b.remove(); }; return b; })() : null)];
  const tone = { story: 'moss', brew: 'lotus', wholesale: 'hibiscus', elixir: 'marigold', hello: 'night' }[id] || 'night';
  const body = html('div', 'info-body', i.html.replace(/assets\//g, A('assets/')).replace(/href="#(tea|pond)"/g, 'href="#shop-$1"'));
  if (id === 'story') {
    const media = el('div', { className: 'st-media' }), text = el('div', { className: 'st-text' }); let card = null, n = 0;
    for (const node of [...body.children]) {
      if (node.matches('figure, .pair')) media.append(node);
      else if (node.matches('h3')) { card = el('article', { className: 'st-card' }, el('span', { className: 'st-n', ariaHidden: 'true', textContent: ROMAN[n++] })); card.append(node); text.append(card); }
      else if (node.matches('p') && card) card.append(node);
      else if (!node.matches('.lede, h2')) text.append(node);
    }
    body.replaceChildren(media, text); body.classList.add('story-2col');
  }
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
    el('div', { className: 'foot-top' }, el('a', { className: 'foot-logo', href: '#home', ariaLabel: 'The Garden of Gaia Apothecary, home' }), el('p', { className: 'foot-line', textContent: 'Steep slow. Stay rooted.' }), el('div', { className: 'foot-acts' }, el('a', { className: 'btn btn-glow', href: './#grove', textContent: 'Shop by plants' }), top)),
    el('div', { className: 'foot-grid' },
      group('Shop the apothecary', [el('ul', { className: 'f-cols' }, ORDER.map((k) => { const l = catalog.filter((p) => p.station === k); const pic = l.find((p) => p.gallery.length); return el('li', {}, el('a', { href: `#shop-${k}` }, pic ? el('img', { src: photo(pic), alt: '', loading: 'lazy' }) : null, el('span', { className: 'fc-n', textContent: COL[k].name }), el('span', { className: 'fc-c', textContent: `${l.length}` }))); })), links([['Shop all', '#shop'], ['Gifts by budget', '#gifts'], ['Gift cards', `#p--${CARD}`]])], 'f-shop'),
      group('Shop by plant', [el('div', { className: 'f-chips' }, plantKeys.map((k) => el('a', { className: 'f-chip', href: `#plant--${k}` }, icon(PLANTS[k].ic), PLANTS[k].n)), el('a', { className: 'f-chip all', href: '#plants', textContent: 'All plants →' }))], 'f-plants'),
      group('About us', [links([...INFO.map((i) => [i.title, `#${i.id}`]), ['Kind words', '#reviews']])], 'f-about'),
      group('Help', [links([['Questions, answered', '#faq'], ['Refund policy', `${STORE}/policies/refund-policy`, 1], ['Privacy policy', `${STORE}/policies/privacy-policy`, 1], ['Terms of service', `${STORE}/policies/terms-of-service`, 1], ['Contact information', `${STORE}/policies/contact-information`, 1], ['Wholesale application', `${STORE}/pages/wholesale-blue-water-lily`, 1]])], 'f-help')),
    promisesRow(),
    el('div', { className: 'foot-social' }, ...[[FACEBOOK, 'Facebook', `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.700"/><path d="M13 20.500v-7h2.300l.4-2.700H13V9.200c0-.8.3-1.300 1.400-1.300h1.400V5.600c-.3 0-1.100-.1-2-.1-2 0-3.300 1.200-3.300 3.400v1.900H8.300v2.700h2.200v7" fill="none" stroke="currentColor" stroke-width="1.500" stroke-linejoin="round"/></svg>`], [INSTAGRAM, 'Instagram', `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.500" y="3.500" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.700"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.700"/><circle cx="17.200" cy="6.800" r="1.100" fill="currentColor"/></svg>`], [`mailto:${EMAIL}`, 'Email', `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.500" width="18" height="13" rx="2.500" fill="none" stroke="currentColor" stroke-width="1.700"/><path d="M4 7.500l8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round"/></svg>`]].filter((x) => x[0]).map(([href, label, svg]) => { const a = html('a', 'fso', svg); a.href = href; a.setAttribute('aria-label', label); a.title = label; if (!href.startsWith('mailto')) { a.target = '_blank'; a.rel = 'noopener'; } return a; })),
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
  else if (a === 'faq') { page = [el('section', { className: 'page-head tone-night' }, el('p', { className: 'kicker', textContent: 'Good to know' }), el('h1', { textContent: 'Questions, answered' })), faqBlock()]; title = `Questions | ${title}`; }
  else if (INFO.some((i) => i.id === a) || a === 'reviews') page = infoPage(a);
  else page = home();
  document.body.classList.remove('buybar-on');
  $('#main').replaceChildren(...page.filter(Boolean));
  const noCards = () => document.querySelectorAll('#main .collage').forEach((c) => { c.closest('.sec-head')?.classList.add('solo'); c.remove(); });   // no hands of cards anywhere: they sent people off in every direction
  noCards();
  document.querySelectorAll('#main .sec, #main .page-head, #main .story-band').forEach((sec, k) => sec.prepend(el('div', { className: 'sec-flies', ariaHidden: 'true' }, Array.from({ length: 12 }, (_, i) => { const f = el('i'); f.style.cssText = `left:${(i * 41 + k * 17) % 100}%;top:${(i * 59 + k * 23) % 96}%;animation-delay:-${((i * 1.7 + k) % 8).toFixed(1)}s;animation-duration:${6 + ((i + k) % 5)}s`; return f; }))));
  const ph = $('#main .page-head');
  if (a === 'shop' || a === 'search') dress(ph, b ? catalog.filter((p) => `${p.name} ${p.sub}`.toLowerCase().includes((b || '').toLowerCase())) : best, b ? 'Found' : 'Apothecary');
  else if (a.startsWith('shop-')) { const st = { pond: ['blue-lilies'], altar: ['rope-incense', 'altar-crystals'], tea: ['tea-jars'] }[a.slice(5)] || [], l = catalog.filter((p) => p.station === a.slice(5)); dress(ph, [l[0], st[0], l[1], l[2], st[1], l[3]].filter(Boolean).concat(l.slice(4)), COL[a.slice(5)]?.short || 'Shop'); }
  else if (a === 'plants') dress(ph, [best[0], 'blue-lotus-night', best[1], best[2], 'blue-lilies', best[3]], 'Botanica');
  else if (a === 'plant') { if (!plantPhotos[b]) dress(ph, productsWith(b), PLANTS[b]?.n || 'Plant'); }   // a plant with its own photograph needs no card fan beside it
  else if (a.startsWith('gifts')) dress(ph, a === 'gifts' ? [byHandle[CARD], ...giftList('25').slice(0, 5)] : giftList(a.slice(6)), 'Gifts');
  else if (ph) dress(ph, a === 'story' ? ['green-valley', best[0], 'blue-lilies', best[1], best[5], best[3]] : [...new Set(reviews.map((r) => byHandle[r.handle]).filter(Boolean))], { story: 'Roots', brew: 'Steep', wholesale: 'Wholesale', elixir: 'Elixir', hello: 'Hello', reviews: 'Love' }[a] || 'Gaia');
  noCards();
  document.title = a === 'home' ? 'The Garden of Gaia Apothecary | Organic Herbal Teas & Tinctures' : title;
  document.querySelectorAll('#nav a').forEach((x) => x.setAttribute('aria-current', String(x.getAttribute('href') === `#${a}` || (a === 'p' && x.getAttribute('href') === `#shop-${byHandle[b]?.station}`))));
  $('#nav .nav-top').setAttribute('aria-current', String(a === 'shop' || a.startsWith('shop-') || a === 'p' || a === 'search'));
  closeMenu();
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (location.hash && location.hash !== '#home') $('#main').focus({ preventScroll: true });
}
function askSarah() { openConsult({ catalog, now, figure: A('assets/img/witch-sip.webp'), img: (p) => photo(p, 0), add: (p, v) => addToBasket(v.id, 1, p.name), open: (p) => { location.hash = `#p--${p.handle}`; } }); }
const closeMenu = () => { document.body.classList.remove('nav-open'); $('#menu-btn').setAttribute('aria-expanded', 'false'); };

/* ---------- the phone menu: the same shape as the garden's, with search, Sarah, the shelves, gifts and the story ---------- */
function buildMenu() {
  const first = (st) => catalog.find((x) => x.station === st && x.gallery.length), count = (st) => catalog.filter((x) => x.station === st).length;
  const big = (href, label, sub2, img) => el('li', {}, el('a', { href }, img ? el('img', { src: img, alt: '', loading: 'lazy' }) : el('span', { className: 'mn-dot', ariaHidden: 'true', textContent: '✦' }), el('span', { className: 'mn-l', textContent: label }), sub2 ? el('small', { textContent: sub2 }) : null));
  const small = (list) => el('ul', { className: 'mn-small' }, list.map(([t, h]) => el('li', {}, el('a', { href: h, textContent: t }))));
  const form = el('form', { className: 'mn-search', role: 'search' }, el('label', { className: 'mn-label', htmlFor: 'mn-q', textContent: 'Search the shop' }), el('input', { id: 'mn-q', type: 'search', placeholder: 'Blue lotus, chai, sage…', autocomplete: 'off', enterKeyHint: 'search' }));
  form.onsubmit = (e) => { e.preventDefault(); const q = form.querySelector('input').value.trim(); if (q) { location.hash = `#search--${encodeURIComponent(q)}`; form.querySelector('input').blur(); closeMenu(); } };
  const ask = el('button', { type: 'button', className: 'mn-ask' }, el('img', { src: A('assets/img/witch-face.webp'), alt: '' }), el('span', {}, el('b', { textContent: 'Ask Sarah' }), el('small', { textContent: 'Five questions, and a ritual chosen for you' })), el('i', { ariaHidden: 'true', textContent: '→' }));
  ask.onclick = () => { closeMenu(); askSarah(); };
  const garden = el('a', { className: 'mn-garden', href: './#grove' }, el('span', { className: 'mn-orb', ariaHidden: 'true' }), el('span', {}, el('b', { textContent: 'Shop by plants' }), el('small', { textContent: 'Meet every plant we work with' })));
  const sound = el('button', { type: 'button', className: 'mn-sound' }); const paint = () => { sound.textContent = `Garden sounds: ${soundOn ? 'on' : 'off'}`; }; sound.onclick = () => { toggleSound(); paint(); }; paint();
  const idx = el('button', { type: 'button', className: 'mn-idx' }, el('b', { textContent: 'Shop index' }), el('small', { textContent: 'Everything, in one list' })); idx.onclick = () => { closeMenu(); openIndex('all'); };
  // Gifts: the second of the two big doors in the menu, dressed like a wrapped present
  const gifts = el('div', { className: 'mn-gift' },
    el('a', { className: 'mg-main', href: '#gifts' }, el('span', { className: 'mg-rays', ariaHidden: 'true' }), el('img', { src: A(`assets/cut/${CARD}.webp`), alt: '', loading: 'lazy' }),
      el('span', { className: 'mg-t' }, el('small', { textContent: 'Give the garden' }), el('b', { textContent: 'Gifts' }), el('em', { textContent: 'Wrapped rituals for every budget' })), el('i', { ariaHidden: 'true', textContent: '→' })),
    el('span', { className: 'mg-bow', ariaHidden: 'true', textContent: '✿' }),
    el('div', { className: 'mg-chips' }, [['Under $25', '#gifts-25'], ['$25 to $40', '#gifts-40'], ['$40 to $75', '#gifts-75'], ['Gift cards', `#p--${CARD}`]].map(([t, h]) => el('a', { href: h, textContent: t }))));
  const m = el('aside', { id: 'mnav', className: 'mnav', ariaLabel: 'Menu' }, el('div', { className: 'mn-in' },
    ask, gifts, form,
    el('p', { className: 'mn-label', textContent: 'Shop' }),
    el('ul', { className: 'mn-big' }, big('#shop', 'Shop apothecary', `All ${catalog.length}, A to Z`, photo(typeof best[0] === 'string' ? byHandle[best[0]] : best[0], 0)), ...Object.entries(COL).filter(([k]) => first(k) && k !== 'roots').map(([k, c]) => big(`#shop-${k}`, c.short || c.name, `${count(k)}`, photo(first(k), 0))), big('#plants', 'Shop by plant', 'Meet the plants', A('assets/plants/blue-lotus.webp'))),
    el('div', { className: 'mn-cols' },
      el('div', {}, el('p', { className: 'mn-label', textContent: 'Find it fast' }), idx),
      el('div', {}, el('p', { className: 'mn-label', textContent: 'About' }), small([...INFO.map((i) => [i.title, `#${i.id}`]), ['Kind words', '#reviews'], ['Questions', '#faq']]))),
    garden,
    el('div', { className: 'mn-foot' }, sound, el('a', { href: `mailto:${EMAIL}`, textContent: 'Write to us' }), el('a', { href: INSTAGRAM, target: '_blank', rel: 'noopener', textContent: 'Instagram' })),
    el('p', { className: 'mn-fine', textContent: SALE.line })));
  m.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) closeMenu(); });
  // the first door opens the shop index: every product in one searchable list
  m.querySelector('.mn-big a[href="#shop"]').addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); closeMenu(); openIndex('all'); });
  document.body.append(m);
}
const markMenu = () => { const h = location.hash || '#home'; document.querySelectorAll('#mnav a[href^="#"]').forEach((a) => { if (a.getAttribute('href') === h) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); }); };

/* ---------- boot ---------- */
runTicker($('#ticker'), [SALE.line, 'Organic & pesticide-free', 'Farm-direct from Sri Lanka', 'Made in-house in small batches', `Free U.S. shipping over $${FREE_SHIPPING_AT}`].filter(Boolean), reduce);
$('#basket-open').onclick = () => ($('#basket').hidden ? openBasket() : closeBasket()); $('#basket-close').onclick = closeBasket; $('#scrim').onclick = closeBasket; $('#basket-tab').onclick = closeBasket; $('#basket-shop').onclick = closeBasket;
$('#menu-btn').onclick = () => { const o = document.body.classList.toggle('nav-open'); $('#menu-btn').setAttribute('aria-expanded', String(o)); if (o) { markMenu(); $('#mnav').scrollTop = 0; $('#mnav').style.setProperty('--mn-top', `${Math.max(0, Math.round($('#head').getBoundingClientRect().bottom))}px`); } };
addEventListener('click', (e) => { if (e.target.closest?.('a[href^="./#"]')) store.set('gaia-view', 'garden'); }, true);
$('#ask-top').onclick = () => { closeMenu(); if (document.documentElement.classList.contains('consult-on')) closeConsult(); else askSarah(); };
$('#nav-ask').onclick = () => { closeMenu(); askSarah(); };
mountAsk(askSarah, A('assets/img/witch-face.webp'));
/* ---------- shop index: everything in one list, opened the same way as in the garden ---------- */
let sidxFilter = 'all';
function sidxRow(p) {
  const pl = plantsOf(p), a = el('a', { href: `#p--${p.handle}` }, el('img', { src: A(`assets/thumb/${p.handle}.webp`), alt: '', loading: 'lazy' }),
    el('span', {}, el('span', { className: 'n', textContent: p.name }), el('span', { className: 's', textContent: pl.length ? pl.slice(0, 4).map((x) => x.n).join(' · ') + (pl.length > 4 ? ` · +${pl.length - 4}` : '') : p.sub || '' })),
    el('span', { className: 'p', textContent: priceLabel(p) }));
  a.dataset.q = `${p.name} ${p.sub || ''} ${pl.map((x) => x.n).join(' ')}`.toLowerCase();
  a.onclick = () => closeIndex();
  return a;
}
function openIndex(filter = 'all') {
  closeBasket(); closeMenu(); sidxFilter = filter; const box = $('#sidx'); box.hidden = false; box.style.setProperty('--sidx-top', `${Math.max(0, Math.round($('#head').getBoundingClientRect().bottom))}px`); box.scrollTop = 0; document.body.classList.add('locked');
  const gift = filter.startsWith('gift'), G = { gift25: [0, 25, 'Under $25'], gift40: [25, 40, '$25 to $40'], gift75: [40, 75, '$40 to $75'] };
  const ids = ORDER.filter((id) => catalog.some((x) => x.station === id));
  $('#sidx-title').textContent = gift ? 'Gifts' : 'Shop index';
  $('#sidx-lede').textContent = gift ? 'Give a gift that keeps on giving. Pick a budget and we will show what fits.' : 'Everything in the apothecary, in one list.';
  const tab = (id, name) => { const b = el('button', { type: 'button', textContent: name }); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(id === sidxFilter)); b.onclick = () => openIndex(id); return b; };
  $('#sidx-filter').replaceChildren(tab('all', 'Everything'), ...ids.map((id) => tab(id, COL[id].name)));
  $('#sidx-gifts').replaceChildren(el('span', { className: 'sidx-label', textContent: 'Gifts' }), tab('gift25', 'Under $25'), tab('gift40', '$25 to $40'), tab('gift75', '$40 to $75'));
  const list = $('#sidx-list'); list.replaceChildren();
  if (gift) {
    const [lo, hi, title] = G[filter] || G.gift25, cost = (x) => { const v = x.variants.find((z) => z.available) || x.variants[0]; return now(v.price, x); };
    list.append(el('h3', { textContent: 'Let them choose' })); if (byHandle[CARD]) list.append(sidxRow(byHandle[CARD]));
    list.append(el('h3', { textContent: `Gifts ${title.toLowerCase()}` }));
    catalog.filter((x) => x.handle !== CARD && cost(x) > lo && cost(x) <= hi).sort((x, y) => cost(x) - cost(y)).forEach((x) => list.append(sidxRow(x)));
  } else for (const id of ids.filter((x) => sidxFilter === 'all' || x === sidxFilter)) {
    list.append(el('h3', { textContent: COL[id].name }));
    catalog.filter((x) => x.station === id).sort((x, y) => x.name.localeCompare(y.name)).forEach((x) => list.append(sidxRow(x)));
  }
  $('#sidx-search').value = ''; $('#sidx-close').focus({ preventScroll: true });
}
function closeIndex() { if ($('#sidx').hidden) return; $('#sidx').hidden = true; if ($('#age').hidden) document.body.classList.remove('locked'); }
$('#sidx-search').oninput = (e) => {
  const t = e.target.value.trim().toLowerCase(); let shown = 0;
  $('#sidx-list').querySelectorAll('a').forEach((r) => { const ok = !t || r.dataset.q.includes(t); r.hidden = !ok; if (ok) shown++; });
  // a heading with nothing under it steps aside
  $('#sidx-list').querySelectorAll('h3').forEach((hd) => { let n = hd.nextElementSibling, any = false; while (n && n.tagName !== 'H3') { if (!n.hidden) any = true; n = n.nextElementSibling; } hd.hidden = !any; });
  $('#sidx-list').classList.toggle('none', !shown);
};
$('#index-open').onclick = () => ($('#sidx').hidden ? openIndex('all') : closeIndex());
$('#find-top').onclick = () => { if (!$('#sidx').hidden) { closeIndex(); return; } openIndex('all'); setTimeout(() => $('#sidx-search').focus(), 60); };
// a button that opens something closes it again: each one shows that it is open, and a second press puts things back
{ const pair = (btn, open) => { const b = $(btn); if (!b) return; const sync = () => { const on = open(); b.classList.toggle('is-open', on); b.setAttribute('aria-expanded', String(on)); }; new MutationObserver(sync).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] }); sync(); };
  pair('#find-top', () => !$('#sidx').hidden); pair('#index-open', () => !$('#sidx').hidden); pair('#basket-open', () => !$('#basket').hidden); pair('#ask-top', () => document.documentElement.classList.contains('consult-on')); }
// the Shop menu: the four collections with a picture and a line each
$('#np-cols').replaceChildren(...ORDER.filter((id) => id !== 'roots').map((id) => { const c = COL[id], l = catalog.filter((x) => x.station === id), pic = l.find((x) => x.gallery.length);
  return el('a', { className: 'np-col', href: `#shop-${id}` }, pic ? el('img', { src: photo(pic), alt: '', loading: 'lazy' }) : null, el('b', { textContent: c.short || c.name }), el('small', { textContent: `${l.length} · ${c.name}` })); }));
{ const d = $('#nav-drop'); d.addEventListener('click', (e) => { if (e.target.closest('a, button')) { d.classList.add('shut'); document.activeElement?.blur(); } }); d.addEventListener('mouseleave', () => d.classList.remove('shut')); }
$('#sidx-close').onclick = closeIndex;
addEventListener('hashchange', closeIndex);
addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeIndex(); closeBasket(); closeMenu(); } });
addEventListener('hashchange', route);
addEventListener('scroll', () => $('#head').classList.toggle('scrolled', scrollY > 30), { passive: true });
footer(); renderBasket(); route();
if (!store.get('gaia-21', false)) { $('#age').hidden = false; document.body.classList.add('locked'); $('#age-yes').focus(); }
$('#age-yes').onclick = () => { store.set('gaia-21', true); $('#age').hidden = true; document.body.classList.remove('locked'); };
$('#age-no').onclick = () => { $('#age-denied').hidden = false; $('#age-yes').hidden = true; $('#age-no').hidden = true; };

/* ---------- butterflies, with the soft sound of their wings ---------- */
let actx = null, soundOn = false;   // the site is silent
const syncSound = () => { $('#sound-btn').setAttribute('aria-pressed', String(soundOn)); $('#sound-btn').classList.toggle('off', !soundOn); $('#nav-sound').textContent = `Garden sounds: ${soundOn ? 'on' : 'off'}`; };
const toggleSound = () => {};
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
buildMenu();   // last, once sound and basket are ready for it to use
