const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto('http://127.0.0.1:4175/classic.html'); await p.waitForFunction('window.__ready'); await p.waitForTimeout(800);
  console.log(await p.evaluate(() => getComputedStyle(document.querySelector('.ticker')).fontSize));
  await p.screenshot({ path: 'raw/_tick.jpg', type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 390, height: 140 } }); await b.close(); })();
