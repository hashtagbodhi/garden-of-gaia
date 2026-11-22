const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [name, opts] of [['phone', devices['iPhone 13']], ['desktop', { viewport: { width: 1440, height: 900 } }]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage(); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
    await p.goto('http://127.0.0.1:4175/classic.html#p--butterfly-chai-organic-whole-spice-blend-ceylon-black-tea'); await p.waitForFunction('window.__ready'); await p.waitForTimeout(500);
    console.log(name, 'emblem visible:', await p.isVisible('.pp-stamp')); await ctx.close(); }
  await b.close(); })();
