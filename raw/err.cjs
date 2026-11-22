const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage(); p.on('pageerror', (e) => console.log('PAGEERR', e.message, (e.stack || '').split('\n').slice(0, 3).join(' | '))); p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
  await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForTimeout(9000); await b.close(); })();
