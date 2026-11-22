const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext(devices['iPhone 13']); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
  await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3000);
  for (const st of ['tea', 'grove']) {
    await p.evaluate((h) => { location.hash = '#' + h; }, st); await p.waitForTimeout(14000);
    await p.screenshot({ path: `raw/_sa-${st}-0.jpg`, type: 'jpeg', quality: 70 });
    for (let i = 0; i < 3; i++) { await p.click('#focus-next'); await p.waitForTimeout(900); }
    await p.waitForTimeout(1200); await p.screenshot({ path: `raw/_sa-${st}-3.jpg`, type: 'jpeg', quality: 70 });
  }
  console.log('errors', errs); await b.close(); })();
