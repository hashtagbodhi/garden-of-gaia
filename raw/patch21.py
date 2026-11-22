p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# Sarah stands at the near end of the cabinet; on arrival the camera greets her, then moves in to the shelf
rep("  s.witchPos = s.D.clone().addScaledVector(s.r, W / 2 + 1.1).addScaledVector(s.f, 1.6);   // beside the cabinet, clear of the title",
    "  s.witchPos = s.D.clone().addScaledVector(s.r, -(W / 2 - 0.4)).addScaledVector(s.f, 1.9);   // at the near end of the cabinet, where the first product is\n  s.arrive = { camPos: s.witchPos.clone().addScaledVector(s.r, 1.5).addScaledVector(s.f, 9.2).setY(4.1), camLook: s.witchPos.clone().addScaledVector(s.r, 1.5).setY(3.9) };")
rep("  if (changed) { travel.t = instant ? 1 : 0; flyTo(s, instant); moveWitch(s, instant);",
    "  if (changed) { travel.t = instant ? 1 : 0; const greet = s.lined && s.arrive && !instant && !reduce; flyTo(greet ? s.arrive : s, instant); s.hold = greet ? performance.now() + 4300 : 0; s.push = greet; moveWitch(s, instant);")
rep("    if (!selected && travel.t >= 0.999) { camPos.lerp(s.camPos, Math.min(1, dt * 10)); camLook.lerp(s.camLook, Math.min(1, dt * 10));",
    "    if (!selected && travel.t >= 0.999 && performance.now() > (s.hold || 0)) { const rate = s.push ? 1.9 : 10; camPos.lerp(s.camPos, Math.min(1, dt * rate)); camLook.lerp(s.camLook, Math.min(1, dt * rate)); if (s.push && camPos.distanceToSquared(s.camPos) < 0.01) s.push = false;")
# any touch during the greeting skips straight to the shelf
rep("canvas.addEventListener('pointerdown', (e) => {", "canvas.addEventListener('pointerdown', (e) => { if (current?.hold) { current.hold = 0; }")
rep("$('#focus-prev').onclick = () => {", "$('#focus-prev').onclick = () => { current.hold = 0; current.push = false;")
rep("$('#focus-next').onclick = () => {", "$('#focus-next').onclick = () => { current.hold = 0; current.push = false;")
# the witch does not follow the camera along the shelves any more: she stays by the cabinet
rep("if (witch && !witchHidden) { witchAt(s, tmp); witch.position.x += (tmp.x - witch.position.x) * Math.min(1, dt * 3.5); witch.position.z += (tmp.z - witch.position.z) * Math.min(1, dt * 3.5); }", "")
open(p, 'w').write(s)
c = open('src/style.css').read()
c += """
@media (max-width: 820px) { .place[data-home] .lede { font-size: 1rem; max-width: none; text-wrap: balance; } }
"""
open('src/style.css', 'w').write(c)
print('ok')
