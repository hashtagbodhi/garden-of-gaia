const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 640 } }); const p = await ctx.newPage();
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); }); await p.goto('http://127.0.0.1:4175/classic.html#shop'); await p.waitForTimeout(2500);
  await p.evaluate(() => { location.hash = '#p--blue-water-lily-tincture'; scrollTo(0, 0); }); await p.waitForTimeout(900);
  console.log(await p.evaluate(() => { const a = document.querySelector('.ask-sarah').getBoundingClientRect(), h = document.querySelector('#head').getBoundingClientRect(), g = document.querySelector('.pp-gallery img'); return JSON.stringify({ scrollY, ask: [Math.round(a.top), Math.round(a.bottom)], head: [Math.round(h.top), Math.round(h.bottom)], vh: innerHeight, img: g && [g.complete, g.naturalWidth, Math.round(g.getBoundingClientRect().top)], bodyT: getComputedStyle(document.body).transform, mainT: getComputedStyle(document.querySelector('#main')).transform }); }));
  await p.screenshot({ path: 'raw/_pp1.jpg', type: 'jpeg', quality: 70 }); await p.waitForTimeout(2500); await p.screenshot({ path: 'raw/_pp2.jpg', type: 'jpeg', quality: 70 });
  console.log(await p.evaluate(() => JSON.stringify({ scrollY, docH: document.documentElement.scrollHeight })));
  await b.close(); })();
