// Bug sweep: both views, desktop + phone. Reports script errors, failed requests, broken images, sideways overflow,
// things that cannot be scrolled to, and fixed controls sitting on top of other controls.
const { chromium, devices } = require('playwright');
const BASE = 'http://127.0.0.1:4175';
const out = [];
const note = (tag, msg) => { out.push(`${tag}: ${msg}`); };
const pageChecks = (tag) => async (p, where) => {
  const r = await p.evaluate(() => {
    const vw = innerWidth, res = { overflowX: document.documentElement.scrollWidth - vw, broken: [], offscreen: [] };
    document.querySelectorAll('img').forEach((i) => { if (i.complete && i.naturalWidth === 0 && i.getAttribute('src') && i.offsetParent) res.broken.push(i.getAttribute('src').slice(-50)); });
    document.querySelectorAll('button, a').forEach((b) => { const r = b.getBoundingClientRect(); if (r.width && r.height && b.offsetParent && getComputedStyle(b).visibility !== 'hidden' && (r.right > vw + 2 || r.left < -2) && !b.closest('.ticker, .places, .fan, #flutters, .collage, [hidden], .skip, .pp-thumbs, .index-filter, .chips, .filters') && !/Skip to/.test(b.textContent)) res.offscreen.push((b.textContent || b.ariaLabel || b.className).trim().slice(0, 30) + ' @' + Math.round(r.left) + '..' + Math.round(r.right)); });
    return res;
  });
  if (r.overflowX > 2) note(tag, `${where}: page is ${r.overflowX}px wider than the screen`);
  if (r.broken.length) note(tag, `${where}: broken images ${[...new Set(r.broken)].slice(0, 6).join(', ')}`);
  if (r.offscreen.length) note(tag, `${where}: controls off screen: ${[...new Set(r.offscreen)].slice(0, 6).join(' | ')}`);
};
// can the last thing inside a scroller be reached?
const reach = async (p, tag, where, scroller, lastSel) => {
  const r = await p.evaluate(([sc, ls]) => {
    const s = document.querySelector(sc); if (!s) return { missing: sc };
    s.scrollTop = 1e6; const all = s.querySelectorAll(ls), last = all[all.length - 1]; if (!last) return { missing: ls };
    const a = last.getBoundingClientRect(), b = s.getBoundingClientRect();
    return { cut: Math.round(a.bottom - Math.min(b.bottom, innerHeight)), sh: s.scrollHeight, ch: s.clientHeight, oy: getComputedStyle(s).overflowY };
  }, [scroller, lastSel]);
  if (r.missing) note(tag, `${where}: could not find ${r.missing}`);
  else if (r.cut > 2) note(tag, `${where}: the bottom ${r.cut}px cannot be reached (scroller ${r.ch}/${r.sh}, overflow ${r.oy})`);
  return r;
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [tag, opts] of [['desktop', { viewport: { width: 1366, height: 700 } }], ['phone', { ...devices['iPhone 13'], viewport: { width: 390, height: 640 } }]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage(); const chk = pageChecks(tag), phone = tag === 'phone';
    p.on('pageerror', (e) => note(tag, 'script error: ' + String(e).slice(0, 160)));
    p.on('console', (m) => { if (m.type() === 'error' && !/favicon/.test(m.text())) note(tag, 'console: ' + m.text().slice(0, 160)); });
    p.on('requestfailed', (r) => note(tag, 'request failed: ' + r.url().slice(-70)));
    p.on('response', (r) => { if (r.status() >= 400 && !/favicon/.test(r.url())) note(tag, `HTTP ${r.status()}: ${r.url().slice(-70)}`); });
    await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); });
    const shot = (n) => p.screenshot({ path: `raw/_au-${tag}-${n}.jpg`, type: 'jpeg', quality: 70 });

    /* ---------- the website ---------- */
    await p.goto(BASE + '/classic.html'); await p.waitForTimeout(2500); await chk(p, 'shop home');
    // every section, scrolled through
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 560) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(140); }
    await p.waitForTimeout(600); await chk(p, 'shop home (scrolled)');
    for (const h of ['#shop', '#shop-tea', '#shop-potions', '#shop-pond', '#shop-altar', '#plants', '#gifts', '#story', '#p--blue-water-lily-tincture', '#p--garden-of-gaia-gift-cards', '#p--free-guide-creating-your-own-divine-pantry']) {
      await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(900);
      const HH = await p.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < HH; y += 700) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(90); }
      await chk(p, 'shop ' + h);
      const empty = await p.evaluate(() => document.querySelector('#main')?.innerText.trim().length || 0); if (empty < 80) note(tag, `shop ${h}: page looks empty`);
    }
    await p.evaluate(() => { location.hash = '#p--blue-water-lily-tincture'; scrollTo(0, 0); }); await p.waitForTimeout(900); await shot('product');
    // add to basket, open the sheet, check it can be scrolled and closed
    await p.locator('.pp .btn-main, .pp button.btn').first().click().catch(() => note(tag, 'product: add button not clickable')); await p.waitForTimeout(600);
    await p.click('#basket-open'); await p.waitForTimeout(700); await shot('basket');
    await reach(p, tag, 'shop basket', '#basket .sheet-in', 'a, button, p'); await chk(p, 'shop basket');
    const cover = await p.evaluate(() => { const a = document.querySelector('.ask-sarah'); if (!a || getComputedStyle(a).display === 'none') return null; const r = a.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && a.contains(e) ? 'visible over the open basket' : null; });
    if (cover) note(tag, 'shop basket: Ask Sarah button ' + cover);
    await p.click('#basket-close').catch(() => note(tag, 'basket close not clickable')); await p.waitForTimeout(400);
    if (await p.isVisible('#basket')) note(tag, 'shop basket did not close');
    if (phone) { await p.click('#menu-btn'); await p.waitForTimeout(500); await shot('nav'); await reach(p, tag, 'shop phone menu', '#nav', 'a, button'); await p.click('#menu-btn'); await p.waitForTimeout(300); }
    // Ask Sarah: every step must be reachable to its last control
    await p.evaluate(() => { location.hash = '#home'; scrollTo(0, 0); }); await p.waitForTimeout(500);
    await p.click(phone ? '.ask-sarah' : '#ask-top'); await p.waitForTimeout(800); await shot('ask0');
    const step = async (n, act) => { await reach(p, tag, `Ask Sarah step ${n}`, '.cs-in', '.cs-go, .cs-opt, .cs-again, .cs-fine'); await act(); await p.waitForTimeout(450); };
    await step(0, () => p.click('.cs-body .cs-go'));
    await step(1, async () => { await p.locator('.cs-opt', { hasText: 'Deeper sleep' }).click(); await p.locator('.cs-opt', { hasText: 'Calm and stress' }).click(); await shot('ask1'); await p.evaluate(() => document.querySelector('.cs-body .cs-go').click()); });
    await step(2, async () => { await p.locator('.cs-opt', { hasText: 'Surprise me' }).click(); await p.evaluate(() => document.querySelector('.cs-body .cs-go').click()); });
    await step(3, () => p.locator('.cs-opt', { hasText: 'Whenever' }).click());
    await step(4, async () => { await shot('ask4'); await p.evaluate(() => document.querySelector('.cs-body .cs-go').click()); });
    await step(5, () => p.locator('.cs-opt', { hasText: 'No limit' }).click());
    await p.waitForTimeout(800); await reach(p, tag, 'Ask Sarah results', '.cs-in', '.cs-fine'); await shot('ask6'); await chk(p, 'Ask Sarah results');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400); if (await p.isVisible('.cs-card')) note(tag, 'Ask Sarah did not close on Escape');

    /* ---------- the garden ---------- */
    await p.evaluate(() => localStorage.setItem('gaia-view', JSON.stringify('garden')));
    await p.goto(BASE + '/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
    if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3500); await chk(p, 'garden gate'); await shot('gate');
    for (const st of ['tea', 'potions', 'pond', 'altar', 'grove', 'roots']) {
      await p.evaluate((h) => { location.hash = '#' + h; }, st); await p.waitForTimeout(st === 'tea' ? 9000 : 7000); await chk(p, 'garden ' + st); await shot(st);
      if (phone) { const g = await p.evaluate(() => { const f = document.querySelector('#focus'), a = document.querySelector('#place-actions'), n = document.querySelector('#places').getBoundingClientRect(); const r = (f && !f.hidden ? f : a).getBoundingClientRect(); return Math.round(r.bottom - n.top); }); if (g > 1) note(tag, `garden ${st}: card overlaps the bottom bar by ${g}px`); }
    }
    await p.evaluate(() => { location.hash = '#tea--sweet-dreamz-sleep-support-loose-leaf-tea-blend'; }); await p.waitForTimeout(4500); await shot('detail');
    await reach(p, tag, 'garden product page', '#detail .column-in', 'button, a, p'); await chk(p, 'garden product');
    await p.evaluate(() => document.querySelector('#detail-add')?.click()); await p.waitForTimeout(500);
    await p.evaluate(() => document.querySelector('#basket-open').click()); await p.waitForTimeout(700); await shot('gbasket'); await reach(p, tag, 'garden basket', '#basket .sheet-in', 'a, button, p');
    await p.evaluate(() => document.querySelector('#basket-close').click()); await p.waitForTimeout(400);
    await p.evaluate(() => { location.hash = '#grove--lavender'; }); await p.waitForTimeout(3000); await reach(p, tag, 'garden plant page', '#info .column-in', 'li, p'); await shot('plant');
    await p.evaluate(() => { location.hash = '#grove'; }); await p.waitForTimeout(1500);
    await p.evaluate(() => document.querySelector('#menu-open').click()); await p.waitForTimeout(600); await shot('menu'); await reach(p, tag, 'garden menu', '#menu .menu-in, #menu', 'a, button, p'); await chk(p, 'garden menu');
    await p.evaluate(() => document.querySelector('[data-act="index"]').click()); await p.waitForTimeout(700); await shot('index'); await reach(p, tag, 'garden shop index', '#index .index-in, #index', 'li, a, button'); await chk(p, 'garden index');
    await ctx.close();
  }
  console.log([...new Set(out)].join('\n') || 'nothing found'); await b.close();
})();
