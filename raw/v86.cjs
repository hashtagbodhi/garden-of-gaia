const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [n, o] of [['a', { viewport: { width: 1440, height: 810 } }], ['b', { viewport: { width: 1920, height: 1000 } }], ['c', devices['iPhone 13']]]) { const c = await b.newContext(o); const p = await c.newPage(); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(9000); await p.screenshot({ path: `raw/_q${n}.jpg`, type: 'jpeg', quality: 78 }); await c.close(); }
  await b.close(); })();
