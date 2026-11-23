const { chromium } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const p = await b.newPage({ viewport: { width: 1440, height: 760 } }); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript(() => localStorage.setItem('gaia-21', 'true')); await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3500);
  await p.evaluate(() => { location.hash = '#grove'; }); await p.waitForTimeout(12000);
  for (let i = 0; i < 6; i++) { await p.mouse.move(700, 400); await p.mouse.wheel(0, 3400); await p.waitForTimeout(1500); await p.screenshot({ path: `raw/_o${i}.jpg`, type: 'jpeg', quality: 60 }); }
  console.log('errors', errs); await b.close(); })();
