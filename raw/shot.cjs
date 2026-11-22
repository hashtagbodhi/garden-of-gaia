const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const mobile = process.argv[2] === 'mobile', port = process.argv[3] || '4173';
  const p = await b.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 810 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  const tag = mobile ? 'm_' : '', shot = (n) => p.screenshot({ path: `raw/s_${tag}${n}.jpg`, quality: 78, type: 'jpeg' });
  const hash = async (h, ms = 4500) => { await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(ms); };
  await p.click('#enter-yes'); await p.waitForTimeout(4500); await shot('gate');
  for (const id of ['tea', 'potions', 'pond', 'altar', 'roots']) { await hash('#' + id); await shot(id); }
  await hash('#potions--hathors-ease-blue-lotus-magnesium-whipped-tallow-balm'); await shot('product');
  await p.click('#detail-add'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('#detail .column-in').scrollTo(0, 620)); await p.waitForTimeout(300); await shot('product2');
  await p.evaluate(() => document.querySelector('#detail-reviews').scrollIntoView()); await p.waitForTimeout(300); await shot('product3');
  await p.click('#detail-gallery button'); await p.waitForTimeout(600); await shot('photo'); await p.click('#lightbox-close');
  await p.click('#basket-open'); await p.waitForTimeout(500); await shot('basket'); await p.click('#basket-close');
  await p.click('#menu-open'); await p.waitForTimeout(600); await shot('menu');
  await p.click('#menu [data-act="gift25"]'); await p.waitForTimeout(600); await shot('gifts');
  await p.click('#index-close'); await hash('#roots', 3500); await p.click('#place-menu button'); await p.waitForTimeout(700); await shot('story');
  console.log('errors:', errs.slice(0, 8));
  await b.close();
})();
