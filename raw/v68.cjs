const { chromium, devices } = require('playwright'); const U = 'http://127.0.0.1:4175/';
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const c = await b.newContext({ ...devices['iPhone 13'] }); const p = await c.newPage();
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
  await p.goto(U + '#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); if (await p.isVisible('#enter-yes')) await p.tap('#enter-yes'); await p.waitForTimeout(3000);
  await p.evaluate(() => { location.hash = '#pond--white-lotus-flower-1'; }); await p.waitForTimeout(9000);
  console.log(JSON.stringify(await p.evaluate(() => { const g = document.querySelector('#detail .gallery'); const r = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.width), Math.round(b.height)]; }; return { g: g && r(g), hidden: g?.hidden, disp: g && getComputedStyle(g).display, kids: g && [...g.children].map((k) => [r(k), k.firstElementChild && r(k.firstElementChild), k.firstElementChild?.complete, k.firstElementChild?.naturalWidth]), html: g?.outerHTML.slice(0, 300) }; })));
  await p.screenshot({ path: 'raw/_x0.jpg', type: 'jpeg', quality: 80 }); await b.close(); })();
