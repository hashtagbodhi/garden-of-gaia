const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto('http://127.0.0.1:4174/classic.html'); await p.waitForFunction('window.__ready');
  console.log(await p.evaluate(() => { const c = document.querySelector('.cols'), s = getComputedStyle(c); const k = document.querySelector('.col.split'), ks = getComputedStyle(k); return { colsW: c.getBoundingClientRect().width, cols: s.gridTemplateColumns, display: s.display, tileW: k.getBoundingClientRect().width, gc: ks.gridColumn, tile: ks.gridTemplateColumns }; }));
  await b.close(); })();
