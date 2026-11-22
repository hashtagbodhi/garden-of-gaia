import json

p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# ---- lighter artwork on phones, decoded off the main thread
rep("const loader = new THREE.TextureLoader();",
    "const small = coarse || Math.min(innerWidth, innerHeight) < 700;   // phones get half-size artwork\nconst IMG = small ? 'assets/img-s' : 'assets/img';\nconst bitmaps = typeof createImageBitmap === 'function';\nconst loader = bitmaps ? new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' }) : new THREE.TextureLoader();\nconst asTex = (img) => { const t = bitmaps ? new THREE.Texture(img) : img; if (bitmaps) { t.flipY = false; t.needsUpdate = true; } t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };")
rep("const loadTex = (name, url = A(`assets/img/${name}.webp`)) => new Promise((res) => {", "const loadTex = (name, url = A(`${IMG}/${name}.webp`)) => new Promise((res) => {")
rep("  loader.load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); tex[name] = t; tick(); res(t); }, undefined, () => { tick(); res(null); });",
    "  loader.load(url, (img) => { const t = asTex(img); tex[name] = t; tick(); res(t); }, undefined, () => { tick(); res(null); });")

# ---- product cut-outs load when needed, not all at once before the gate opens
rep("      loader.load(cutUrl(it.p), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; it.mesh.material.map = t; it.mesh.material.needsUpdate = true; });\n",
    "      it.mesh.visible = false; it.loaded = false;\n")
rep("function placeItems(s) {", """const cutQueue = []; let cutBusy = 0;
function wantCuts(items, front) {
  for (const it of items) if (!it.loaded && !it.queued) { it.queued = true; front ? cutQueue.unshift(it) : cutQueue.push(it); }
  pumpCuts();
}
function pumpCuts() {
  while (cutBusy < 4 && cutQueue.length) {
    const it = cutQueue.shift(); cutBusy++;
    const done = () => { cutBusy--; pumpCuts(); };
    loader.load(cutUrl(it.p), (img) => { it.mesh.material.map = asTex(img); it.mesh.material.needsUpdate = true; it.loaded = true; done(); }, undefined, done);
  }
}
function placeItems(s) {""")
rep("    const show = paged || !(selected && it !== selected && it.station === selected.station);", "    const show = it.loaded && (paged || !(selected && it !== selected && it.station === selected.station));")
rep("  if (changed) buildLabels(s);", "  if (changed) { buildLabels(s); wantCuts(s.items, true); }")
rep("  window.__ready = true;", "  wantCuts(STATIONS.flatMap((x) => x.items), false);   // the rest trickle in behind the garden, four at a time\n  window.__ready = true;")

# ---- alpha lookup works for flipped bitmaps too
rep("  return d[(((1 - uv.y) * 127) | 0) * 512 + ((uv.x * 127) | 0) * 4 + 3] > 60;", "  return d[(((bitmaps ? uv.y : 1 - uv.y) * 127) | 0) * 512 + ((uv.x * 127) | 0) * 4 + 3] > 60;")

# ---- the 3D library's old clock is deprecated
rep("const clock = new THREE.Clock(),", "const clock = new THREE.Timer(),")
rep("  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime, k = reduce ? 0 : 1;", "  clock.update();\n  const dt = Math.min(clock.getDelta(), 0.05), t = clock.getElapsed(), k = reduce ? 0 : 1;")
open(p, 'w').write(s)

# ---- cache headers for Vercel
json.dump({
    "headers": [
        {"source": "/assets/(.*)\\.(js|css|woff2)", "headers": [{"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}]},
        {"source": "/assets/(img|img-s|cut|gal|audio)/(.*)", "headers": [{"key": "Cache-Control", "value": "public, max-age=604800, stale-while-revalidate=2592000"}]},
    ]
}, open('vercel.json', 'w'), indent=2)

# ---- only what the site needs to build
d = json.load(open('package.json'))
d['dependencies'] = {k: v for k, v in d.get('dependencies', {}).items() if k in ('three', 'gsap', '@fontsource-variable/eb-garamond', '@fontsource-variable/instrument-sans', '@phosphor-icons/core')}
d['devDependencies'] = {'vite': d.get('devDependencies', {}).get('vite', '^8.0.0')}
json.dump(d, open('package.json', 'w'), indent=2)
print('ok', d['dependencies'].keys())
