const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1366, height: 700 } });
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
  await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3000);
  await p.evaluate(() => { location.hash = '#roots'; }); await p.waitForTimeout(8000);
  console.log(await p.evaluate(() => { const pl = document.querySelector('#place'), cs = getComputedStyle(pl); return JSON.stringify({ place: [Math.round(pl.getBoundingClientRect().top), Math.round(pl.getBoundingClientRect().bottom), cs.display, cs.gridTemplateRows, cs.height, cs.maxHeight, cs.top], kids: [...pl.children].filter((c) => c.offsetParent).map((c) => [c.id, Math.round(c.getBoundingClientRect().top), Math.round(c.getBoundingClientRect().bottom)]) }); }));
  await b.close(); })();
