const { chromium } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 760 } }); p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
  await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(4000);
  await p.screenshot({ path: 'raw/_y-gate.jpg', type: 'jpeg', quality: 78 });
  for (const id of ['tea', 'potions', 'pond', 'altar', 'grove']) { await p.evaluate((h) => { location.hash = '#' + h; }, id); await p.waitForTimeout(12000); await p.screenshot({ path: `raw/_y-${id}.jpg`, type: 'jpeg', quality: 78 }); }
  console.log('errors', errs); await b.close(); })();
