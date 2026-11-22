const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [name, vp, dsf] of [['d', { width: 1440, height: 900 }, 1], ['m', { width: 390, height: 844 }, 2]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: dsf });
    await p.goto('http://127.0.0.1:4173/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.click('#enter-yes'); await p.waitForTimeout(1500);
    await p.evaluate(() => { location.hash = '#tea--butterfly-chai-organic-whole-spice-blend-ceylon-black-tea'; }); await p.waitForTimeout(4000);
    await p.screenshot({ path: `raw/ing-${name}1.jpg`, type: 'jpeg', quality: 82 });
    await p.evaluate(() => document.querySelector('#detail-inside').scrollIntoView()); await p.evaluate(() => document.querySelector('#detail .column-in').scrollBy(0, -70)); await p.waitForTimeout(400);
    await p.screenshot({ path: `raw/ing-${name}2.jpg`, type: 'jpeg', quality: 82 }); await p.close();
  }
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto('http://127.0.0.1:4173/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.click('#enter-yes'); await p.waitForTimeout(1500);
  await p.evaluate(() => { location.hash = '#potions'; }); await p.waitForTimeout(4500); await p.screenshot({ path: 'raw/ing-m3.jpg', type: 'jpeg', quality: 82 });
  await b.close(); })();
