// Ask Sarah: a short consultation that reads what someone needs and picks from the shelves.
// Every product carries a herbalist's profile: what it is traditionally used for (0-3 per need),
// how it is taken, when in the day it belongs, and what should keep it off someone's shelf.
import './consult.css';

export const NEEDS = [
  { k: 'sleep', l: 'Deeper sleep', s: 'Winding down, falling and staying asleep' },
  { k: 'calm', l: 'Calm and stress', s: 'A busy mind, tension, nerves' },
  { k: 'energy', l: 'Energy and nourishment', s: 'Steady vitality, minerals, focus' },
  { k: 'digest', l: 'Digestion and liver', s: 'Bloating, sluggishness, after big meals' },
  { k: 'immune', l: 'Breath and immunity', s: 'Seasonal wellness, lungs, throat' },
  { k: 'mood', l: 'Mood and heart', s: 'Lightness, joy, an open heart' },
  { k: 'skin', l: 'Skin, hair and body', s: 'Dryness, sore muscles, scalp' },
  { k: 'cycle', l: 'Womb and cycle', s: 'Menstrual comfort, feminine ritual' },
  { k: 'ritual', l: 'Ritual and sacred space', s: 'Meditation, clearing, intention' },
  { k: 'gift', l: 'A gift for someone', s: 'Something beautiful to give' },
];
const FORMS = [
  { k: 'tea', l: 'A warm cup', s: 'Loose leaf teas and whole flowers' },
  { k: 'drops', l: 'A few drops', s: 'Tinctures and syrups, quick and simple' },
  { k: 'skin', l: 'On my skin', s: 'Balms, oils, sprays and massage candles' },
  { k: 'smoke', l: 'Smoke and scent', s: 'Resins, smudges and herbal smoke blends' },
  { k: 'kitchen', l: 'In my kitchen', s: 'Cacao, spice and golden paste' },
];
const SAY = { tea: 'as a warm cup', drops: 'in a few drops', skin: 'for your skin', smoke: 'as smoke and scent', kitchen: 'from your kitchen' };
const TIMES = [
  { k: 'am', l: 'Morning and daytime', s: 'To start well and keep going' },
  { k: 'pm', l: 'Evening and bedtime', s: 'To soften the day and rest' },
  { k: 'any', l: 'Whenever I need it', s: 'No particular time' },
];
const CARE = [
  { k: 'preg', l: 'Pregnant or trying', x: 'preg' },
  { k: 'nurse', l: 'Breastfeeding', x: 'preg' },
  { k: 'kid', l: 'It is for a child', x: 'kid' },
  { k: 'caf', l: 'Avoiding caffeine', x: 'caf' },
  { k: 'alc', l: 'Avoiding alcohol', x: 'alc' },
  { k: 'smoke', l: 'No smoke or incense', x: 'smoke' },
  { k: 'animal', l: 'Plant-based only', x: 'animal' },
  { k: 'aster', l: 'Ragweed or daisy allergy', x: 'aster' },
];
const MEDS = [
  { k: 'bp', l: 'Blood pressure medicine' },
  { k: 'sugar', l: 'Diabetes or blood sugar medicine' },
  { k: 'blood', l: 'Blood thinners' },
  { k: 'mind', l: 'Sleep, anxiety or mood medicine' },
];
const BUDGETS = [
  { k: 25, l: 'Under $25', s: 'A single ally' },
  { k: 50, l: 'Up to $50', s: 'A small ritual' },
  { k: 999, l: 'No limit', s: 'The whole ceremony' },
];
const AVOID = { preg: 'pregnancy or breastfeeding', kid: 'children', caf: 'caffeine', alc: 'alcohol', smoke: 'smoke', animal: 'animal ingredients', aster: 'the daisy family', bp: 'blood pressure medicine', sugar: 'blood sugar medicine', blood: 'blood thinners', mind: 'sleep, anxiety or mood medicine' };
const KNOW = { alc: 'Extracted in organic cane alcohol', caf: 'Contains caffeine', aster: 'Contains daisy-family herbs', smoke: 'Burn with care, away from pets and children', animal: 'Made with grass-fed tallow or honey', sed: 'Relaxing: may make you drowsy', ext: 'For external use only' };

