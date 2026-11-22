// Ask Sarah: walk the consultation on the website (desktop + phone) and in the garden menu (phone)
const { chromium, devices } = require('playwright');
const pick = async (p, label) => { await p.locator('.cs-opt', { hasText: label }).first().click(); await p.waitForTimeout(250); };
const go = async (p) => { await p.click('.cs-body .cs-go'); await p.waitForTimeout(450); };
async function walk(p, tag) {
  await p.waitForSelector('#consult:not([hidden])'); await p.waitForTimeout(500); await p.screenshot({ path: `raw/_cs-${tag}-0.jpg`, type: 'jpeg', quality: 72 });
  await go(p);
  await pick(p, 'Deeper sleep'); await pick(p, 'Calm and stress'); await p.screenshot({ path: `raw/_cs-${tag}-1.jpg`, type: 'jpeg', quality: 72 }); await go(p);
  await pick(p, 'A warm cup'); await pick(p, 'On my skin'); await go(p);
  await pick(p, 'Evening and bedtime');
  await pick(p, 'Avoiding alcohol'); await p.screenshot({ path: `raw/_cs-${tag}-4.jpg`, type: 'jpeg', quality: 72 }); await go(p);
  await pick(p, 'Up to $50'); await p.waitForTimeout(900);
  await p.screenshot({ path: `raw/_cs-${tag}-res.jpg`, type: 'jpeg', quality: 72, fullPage: false });
  const names = await p.$$eval('.cs-ritual h3', (n) => n.map((x) => x.textContent));
  const aside = await p.textContent('.cs-aside summary').catch(() => '');
  await p.locator('.cs-ritual .cs-add').first().click(); await p.waitForTimeout(300);
  const basket = await p.evaluate(() => JSON.parse(localStorage.getItem('gaia-basket') || '[]').length);
  console.log(tag, '| ritual:', names.join(' / '), '|', aside, '| basket lines:', basket);
  await p.locator('.cs-ritual .cs-see').first().click(); await p.waitForTimeout(2500);
  console.log(tag, '| see it ->', p.url().split('#')[1], '| consult hidden:', await p.isHidden('#consult'));
}
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  for (const [tag, opts] of [['wd', { viewport: { width: 1440, height: 900 } }], ['wm', devices['iPhone 13']]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(tag + ' ' + e));
    await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.removeItem('gaia-basket'); });
    await p.goto('http://127.0.0.1:4175/classic.html'); await p.waitForTimeout(1500);
    if (tag === 'wm') { await p.click('#menu-btn'); await p.waitForTimeout(400); await p.screenshot({ path: 'raw/_cs-wm-nav.jpg', type: 'jpeg', quality: 72 }); }
    else await p.screenshot({ path: 'raw/_cs-wd-head.jpg', type: 'jpeg', quality: 72, clip: { x: 0, y: 0, width: 1440, height: 160 } });
    await p.click('#nav-ask'); await walk(p, tag); await ctx.close();
  }
  const ctx = await b.newContext(devices['iPhone 13']); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push('g ' + e));
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); localStorage.removeItem('gaia-basket'); });
  await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(2500);
  await p.click('#menu-open'); await p.waitForTimeout(500); await p.screenshot({ path: 'raw/_cs-gm-menu.jpg', type: 'jpeg', quality: 72 });
  await p.click('.menu-ask'); await walk(p, 'gm');
  await ctx.close(); console.log('errors', errs); await b.close();
})();
