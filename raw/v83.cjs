const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(n + ' ' + e)); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    for (const h of ['home', 'shop', 'shop-tea', 'p--blue-water-lily-tincture', 'plants', 'plant--lavender', 'gifts', 'gifts-25', 'story', 'brew', 'reviews', 'faq']) { await p.goto(U + 'classic.html#' + h); await p.waitForTimeout(1300);
      console.log(n, h, await p.evaluate(() => document.body.scrollHeight), await p.evaluate(() => [...document.querySelectorAll('#main > *')].map((x) => `${x.className.split(' ').filter((k) => !/^tone-|^scal$|^sec$/.test(k)).slice(0, 2).join('.') || 'sec'}:${Math.round(x.getBoundingClientRect().height)}`).join(' ')));
      if (process.argv[2] === 'shots' && ['shop-tea', 'plants', 'reviews', 'faq'].includes(h)) await p.screenshot({ path: `raw/_n-${n}-${h.slice(0, 5)}.jpg`, type: 'jpeg', quality: 70 }); }
    await c.close(); }
  console.log('errors', errs); await b.close(); })();
