const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push(n + ' ' + e));
    await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(4000);
    await p.evaluate(() => { location.hash = '#grove'; }); await p.waitForTimeout(13000); await p.screenshot({ path: `raw/_i-${n}0.jpg`, type: 'jpeg', quality: 78 });
    if (n === 'd') await p.mouse.click(720, 430); else await p.touchscreen.tap(213, 330); await p.waitForTimeout(2200);
    console.log(n, 'plant', await p.isVisible('#info'), await p.textContent('#info-title').catch(() => ''));
    await p.locator('.plant-goods .pg-add').first().click(); await p.waitForTimeout(500);
    await p.locator('.plant-goods .pg-row strong').first().click(); await p.waitForTimeout(2500);
    console.log(n, 'product page', await p.isVisible('#detail'), await p.textContent('#detail-name'), '| back:', await p.textContent('#detail-close'), '| url', p.url().split('/').pop());
    await p.screenshot({ path: `raw/_i-${n}1.jpg`, type: 'jpeg', quality: 78 });
    await p.click('#detail-close'); await p.waitForTimeout(1800); console.log(n, 'back to plant', await p.isVisible('#info'), await p.isHidden('#detail'));
    await p.evaluate(() => document.querySelector('#basket-open, .basket-pill').click()); await p.waitForTimeout(1500); await p.screenshot({ path: `raw/_i-${n}2.jpg`, type: 'jpeg', quality: 80 });
    await c.close(); }
  console.log('errors', errs); await b.close(); })();
