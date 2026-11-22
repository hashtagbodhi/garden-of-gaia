p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# ---- every place with products gets a cabinet; the old tiered / row / ring layouts are bypassed
rep("  const per = portrait ? Math.min(3, n) : n <= 5 ? n : Math.ceil(n / (n > 10 ? 3 : 2));",
    "  return cabinetLayout(s);\n  const per = portrait ? Math.min(3, n) : n <= 5 ? n : Math.ceil(n / (n > 10 ? 3 : 2));")
rep("/* Phones: one row to swipe along. Sarah stands just behind it and walks with you. */\nconst STEP = 3.3;", """/* A worn wooden cabinet in each clearing. Products stand on its shelves; you see them all at a glance,
   then move along them one by one, close up. */
const CAB = { H: 10, shelves: [0.253, 0.418, 0.578, 0.75], rowH: [1.02, 1.2, 1.2, 1.26], x0: 0.105, x1: 0.89 };
function cabinetLayout(s) {
  const n = s.items.length, sp = sprites.cabinet, W = CAB.H * (sp.w / sp.h);
  s.cab = true; s.lined = portrait; s.mid = 0;
  s.D = s.p.clone().addScaledVector(s.f, s.flat ? s.propH / 2 + 2.5 : s.propH > 15 ? 8 : s.beside ? 3.2 : 6);
  const rows = Math.min(4, Math.max(n > 5 ? 2 : 1, Math.ceil(n / 4))), per = Math.ceil(n / rows), first = rows === 4 ? 0 : 1;
  const left = -W / 2 + CAB.x0 * W, innerW = (CAB.x1 - CAB.x0) * W, slot = innerW / per;
  s.items.forEach((it, i) => {
    const r = Math.min(3, first + Math.floor(i / per)), inRow = Math.min(per, n - Math.floor(i / per) * per), j = i % per;
    const k = Math.min((CAB.rowH[r] * 0.94) / it.h0, (slot * 0.84) / it.w0);
    it.w = it.w0 * k; it.h = it.h0 * k; it.k = 1; it.row = r; it.out = null;
    it.top = CAB.H * (1 - CAB.shelves[r]);
    const x = left + (innerW - inRow * slot) / 2 + (j + 0.5) * slot + it.jx * 0.3;
    it.pos.copy(s.D).addScaledVector(s.r, x).addScaledVector(s.f, 0.4).setY(it.top + it.h / 2);
  });
  s.half = W / 2;
  s.witchPos = s.D.clone().addScaledVector(s.r, -(W / 2 + 1.5)).addScaledVector(s.f, 1.2);
  if (s.beside) { const w = s.propH * sprites[s.prop].w / sprites[s.prop].h; s.propPos = s.D.clone().addScaledVector(s.r, W / 2 + w / 2 + 0.3).addScaledVector(s.f, -0.4); }
  else s.propPos = null;
  // the whole cabinet, standing in the garden
  const d = CAB.H / 0.74 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  s.wide = { camPos: s.D.clone().addScaledVector(s.f, d).setY(5.3), camLook: s.D.clone().setY(5.0) };
  if (portrait) { s.pan = Math.min(s.pan ?? 0, n - 1); s.panTarget = s.pan; panView(s); }
  else { s.camPos = s.wide.camPos; s.camLook = s.wide.camLook; }
  if (built) placeItems(s);
}
const STEP = 1;""")
# phones: the camera glides from product to product along the shelves
i0 = s.index("function panView(s) {")
i1 = s.index("const focusOf = (s) =>")
s = s[:i0] + """function panView(s) {
  const n = s.items.length, t = THREE.MathUtils.clamp(s.pan, 0, n - 1), a = s.items[Math.floor(t)], b = s.items[Math.min(n - 1, Math.floor(t) + 1)];
  const at = a.pos.clone().lerp(b.pos, t - Math.floor(t));
  s.camPos = at.clone().addScaledVector(s.f, 4.3).add(new THREE.Vector3(0, 0.15, 0));
  s.camLook = at;
}
""" + s[i1:]
rep("    const perPx = (2 * 9.4 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect) / innerWidth;", "    const perPx = 1 / (innerWidth * 0.6);")
rep("perPx * 1.15, -0.6, (current.items.length - 1) * STEP + 0.6);", "perPx, -0.3, (current.items.length - 1) * STEP + 0.3);")
rep("innerHeight * (current?.items.length ? 0.17 : 0.17)", "innerHeight * (current?.items.length ? 0.2 : 0.17)")

