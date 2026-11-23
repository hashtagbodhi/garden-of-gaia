const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(n + ' ' + e));
    await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(4500); await p.screenshot({ path: `raw/_g-${n}0.jpg`, type: 'jpeg', quality: 78 });
    await p.click('#place-actions a.btn'); await p.waitForTimeout(13000); console.log(n, 'button ->', p.url()); await p.screenshot({ path: `raw/_g-${n}1.jpg`, type: 'jpeg', quality: 78 });
    await p.evaluate(() => { location.hash = '#tea'; }); await p.waitForTimeout(2500); console.log(n, '#tea -> title', await p.textContent('#place-title'));
    if (n === 'd') { await p.mouse.click(720, 380); } else { await p.touchscreen.tap(213, 285); } await p.waitForTimeout(2200); console.log(n, 'plant open', await p.isVisible('#info'), await p.locator('.plant-goods a.text-link').first().getAttribute('href').catch(() => null));
    await p.goto(U + '#pond--white-lotus-flower-1'); await p.waitForTimeout(2500); console.log(n, 'old product link ->', p.url()); await c.close(); }
  console.log('errors', errs); await b.close(); })();
