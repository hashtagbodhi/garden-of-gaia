const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } }); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto('http://127.0.0.1:4174/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  await p.click('#enter-yes'); await p.waitForTimeout(5000);
  await p.evaluate(() => { location.hash = '#tea'; }); await p.waitForTimeout(9000); await p.screenshot({ path: 'raw/_tea.jpg', type: 'jpeg', quality: 78 });
  console.log(errs); await b.close(); })();
