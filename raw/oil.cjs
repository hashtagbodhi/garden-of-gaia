const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [name, vp, dsf] of [['d', { width: 1440, height: 810 }, 1], ['m', { width: 390, height: 844 }, 2]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: dsf });
    await p.goto('http://127.0.0.1:4173/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.click('#enter-yes'); await p.waitForTimeout(1500);
    await p.evaluate(() => { location.hash = '#potions'; }); await p.waitForTimeout(4500);
    if (name === 'm') { for (let i = 0; i < 14; i++) { const n = await p.textContent('#focus-name'); if (/Priesthood/.test(n)) break; await p.click('#focus-next'); await p.waitForTimeout(500); } await p.waitForTimeout(1200); }
    await p.screenshot({ path: `raw/oil-${name}.jpg`, type: 'jpeg', quality: 82 }); await p.close();
  }
  await b.close(); })();
