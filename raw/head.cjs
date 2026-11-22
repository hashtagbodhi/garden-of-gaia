const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  for (const [tag, opts] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(tag + ' ' + e));
    await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
    await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
    if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3000);
    await p.evaluate(() => { location.hash = '#tea'; }); await p.waitForTimeout(9000);
    const vw = p.viewportSize(); await p.screenshot({ path: `raw/_h-g${tag}.jpg`, type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: vw.width, height: tag === 'd' ? 150 : 260 } });
    if (tag === 'd') { await p.click('#sound-toggle'); await p.click('#ask-top'); await p.waitForTimeout(700); console.log('ask opens from header:', await p.isVisible('.cs-card')); await p.keyboard.press('Escape'); }
    await p.evaluate(() => localStorage.setItem('gaia-view', JSON.stringify('classic')));
    await p.goto('http://127.0.0.1:4175/classic.html'); await p.waitForTimeout(2500);
    await p.screenshot({ path: `raw/_h-w${tag}.jpg`, type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: vw.width, height: tag === 'd' ? 150 : 260 } });
    await p.click('#to-garden'); await p.waitForTimeout(2500); console.log(tag, 'switch ->', p.url());
    await ctx.close(); }
  console.log('errors', errs); await b.close(); })();
