const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 810 } }); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto('http://127.0.0.1:4175/classic.html' + (process.argv[3] || '')); await p.waitForTimeout(1500);
  const sels = (process.argv[2] || '').split('|');
  const r = await p.evaluate((sels) => { const o = {}; for (const s of sels) { const e = document.querySelector(s); if (!e) { o[s] = null; continue; } const c = getComputedStyle(e); o[s] = { cls: String(e.className).slice(0, 50), bg: c.backgroundColor, img: c.backgroundImage.slice(0, 160), color: c.color, before: getComputedStyle(e, '::before').backgroundImage.slice(0, 80) + ' ' + getComputedStyle(e, '::before').backgroundColor }; } return o; }, sels);
  console.log(JSON.stringify(r, null, 1)); await b.close(); })();
