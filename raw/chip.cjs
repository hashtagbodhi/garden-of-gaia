const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 640 } }); const p = await ctx.newPage();
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); }); await p.goto('http://127.0.0.1:4175/classic.html#shop'); await p.waitForTimeout(2500);
  console.log(await p.evaluate(() => { const a = [...document.querySelectorAll('a,button')].find((x) => x.textContent.trim() === 'Gifts' && x.getBoundingClientRect().left > 390); const par = a.parentElement, cs = getComputedStyle(par); a.scrollIntoView({ block: 'center' }); return [par.className, cs.overflowX, par.scrollWidth, par.clientWidth, cs.scrollbarWidth].join(' | '); }));
  await p.waitForTimeout(400); await p.screenshot({ path: 'raw/_chip.jpg', type: 'jpeg', quality: 80 }); await b.close(); })();
