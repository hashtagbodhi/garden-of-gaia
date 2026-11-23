const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  for (const [n, o] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push(n + ' ' + e)); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + 'classic.html'); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelector('#to-garden').click()); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.waitForTimeout(3500);
    console.log(n, p.url().split('/').pop(), 'entry hidden', await p.isHidden('#entry'), 'title', await p.textContent('.grove-cap b'), 'gate btn', await p.locator('#place-actions a.btn:visible').count()); await p.screenshot({ path: `raw/_B-${n}.jpg`, type: 'jpeg', quality: 82 });
    if (n === 'd') { await p.mouse.click(660, 470); await p.waitForTimeout(1500); console.log('plant opens', await p.isVisible('#info')); }
    await c.close(); }
  const c = await b.newContext({ viewport: { width: 1440, height: 810 } }); const p = await c.newPage(); await p.goto(U + '#grove'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.waitForTimeout(1500); console.log('new visitor sees age check:', await p.isVisible('#entry'), await p.textContent('#enter-yes'));
  console.log('errors', errs); await b.close(); })();
