const { chromium } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 810 } }); p.setDefaultTimeout(8000); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript(() => localStorage.setItem('gaia-21', 'true')); await p.goto(U + 'classic.html#plant--lavender'); await p.waitForTimeout(2500);
  const add = async (n) => { for (let i = 0; i < n; i++) { await p.evaluate((k) => document.querySelectorAll('.pg-add')[k]?.click(), i); await p.waitForTimeout(250); } };
  const shot = async (k) => { await p.evaluate(() => document.querySelector('#basket-open').click()); await p.waitForTimeout(1600); await p.screenshot({ path: `raw/_j${k}.jpg`, type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 1440, height: 260 } }); console.log(k, await p.textContent('.vine-t')); await p.keyboard.press('Escape'); await p.waitForTimeout(500); };
  await add(1); await shot(0); await add(6); await shot(1);
  console.log('errors', errs); await b.close(); })();
