p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


rep("      setTimeout(ring, 6000);", """      setTimeout(ring, 6000);
      this.nature();""")
rep("  play(n) {", r"""  // Little signs of life, far apart: a bird now and then, a leaf stirring, and very rarely a cat or an owl.
  nature() {
    const c = this.ctx;
    // its own path: brighter than the tone (birds live up high) but still soft, and quiet overall
    this.wild = c.createGain(); this.wild.gain.value = 1;
    const air = c.createBiquadFilter(); air.type = 'lowpass'; air.frequency.value = 7500; air.Q.value = 0.4;
    const roomL = c.createDelay(1), fb = c.createGain(), wet = c.createGain();   // a touch of space so nothing sounds right in your ear
    roomL.delayTime.value = 0.19; fb.gain.value = 0.28; wet.gain.value = 0.22;
    this.wild.connect(air); air.connect(this.master2);
    air.connect(roomL); roomL.connect(fb).connect(roomL); roomL.connect(wet).connect(this.master2);
    const pan = (v) => { const p = c.createStereoPanner ? c.createStereoPanner() : c.createGain(); if (p.pan) p.pan.value = v; p.connect(this.wild); return p; };
    const live = () => this.on && document.visibilityState === 'visible';
    const every = (min, max, fn, first) => { const run = () => { if (live()) fn(); setTimeout(run, min + Math.random() * (max - min)); }; setTimeout(run, first ?? min); };
    // a bird: two to four short whistled notes with a quick upward or downward slide
    const bird = () => {
      const out = pan(Math.random() * 1.6 - 0.8), base = 2300 + Math.random() * 2200, n = 2 + ((Math.random() * 3) | 0), up = Math.random() < 0.5;
      let t = c.currentTime + 0.05;
      for (let i = 0; i < n; i++) {
        const o = c.createOscillator(), g = c.createGain(), d = 0.06 + Math.random() * 0.08, f = base * (1 + (Math.random() - 0.5) * 0.18);
        o.type = 'sine'; o.frequency.setValueAtTime(up ? f * 0.82 : f * 1.18, t); o.frequency.exponentialRampToValueAtTime(up ? f * 1.16 : f * 0.84, t + d);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.016, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(out); o.start(t); o.stop(t + d + 0.02); t += d + 0.04 + Math.random() * 0.09;
      }
    };
    // a leaf or two stirring
    const noise = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const rustle = () => {
      const t = c.currentTime, src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(), d = 0.5 + Math.random() * 0.7;
      src.buffer = noise; bp.type = 'bandpass'; bp.frequency.value = 2600 + Math.random() * 2400; bp.Q.value = 0.9;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.012, t + d * 0.35); g.gain.linearRampToValueAtTime(0, t + d);
      src.connect(bp).connect(g).connect(pan(Math.random() * 1.4 - 0.7)); src.start(t, Math.random() * 0.4); src.stop(t + d + 0.05);
    };
    const sample = (name, vol) => { const b = this.buf?.[name]; if (!b) return; const src = c.createBufferSource(), g = c.createGain(); src.buffer = b; g.gain.value = vol; src.connect(g).connect(pan(Math.random() * 1.2 - 0.6)); src.start(); };
    this.buf = {};
    ['meow', 'owl'].forEach(async (n) => { try { const r = await fetch(A(`assets/sfx/${n}.mp3`)); this.buf[n] = await c.decodeAudioData(await r.arrayBuffer()); } catch (e) { /* fine without it */ } });
    every(5000, 12000, bird, 3000);
    every(14000, 26000, rustle, 8000);
    every(55000, 110000, () => sample(Math.random() < 0.5 ? 'meow' : 'owl', 0.09), 40000);
  },
  play(n) {""")
# the tone keeps its soft filter; nature needs its own path to the speakers
rep("      this.master.connect(soft).connect(c.destination);",
    "      this.master.connect(soft).connect(c.destination);\n      this.master2 = c.createGain(); this.master2.gain.value = 0; this.master2.connect(c.destination);\n      this.master2.gain.linearRampToValueAtTime(on ? this.level : 0, c.currentTime + 4);")
rep("this.master.gain.linearRampToValueAtTime(on ? this.level : 0, t + 0.6); }",
    "this.master.gain.linearRampToValueAtTime(on ? this.level : 0, t + 0.6); this.master2?.gain.cancelScheduledValues(t); this.master2?.gain.linearRampToValueAtTime(on ? this.level : 0, t + 0.6); }")
open(p, 'w').write(s)
pk = open('raw/pack.cjs').read().replace("['img', 'img-s', 'cut', 'thumb', 'gal']", "['img', 'img-s', 'cut', 'thumb', 'gal', 'sfx']")
open('raw/pack.cjs', 'w').write(pk)
print('ok')
