const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } }); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push(String(e))); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  const shots = process.argv[2] ? process.argv[2].split(',') : ['home', 'shop-tea', 'p--blue-water-lily-tincture', 'plant--vanilla', 'story', 'gifts'];
  for (const h of shots) { await p.goto(U + 'classic.html#' + h); await p.waitForTimeout(1600); await p.screenshot({ path: `raw/_S-${h.slice(0, 8)}.jpg`, type: 'jpeg', quality: 60, fullPage: h === 'home' }); }
  console.log('errors', errs); await b.close(); })();
