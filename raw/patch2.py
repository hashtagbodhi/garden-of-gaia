p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# ---- Sarah: a pose per place, and she arrives in a breath of light instead of sliding
i0 = s.index("function moveWitch(s, instant) {")
i1 = s.index("/* ---------- audio ---------- */")
s = s[:i0] + """const POSE = { gate: 'witch', tea: 'witch-sip', potions: 'witch-present', pond: 'witch-sip', altar: 'witch-present', roots: 'witch' };
let witchHidden = false, flash;
const witchOff = { v: 0 };
function witchAt(s, out) { return out.copy(s.witchPos).addScaledVector(s.r, witchOff.v); }
function setPose(s) {
  const n = tex[POSE[s.id]] ? POSE[s.id] : 'witch', sp = sprites[n], base = sprites.witch;
  witch.material.map = tex[n];
  witch.scale.x = (sp.w / sp.h) / (base.w / base.h);
  witchOff.v = (5.9 * (sp.w / sp.h - base.w / base.h)) / 2;   // keep her body where it was when the arm reaches out
}
function puffAt(pos) {
  if (!flash) { flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: softPuff(), color: 0xc8f58a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); scene.add(flash); }
  flash.position.set(pos.x, 3, pos.z); flash.scale.set(2, 4, 1); flash.material.opacity = 0.75;
  gsap.to(flash.scale, { x: 7, y: 10, duration: 0.8, ease: 'power2.out' }); gsap.to(flash.material, { opacity: 0, duration: 0.8, ease: 'power1.in' });
}
function moveWitch(s, instant) {
  const place = () => { setPose(s); const w = witchAt(s, new THREE.Vector3()); witch.position.set(w.x, 2.8, w.z); witch.rotation.y = Math.atan2(s.f.x, s.f.z); };
  if (instant || reduce) { place(); return; }
  puffAt(witch.position); witchHidden = true;
  gsap.delayedCall(1.15, () => { place(); witchHidden = false; puffAt(witch.position); });
}

""" + s[i1:]
rep("if (witch) { witch.position.x += (s.witchPos.x - witch.position.x) * Math.min(1, dt * 3.5); witch.position.z += (s.witchPos.z - witch.position.z) * Math.min(1, dt * 3.5); }",
    "if (witch && !witchHidden) { witchAt(s, tmp); witch.position.x += (tmp.x - witch.position.x) * Math.min(1, dt * 3.5); witch.position.z += (tmp.z - witch.position.z) * Math.min(1, dt * 3.5); }")
rep("  if (witch) witch.visible = !(portrait && selected && !paged);", "  if (witch) witch.visible = !witchHidden && !(portrait && selected && !paged);")
rep("  $('#place-line').textContent = home ?", "  $('#place-says').hidden = home || !s.says; $('#place-says-text').textContent = s.says ? `“${s.says}”` : '';\n  audio.place(s.id);\n  $('#place-line').textContent = home ?")

# ---- sound: a layer for each place, made on the fly so nothing audibly loops
rep("      this.loop('ambience', 0.5); this.loop('score', 0.34);", "      this.loop('ambience', 0.5); this.loop('ambience', 0.3, 0.84, 4); this.loop('score', 0.34);\n      this.layers(); this.place(current?.id);")
rep("  loop(n, vol) { const s = this.ctx.createBufferSource(); s.buffer = this.buf[n]; s.loop = true;", "  loop(n, vol, rate = 1, offset = 0) { const s = this.ctx.createBufferSource(); s.buffer = this.buf[n]; s.loop = true; s.playbackRate.value = rate;")
rep("s.connect(g).connect(this.master); s.start(); },\n  play(n,", "s.connect(g).connect(this.master); s.start(0, offset); },\n  play(n,")
rep("  set(on) { this.on = on;", """  layers() {
    const c = this.ctx, mk = () => { const g = c.createGain(); g.gain.value = 0; g.connect(this.master); return g; };
    const noise = c.createBuffer(1, c.sampleRate * 2, c.sampleRate), d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const bed = (out, type, f, q, vol) => { const n = c.createBufferSource(), b = c.createBiquadFilter(), g = c.createGain(); n.buffer = noise; n.loop = true; b.type = type; b.frequency.value = f; b.Q.value = q; g.gain.value = vol; n.connect(b).connect(g).connect(out); n.start(); return b; };
    const L = (this.L = { pond: mk(), altar: mk(), roots: mk(), tea: mk(), potions: mk() });
    const water = bed(L.pond, 'bandpass', 1100, 0.9, 0.1), lfo = c.createOscillator(), lg = c.createGain();   // moving water
    lfo.frequency.value = 0.31; lg.gain.value = 520; lfo.connect(lg).connect(water.frequency); lfo.start(); bed(L.pond, 'highpass', 4200, 0.5, 0.011);
    bed(L.altar, 'lowpass', 320, 0.7, 0.15); bed(L.tea, 'lowpass', 520, 0.6, 0.06);                            // ember bed, kettle simmer
    const blip = (out, f0, f1, dur, vol) => { const t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.02); };
    const crack = (out) => { const t = c.currentTime, n = c.createBufferSource(), b = c.createBiquadFilter(), g = c.createGain(); n.buffer = noise; b.type = 'bandpass'; b.frequency.value = 1800 + Math.random() * 3200; b.Q.value = 2; g.gain.setValueAtTime(0.05 + Math.random() * 0.12, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03 + Math.random() * 0.05); n.connect(b).connect(g).connect(out); n.start(t, Math.random()); n.stop(t + 0.1); };
    const sample = (out, n, vol, rate) => { const b = c.createBufferSource(), g = c.createGain(); b.buffer = this.buf[n]; b.playbackRate.value = rate; g.gain.value = vol; b.connect(g).connect(out); b.start(); };
    const bells = [1318.5, 1568, 1760, 1975.5, 2349.3];
    const every = (key, min, max, fn) => { const run = () => { if (this.on && this.cur === key && document.visibilityState === 'visible') fn(); setTimeout(run, min + Math.random() * (max - min)); }; setTimeout(run, max); };
    every('altar', 70, 420, () => crack(L.altar));
    every('potions', 350, 1500, () => blip(L.potions, 380 + Math.random() * 300, 900 + Math.random() * 500, 0.09, 0.035));
    every('potions', 6000, 13000, () => sample(L.potions, 'clink', 0.1, 1.1 + Math.random() * 0.5));
    every('tea', 5000, 11000, () => sample(L.tea, 'clink', 0.12, 0.8 + Math.random() * 0.4));
    every('roots', 1600, 4800, () => { const f = bells[(Math.random() * bells.length) | 0]; blip(L.roots, f, f * 0.999, 2.6, 0.028); blip(L.roots, f * 2.01, f * 2, 1.4, 0.007); });
  },
  place(id) { this.cur = id; if (!this.L) return; const t = this.ctx.currentTime; for (const [k, g] of Object.entries(this.L)) { g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(k === id ? 1 : 0, t, 0.7); } },
  set(on) { this.on = on;""")

