const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto('http://127.0.0.1:4174/classic.html#p--butterfly-chai-organic-whole-spice-blend-ceylon-black-tea'); await p.waitForFunction('window.__ready'); await p.waitForTimeout(800);
  console.log(await p.evaluate(() => [...document.querySelector('.pp').children].map((e) => `${e.className} ${Math.round(e.getBoundingClientRect().top)} ${getComputedStyle(e).position}`)));
  await b.close(); })();
