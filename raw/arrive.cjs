const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('http://127.0.0.1:4173/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.click('#enter-yes'); await p.waitForTimeout(3000);
  await p.screenshot({ path: 'raw/a0.jpg', type: 'jpeg', quality: 80 });
  await p.evaluate(() => { location.hash = '#tea'; });
  for (const [i, ms] of [[1, 3600], [2, 1800], [3, 2600]]) { await p.waitForTimeout(ms); await p.screenshot({ path: `raw/a${i}.jpg`, type: 'jpeg', quality: 80 }); }
  await p.click('#focus-next'); await p.waitForTimeout(1500); await p.screenshot({ path: 'raw/a4.jpg', type: 'jpeg', quality: 80 });
  console.log('errors:', errs); await b.close(); })();
