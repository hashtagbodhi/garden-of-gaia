const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const mob = process.argv[3] === 'm'; const p = await b.newPage({ viewport: mob ? { width: 390, height: 844 } : { width: 1440, height: 900 } });
  await p.goto('http://127.0.0.1:4174/classic.html#' + (process.argv[2] || 'home')); await p.waitForFunction('window.__ready'); await p.evaluate(() => localStorage.setItem('gaia-21', 'true'));
  console.log(await p.evaluate(() => { const W = document.documentElement.clientWidth; const out = [document.documentElement.scrollWidth, document.body.scrollWidth]; document.querySelectorAll('body *').forEach((e) => { const r = e.getBoundingClientRect(); if (r.right > W + 2 && out.length < 14) out.push(e.className + ' ' + Math.round(r.right)); }); return out; }));
  await b.close(); })();
