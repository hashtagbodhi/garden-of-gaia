const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch(); const c = await b.newContext(devices['iPhone 13']); const p = await c.newPage(); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto(U + 'classic.html'); await p.waitForTimeout(2000);
  for (const [i, y] of [[0, 0], [1, 20], [2, 900]]) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(400); await p.tap('#menu-btn'); await p.waitForTimeout(900);
    console.log(y, JSON.stringify(await p.evaluate(() => { const h = document.querySelector('#head').getBoundingClientRect(), t = document.querySelector('.ticker'), a = document.querySelector('.mn-ask').getBoundingClientRect(); return { headTop: h.top, headBottom: h.bottom, ticker: getComputedStyle(t).visibility, askTop: Math.round(a.top) }; })));
    await p.screenshot({ path: `raw/_f${i}.jpg`, type: 'jpeg', quality: 78, clip: { x: 0, y: 0, width: 390, height: 300 } }); await p.tap('#menu-btn'); await p.waitForTimeout(400); }
  await b.close(); })();
