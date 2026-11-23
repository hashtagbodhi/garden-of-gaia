const { chromium } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } }); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push(String(e))); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto(U + 'classic.html#story'); await p.waitForTimeout(2200); await p.evaluate(() => scrollTo(0, 330)); await p.waitForTimeout(700); await p.screenshot({ path: 'raw/_u0.jpg', type: 'jpeg', quality: 80 });
  await p.locator('.f-news').scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await p.locator('.f-news').screenshot({ path: 'raw/_u1.jpg', type: 'jpeg', quality: 85 });
  await p.goto(U + 'classic.html#shop-tea'); await p.waitForTimeout(2000); await p.evaluate(() => scrollTo(0, 420)); await p.waitForTimeout(800); await p.screenshot({ path: 'raw/_u2.jpg', type: 'jpeg', quality: 80 });
  await p.goto(U + 'classic.html#home'); await p.waitForTimeout(2000); await p.click('#ask-top'); await p.waitForTimeout(1500); await p.screenshot({ path: 'raw/_u3.jpg', type: 'jpeg', quality: 80 });
  await p.keyboard.press('Escape'); const st = p.locator('.stamp').first(); if (await st.count()) { await st.scrollIntoViewIfNeeded(); await p.waitForTimeout(600); await st.screenshot({ path: 'raw/_u4.jpg', type: 'jpeg', quality: 85 }).catch(() => {}); }
  await p.goto(U + '#grove'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(14000); await p.mouse.move(700, 400); await p.mouse.wheel(0, 9000); await p.waitForTimeout(2500); await p.screenshot({ path: 'raw/_u5.jpg', type: 'jpeg', quality: 80 });
  console.log('errors', errs); await b.close(); })();
