const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  for (const [tag, extra] of [['motion', {}], ['reduced', { reducedMotion: 'reduce' }]]) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 700 }, ...extra }); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(tag + ' ' + e));
    await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); });
    const moving = async (sel) => { const x = () => p.evaluate((s) => { const t = document.querySelector(s); return [Math.round(t.getBoundingClientRect().left), t.textContent.slice(0, 40)].join('|'); }, sel); const a = await x(); await p.waitForTimeout(1500); const c = await x(); await p.waitForTimeout(3600); const d = await x(); return a !== c || c !== d ? 'changes over time' : 'STATIC'; };
    await p.goto('http://127.0.0.1:4175/classic.html'); await p.waitForTimeout(2000);
    console.log(tag, 'shop bar:', await moving('#ticker'));
    await p.screenshot({ path: `raw/_ux-${tag}-shop.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 390, height: 150 } });
    await p.evaluate(() => localStorage.setItem('gaia-view', JSON.stringify('garden')));
    await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
    if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3500);
    await p.evaluate(() => { location.hash = '#tea'; }); await p.waitForTimeout(8000);
    console.log(tag, 'garden bar:', await moving('#sl-track'), '| visible:', await p.isVisible('.sl-bar'));
    await p.screenshot({ path: `raw/_ux-${tag}-garden.jpg`, type: 'jpeg', quality: 80 });
    if (tag === 'motion') {
      console.log('prev disabled at start:', await p.isDisabled('#focus-prev'), '| next:', await p.isDisabled('#focus-next'));
      await p.click('#menu-open'); await p.waitForTimeout(500); const o1 = await p.isVisible('#menu'); await p.screenshot({ path: 'raw/_ux-menu.jpg', type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: 390, height: 220 } });
      await p.click('#menu-open'); await p.waitForTimeout(500); console.log('menu: open', o1, '-> second tap closes:', !(await p.isVisible('#menu')));
      await p.click('#basket-open'); await p.waitForTimeout(500); const b1 = await p.isVisible('#basket'); await p.keyboard.press('Escape'); await p.waitForTimeout(400); console.log('basket: open', b1, '-> Escape closes:', !(await p.isVisible('#basket')));
    }
    await ctx.close(); }
  console.log('errors', errs); await b.close(); })();
