p = 'src/main.js'
s = open(p).read()
i0 = s.index("const audio = {")
i1 = s.index("};", i0) + 2
NEW = r"""// Sound, kept minimal: one very soft held tone that breathes slowly, a rare quiet bell, and a small
// chime when something goes in the basket. No music track, no nature recordings.
const audio = {
  ctx: null, master: null, on: true, level: coarse ? 0.5 : 0.7,
  async start(on) {
    this.on = on;
    try {
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older browsers */ }
      const c = (this.ctx = new (window.AudioContext || window.webkitAudioContext)());
      c.resume?.();
      const wake = () => { if (c.state !== 'running') c.resume?.(); };
      ['touchend', 'pointerup', 'keydown'].forEach((ev) => addEventListener(ev, wake, { passive: true }));
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
      this.master = c.createGain(); this.master.gain.value = 0;
      const soft = c.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 1800; soft.Q.value = 0.3;
      this.master.connect(soft).connect(c.destination);
      this.master.gain.linearRampToValueAtTime(on ? this.level : 0, c.currentTime + 4);
      // the held tone: a low D with its fifth and octave, each drifting in and out on its own slow breath
      [[146.83, 0.05, 0.05], [220, 0.028, 0.037], [293.66, 0.02, 0.061], [440, 0.006, 0.043]].forEach(([f, vol, rate], i) => {
        const o = c.createOscillator(), g = c.createGain(), l = c.createOscillator(), lg = c.createGain();
        o.type = 'sine'; o.frequency.value = f; o.detune.value = i * 3 - 4; g.gain.value = vol * 0.6;
        l.frequency.value = rate; lg.gain.value = vol * 0.4; l.connect(lg).connect(g.gain);
        o.connect(g).connect(this.master); o.start(); l.start();
      });
      // a bell now and then, never on a beat
      const notes = [587.33, 659.25, 739.99, 880, 987.77];
      const ring = () => { if (this.on && document.visibilityState === 'visible') this.bell(notes[(Math.random() * notes.length) | 0], 0.022, 4.5); setTimeout(ring, 9000 + Math.random() * 14000); };
      setTimeout(ring, 6000);
    } catch (e) { /* the garden still works in silence */ }
  },
  bell(f, vol, dur) {
    const c = this.ctx; if (!c) return; const t = c.currentTime;
    [[1, vol], [2.01, vol * 0.22]].forEach(([m, v]) => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.value = f * m; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur / m); o.connect(g).connect(this.master); o.start(t); o.stop(t + dur / m + 0.05); });
  },
  play(n) { if (n === 'chime') { this.bell(880, 0.05, 1.6); setTimeout(() => this.bell(1318.5, 0.035, 1.8), 110); } },   // every other effect is silent now
  place() {},
  set(on) { this.on = on; if (this.master) { const t = this.ctx.currentTime; this.master.gain.cancelScheduledValues(t); this.master.gain.linearRampToValueAtTime(on ? this.level : 0, t + 0.6); } if (this.ctx?.state === 'suspended') this.ctx.resume(); },
};"""
s = s[:i0] + NEW + s[i1:]
a = "  audio.start(withSound).then(() => audio.play('chime', 0.4));"
assert a in s
s = s.replace(a, "  audio.start(withSound);")
open(p, 'w').write(s)
pk = open('raw/pack.cjs').read().replace("['img', 'img-s', 'cut', 'thumb', 'audio', 'gal']", "['img', 'img-s', 'cut', 'thumb', 'gal']")
open('raw/pack.cjs', 'w').write(pk)
print('ok')
