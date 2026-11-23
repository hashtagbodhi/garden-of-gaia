const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch();
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 900 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + 'classic.html'); await p.waitForTimeout(2000); const s = p.locator('.gifts-band'); await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500); await s.screenshot({ path: `raw/_e-${n}.jpg`, type: 'jpeg', quality: 80 }); await c.close(); }
  await b.close(); })();
