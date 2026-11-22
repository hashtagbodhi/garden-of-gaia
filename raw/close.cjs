const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } });
  await p.goto('http://127.0.0.1:4174/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  await p.click('#enter-yes'); await p.waitForTimeout(4000);
  for (const [h, n] of [['#tea--golden-sticky-chai-haldi-doodh-paste-golden-milk', 'c1'], ['#potions--blue-water-lily-tincture', 'c2'], ['#altar--frankincense-resin-boswellia-serrata', 'c3']]) { await p.evaluate((x) => { location.hash = x; }, h); await p.waitForTimeout(8000); await p.screenshot({ path: `raw/_${n}.jpg`, type: 'jpeg', quality: 78 }); }
  await b.close(); })();
