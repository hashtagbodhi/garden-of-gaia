const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript(() => { const T = window.setTimeout; window.setTimeout = (f, ms, ...a) => T(f, Math.min(ms || 0, 400), ...a); });   // run the slow schedule fast
  await p.goto('http://127.0.0.1:4173/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 }); await p.click('#enter-yes');
  await p.waitForTimeout(8000);
  const ok = await p.evaluate(async () => { const r = await fetch('assets/sfx/meow.mp3'); return r.ok; });
  console.log('meow file reachable:', ok, '| errors:', errs); await b.close(); })();
