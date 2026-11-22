const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  const mobile = process.argv[2] === 'mobile';
  const p = await b.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, deviceScaleFactor: mobile ? 2 : 1 });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://127.0.0.1:' + (process.argv[3] || '4173') + '/classic.html'); await p.waitForFunction('window.__ready', null, { timeout: 30000 }); await p.waitForTimeout(600);
  const t = mobile ? 'm' : 'd'; const full = async (n) => { await p.waitForTimeout(300); await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 140)); } scrollTo(0, 0); }); await p.waitForTimeout(1500); await p.screenshot({ path: `raw/c-${t}-${n}.jpg`, type: 'jpeg', quality: 72, fullPage: true }); };
  await p.screenshot({ path: `raw/c-${t}-age.jpg`, type: 'jpeg', quality: 72 });
  await p.click('#age-yes');
  await full('home');
  for (const [h, n] of [['#shop-tea', 'shop'], ['#p--butterfly-chai-organic-whole-spice-blend-ceylon-black-tea', 'product'], ['#plants', 'plants'], ['#plant--blue-lotus', 'plant'], ['#gifts-25', 'gifts'], ['#story', 'story']]) { await p.evaluate((x) => { location.hash = x; }, h); await full(n); }
  await p.evaluate(() => { location.hash = '#p--blue-water-lily-flowers-organic-whole-flower'; }); await p.waitForTimeout(600);
  await p.click('.pp-row .btn-main'); await p.click('#basket-open'); await p.waitForTimeout(500); await p.screenshot({ path: `raw/c-${t}-basket.jpg`, type: 'jpeg', quality: 72 });
  console.log('errors:', errs.slice(0, 6)); await b.close(); })();
