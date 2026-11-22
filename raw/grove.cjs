const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  for (const [tag, opts] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(tag + ' ' + String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(tag + ' ' + m.text()); });
    await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
    await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
    if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3000);
    await p.evaluate(() => { location.hash = '#grove'; }); await p.waitForTimeout(14000);
    await p.screenshot({ path: `raw/_gr-${tag}.jpg`, type: 'jpeg', quality: 78 });
    if (tag === 'm') { console.log('card:', await p.textContent('#focus-name'), '|', await p.textContent('#focus-price')); await p.click('#focus-next'); await p.waitForTimeout(1200); console.log('next:', await p.textContent('#focus-name')); await p.screenshot({ path: 'raw/_gr-m2.jpg', type: 'jpeg', quality: 78 }); await p.click('#focus-open'); }
    else { await p.evaluate(() => { location.hash = '#grove--blue-lotus'; }); }
    await p.waitForTimeout(1500); await p.screenshot({ path: `raw/_gr-${tag}-plant.jpg`, type: 'jpeg', quality: 78 });
    console.log(tag, 'plant page:', await p.textContent('#info-title'), '| products:', await p.locator('.plant-goods li').count(), '| back:', await p.textContent('#info-close'));
    await p.locator('.plant-goods .text-link').first().click(); await p.waitForTimeout(3000); console.log(tag, 'went to:', p.url().split('#')[1], '| detail open:', await p.isVisible('#detail'));
    await ctx.close();
  }
  console.log('errors', errs); await b.close(); })();
