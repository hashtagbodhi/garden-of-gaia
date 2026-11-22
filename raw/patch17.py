p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# phones: render at the screen's real sharpness, and never trade sharpness for speed before glow
rep("let dpr = Math.min(devicePixelRatio, coarse ? 1.25 : 1.5);", "let dpr = Math.min(devicePixelRatio, coarse ? 2 : 1.5);\nconst dprFloor = coarse ? 1.5 : 0.8;")
rep("      if (fps < 42 && dpr > 0.8) { dpr = Math.max(0.8, dpr - 0.25); resize(); }\n      else if (fps < 34 && bloomPass.enabled) bloomPass.enabled = false;",
    "      if (fps < 42 && bloomPass.enabled) bloomPass.enabled = false;\n      else if (fps < 36 && dpr > dprFloor) { dpr = Math.max(dprFloor, dpr - 0.25); resize(); }")
# phones: the product in front of you is larger
rep("    it.row = 0; it.pedType = i % 2; it.top = i % 2 ? 0.95 : 0.45; it.out = null;\n    it.pos.copy(s.D).addScaledVector(s.r, i * STEP).addScaledVector(s.f, it.jz * 0.5).setY(it.top + it.h / 2 - 0.05);",
    "    it.row = 0; it.pedType = i % 2; it.top = i % 2 ? 0.95 : 0.45; it.out = null; it.k = 1.35;\n    it.pos.copy(s.D).addScaledVector(s.r, i * STEP).addScaledVector(s.f, it.jz * 0.5).setY(it.top + (it.h * it.k) / 2 - 0.05);")
rep("const STEP = 2.7;", "const STEP = 3.3;")
rep("    const sc = 1 + it.hover * 0.07; it.mesh.scale.set(it.w * sc, it.h * sc, 1);", "    const sc = (1 + it.hover * 0.07) * (it.station.lined ? it.k || 1 : 1); it.mesh.scale.set(it.w * sc, it.h * sc, 1);")
# the product in front is shown at full brightness, the others slightly back
rep("    goal.copy(selected && it !== selected && it.station === current ? dim : rest).lerp(white, it.hover);", "    goal.copy(selected && it !== selected && it.station === current ? dim : rest).lerp(bright, it.hover);")
rep("white = new THREE.Color(0xf2f2f2),", "white = new THREE.Color(0xf2f2f2), bright = new THREE.Color(0xffffff),")
rep("innerHeight * (current?.items.length ? 0.15 : 0.17)", "innerHeight * (current?.items.length ? 0.17 : 0.17)")
open(p, 'w').write(s)

c = open('src/style.css').read()
c += """
/* ---- eyebrows in normal case ---- */
.label, .focus .label, .prose h3, .prose summary, .index-list h3, .menu .label, .index-filter .label { text-transform: none; letter-spacing: .02em; font-size: .86rem; font-weight: 500; }
.focus .label { font-size: .84rem; letter-spacing: .02em; }
/* phones: keep the dark wash below the product, not over it */
@media (max-width: 820px) {
  .veil { background: linear-gradient(0deg, rgba(5, 12, 21, .96) 0, rgba(5, 12, 21, .9) 22%, rgba(5, 12, 21, .35) 31%, rgba(5, 12, 21, 0) 38%); }
}
"""
open('src/style.css', 'w').write(c)
print('ok')
