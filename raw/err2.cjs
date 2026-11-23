const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage(); p.on('pageerror', (e) => console.log('PAGEERR', e.message)); p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); }); await p.goto('http://127.0.0.1:4175/classic.html'); await p.waitForTimeout(3000); console.log('mnav exists', await p.evaluate(() => !!document.querySelector('#mnav'))); await b.close(); })();
