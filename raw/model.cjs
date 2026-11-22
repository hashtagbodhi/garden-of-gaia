const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } }); const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
  await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3000);
  await p.evaluate(() => { location.hash = '#grove'; }); await p.waitForTimeout(15000);
  // walk to the far-right, deeper rows where ginger, lime and the apple grow
  for (let n = 0; n < 3; n++) { await p.mouse.move(900, 300); await p.mouse.down(); for (let i = 1; i <= 10; i++) await p.mouse.move(900 - i * 30, 300 + i * 22); await p.mouse.up(); await p.waitForTimeout(900); }
  await p.waitForTimeout(2500); await p.screenshot({ path: 'raw/_model.jpg', type: 'jpeg', quality: 80 });
  console.log('errors', errs); await b.close(); })();
