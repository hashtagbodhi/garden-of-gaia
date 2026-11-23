const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(n + ' ' + e)); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + 'classic.html'); await p.waitForTimeout(2500); await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); }); await p.waitForTimeout(800);
    console.log(n, 'page height', await p.evaluate(() => document.body.scrollHeight), 'sections', await p.evaluate(() => [...document.querySelectorAll('#main > *')].map((x) => x.className.split(' ').slice(0, 3).join('.')).join(' | ')));
    await p.screenshot({ path: `raw/_k-${n}.jpg`, type: 'jpeg', quality: 60, fullPage: true }); await c.close(); }
  console.log('errors', errs); await b.close(); })();