# ---- adding to the basket is felt in the garden
rep("$('#detail-add').onclick = () => { addToBasket(chosen.id, qty);", "$('#detail-add').onclick = () => { selected.hop = 1; addToBasket(chosen.id, qty);")
rep("    it.mesh.position.y = it.pos.y + it.hover * 0.14 + Math.sin(t * 1.1 + it.ph) * 0.015 * k;",
    "    if (it.hop > 0) it.hop = Math.max(0, it.hop - dt * 2.2);\n    it.mesh.position.y = it.pos.y + it.hover * 0.14 + Math.sin(t * 1.1 + it.ph) * 0.015 * k + (it.hop > 0 ? Math.sin((1 - it.hop) * Math.PI) * 0.42 * k : 0);")
rep("it.halo.material.opacity = (it === selected ? 0.42 :", "it.halo.material.opacity = (it === selected ? 0.42 + (it.hop || 0) * 0.5 :")
open(p, 'w').write(s)

c = open('src/content.js').read()
a = "export const SALE = { line:"
assert a in c
c = c.replace(a, "export const SALE = { pct: 20, line:")
for sid, line in {'tea': 'Steep slow. Stay rooted.', 'potions': 'Every potion here is made in-house, in small batches.', 'pond': 'These flowers are picked by hand from our family lakes.', 'altar': 'Light something, slow down, clear the air.', 'roots': 'Earth is always here to nourish you.'}.items():
    a = "id: '%s'," % sid
    assert a in c
    c = c.replace(a, a + " says: '%s'," % line, 1)
open('src/content.js', 'w').write(c)

h = open('index.html').read()
a = '    <p id="place-line" class="lede"></p>'
assert a in h
h = h.replace(a, a + '\n    <p id="place-says" class="says" hidden><span id="place-says-text"></span> <cite>Sarah</cite></p>')
open('index.html', 'w').write(h)

css = open('src/style.css').read()
css += """
/* ---- Sarah's line, sale price ---- */
.says { font-style: italic; font-size: 1.15rem; line-height: 1.3; color: var(--glow); text-shadow: 0 1px 14px rgba(5, 12, 21, .95); max-width: 34ch; }
.says cite { font-family: var(--sans); font-style: normal; font-size: var(--t-label); font-weight: 550; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-2); margin-left: 6px; white-space: nowrap; }
.says cite::before { content: '\\2014\\00a0'; }
.price s { font-size: .55em; color: var(--ink-3); margin-left: 12px; text-decoration-thickness: 1px; }
.price em { font-family: var(--sans); font-style: normal; font-size: .36em; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--glow); margin-left: 10px; vertical-align: .35em; }
"""
open('src/style.css', 'w').write(css)

f = open('raw/finish.py').read()
a = "    crop = Image.fromarray(im[y0:y1 + 1, x0:x1 + 1])"
assert a in f
f = f.replace(a, "    crop = Image.fromarray(grade(im[y0:y1 + 1, x0:x1 + 1]))")
a = "out = {}\n"
assert a in f
f = f.replace(a, '''out = {}


def grade(im):
    """Sit a daylight product photo in the moonlit garden: cooler and deeper, a cool rim from the moon, a warm bounce from the lanterns."""
    rgb = im[..., :3].astype(np.float32) / 255.0
    a = im[..., 3].astype(np.float32) / 255.0
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    rgb = lum[..., None] * 0.1 + rgb * 0.9
    rgb = np.power(rgb, 1.1) * np.array([0.88, 0.94, 1.03], np.float32)
    k = max(2, int(im.shape[0] * 0.012))
    soft = ndi.gaussian_filter(a, k * 0.8)
    moon = np.clip(a - np.roll(np.roll(soft, k, 0), k, 1), 0, 1)       # edges facing upper-left
    lamp = np.clip(a - np.roll(np.roll(soft, -k, 0), -k, 1), 0, 1)     # edges facing lower-right
    rgb += ndi.gaussian_filter(moon, 1.2)[..., None] * np.array([0.42, 0.72, 1.0], np.float32) * 0.5
    rgb += ndi.gaussian_filter(lamp, 1.2)[..., None] * np.array([1.0, 0.66, 0.34], np.float32) * 0.2
    out_im = im.copy()
    out_im[..., :3] = (np.clip(rgb, 0, 1) * 255).astype(np.uint8)
    return out_im

''', 1)
open('raw/finish.py', 'w').write(f)
print('pass 2 ok')
