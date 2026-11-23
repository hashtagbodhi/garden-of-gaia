const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch(); const c = await b.newContext(devices['iPhone 13']); const p = await c.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  for (const h of ['home', 'shop', 'teas', 'plants', 'gifts', 'story', 'ritual']) { await p.goto(U + 'classic.html#' + h); await p.waitForTimeout(1500);
    console.log(h, await p.evaluate(() => [...document.querySelectorAll('#main .collage')].filter((x) => x.offsetParent).length, null), 'shown of', await p.evaluate(() => document.querySelectorAll('#main .collage').length));
    if (h === 'teas' || h === 'plants') await p.screenshot({ path: `raw/_b-${h}.jpg`, type: 'jpeg', quality: 75 }); }
  console.log('errors', errs); await b.close(); })();
