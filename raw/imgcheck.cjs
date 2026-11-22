const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto('http://127.0.0.1:4174/classic.html'); await p.waitForFunction('window.__ready'); await p.waitForTimeout(4000);
  console.log(await p.evaluate(() => { const t = [...document.querySelectorAll('.tarot img')]; return { total: t.length, broken: t.filter((i) => i.complete && !i.naturalWidth).map((i) => i.src), pending: t.filter((i) => !i.complete).length }; }));
  await b.close(); })();
