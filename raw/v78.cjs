const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(n + ' ' + e)); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + 'classic.html#shop'); await p.waitForTimeout(2000);
    const shot = async (k) => { await p.click('#basket-open'); await p.waitForTimeout(1500); await p.locator('#basket .sheet-head, #basket header').first().screenshot({ path: `raw/_h-${n}${k}.jpg`, type: 'jpeg', quality: 85 }).catch(async () => p.screenshot({ path: `raw/_h-${n}${k}.jpg`, type: 'jpeg', quality: 85 })); await p.keyboard.press('Escape'); await p.waitForTimeout(400); };
    await shot(0);
    const adds = p.locator('.card .card-add, .card button').first(); await adds.click({ force: true }).catch(() => {}); await p.waitForTimeout(600); await shot(1);
    for (let i = 0; i < 5; i++) { await p.locator('.card .card-add, .card button').nth(i + 1).click({ force: true }).catch(() => {}); await p.waitForTimeout(300); } await shot(2);
    await c.close(); }
  console.log('errors', errs); await b.close(); })();
