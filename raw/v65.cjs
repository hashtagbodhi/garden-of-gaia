// plant paintings everywhere, green logo, sentence-case eyebrows, and the way from the shop into the garden
const { chromium, devices } = require('playwright');
const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  // 1. the shop: a returning shopper presses "Walk the 3D garden"
  let p = await b.newPage({ viewport: { width: 1440, height: 810 } }); p.on('pageerror', (e) => errs.push('shop ' + e));
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); });
  await p.goto(U + 'classic.html'); await p.waitForTimeout(2500); await p.screenshot({ path: 'raw/_v0.jpg', type: 'jpeg', quality: 80 });
  await p.goto(U + 'classic.html#plants'); await p.waitForTimeout(2000); await p.screenshot({ path: 'raw/_v1.jpg', type: 'jpeg', quality: 80 });
  await p.goto(U + 'classic.html#home'); await p.waitForTimeout(1200);
  await p.click('a.btn-glow'); await p.waitForTimeout(2500); console.log('hero button lands on:', p.url());
  await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3500);
  await p.evaluate(() => { location.hash = '#grove'; }); await p.waitForTimeout(16000); await p.screenshot({ path: 'raw/_v2.jpg', type: 'jpeg', quality: 82 });
  await p.mouse.move(800, 450); await p.mouse.wheel(0, 6000); await p.waitForTimeout(2500); await p.screenshot({ path: 'raw/_v3.jpg', type: 'jpeg', quality: 82 });
  await p.mouse.click(760, 400); await p.waitForTimeout(1800); console.log('plant page:', await p.isVisible('#info'), await p.textContent('#info-title').catch(() => '')); await p.screenshot({ path: 'raw/_v4.jpg', type: 'jpeg', quality: 82 });
  await p.close();
  // 2. a phone
  const c = await b.newContext({ ...devices['iPhone 13'] }); p = await c.newPage(); p.on('pageerror', (e) => errs.push('phone ' + e));
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
  await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.screenshot({ path: 'raw/_v5.jpg', type: 'jpeg', quality: 80 });
  if (await p.isVisible('#enter-yes')) await p.tap('#enter-yes'); await p.waitForTimeout(3500);
  await p.evaluate(() => { location.hash = '#grove'; }); await p.waitForTimeout(16000); await p.screenshot({ path: 'raw/_v6.jpg', type: 'jpeg', quality: 80 });
  await p.tap("#places a[href=\"#gate\"]").catch(() => {});
  console.log('errors', errs); await b.close(); })();
