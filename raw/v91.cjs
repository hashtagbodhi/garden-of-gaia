const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 810 } }); await p.addInitScript(() => localStorage.setItem('gaia-21', 'true'));
  await p.goto('http://127.0.0.1:4175/classic.html#home'); await p.waitForTimeout(2000); await p.click('#ask-top'); await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => document.querySelector('.cs-begin').outerHTML.slice(0, 400)), await p.evaluate(() => getComputedStyle(document.querySelector('.cs-begin'), '::after').content));
  await p.locator('.cs-begin').screenshot({ path: 'raw/_v.jpg', type: 'jpeg', quality: 90 }); await b.close(); })();
