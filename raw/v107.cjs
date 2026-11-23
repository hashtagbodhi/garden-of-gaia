const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } }); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push(String(e))); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto(U + '#grove'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.waitForTimeout(2500); await p.screenshot({ path: 'raw/_U0.jpg', type: 'jpeg', quality: 80 });
  await p.mouse.move(720, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 200); await p.waitForTimeout(120); } await p.waitForTimeout(1500); await p.screenshot({ path: 'raw/_U1.jpg', type: 'jpeg', quality: 80 });
  for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 200); await p.waitForTimeout(120); } await p.waitForTimeout(1500); await p.screenshot({ path: 'raw/_U2.jpg', type: 'jpeg', quality: 80 });
  const t = await p.locator('.pg-plant').evaluateAll((n) => n.map((x) => [x.dataset.k, getComputedStyle(x).opacity, Math.round(x.getBoundingClientRect().x)])); console.log(JSON.stringify(t));
  const vis = p.locator('.pg-plant.near'); if (await vis.count()) { await vis.click({ force: true }); await p.waitForTimeout(1500); console.log('plant panel', await p.isVisible('#info'), await p.textContent('#info-title').catch(() => '')); await p.screenshot({ path: 'raw/_U3.jpg', type: 'jpeg', quality: 80 }); }
  const c = await b.newContext(devices['iPhone 13']); const q = await c.newPage(); q.on('pageerror', (e) => errs.push('m ' + e)); await q.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await q.goto(U + '#grove'); await q.waitForFunction('window.__ready', null, { timeout: 90000 }); await q.waitForTimeout(2500); await q.screenshot({ path: 'raw/_U4.jpg', type: 'jpeg', quality: 80 });
  console.log('errors', errs); await b.close(); })();
