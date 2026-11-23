// The herb garden, drawn in code: a Mediterranean garden you walk into.
// No WebGL and no 3D software: an SVG landscape for the far distance, a CSS 3D lawn and reflecting pool,
// painted flower borders and plants standing at depth, and a checked tablecloth across the front.
// Scroll, swipe or use the arrow keys to walk in; the pointer sways the view; tap a plant to meet it.
import riv from './riv.json';

const P = 1000;                                   // perspective, in world pixels
const LAYOUT = [                                   // where each plant stands: x across, z into the garden
  ['lavender', -440, -1350], ['hibiscus', 450, -2250], ['blue-lotus', 0, -3600],
  ['cinnamon', -440, -4300], ['mullein', 450, -5200], ['ginger', -440, -6100], ['moringa', 450, -7000],
  ['butterfly-pea', -440, -7900], ['calendula', 450, -8800], ['orange', 0, -9600],
];
const BORDERS = Array.from({ length: 12 }, (_, i) => [[-820, -300 - i * 820, i % 2 ? 'border-r' : 'border-l'], [820, -720 - i * 820, i % 2 ? 'border-l' : 'border-r']]).flat();
const CYPRESS = Array.from({ length: 7 }, (_, i) => [[-1180, -1100 - i * 1500], [1180, -1800 - i * 1500]]).flat();

const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html) n.innerHTML = html; return n; };

