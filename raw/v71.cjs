const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  for (const [name, opt] of [['desk', { viewport: { width: 1440, height: 810 } }], ['phone', devices['iPhone 13']]]) {
    const c = await b.newContext(opt); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(name + ' ' + e));
    await p.addInitScript(() => { localStorage.setItem('gaia-view', JSON.stringify('garden')); });   // even someone who last used the garden
    await p.goto(U); await p.waitForTimeout(2500); console.log(name, 'opens on', p.url()); await p.screenshot({ path: `raw/_a-${name}0.jpg`, type: 'jpeg', quality: 78 });
    await p.click('#age-yes'); await p.waitForTimeout(800); await p.screenshot({ path: `raw/_a-${name}1.jpg`, type: 'jpeg', quality: 78 });
    await p.click('#to-garden'); await p.waitForTimeout(3000); console.log(name, 'switch goes to', p.url());
    await p.reload(); await p.waitForTimeout(2000); console.log(name, 'reload stays on', p.url());
    await c.close(); }
  console.log('errors', errs); await b.close(); })();