// n: needs 0-3 · f: forms · t: am | pm | any · x: what keeps it off a shelf · m: medicines to check
// kid: gentle enough for children · fam: plant family, so a ritual is not three of the same flower · why: in Sarah's words
const PROFILE = {
  'blue-water-lily-flowers-organic-whole-flower': { n: { calm: 3, mood: 2, sleep: 2, ritual: 2 }, f: ['tea'], t: 'pm', x: ['preg', 'sed'], m: ['mind'], fam: 'lotus', why: 'Whole blue lotus flowers, the sacred water lily of the Nile. A cooling cup traditionally sipped for a soft, dreamy calm.' },
  'white-lotus-flower-1': { n: { calm: 3, ritual: 2, sleep: 2, mood: 1 }, f: ['tea'], t: 'pm', x: ['preg', 'sed'], m: ['mind'], fam: 'lotus', why: 'The quieter sister of the blue lotus. Ayurveda counts it as cooling and balancing; I reach for it for clear, introspective stillness.' },
  'blue-water-lily-tincture': { n: { calm: 3, mood: 2, sleep: 2, ritual: 2, cycle: 1 }, f: ['drops'], t: 'any', x: ['preg', 'alc', 'sed'], m: ['mind', 'bp'], fam: 'lotus', why: 'Blue lotus in a fast drop beneath the tongue, for meditation, yoga or any moment that calls for presence. Traditionally used for stress, rest and cramps.' },
  'lotus-trinity-bundle-tea-tincture-blend': { n: { calm: 3, mood: 2, ritual: 2, sleep: 1, gift: 2 }, f: ['tea', 'drops', 'smoke'], t: 'any', x: ['preg', 'alc', 'smoke', 'sed', 'aster'], m: ['mind', 'bp'], fam: 'lotus', bundle: 1, why: 'Blue lotus three ways: whole flowers for tea, a tincture and our Cosmic smoke blend. The best way to learn how this flower speaks to you.' },
  'sweet-dreamz-sleep-support-loose-leaf-tea-blend': { n: { sleep: 3, calm: 2 }, f: ['tea'], t: 'pm', x: ['preg', 'sed'], m: ['mind'], fam: 'dreamz', why: 'Blue lotus, valerian, skullcap and lavender, the classic nervine allies, steeped an hour before bed to quiet the nervous system.' },
  'sweet-dreamz-tincture-nervous-system-relaxation-elixir': { n: { sleep: 3, calm: 2 }, f: ['drops'], t: 'pm', x: ['preg', 'alc', 'sed'], m: ['mind'], fam: 'dreamz', why: 'The Sweet Dreamz herbs in a dropper: valerian root and skullcap with blue lotus and lavender, beneath the tongue before your pillow calls.' },
  'lavender-loom-loose-leaf-herbal-tea-calming-tea-blend': { n: { calm: 3, sleep: 2, digest: 1 }, f: ['tea'], t: 'any', x: ['aster'], m: [], kid: 1, fam: 'loom', why: 'Lavender, Egyptian chamomile and oat straw. Gentle nervines that soothe both the mind and the belly, mild enough for any hour.' },
  'herbal-wellness-tinctures-potions-of-peace-bundle': { n: { calm: 2, sleep: 2, energy: 2, mood: 1, gift: 2 }, f: ['drops'], t: 'any', x: ['preg', 'alc', 'sed'], m: ['mind', 'bp', 'sugar'], fam: 'potions', bundle: 1, why: 'Moringa for the morning, blue lotus for presence and Sweet Dreamz for night: three tinctures that rotate through a whole day.' },
  'golden-sticky-chai-haldi-doodh-paste-golden-milk': { n: { digest: 3, immune: 2, energy: 1 }, f: ['kitchen', 'tea'], t: 'any', x: ['animal'], m: ['blood'], kid: 1, fam: 'chai', why: 'Turmeric, ginger and our whole-spice masala with Florida honey. Golden milk traditionally taken to warm digestion and calm inflammation, and caffeine free.' },
  'butterfly-chai-organic-whole-spice-blend-ceylon-black-tea': { n: { energy: 3, digest: 2, mood: 1 }, f: ['tea'], t: 'am', x: ['caf'], m: [], fam: 'chai', why: 'Ceylon black tea with cardamom, ginger, pepper and butterfly pea flower: a warming masala chai traditionally drunk as a brain tonic to start the day.' },
  'agua-de-jamaica-hibiscus-loose-leaf-tea': { n: { energy: 1, immune: 1, mood: 2, skin: 1, digest: 1 }, f: ['tea'], t: 'am', x: ['preg'], m: ['bp'], fam: 'hibiscus', why: 'Two kinds of whole hibiscus with ginger, lime and Ceylon cinnamon. Tart, hydrating and full of antioxidants; best iced on a warm afternoon.' },
  'full-spectrum-hibiscus-flower-premium-loose-leaf-tea': { n: { cycle: 2, mood: 2, energy: 1, immune: 1, skin: 1 }, f: ['tea'], t: 'am', x: ['preg'], m: ['bp'], fam: 'hibiscus', why: 'Roselle calyx and rosa-sinensis petals, the two most medicinal hibiscus. Traditionally a heart-centred flower, also used for cyclical balance.' },
  'ceylon-alba-cinnamon-true-ceylon-cinnamon': { n: { digest: 2, energy: 1, immune: 1 }, f: ['kitchen', 'tea'], t: 'any', x: [], m: [], kid: 1, fam: 'cinnamon', why: 'True Ceylon cinnamon of the finest Alba grade. Warming and gentle on digestion, and far lower in coumarin than common cassia.' },
  'liver-love-tincture-liver-metabolic-digestive-support': { n: { digest: 3, energy: 1 }, f: ['drops'], t: 'any', x: ['aster', 'preg'], m: ['blood', 'sugar'], kid: 1, fam: 'liver', why: 'Dandelion root, milk thistle and turmeric with black pepper: the bitter, cleansing roots herbalists turn to for liver and bile flow. Alcohol free and glycerin based.' },
  'elderberry-syrup-immune-support-elixir': { n: { immune: 3, digest: 1 }, f: ['drops', 'kitchen'], t: 'any', x: ['preg'], m: [], kid: 1, fam: 'elder', why: 'Elderberries simmered with ginger, clove, mullein and marshmallow root. A spoonful a day through the cold months; family safe from age 5.' },
  'cleansing-lungs-respiratory-digestion-immunity-loose-leaf-herbal-tea': { n: { immune: 3, digest: 2, energy: 1 }, f: ['tea'], t: 'any', x: ['preg'], m: ['bp', 'sugar'], fam: 'lungs', why: 'Mullein, marshmallow root and nettle with moringa and soursop. Expectorant and soothing herbs traditionally used to clear and restore the breath.' },
  'wildcrafted-mullein': { n: { immune: 3, ritual: 1 }, f: ['tea', 'smoke'], t: 'any', x: [], m: [], kid: 1, fam: 'mullein', why: 'Soft wildcrafted mullein leaf, the herbalist\'s first ally for the lungs. Strain it well; it also makes a smooth base for smoke blends.' },
  'soursop-leaves-organic-whole-leaves': { n: { immune: 2, calm: 1, sleep: 1, digest: 1 }, f: ['tea'], t: 'pm', x: ['preg', 'sed'], m: ['bp', 'sugar'], fam: 'soursop', why: 'Graviola leaves, an evening tea with a long tradition in Caribbean, African and South Asian homes for calm and resilience.' },
  'moringa-leaves-organic-whole-leaves': { n: { energy: 3, immune: 2, digest: 1 }, f: ['tea'], t: 'am', x: ['preg'], m: ['sugar', 'bp'], fam: 'moringa', why: 'Leaves of the miracle tree, rich in minerals, vitamins and protein. A green morning cup for steady, nourished energy.' },
  'moringa-tincture-superfood-herbal-tincture': { n: { energy: 3, immune: 2, digest: 1 }, f: ['drops'], t: 'am', x: ['preg', 'alc'], m: ['sugar', 'bp'], fam: 'moringa', why: 'Moringa in a daily dropper, for vitality from sunrise on without a cup to brew.' },
  'moringa-moringa': { n: { energy: 3, immune: 2, digest: 1, gift: 1 }, f: ['tea', 'drops'], t: 'am', x: ['preg', 'alc'], m: ['sugar', 'bp'], fam: 'moringa', bundle: 1, why: 'Moringa leaves and tincture together: tea when you have a slow morning, drops when you do not.' },
  'butterfly-pea-flower-copy': { n: { mood: 2, energy: 1, skin: 1, ritual: 1 }, f: ['tea'], t: 'any', x: ['preg'], m: [], kid: 1, fam: 'pea', why: 'Clitoria ternatea, an Ayurvedic brain tonic full of antioxidant anthocyanins. Add lemon and watch the cup turn from blue to violet.' },
  'ceremonial-grade-costa-rican-cacao-bribri': { n: { mood: 3, energy: 2, ritual: 2 }, f: ['kitchen'], t: 'am', x: ['caf'], m: ['mind'], fam: 'cacao', why: 'Ceremonial-grade Bribri cacao, whole bean. Theobromine lifts gently and opens the heart; the centrepiece of a cacao ceremony.' },
  'golden-treasures-sacred-herbal-blend': { n: { calm: 2, ritual: 2, cycle: 1 }, f: ['smoke', 'tea'], t: 'pm', x: ['preg', 'aster', 'smoke', 'sed'], m: ['mind'], fam: 'blend', why: 'Calendula, mullein, damiana, skullcap, rose and mugwort. Grounding to sip or puff; no THC, nicotine or fillers.' },
  'rainbow-body-cosmic-herbal-blend': { n: { mood: 3, ritual: 2, calm: 1 }, f: ['smoke', 'tea'], t: 'any', x: ['preg', 'aster', 'smoke', 'sed'], m: ['mind'], fam: 'lotus', why: 'Blue lotus petals with wild dagga, damiana, rose and butterfly pea. Uplifting and blissful, to sip or smoke in a mindful moment.' },
  'yoni-steam': { n: { cycle: 3, calm: 1, ritual: 1 }, f: ['tea'], t: 'any', x: ['preg'], m: [], fam: 'chalice', why: 'Our womb blend, made for a warm cup or a yoni steam. Steam between bleeds, never while pregnant or menstruating.' },
  'priestess-anointing-oil': { n: { ritual: 3, mood: 2, cycle: 1, skin: 1 }, f: ['skin'], t: 'any', x: ['ext'], m: [], fam: 'oil', why: 'Ylang ylang, sandalwood, vanilla, geranium and frankincense. A floral, resinous oil for anointing the sacred feminine.' },
  'priesthood-anointing-oil': { n: { ritual: 3, mood: 1, calm: 1 }, f: ['skin'], t: 'any', x: ['ext'], m: [], fam: 'oil', why: 'Oud, sandalwood, spruce and frankincense: a grounding blend of bark and resin to wear into prayer or meditation.' },
  'easy-om-magnesium-fine-mist-spray': { n: { sleep: 2, calm: 2, skin: 2 }, f: ['skin'], t: 'pm', x: ['ext'], m: [], kid: 1, fam: 'om', why: 'Magnesium chloride with lavender and birch, misted on sore muscles before bed. It doubles as a natural deodorant.' },
  'hathor-s-nectar-tallow-balm': { n: { skin: 3, gift: 1 }, f: ['skin'], t: 'any', x: ['animal', 'ext'], m: [], fam: 'hathor', why: 'Grass-fed tallow whipped with frankincense and saffron. Its fats mirror our own skin\'s, so it sinks in and restores a dry barrier.' },
  'hathors-ease-blue-lotus-magnesium-whipped-tallow-balm': { n: { skin: 2, sleep: 2, calm: 2 }, f: ['skin'], t: 'pm', x: ['animal', 'ext'], m: [], fam: 'hathor', why: 'Tallow with blue lotus, lavender and magnesium: an evening balm to massage into tired muscles and soften into rest.' },
  'hathor-s-ritual-collection-herbal-whipped-tallow-balm-bundle': { n: { skin: 3, calm: 1, sleep: 1, gift: 2 }, f: ['skin'], t: 'any', x: ['animal', 'ext'], m: [], fam: 'hathor', bundle: 1, why: 'Both Hathor balms together, Nectar for radiance by day and Ease for rest at night.' },
  'new-product-length-strength-ayurvedic-hair-oil-pre-wash-ritual-1oz-bottle-starter-exclusive': { n: { skin: 3 }, f: ['skin'], t: 'any', x: ['ext'], m: [], fam: 'hair', why: 'An Ayurvedic pre-wash oil to massage into the scalp, for strength and length retention in dry, brittle strands.' },
  'theobroma-cacao-butter-massage-candle': { n: { skin: 2, ritual: 2, calm: 1, mood: 1, gift: 1 }, f: ['skin'], t: 'pm', x: ['ext'], m: [], fam: 'candle', why: 'Pure cacao butter: light it, let it melt, then pour the warm butter onto skin as a chocolate-scented massage.' },
  'theobroma-cacao-butter-massage-candles-orange': { n: { skin: 2, ritual: 2, mood: 2, gift: 1 }, f: ['skin'], t: 'any', x: ['ext'], m: [], fam: 'candle', why: 'Peruvian cacao butter with orange zest, a brighter massage candle for skin and for joy.' },
  'vampire-repellent-non-toxic-herbal-bug-spray': { n: { skin: 1, ritual: 1 }, f: ['skin'], t: 'any', x: ['ext'], m: [], fam: 'spray', why: 'Lemongrass, eucalyptus, clove and witch hazel to keep biting things away outdoors. Patch test first.' },
  'frankincense-resin-boswellia-serrata': { n: { ritual: 3, calm: 1 }, f: ['smoke'], t: 'any', x: ['smoke'], m: [], fam: 'resin', why: 'Pure Boswellia serrata tears. Burned on charcoal, frankincense has carried prayer and quiet for thousands of years.' },
  'rising-star-resin-incense': { n: { ritual: 3, mood: 1 }, f: ['smoke'], t: 'any', x: ['smoke'], m: [], fam: 'resin', why: 'Hand-blended resin incense from Orthodox monasteries; a pinch on charcoal fills a room.' },
  'pure-resin-incense-mount-athos': { n: { ritual: 3, calm: 1 }, f: ['smoke'], t: 'any', x: ['smoke'], m: [], fam: 'resin', why: 'Monastery resin from Mount Athos, made for prayer and still, devotional space.' },
  'brass-resin-burner-w-wooden-handle': { n: { ritual: 3, gift: 2 }, f: ['smoke'], t: 'any', x: ['smoke'], m: [], fam: 'burner', bundle: 1, why: 'A brass cauldron with a wooden handle, bundled with resin, so you can burn herbs and offerings safely.' },
  'palo-santo': { n: { ritual: 3, mood: 1 }, f: ['smoke'], t: 'any', x: ['smoke'], m: [], fam: 'wood', why: 'Holy wood with sweet, smoky notes. It does not clear a room so much as invite a higher, lighter feeling in.' },
  'dragons-blood-sage-smudge-stick': { n: { ritual: 3 }, f: ['smoke'], t: 'any', x: ['smoke'], m: [], fam: 'sage', why: 'White sage dipped in dragon\'s blood resin: the sage clears and the resin protects.' },
  'black-sage-smudge-stick': { n: { ritual: 3, calm: 1 }, f: ['smoke'], t: 'pm', x: ['smoke'], m: [], fam: 'sage', why: 'Black sage, a deeper, earthier smudge for clearing and settling before rest, used with respect for the traditions it comes from.' },
  'lemon-balm-peppermint-smudge-stick': { n: { ritual: 2, mood: 2, calm: 1, energy: 1 }, f: ['smoke'], t: 'am', x: ['smoke'], m: [], fam: 'sage', why: 'Lemon balm and peppermint: a bright, minty smudge that lifts a room and eases nervousness.' },
};
export const usesOf = (handle) => Object.entries(PROFILE[handle]?.n || {}).filter(([k, v]) => v >= 2 && k !== 'gift').sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => NEEDS.find((x) => x.k === k)?.l).filter(Boolean);
// gift cards stand in for someone who cannot choose; tea bags join any loose tea; the guide is free for everyone
const GIFT_CARD = 'garden-of-gaia-gift-cards', TEA_BAGS = 'cotton-reusable-tea-bags-unbleached', GUIDE = 'free-guide-creating-your-own-divine-pantry';

