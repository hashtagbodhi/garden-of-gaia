const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch();
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + 'classic.html'); await p.waitForTimeout(2500); console.log(n, await p.evaluate(() => document.body.scrollHeight));
    const s = p.locator('.kind'); await s.scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, n => 0)); await p.locator('.doors').scrollIntoViewIfNeeded(); await p.waitForTimeout(1500); await p.screenshot({ path: `raw/_l-${n}.jpg`, type: 'jpeg', quality: 80 }); await c.close(); }
  await b.close(); })();
