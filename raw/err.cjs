const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack || e).slice(0, 500)));
  await p.goto('http://127.0.0.1:4173/'); await p.waitForTimeout(6000); await b.close(); })();