const priceOf = (p, now) => Math.min(...p.variants.filter((v) => v.available).map((v) => now(v.price, p)).concat(Infinity));

// the algorithm: hard-filter for safety, score fit, then compose a varied ritual of three
export function recommend(catalog, a, now = (n) => n) {
  const blocked = new Set([...a.care.map((c) => CARE.find((x) => x.k === c)?.x), ...a.meds].filter(Boolean));
  const w = [1, 0.7], out = [], set = {};
  for (const p of catalog) {
    const pr = PROFILE[p.handle]; if (!pr) continue;
    const price = priceOf(p, now); if (!isFinite(price)) continue;
    const fit = a.needs.reduce((s, k, i) => s + (pr.n[k] || 0) * w[i], 0); if (!fit) continue;
    const why = [...pr.x, ...pr.m].find((f) => blocked.has(f) && f !== 'kid') || (blocked.has('kid') && !pr.kid ? 'kid' : null);
    if (why) { (set[why] = set[why] || []).push(p.name); continue; }
    let s = fit * 10;
    const forms = a.forms.filter((f) => f !== 'any');
    if (forms.length) s += pr.f.some((f) => forms.includes(f)) ? 6 : -9;
    if (a.time !== 'any' && pr.t !== 'any') s += pr.t === a.time ? 3 : -12;
    if (price > a.budget) s -= 14 + Math.min(10, (price - a.budget) / 4);
    if (a.needs.includes('gift')) s += (pr.bundle ? 4 : 0) + (price >= 20 ? 2 : -2);
    s += Math.min(a.needs.filter((k) => pr.n[k] >= 2).length, 2) * 2;   // fits both needs well
    out.push({ p, pr, s, price, hits: a.needs.filter((k) => pr.n[k]) });
  }
  out.sort((x, y) => y.s - x.s);
  // only real allies: it must truly serve a chosen need, and sit near the best fit
  const floor = (out[0]?.s || 0) * 0.45;
  const good = out.filter((c) => c.s >= floor && a.needs.some((k) => (c.pr.n[k] || 0) >= 2));
  out.length = 0; out.push(...good);
  // a ritual, not three of the same thing: vary the plant and how it is taken
  const ritual = [];
  while (ritual.length < 3 && ritual.length < out.length) {
    let best = null, bv = -Infinity;
    for (const c of out) {
      if (ritual.includes(c)) continue;
      let v = c.s;
      if (ritual.some((r) => r.pr.fam === c.pr.fam)) continue;
      for (const r of ritual) { if (r.pr.f[0] === c.pr.f[0]) v -= 6; if (r.pr.bundle && c.pr.bundle) v -= 8; }
      if (v > bv) { bv = v; best = c; }
    }
    if (!best) break;
    ritual.push(best);
  }
  const more = out.filter((c) => !ritual.includes(c)).slice(0, 4);
  return { ritual, more, set };
}

