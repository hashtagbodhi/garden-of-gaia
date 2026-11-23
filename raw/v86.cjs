const { chromium } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [n, w, h] of [['a', 1440, 810], ['b', 1920, 1000]]) { const p = await b.newPage({ viewport: { width: w, height: h } }); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(5000); await p.screenshot({ path: `raw/_q${n}.jpg`, type: 'jpeg', quality: 78 }); await p.close(); }
  await b.close(); })();
