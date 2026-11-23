const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch(); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } }); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push(String(e))); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto(U + 'classic.html'); await p.waitForTimeout(2000); await p.hover('.nav-top'); await p.waitForTimeout(600); await p.screenshot({ path: 'raw/_y0.jpg', type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: 1440, height: 520 } });
  await p.click('.np-col >> nth=1'); await p.waitForTimeout(900); console.log('collection ->', p.url().split('#')[1], 'panel hidden', await p.evaluate(() => getComputedStyle(document.querySelector('.nav-panel')).visibility));
  await p.mouse.move(700, 600); await p.click('#find-top'); await p.waitForTimeout(600); console.log('search opens index', await p.isVisible('#sidx'), await p.evaluate(() => document.activeElement.id)); await p.keyboard.press('Escape');
  await p.setViewportSize({ width: 1180, height: 760 }); await p.waitForTimeout(500); await p.screenshot({ path: 'raw/_y1.jpg', type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: 1180, height: 150 } });
  const c = await b.newContext(devices['iPhone 13']); const q = await c.newPage(); q.on('pageerror', (e) => errs.push('m ' + e)); await q.addInitScript(() => localStorage.setItem('gaia-21', 'true')); await q.goto(U + 'classic.html'); await q.waitForTimeout(1500); await q.screenshot({ path: 'raw/_y2.jpg', type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 390, height: 140 } });
  console.log('errors', errs); await b.close(); })();
