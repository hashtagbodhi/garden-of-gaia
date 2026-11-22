const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } });
  const msgs = new Map(); p.on('console', (m) => { if (m.type() !== 'log') { const k = m.type() + ': ' + m.text().slice(0, 220); msgs.set(k, (msgs.get(k) || 0) + 1); } });
  const reqs = []; p.on('response', (r) => reqs.push(r.url()));
  const t0 = Date.now();
  await p.goto('http://127.0.0.1:4173/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  console.log('ready after', Date.now() - t0, 'ms;', reqs.length, 'requests before the gate opens');
  await p.click('#enter-yes'); await p.waitForTimeout(3000);
  await p.evaluate(() => { location.hash = '#potions--liver-love-tincture-liver-metabolic-digestive-support'; }); await p.waitForTimeout(3000);
  for (const [k, n] of msgs) console.log(n + 'x', k);
  console.log('total requests', reqs.length);
  await b.close();
})();
