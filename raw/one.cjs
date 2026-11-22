const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://127.0.0.1:4173/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.click('#enter-yes'); await p.waitForTimeout(1500);
  await p.evaluate(() => { location.hash = '#pond--soursop-leaves-organic-whole-leaves'; }); await p.waitForTimeout(3500);
  await p.evaluate(() => { const d = [...document.querySelectorAll('#detail-desc details')]; d.forEach((x) => (x.open = true)); d[Math.max(0, d.length - 2)].scrollIntoView(); document.querySelector('#detail .column-in').scrollBy(0, -160); }); await p.waitForTimeout(400);
  await p.screenshot({ path: 'raw/_soursop.jpg', type: 'jpeg', quality: 85 }); await b.close(); })();
