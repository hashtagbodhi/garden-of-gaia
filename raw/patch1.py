p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# ---- sale prices
rep("const priceLabel = (p) => (p.variants[0].price !== p.variants.at(-1).price ? `From ${money(p.variants[0].price)}` : p.variants[0].price === 0 ? 'Free' : money(p.variants[0].price));",
    "const now = (n) => +(n * (1 - (SALE.pct || 0) / 100)).toFixed(2);   // what the buyer pays today\nconst priceLabel = (p) => (p.variants[0].price !== p.variants.at(-1).price ? `From ${money(now(p.variants[0].price))}` : p.variants[0].price === 0 ? 'Free' : money(now(p.variants[0].price)));")
rep("total += v.price * l.qty; count += l.qty;", "total += now(v.price) * l.qty; count += l.qty;")
rep("textContent: [v.title, money(v.price)].filter(Boolean).join(' · ')", "textContent: [v.title, money(now(v.price))].filter(Boolean).join(' · ')")
rep("  $('#detail-price').textContent = chosen.price === 0 ? 'Free' : `$${(chosen.price * qty).toFixed(2)}`;",
    "  $('#detail-price').replaceChildren(chosen.price === 0 ? 'Free' : `$${(now(chosen.price) * qty).toFixed(2)}`, ...(SALE.pct && chosen.price ? [el('s', { textContent: `$${(chosen.price * qty).toFixed(2)}` }), el('em', { textContent: `${SALE.pct}% off` })] : []));")
rep("variantIndex.get(l.id).v.price * l.qty, 0), left = FREE_SHIPPING_AT - total - chosen.price * qty;",
    "now(variantIndex.get(l.id).v.price) * l.qty, 0), left = FREE_SHIPPING_AT - total - now(chosen.price) * qty;")

# ---- loading progress
rep("tex[name] = t; res(t); }, undefined, () => res(null));", "tex[name] = t; tick(); res(t); }, undefined, () => { tick(); res(null); });")
rep("const loadTex = ",
    "let loaded = 0; const toLoad = Object.keys(sprites).length + 2;\nconst tick = () => { loaded++; const b = $('#enter-yes'); if (b.disabled) b.textContent = `Gathering the garden… ${Math.min(99, Math.round((loaded / toLoad) * 100))}%`; };\nconst loadTex = ")

# ---- size classes
rep("  const k = Math.min(2.05 / c.w, 2.45 / c.h);",
    "  const t = `${p.handle} ${p.name}`.toLowerCase();\n  const cls = /tin|resin-incense|frankincense|candle|cacao/.test(t) ? 0.72 : /smudge|palo|tea-bags|gift-card/.test(t) ? 0.8 : /tincture|oil|spray|syrup|elixir/.test(t) && !/bundle/.test(t) ? 0.84 : /balm|sticky-chai/.test(t) && !/bundle|collection/.test(t) ? 0.78 : /bundle|collection|trinity|moringa-moringa/.test(t) ? 1.08 : 1;   // rough real-world size, so a tin is not as tall as a tea bag\n  const k = Math.min(2.05 / c.w, 2.45 / c.h) * cls;")

# ---- focal hierarchy: periphery dimmer and cooler
rep("iPhase = new Float32Array(list.length);", "iPhase = new Float32Array(list.length), iDim = new Float32Array(list.length);")
rep("iPhase[i] = o.phase; grounded.push(", "iPhase[i] = o.phase; iDim[i] = dimAt(o.x, o.z); grounded.push(")
rep("  g.setAttribute('iPhase', new THREE.InstancedBufferAttribute(iPhase, 1));",
    "  g.setAttribute('iPhase', new THREE.InstancedBufferAttribute(iPhase, 1));\n  g.setAttribute('iDim', new THREE.InstancedBufferAttribute(iDim, 1));")
rep("      attribute vec3 iPos; attribute vec2 iScale; attribute float iPhase;\n      uniform vec3 camRight; uniform float time; varying vec2 vUv; varying float vDepth; varying float vPulse;",
    "      attribute vec3 iPos; attribute vec2 iScale; attribute float iPhase; attribute float iDim;\n      uniform vec3 camRight; uniform float time; varying vec2 vUv; varying float vDepth; varying float vPulse; varying float vDim;")
rep("        vPulse = 0.9 + 0.22 * sin(time * 0.8 + iPhase * 3.0);", "        vPulse = 0.9 + 0.22 * sin(time * 0.8 + iPhase * 3.0); vDim = iDim;")
rep("      varying vec2 vUv; varying float vDepth; varying float vPulse;\n", "      varying vec2 vUv; varying float vDepth; varying float vPulse; varying float vDim;\n")
rep("        c.rgb *= mix(1.0, vPulse, smoothstep(0.45, 0.9, lum));",
    "        c.rgb *= mix(1.0, vPulse, smoothstep(0.45, 0.9, lum));\n        c.rgb *= mix(vec3(1.0), vec3(0.4, 0.5, 0.66), vDim * (1.0 - 0.55 * smoothstep(0.6, 0.95, lum)));   // away from the displays the garden goes quiet and blue")
rep("function billboardField(map, list) {",
    "const dimAt = (x, z) => { let d = 1e9; for (const s of STATIONS) { const c = s.D || s.p; d = Math.min(d, Math.hypot(x - c.x, z - c.z)); } return THREE.MathUtils.smoothstep(d, 10, 30); };\nfunction billboardField(map, list) {")
rep("  groundDiscs(pools, 0x58e0c8, 0.2, true);",
    "  groundDiscs(pools, 0x58e0c8, 0.2, true);\n  // warm lantern light where the products stand, against the cool moonlit garden\n  groundDiscs(STATIONS.filter((x) => x.items.length).map((x) => { const c = x.D.clone().addScaledVector(x.r, x.mid || 0); return { x: c.x, z: c.z, r: x.half + 3.5, sq: 0.7 }; }), 0xffa24a, 0.22, true);")
rep("white = new THREE.Color(0xdcdcdc), rest = new THREE.Color(0xaab4be)", "white = new THREE.Color(0xf2f2f2), rest = new THREE.Color(0xdfe2e4)")

# shadows fall away from the moon
rep("o.position.set(d.x, additive ? 0.05 : 0.035, d.z);", "o.position.set(d.x + (additive ? 0 : d.r * 0.32), additive ? 0.05 : 0.035, d.z + (additive ? 0 : d.r * 0.2));")
rep("    it.shadow.position.copy(it.pos).setY(0.04);", "    it.shadow.position.copy(it.pos).setY(0.04); it.shadow.position.x += 0.5; it.shadow.position.z += 0.3;")
rep("witchShadow.position.set(witch.position.x, 0.045, witch.position.z);", "witchShadow.position.set(witch.position.x + 0.7, 0.045, witch.position.z + 0.4);")

# quiet zone for the title block (desktop)
rep("      if (s.ring && Math.hypot",
    "      if (!s.lined && lx < -s.half * 0.15 && lx > -(s.half + 11) && lz > 3.4 && lz < 17) return false;   // calm ground where the title sits\n      if (s.ring && Math.hypot")

open(p, 'w').write(s)
print('pass 1 ok')
