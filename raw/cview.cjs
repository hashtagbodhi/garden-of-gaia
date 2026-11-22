const { chromium } = require('playwright');
(async () => { const b = await chromium.launch();
  for (const [t, vp, d] of [['d', { width: 1440, height: 900 }, 1], ['m', { width: 390, height: 844 }, 2]]) {
    const p = await b.newPage({ viewport: vp, deviceScaleFactor: d });
    await p.goto('http://127.0.0.1:4173/classic.html'); await p.waitForFunction('window.__ready'); await p.click('#age-yes'); await p.waitForTimeout(800);
    await p.screenshot({ path: `raw/cv-${t}-hero.jpg`, type: 'jpeg', quality: 80 });
    for (const [sel, n] of [['.grid', 'cards'], ['.story-band', 'story']]) { await p.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start' }), sel); await p.waitForTimeout(1200); await p.screenshot({ path: `raw/cv-${t}-${n}.jpg`, type: 'jpeg', quality: 80 }); }
    await p.close(); }
  await b.close(); })();