// the far distance: sky, a V of sea between two hills of round topiary, cypresses, a white tower, an orange tree
function landscape() {
  const cyp = (x, y, h, w) => `<g transform="translate(${x} ${y})"><path d="M0 0 C ${-w * .62} ${-h * .3} ${-w * .5} ${-h * .78} 0 ${-h} C ${w * .5} ${-h * .78} ${w * .62} ${-h * .3} 0 0 Z" fill="url(#cy)"/><path d="M${w * .08} ${-h * .1} C ${w * .4} ${-h * .4} ${w * .3} ${-h * .8} 0 ${-h}" stroke="#1d3d1f" stroke-width="3" fill="none" opacity=".35"/></g>`;
  const bushes = (pts, r, fill) => pts.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${r * (0.82 + ((i * 37) % 10) / 28)}" fill="${fill}"/>`).join('');
  const leftHill = [[90, 470], [170, 430], [250, 450], [330, 420], [410, 470], [480, 520], [150, 520], [260, 520], [360, 540], [60, 560], [440, 580], [520, 600], [210, 590], [330, 610]];
  const rightHill = leftHill.map(([x, y]) => [1600 - x, y + 10]);
  return `<svg class="pg-sky" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f72c4"/><stop offset=".7" stop-color="#7f9fdc"/><stop offset="1" stop-color="#a9c0ec"/></linearGradient>
      <linearGradient id="se" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2346a8"/><stop offset="1" stop-color="#3a62c2"/></linearGradient>
      <radialGradient id="hl" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#5b9a3e"/><stop offset="1" stop-color="#2f6a2c"/></radialGradient>
      <radialGradient id="bu" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6fae4a"/><stop offset=".7" stop-color="#3f7c33"/><stop offset="1" stop-color="#2d5e27"/></radialGradient>
      <radialGradient id="bu2" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#5f9d42"/><stop offset=".75" stop-color="#346e2d"/><stop offset="1" stop-color="#244f22"/></radialGradient>
      <linearGradient id="cy" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3d7436"/><stop offset=".55" stop-color="#28562a"/><stop offset="1" stop-color="#1b3d1d"/></linearGradient>
      <linearGradient id="lw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f9c3c"/><stop offset="1" stop-color="#4b8a31"/></linearGradient>
    </defs>
    <rect width="1600" height="700" fill="url(#sk)"/>
    <path d="M560 445 L1040 445 L840 600 L760 600 Z" fill="url(#se)"/>
    <path d="M0 330 C 200 300 420 330 520 400 C 620 470 760 560 820 640 L 0 700 Z" fill="url(#hl)"/>
    <path d="M1600 330 C 1400 300 1180 330 1080 400 C 980 470 840 560 780 640 L 1600 700 Z" fill="url(#hl)"/>
    <g>${bushes(leftHill, 46, 'url(#bu)')}${bushes(rightHill, 46, 'url(#bu2)')}</g>
    <g>${bushes([[600, 560], [680, 600], [540, 610], [1000, 560], [920, 600], [1060, 610]], 40, 'url(#bu)')}</g>
    <g transform="translate(120 520)"><path d="M0 0 L -22 -36 L 0 -120 L 22 -36 Z" fill="#fbf7ef"/><rect x="-22" y="-36" width="44" height="60" fill="#f4efe4"/><path d="M0 -120 L 22 -36 L 0 -36 Z" fill="#dcd6c8"/></g>
    <g transform="translate(1390 520)"><rect x="-8" y="-40" width="16" height="60" fill="#6b4a2b"/><circle cx="0" cy="-80" r="70" fill="url(#bu)"/>${[[-30, -110], [20, -120], [40, -80], [-45, -70], [0, -60], [-10, -125], [55, -105], [-55, -100], [25, -55]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#ef7a2c"/>`).join('')}</g>
    ${cyp(330, 560, 360, 60)}${cyp(420, 590, 300, 52)}${cyp(1180, 560, 360, 60)}${cyp(1270, 590, 300, 52)}
    <rect y="636" width="1600" height="64" fill="url(#lw)"/>
  </svg>`;
}

export function mountRiviera({ A, names, counts, onOpen, onBackground, sound }) {
  const root = el('div', 'pg'); root.id = 'pg';
  root.innerHTML = landscape();
  const stage = el('div', 'pg-stage'), world = el('div', 'pg-world');
  stage.append(world); root.append(stage);
  // the lawn, laid flat and running away from you; a long reflecting pool down the middle
  const ground = el('div', 'pg-ground'); world.append(ground);
  const pool = el('div', 'pg-pool'); ground.append(pool);
  const items = [];
  const place = (node, x, z, w, h) => { node.style.width = `${w}px`; node.style.height = `${h}px`; node.dataset.z = z; items.push({ node, x, z, w, h }); world.append(node); };
  for (const [x, z] of CYPRESS) { const c = el('div', 'pg-cypress'); place(c, x, z, 250, 1250); }
  for (const [x, z, k] of BORDERS) { const m = riv[k], w = 1150, h = (w * m.h) / m.w, b = el('div', 'pg-border'); b.style.backgroundImage = `url(${A(`assets/riv/${k}.webp`)})`; place(b, x, z, w, h); }
  const plants = LAYOUT.filter(([k]) => riv[k] && names[k]);
  plants.forEach(([k, x, z], i) => {
    const m = riv[k], w = 560, h = (w * m.h) / m.w, n = el('button', 'pg-plant');
    n.type = 'button'; n.dataset.k = k; n.dataset.i = i; n.setAttribute('aria-label', `${names[k]}, ${counts[k]} products. Meet the plant`);
    n.innerHTML = `<img src="${A(`assets/riv/${k}.webp`)}" alt="" draggable="false"><span class="pg-tag"><b>${names[k]}</b><i>${counts[k]} ${counts[k] === 1 ? 'product' : 'products'}</i><u>Meet the plant</u></span>`;
    n.addEventListener('click', (e) => { e.stopPropagation(); onOpen(k); });
    n.addEventListener('pointerenter', () => sound('hover', i));
    place(n, x, z, w, h + 70);
  });
  const table = el('div', 'pg-table'); root.append(table);
  const hint = el('p', 'pg-hint', '<span>Scroll or swipe to walk in</span>'); root.append(hint);
  document.body.prepend(root); document.body.classList.add('pg-on');

  // ---- walking ----
  const last = plants.length ? -plants[plants.length - 1][2] : 2000, END = Math.max(1400, last - 900);
  let cam = 0, camT = 0, mx = 0, my = 0, mxT = 0, myT = 0, near = -1, walked = false;
  const walk = (d) => { camT = Math.max(0, Math.min(END, camT + d)); if (!walked && Math.abs(d) > 4) { walked = true; hint.classList.add('gone'); } };
  root.addEventListener('wheel', (e) => { if (!root.isConnected || document.body.classList.contains('reading') && !document.body.classList.contains('companion')) return; e.preventDefault(); walk((Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * 1.6); }, { passive: false });
  let drag = null;
  root.addEventListener('pointerdown', (e) => { drag = { y: e.clientY, x: e.clientX, moved: 0, id: e.pointerId }; });
  addEventListener('pointermove', (e) => {
    mxT = (e.clientX / innerWidth) * 2 - 1; myT = (e.clientY / innerHeight) * 2 - 1;
    if (!drag) return; const dy = drag.y - e.clientY, dx = drag.x - e.clientX; drag.moved += Math.abs(dy) + Math.abs(dx);
    walk((Math.abs(dy) > Math.abs(dx) ? dy : dx) * 3.2); drag.y = e.clientY; drag.x = e.clientX;
  });
  addEventListener('pointerup', () => { drag = drag && { ...drag, up: true }; setTimeout(() => { drag = null; }, 0); });
  root.addEventListener('click', (e) => { if (drag?.moved > 8) return; if (!e.target.closest('.pg-plant')) onBackground(); });
  addEventListener('keydown', (e) => { if (!root.isConnected || e.target.closest?.('input, textarea')) return; if (e.key === 'ArrowUp' || e.key === 'ArrowRight') walk(420); if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') walk(-420); });

  // ---- each frame: dolly the world, sway with the pointer, fade what passes beside you ----
  const sky = root.querySelector('.pg-sky');
  const tick = () => {
    cam += (camT - cam) * 0.085; mx += (mxT - mx) * 0.05; my += (myT - my) * 0.05;
    const narrow = innerWidth < 760, spread = narrow ? 0.5 : 1;
    world.style.transform = `translateZ(${cam.toFixed(1)}px) rotateY(${(mx * 2.2).toFixed(3)}deg) rotateX(${(-my * 0.8).toFixed(3)}deg)`;
    sky.style.transform = `translate3d(${(-mx * 14).toFixed(1)}px, ${(my * 6).toFixed(1)}px, 0) scale(${(1 + cam / 40000).toFixed(4)})`;
    let best = -1, bd = Infinity;
    for (const it of items) {
      const zr = it.z + cam, x = it.x * spread;   // how far ahead of you it is (negative = ahead)
      it.node.style.transform = `translate3d(${(x - it.w / 2).toFixed(1)}px, ${(-it.h).toFixed(1)}px, ${it.z}px)`;
      const o = zr > 380 ? Math.max(0, 1 - (zr - 380) / 260) : zr < -9800 ? Math.max(0, 1 - (-9800 - zr) / 1600) : 1;
      if (it.o !== o) { it.o = o; it.node.style.opacity = o.toFixed(3); it.node.style.visibility = o < 0.02 ? 'hidden' : 'visible'; }
      if (it.node.classList.contains('pg-plant')) { const d = Math.abs(zr + 1100); if (o > 0.5 && d < bd) { bd = d; best = +it.node.dataset.i; } }
    }
    if (best !== near) { if (near !== -1 && best !== -1) sound('step', best); near = best; root.querySelectorAll('.pg-plant').forEach((n) => n.classList.toggle('near', +n.dataset.i === best)); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return root;
}
