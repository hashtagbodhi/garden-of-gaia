const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [tag, opts] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage();
    await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
    await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
    if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3000);
    await p.evaluate(() => { location.hash = '#grove--ginger'; }); await p.waitForTimeout(9000);
    const info = await p.evaluate(() => { const c = document.querySelector('#info'), i = c.querySelector('.column-in'); const cs = (e) => { const s = getComputedStyle(e); return [s.overflowY, e.clientHeight, e.scrollHeight, s.position, s.touchAction].join(','); }; return { col: cs(c), inn: cs(i) }; });
    const bb = await (await p.$('#info')).boundingBox();
    if (tag === 'd') { await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.wheel(0, 600); }
    else { const cdp = await ctx.newCDPSession(p); const x = bb.x + bb.width / 2; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: 600 }] }); for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: 600 - i * 35 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    await p.waitForTimeout(800);
    console.log(tag, JSON.stringify(info), 'scrolled:', await p.evaluate(() => [document.querySelector('#info').scrollTop, document.querySelector('#info .column-in').scrollTop, scrollY]));
    await ctx.close(); }
  await b.close(); })();