/* ---------- the consultation itself ---------- */
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids.flat().filter((k) => k != null && k !== false)); return n; };
const label = (list, k) => list.find((x) => x.k === k)?.l || '';
let root = null, ctx = null, lastFocus = null;

export function openConsult(opts) {
  ctx = opts; lastFocus = document.activeElement;
  if (!root) {
    root = el('section', { className: 'consult', id: 'consult', role: 'dialog', ariaModal: 'true', ariaLabelledby: 'consult-q' });
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeConsult(); });
    root.addEventListener('click', closeConsult);   // a tap outside the pop-out closes it
    document.body.append(root);
  }
  state = { step: 0, needs: [], forms: [], time: null, care: [], meds: [], budget: null };
  root.hidden = false; document.documentElement.classList.add('consult-on');
  render(); requestAnimationFrame(() => root.classList.add('in'));
}
export function closeConsult() {
  if (!root || root.hidden) return;
  root.classList.remove('in'); document.documentElement.classList.remove('consult-on');
  setTimeout(() => { root.hidden = true; }, 260);
  lastFocus?.focus?.();
}
let state;
const STEPS = 5;

function shell(body, { q, sub, back = true, n }) {
  const close = el('button', { className: 'cs-close', type: 'button', ariaLabel: 'Close the consultation' }, el('span', { textContent: 'Close' }), el('b', { ariaHidden: 'true', textContent: '✕' })); close.onclick = closeConsult;
  const prev = back ? el('button', { className: 'cs-back', type: 'button', textContent: '← Back' }) : null;
  if (prev) prev.onclick = () => { state.step = Math.max(0, state.step - 1); render(); };
  const dots = n ? el('div', { className: 'cs-dots', ariaLabel: `Question ${n} of ${STEPS}` }, Array.from({ length: STEPS }, (_, i) => el('i', { className: i < n ? 'on' : '' }))) : null;
  // the pop-out: Sarah on one side with a word for this moment, the question on the other
  const side = el('aside', { className: 'cs-side' },
    ctx.figure ? el('img', { className: 'cs-fig', src: ctx.figure, alt: '' }) : null,
    el('blockquote', { className: 'cs-say' }, el('p', { textContent: SAYS[Math.min(state.step, SAYS.length - 1)] }), el('cite', { textContent: 'Sarah, your herbalist' })));
  const card = el('div', { className: 'cs-card' }, el('i', { className: 'cs-orn', ariaHidden: 'true' }), side,
    el('div', { className: 'cs-in' },
      el('div', { className: 'cs-top' }, prev || el('span', { className: 'cs-brand', textContent: '✦ Ask Sarah' }), dots, close),
      el('div', { className: 'cs-body' }, n ? el('p', { className: 'cs-kick', textContent: `Question ${n} of ${STEPS}` }) : null, el('h2', { id: 'consult-q', className: 'cs-q', textContent: q }), sub ? el('p', { className: 'cs-sub', textContent: sub }) : null, body)));
  card.addEventListener('click', (e) => e.stopPropagation());
  // the bar with the close button stays clear over the painting, and frosts only once the question scrolls under it
  const scroller = card.querySelector('.cs-in'); scroller.addEventListener('scroll', () => scroller.classList.toggle('scrolled', scroller.scrollTop > 4), { passive: true });
  return card;
}
const SAYS = ['Welcome in. Sit with me a moment.', 'Start with what weighs on you most.', 'Every body takes its plants differently.', 'Some herbs wake you, some settle you. Timing matters.', 'This is the part I never skip.', 'A good ritual does not need to be costly.', 'Here is what I would pour for you.'];
function choice(o, on, click, multi) {
  const b = el('button', { type: 'button', className: `cs-opt${on ? ' on' : ''}`, ariaPressed: String(!!on) }, el('span', { className: 'cs-mark', ariaHidden: 'true', textContent: multi ? (on ? '✓' : '') : '✦' }), el('span', { className: 'cs-l', textContent: o.l }), o.s ? el('span', { className: 'cs-s', textContent: o.s }) : null);
  b.onclick = click; return b;
}
const next = () => { state.step++; render(); };
function render() {
  const s = state; let view;
  if (s.step === 0) {
    const go = el('button', { className: 'cs-go', type: 'button', ariaLabel: 'Begin my ritual' }, el('span', { className: 'cs-star', ariaHidden: 'true', textContent: '✦' }), el('span', { textContent: 'Begin my ritual' }), el('span', { className: 'cs-arrow', ariaHidden: 'true', textContent: '→' })); go.classList.add('cs-begin'); go.onclick = next;
    view = shell(el('div', {}, go, el('p', { className: 'cs-fine', textContent: 'Based on traditional herbal use. It is not medical advice, so check with your practitioner if you are pregnant, nursing or on medication.' })),
      { q: 'Tell me what you are carrying, and I will choose from the shelves.', sub: 'Five quick questions about what you need, how you like to take your plants and anything I should be careful of. Then I will put together a small ritual of three, and tell you why each one.', back: false });
    view.classList.add('cs-hello');
  } else if (s.step === 1) {
    const grid = el('div', { className: 'cs-grid' }, NEEDS.map((o) => choice(o, s.needs.includes(o.k), () => {
      if (s.needs.includes(o.k)) s.needs = s.needs.filter((k) => k !== o.k); else { s.needs.push(o.k); if (s.needs.length > 2) s.needs.shift(); }
      render();
    }, true)));
    const go = el('button', { className: 'cs-go', type: 'button', disabled: !s.needs.length, textContent: s.needs.length ? 'Continue' : 'Choose one or two' }); go.onclick = next;
    view = shell(el('div', {}, grid, go), { q: 'What would you like the plants to help with?', sub: 'Choose one or two. The first one you pick matters most.', n: 1 });
  } else if (s.step === 2) {
    const grid = el('div', { className: 'cs-grid' }, [...FORMS, { k: 'any', l: 'Surprise me', s: 'Any way is good' }].map((o) => choice(o, s.forms.includes(o.k), () => {
      if (o.k === 'any') s.forms = s.forms.includes('any') ? [] : ['any'];
      else { s.forms = s.forms.filter((k) => k !== 'any'); s.forms = s.forms.includes(o.k) ? s.forms.filter((k) => k !== o.k) : [...s.forms, o.k]; }
      render();
    }, true)));
    const go = el('button', { className: 'cs-go', type: 'button', disabled: !s.forms.length, textContent: s.forms.length ? 'Continue' : 'Choose any that suit you' }); go.onclick = next;
    view = shell(el('div', {}, grid, go), { q: 'How do you like to take your plants?', sub: 'Choose as many as you like.', n: 2 });
  } else if (s.step === 3) {
    view = shell(el('div', { className: 'cs-grid cs-one' }, TIMES.map((o) => choice(o, s.time === o.k, () => { s.time = o.k; next(); }))), { q: 'When do you most need the support?', n: 3 });
  } else if (s.step === 4) {
    const tog = (arr, k) => () => { s[arr] = s[arr].includes(k) ? s[arr].filter((x) => x !== k) : [...s[arr], k]; render(); };
    const none = s.care.length + s.meds.length === 0;
    const go = el('button', { className: 'cs-go', type: 'button', textContent: none ? 'None of these, continue' : 'Continue' }); go.onclick = next;
    view = shell(el('div', {},
      el('p', { className: 'cs-group', textContent: 'About you' }), el('div', { className: 'cs-chips' }, CARE.map((o) => choice(o, s.care.includes(o.k), tog('care', o.k), true))),
      el('p', { className: 'cs-group', textContent: 'Do you take any of these?' }), el('div', { className: 'cs-chips' }, MEDS.map((o) => choice(o, s.meds.includes(o.k), tog('meds', o.k), true))), go),
    { q: 'Anything I should be careful of?', sub: 'I will leave anything unsuitable off your shelf. Your answers stay on this page.', n: 4 });
  } else if (s.step === 5) {
    view = shell(el('div', { className: 'cs-grid cs-one' }, BUDGETS.map((o) => choice(o, s.budget === o.k, () => { s.budget = o.k; next(); }))), { q: 'What would you like to spend?', sub: 'For your whole ritual, roughly.', n: 5 });
  } else view = results();
  root.replaceChildren(view); root.scrollTop = 0; root.classList.toggle('wide', s.step > 5);
  (root.querySelector('.cs-opt, .cs-go') || root.querySelector('.cs-close'))?.focus({ preventScroll: true });
}

