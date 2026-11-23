const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  const c = await b.newContext(devices['iPhone 13']); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(String(e))); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto(U + 'classic.html'); await p.waitForTimeout(2000); await p.tap('#menu-btn'); await p.waitForTimeout(800); await p.evaluate(() => document.querySelector('#mnav').scrollTo(0, 99999)); await p.waitForTimeout(500); await p.screenshot({ path: 'raw/_t0.jpg', type: 'jpeg', quality: 80 });
  console.log('sound controls visible (shop):', await p.evaluate(() => [...document.querySelectorAll('.snd, .nav-sound, .mn-sound')].filter((x) => x.offsetParent).length));
  await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.tap('#enter-yes'); await p.waitForTimeout(4000); await p.tap('#place-actions a.btn'); await p.waitForTimeout(8000);
  console.log('sound controls visible (garden):', await p.evaluate(() => [...document.querySelectorAll('.snd')].filter((x) => x.offsetParent).length)); await p.screenshot({ path: 'raw/_t1.jpg', type: 'jpeg', quality: 80 });
  console.log('errors', errs); await b.close(); })();
