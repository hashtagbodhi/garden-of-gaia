const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  for (const [vw, vh, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
    const p = await b.newPage({ viewport: { width: vw, height: vh } }); p.on('pageerror', (e) => errs.push(String(e)));
    await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-basket', JSON.stringify([])); });
    await p.goto('http://127.0.0.1:4174/classic.html'); await p.waitForFunction('window.__ready');
    await p.evaluate(() => { location.hash = '#p--butterfly-chai-organic-whole-spice-blend-ceylon-black-tea'; }); await p.waitForTimeout(500); await p.click('.pp-row .btn-main');
    await p.evaluate(() => { location.hash = '#p--blue-water-lily-tincture'; }); await p.waitForTimeout(500); await p.click('.pp-row .btn-main');
    await p.evaluate(() => { location.hash = '#p--hathors-ease-blue-lotus-magnesium-whipped-tallow-balm'; }); await p.waitForTimeout(500); await p.click('.pp-row .btn-main');
    await p.click('#basket-open'); await p.waitForTimeout(1500); await p.screenshot({ path: `raw/_bk-c-${tag}.jpg`, type: 'jpeg', quality: 80 });
    await p.click('.more-add'); await p.waitForTimeout(900); await p.screenshot({ path: `raw/_bk-c2-${tag}.jpg`, type: 'jpeg', quality: 80 });
    await p.click('#basket-tab'); await p.waitForTimeout(300); console.log(tag, 'closed:', await p.evaluate(() => document.querySelector('#basket').hidden));
    await p.evaluate(() => localStorage.setItem('gaia-view', JSON.stringify('garden'))); await p.goto('http://127.0.0.1:4174/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3500);
    await p.click('#basket-open'); await p.waitForTimeout(1500); await p.screenshot({ path: `raw/_bk-g-${tag}.jpg`, type: 'jpeg', quality: 80 });
    await p.keyboard.press('Escape'); await p.waitForTimeout(300); console.log(tag, 'garden closed:', await p.evaluate(() => document.querySelector('#basket').hidden));
    await p.close();
  }
  console.log('errors', errs); await b.close(); })();
