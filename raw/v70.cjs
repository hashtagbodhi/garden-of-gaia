const { chromium } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  const p = await b.newPage({ viewport: { width: 500, height: 900 } }); p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
  await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.setViewportSize({ width: 1440, height: 760 }); await p.waitForTimeout(1500);
  if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(4000);
  await p.evaluate(() => { location.hash = '#grove'; }); await p.waitForTimeout(14000); await p.screenshot({ path: 'raw/_z0.jpg', type: 'jpeg', quality: 78 });
  await p.setViewportSize({ width: 430, height: 900 }); await p.waitForTimeout(5000); await p.screenshot({ path: 'raw/_z1.jpg', type: 'jpeg', quality: 78 });
  console.log('errors', errs); await b.close(); })();
