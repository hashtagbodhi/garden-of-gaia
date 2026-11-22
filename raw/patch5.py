p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# Sarah's arrival: a faint, slow breath of light instead of a flash
rep("color: 0xc8f58a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));", "color: 0xdfeecb, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));")
rep("  flash.position.set(pos.x, 3, pos.z); flash.scale.set(2, 4, 1); flash.material.opacity = 0.75;\n  gsap.to(flash.scale, { x: 7, y: 10, duration: 0.8, ease: 'power2.out' }); gsap.to(flash.material, { opacity: 0, duration: 0.8, ease: 'power1.in' });",
    "  gsap.killTweensOf(flash.scale); gsap.killTweensOf(flash.material);\n  flash.position.set(pos.x, 3, pos.z); flash.scale.set(3, 5.5, 1); flash.material.opacity = 0;\n  gsap.to(flash.scale, { x: 5.5, y: 8.5, duration: 1.6, ease: 'sine.out' });\n  gsap.timeline().to(flash.material, { opacity: 0.2, duration: 0.45, ease: 'sine.out' }).to(flash.material, { opacity: 0, duration: 1.15, ease: 'sine.inOut' });")
# product halos, at rest, on hover, when open, and when added to the basket
rep("it.halo.material.opacity = (it === selected ? 0.42 + (it.hop || 0) * 0.5 : 0.14 + it.hover * 0.3) * (0.85 + 0.15 * Math.sin(t * 1.3 + it.ph));",
    "it.halo.material.opacity = (it === selected ? 0.16 + (it.hop || 0) * 0.14 : 0.06 + it.hover * 0.12) * (0.9 + 0.1 * Math.sin(t * 1.3 + it.ph));")
rep("color: 0x9fe86a, opacity: 0.2, transparent: true", "color: 0xcfe6b0, opacity: 0.06, transparent: true")
# light on the ground
rep("groundDiscs(pools, 0x58e0c8, 0.2, true);", "groundDiscs(pools, 0x58e0c8, 0.11, true);")
rep("0xffa24a, 0.22, true);", "0xffa24a, 0.13, true);")
# overall bloom
rep("0.3, 0.45, 0.86);", "0.2, 0.4, 0.88);")
open(p, 'w').write(s)
print('ok')
