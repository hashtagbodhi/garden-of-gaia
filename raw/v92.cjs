const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push(n + ' ' + e));
    await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(4500); await p.screenshot({ path: `raw/_w-${n}0.jpg`, type: 'jpeg', quality: 78 });
    await p.click('#place-actions a.btn'); await p.waitForTimeout(9000); await p.screenshot({ path: `raw/_w-${n}1.jpg`, type: 'jpeg', quality: 80 });
    if (n === 'd') { await p.mouse.move(700, 400); await p.mouse.wheel(0, 9000); await p.waitForTimeout(2500); await p.screenshot({ path: 'raw/_w-d2.jpg', type: 'jpeg', quality: 80 }); await p.mouse.click(700, 420); await p.waitForTimeout(2200); console.log('plant opens', await p.isVisible('#info')); await p.screenshot({ path: 'raw/_w-d3.jpg', type: 'jpeg', quality: 80 }); }
    await c.close(); }
  console.log('errors', errs); await b.close(); })();
