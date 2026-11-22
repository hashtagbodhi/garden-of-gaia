const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const bad = []; p.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
  await p.goto('http://127.0.0.1:4173/classic.html'); await p.waitForFunction('window.__ready'); await p.click('#age-yes');
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); } });
  await p.waitForTimeout(1500);
  const imgs = await p.evaluate(() => [...document.querySelectorAll('.story-photos img, .card-art img')].map((i) => [i.getAttribute('src').slice(-40), i.complete, i.naturalWidth, Math.round(i.getBoundingClientRect().width), Math.round(i.getBoundingClientRect().height)]));
  console.log(bad.slice(0, 5)); console.log(imgs.slice(0, 12).map((x) => x.join(' ')).join('\n')); await b.close(); })();