# sizes: remember the natural size, the cabinet scales from it
rep("  byId[p.station].items.push({ p, w: c.w * k, h: c.h * k,", "  byId[p.station].items.push({ p, w: c.w * k, h: c.h * k, w0: c.w * k, h0: c.h * k,")

# cabinet mesh per place; no stumps or ground shadows under shelf products
rep("    if (s.items.length) placeItems(s);", "    if (s.items.length) { s.cabMesh = flat('cabinet', CAB.H, s.D, s.f); s.cabMesh.material.color.set(0xd8d8d8); placeItems(s); }")
rep("  if (s.mesh && !s.flat) s.mesh.position.copy(s.propPos || s.p).setY(s.propH / 2 - 0.15);", "  if (s.mesh && !s.flat) s.mesh.position.copy(s.propPos || s.p).setY(s.propH / 2 - 0.15);\n  if (s.cabMesh) s.cabMesh.position.copy(s.D).setY(CAB.H / 2);")
rep("    const show = it.loaded && (paged || !(selected && it !== selected && it.station === selected.station)); it.mesh.visible = show; it.ped.visible = show;", "    const show = it.loaded && (paged || s.cab || !(selected && it !== selected && it.station === selected.station)); it.mesh.visible = show; it.ped.visible = show && !s.cab;")
rep("    it.shadow.visible = show; it.halo.visible = show;", "    it.shadow.visible = show && !s.cab; it.halo.visible = show && (!s.cab || it === hoverItem || it === selected);")
rep("    it.halo.position.copy(it.pos).addScaledVector(s.f, -0.25); it.halo.scale.set(it.w * 2.1, it.h * 1.7, 1);", "    it.halo.position.copy(it.pos).addScaledVector(s.f, -0.12); it.halo.scale.set(it.w * 2.1, it.h * 1.7, 1);")

# keyboard: left and right move along the shelves, in the wide view and in close-up
rep("  if (selected || !current?.items.length || e.target.closest?.('.panel, .index, .column')) return;",
    "  if (selected && !paged && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.closest?.('input, .panel, .index')) { const L = selected.station.items, n2 = L.length; select(L[(selected.index + (e.key === 'ArrowRight' ? 1 : -1) + n2) % n2], true); e.preventDefault(); return; }\n  if (selected || !current?.items.length || e.target.closest?.('.panel, .index, .column')) return;")
open(p, 'w').write(s)

h = open('index.html').read()
a = '    <div class="buy">'
assert a in h
h = h if 'detail-step' in h else h.replace(a, '    <p id="detail-step" class="step"><button id="detail-prev" class="arrow" aria-label="Previous product">&larr;</button><span id="detail-pos"></span><button id="detail-next" class="arrow" aria-label="Next product">&rarr;</button></p>\n' + a, 1)
open('index.html', 'w').write(h)

s = open(p).read()
rep("  $('#detail-kind').textContent = it.station.label;", "  $('#detail-kind').textContent = it.station.label; $('#detail-pos').textContent = `${it.index + 1} of ${it.station.items.length} on this shelf`;")
rep("$('#detail-close').onclick = () => closeOverlays();", "$('#detail-close').onclick = () => closeOverlays();\nconst stepSel = (d) => { const L = selected.station.items; select(L[(selected.index + d + L.length) % L.length], true); };\n$('#detail-prev').onclick = () => stepSel(-1); $('#detail-next').onclick = () => stepSel(1);")
open(p, 'w').write(s)

c = open('src/style.css').read()
c += """
/* ---- stepping along the shelf from a product ---- */
.step { display: flex; align-items: center; gap: 14px; font-family: var(--sans); font-size: var(--t-small); color: var(--ink-2); margin-top: 2px; }
.step .arrow { width: 36px; height: 36px; font-size: 1rem; }
@media (max-width: 820px) { .step { display: none; } }
"""
open('src/style.css', 'w').write(c)
print('ok')
