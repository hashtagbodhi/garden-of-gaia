const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const errs = [];
  for (const [tag, opts] of [['d', { viewport: { width: 1440, height: 860 } }], ['m', { ...devices['iPhone 13'], viewport: { width: 390, height: 760 } }]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(tag + ' ' + e)); p.on('console', (m) => { if (m.type() === 'error') errs.push(tag + ' ' + m.text()); });
    await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); });
    await p.goto('http://127.0.0.1:4175/classic.html#plants'); await p.waitForTimeout(2500);
    await p.evaluate(() => { const y = document.querySelector('.plant-tools').getBoundingClientRect().top + scrollY - 150; document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, y); }); await p.waitForTimeout(2500);
    await p.screenshot({ path: `raw/_wp-${tag}-list.jpg`, type: 'jpeg', quality: 78 });
    await p.locator('.pf-chip', { hasText: 'Sleep' }).click(); await p.waitForTimeout(400); const nSleep = await p.textContent('.plant-count');
    await p.fill('.pf-search', 'lav'); await p.waitForTimeout(300); const nLav = await p.locator('.plant:not([hidden])').count();
    await p.fill('.pf-search', ''); await p.locator('.pf-chip', { hasText: 'All plants' }).click();
    console.log(tag, 'filter sleep:', nSleep, '| sleep + "lav":', nLav);
    await p.evaluate(() => { location.hash = '#plant--lavender'; }); await p.waitForTimeout(1500); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
    await p.screenshot({ path: `raw/_wp-${tag}-one.jpg`, type: 'jpeg', quality: 78 });
    await p.evaluate(() => { const y = document.querySelector('.plant-goods').getBoundingClientRect().top + scrollY - 260; document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, y); }); await p.waitForTimeout(2500);
    await p.screenshot({ path: `raw/_wp-${tag}-goods.jpg`, type: 'jpeg', quality: 78 });
    await p.locator('.plant-goods .pg-add:not([disabled])').first().click(); await p.waitForTimeout(400);
    console.log(tag, 'products:', await p.locator('.plant-goods li').count(), '| basket:', await p.textContent('#basket-count'), '| related plants:', await p.locator('.plant-kin .plant').count());
    await p.evaluate(() => { location.hash = '#home'; }); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelector('.plants-sec .plant-grid').scrollIntoView({ block: 'center' })); await p.waitForTimeout(2500);
    await p.screenshot({ path: `raw/_wp-${tag}-home.jpg`, type: 'jpeg', quality: 78 });
    await ctx.close(); }
  console.log('errors', errs); await b.close(); })();
