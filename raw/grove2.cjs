// The new herb grove (drag to wander, photo markers, 3D models, plant page) and the Ask Sarah pop-out
const { chromium, devices } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  for (const [tag, opts] of [['d', { viewport: { width: 1440, height: 810 } }], ['m', devices['iPhone 13']]]) {
    const ctx = await b.newContext(opts); const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(tag + ' ' + String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(tag + ' ' + m.text()); });
    await p.addInitScript(() => { localStorage.setItem('gaia-21', 'true'); localStorage.setItem('gaia-view', JSON.stringify('garden')); });
    await p.goto('http://127.0.0.1:4175/#gate'); await p.waitForFunction('window.__ready', null, { timeout: 90000 });
    if (await p.isVisible('#enter-yes')) await p.click('#enter-yes'); await p.waitForTimeout(3000);
    await p.evaluate(() => { location.hash = '#grove'; }); await p.waitForTimeout(16000);
    await p.screenshot({ path: `raw/_g2-${tag}-0.jpg`, type: 'jpeg', quality: 78 });
    // drag the floor: left and towards us
    const vw = p.viewportSize(), cx = vw.width * 0.6, cy = vw.height * 0.45;
    if (tag === 'd') { await p.mouse.move(cx, cy); await p.mouse.down(); for (let i = 1; i <= 12; i++) await p.mouse.move(cx - i * 22, cy + i * 14); await p.mouse.up(); }
    else { const cdp = await ctx.newCDPSession(p); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] }); for (let i = 1; i <= 12; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx - i * 12, y: cy + i * 10 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    await p.waitForTimeout(2500); await p.screenshot({ path: `raw/_g2-${tag}-1.jpg`, type: 'jpeg', quality: 78 });
    await p.evaluate(() => { location.hash = '#grove--ginger'; }); await p.waitForTimeout(1800); await p.screenshot({ path: `raw/_g2-${tag}-plant.jpg`, type: 'jpeg', quality: 78 });
    console.log(tag, 'plant:', await p.textContent('#info-title'), '| products:', await p.locator('.plant-goods li').count(), '| uses:', await p.locator('.plant-uses b').allTextContents());
    await p.click('#info-close'); await p.waitForTimeout(800);
    await p.click('.ask-sarah'); await p.waitForTimeout(900); await p.screenshot({ path: `raw/_g2-${tag}-ask.jpg`, type: 'jpeg', quality: 78 });
    await ctx.close();
  }
  console.log('errors', errs); await b.close(); })();
