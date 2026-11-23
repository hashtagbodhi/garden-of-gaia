const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push(n + ' ' + e)); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + 'classic.html#p--blue-water-lily-tincture'); await p.waitForTimeout(2200); console.log(n, 'height', await p.evaluate(() => document.body.scrollHeight), await p.evaluate(() => [...document.querySelectorAll('#main > *')].map((x) => (x.id || x.className.split(' ')[0]) + ':' + Math.round(x.getBoundingClientRect().height)).join(' ')));
    await p.screenshot({ path: `raw/_x-${n}0.jpg`, type: 'jpeg', quality: 78 });
    await p.locator('.pp-tabs button').nth(2).click(); await p.waitForTimeout(1500); await p.screenshot({ path: `raw/_x-${n}1.jpg`, type: 'jpeg', quality: 78 }); console.log(n, 'bar on', await p.evaluate(() => document.querySelector('.pp-bar').classList.contains('on')));
    if (n === 'm') { await p.locator('.pp-bar .btn').click(); await p.waitForTimeout(700); console.log('basket count', await p.textContent('#basket-open')); }
    await p.locator('.pp-tabs button').nth(0).click(); await p.waitForTimeout(1500); await p.screenshot({ path: `raw/_x-${n}2.jpg`, type: 'jpeg', quality: 78 });
    await p.click('.cr-next').catch(async () => { await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300); await p.click('.cr-next'); }); await p.waitForTimeout(1200); console.log(n, 'next ->', p.url().split('#')[1]); await c.close(); }
  console.log('errors', errs); await b.close(); })();
