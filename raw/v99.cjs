const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  const c0 = await b.newContext({ viewport: { width: 1440, height: 810 } }); const n = await c0.newPage(); await n.goto(U + '#grove'); await n.waitForTimeout(2500); console.log('new visitor to garden lands on', n.url().split('/').pop(), 'age check', await n.isVisible('#age')); await c0.close();
  for (const [k, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push(k + ' ' + e)); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + 'classic.html'); await p.waitForTimeout(1500); await p.screenshot({ path: `raw/_D-${k}0.jpg`, type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: o.viewport?.width || 390, height: 150 } });
    await p.evaluate(() => document.querySelector('#to-garden').click()); await p.waitForTimeout(700); console.log(k, 'entry screen visible while loading:', await p.isVisible('#entry')); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.waitForTimeout(2500);
    await p.screenshot({ path: `raw/_D-${k}1.jpg`, type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: o.viewport?.width || 390, height: 150 } });
    await p.click('.top .mark'); await p.waitForTimeout(1500); console.log(k, 'logo ->', p.url().split('/').pop()); await c.close(); }
  console.log('errors', errs); await b.close(); })();
