const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 810 } });
  await p.goto('http://127.0.0.1:4173/'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
  await p.click('#enter-yes'); await p.waitForTimeout(1500);
  await p.evaluate(() => { location.hash = '#pond--blue-water-lily-flowers-organic-whole-flower'; }); await p.waitForTimeout(4000);
  console.log(JSON.stringify(await p.evaluate(() => { const d = window.__dbg, it = d.selected, r = (v) => [v.x, v.y, v.z].map((n) => +n.toFixed(2)); return { pos: r(it.pos), mesh: r(it.mesh.position), ped: r(it.ped.position), pedScale: r(it.ped.scale), top: it.top, h: it.h, row: it.row, cam: r(d.camPos), look: r(d.camLook), pedVisible: it.ped.visible, others: it.station.items.filter((x) => x.ped.visible).length, st: r(it.station.p) }; })));
  await b.close();
})();
