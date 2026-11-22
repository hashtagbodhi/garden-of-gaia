import json
p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# keep from the later work: stepping between products, and quality changes that don't move the camera
rep("  if (selected || !current?.items.length || e.target.closest?.('.panel, .index, .column')) return;",
    "  if (selected && !paged && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.closest?.('input, .panel, .index')) { const L = selected.station.items, n2 = L.length; select(L[(selected.index + (e.key === 'ArrowRight' ? 1 : -1) + n2) % n2], true); e.preventDefault(); return; }\n  if (selected || !current?.items.length || e.target.closest?.('.panel, .index, .column')) return;")
rep("  $('#detail-kind').textContent = it.station.label;", "  $('#detail-kind').textContent = it.station.label; $('#detail-pos').textContent = `${it.index + 1} of ${it.station.items.length}`;")
rep("$('#detail-close').onclick = () => closeOverlays();", "$('#detail-close').onclick = () => closeOverlays();\nconst stepSel = (d) => { const L = selected.station.items; select(L[(selected.index + d + L.length) % L.length], true); };\n$('#detail-prev').onclick = () => stepSel(-1); $('#detail-next').onclick = () => stepSel(1);")
rep("function resize() {", "function applyQuality() { renderer.setPixelRatio(dpr); composer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight); }\nfunction resize() {")
rep("else if (fps < 36 && dpr > dprFloor) { dpr = Math.max(dprFloor, dpr - 0.25); resize(); }", "else if (fps < 36 && dpr > dprFloor) { dpr = Math.max(dprFloor, dpr - 0.25); applyQuality(); }")
open(p, 'w').write(s)
sp = json.load(open('src/sprites.json')); sp.pop('cabinet', None); json.dump(sp, open('src/sprites.json', 'w'))
print('ok', 'cabinet' in s)
