const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch(); const errs = [];
  const c = await b.newContext(devices['iPhone 13']); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(String(e))); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto(U + 'classic.html'); await p.waitForTimeout(2000); await p.tap('#menu-btn'); await p.waitForTimeout(900); await p.screenshot({ path: 'raw/_d0.jpg', type: 'jpeg', quality: 80 });
  await p.tap('#menu-btn'); await p.evaluate(() => scrollTo(0, 900)); await p.waitForTimeout(600); await p.tap('#menu-btn'); await p.waitForTimeout(900); await p.screenshot({ path: 'raw/_d1.jpg', type: 'jpeg', quality: 80 });
  await p.evaluate(() => document.querySelector('#mnav').scrollTo(0, 99999)); await p.waitForTimeout(500); await p.screenshot({ path: 'raw/_d2.jpg', type: 'jpeg', quality: 80 });
  await p.evaluate(() => document.querySelector('#mnav').scrollTo(0, 0)); await p.tap('.mg-main'); await p.waitForTimeout(900); console.log('gifts ->', p.url());
  console.log('errors', errs); await b.close(); })();