const STEP_NAMES = ['Begin with', 'Pair with', 'And to close'];
function pickCard(c, i, big) {
  const { p, pr, price } = c, v = p.variants.find((x) => x.available);
  const add = el('button', { className: 'cs-add', type: 'button', textContent: '+ Add to basket' });
  add.onclick = () => { ctx.add(p, v); add.textContent = 'In your basket ✓'; add.classList.add('done'); };
  const see = el('button', { className: 'cs-see', type: 'button', textContent: 'See it' }); see.onclick = () => { closeConsult(); ctx.open(p); };
  const know = [...pr.x.filter((f) => KNOW[f] && f !== 'preg'), ...(pr.f.includes('smoke') && !pr.x.includes('smoke') ? ['smoke'] : [])].map((f) => KNOW[f]);
  return el('article', { className: `cs-pick${big ? '' : ' small'}` },
    el('div', { className: 'cs-img' }, el('img', { src: ctx.img(p), alt: '', loading: 'lazy', decoding: 'async' })),
    el('div', { className: 'cs-txt' },
      big ? el('p', { className: 'cs-step', textContent: STEP_NAMES[i] }) : null,
      el('h3', { textContent: p.name }),
      el('p', { className: 'cs-price', textContent: `${p.variants.length > 1 ? 'From ' : ''}$${price.toFixed(2)}${p.sub ? ` · ${p.sub.replace(/^Organic\s*/i, '').slice(0, 42)}` : ''}` }),
      big ? el('p', { className: 'cs-why', textContent: pr.why }) : null,
      el('p', { className: 'cs-for' }, c.hits.map((k) => el('span', { textContent: label(NEEDS, k) }))),
      big && know.length ? el('p', { className: 'cs-know', textContent: `Good to know: ${know.join('. ')}.` }) : null,
      el('div', { className: 'cs-acts' }, add, see)));
}
function results() {
  const s = state, a = { needs: s.needs, forms: s.forms, time: s.time, care: s.care, meds: s.meds, budget: s.budget };
  const { ritual, more, set } = recommend(ctx.catalog, a, ctx.now);
  const byHandle = (h) => ctx.catalog.find((p) => p.handle === h);
  const intro = `For ${s.needs.map((k) => label(NEEDS, k).toLowerCase()).join(' and ')}${s.time === 'any' ? '' : `, in the ${s.time === 'am' ? 'morning' : 'evening'}`}${s.forms.includes('any') ? '' : `, ${s.forms.map((k) => SAY[k]).filter(Boolean).join(' or ')}`}.`;
  const total = ritual.reduce((t, c) => t + c.price, 0);
  const addAll = el('button', { className: 'cs-go', type: 'button', textContent: `${ritual.length > 1 ? `Add all ${ritual.length}` : 'Add it'} to basket · $${total.toFixed(2)}` });
  addAll.onclick = () => { ritual.forEach((c) => ctx.add(c.p, c.p.variants.find((x) => x.available))); root.querySelectorAll('.cs-pick:not(.small) .cs-add').forEach((b) => { b.textContent = 'In your basket ✓'; b.classList.add('done'); }); addAll.textContent = 'All in your basket ✓'; addAll.disabled = true; };
  const again = el('button', { className: 'cs-again', type: 'button', textContent: 'Start again' }); again.onclick = () => { state = { step: 1, needs: [], forms: [], time: null, care: [], meds: [], budget: null }; render(); };
  const extras = [];
  if (ritual.some((c) => c.pr.f[0] === 'tea')) { const b = byHandle(TEA_BAGS); if (b) extras.push(['For your loose tea', b]); }
  if (s.needs.includes('gift')) { const g = byHandle(GIFT_CARD); if (g) extras.push(['If they would rather choose', g]); }
  const guide = byHandle(GUIDE);
  const setAside = Object.entries(set);
  const view = shell(el('div', { className: 'cs-res' },
    ritual.length ? el('div', { className: 'cs-ritual' }, ritual.map((c, i) => pickCard(c, i, true))) : el('p', { className: 'cs-sub', textContent: 'Nothing on our shelves fits all of that safely. Try a different way of taking your plants, or write to us and I will help you myself.' }),
    ritual.length ? el('div', { className: 'cs-sum' }, addAll, again) : again,
    more.length ? el('div', {}, el('p', { className: 'cs-group', textContent: 'Also on the shelf for you' }), el('div', { className: 'cs-more' }, more.map((c) => pickCard(c, 0, false)))) : null,
    extras.length || guide ? el('ul', { className: 'cs-extras' },
      extras.map(([t, p]) => el('li', {}, el('span', { textContent: t }), Object.assign(el('button', { type: 'button', textContent: `${p.name} →` }), { onclick: () => { closeConsult(); ctx.open(p); } }))),
      guide ? el('li', {}, el('span', { textContent: 'Free, for your pantry' }), Object.assign(el('button', { type: 'button', textContent: 'The Divine Pantry guide →' }), { onclick: () => { closeConsult(); ctx.open(guide); } })) : null) : null,
    setAside.length ? el('details', { className: 'cs-aside' }, el('summary', { textContent: `I kept ${setAside.reduce((n, [, l]) => n + l.length, 0)} products off your shelf for safety` }),
      el('ul', {}, setAside.map(([k, names]) => el('li', {}, el('b', { textContent: `Because of ${AVOID[k]}: ` }), names.join(', '))))) : null,
    el('p', { className: 'cs-fine', textContent: 'Chosen from traditional herbal use, not medical advice. Start gently with anything new, and talk to your practitioner if you are pregnant, nursing, on medication or managing a condition.' })),
  { q: 'Your ritual', sub: intro });
  view.classList.add('cs-result');
  return view;
}

// the way in: Sarah's portrait waiting at the edge of the page
export function mountAsk(open, face) {
  const b = el('button', { className: 'ask-sarah', type: 'button', ariaLabel: 'Ask Sarah: a short consultation to find your ritual' },
    el('span', { className: 'as-face' }, el('img', { src: face, alt: '' })),
    el('span', { className: 'as-t' }, el('b', { textContent: 'Ask Sarah' }), el('small', { textContent: 'Find your ritual' })));
  b.onclick = open; document.body.append(b); return b;
}
