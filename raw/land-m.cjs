const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); });
  await p.goto(process.argv[2] || 'http://127.0.0.1:4174/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  if (await p.isVisible('#enter-yes')) await p.click('#enter-yes');
  await p.waitForTimeout(12000); await p.screenshot({ path: process.argv[3] || 'raw/_land.jpg', type: 'jpeg', quality: 75 });
  console.log(await p.evaluate(() => ({ w: innerWidth, toClassic: getComputedStyle(document.querySelector('#to-classic')).display })));
  await b.close(); })();
