p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


rep("      this.ctx = new (window.AudioContext || window.webkitAudioContext)();",
    """      // iPhones mute this kind of audio when the ring switch is on silent unless the page says it is playing media
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* older browsers */ }
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.ctx.resume?.();   // still inside the tap, so the browser allows it
      const wake = () => { if (this.ctx.state !== 'running') this.ctx.resume?.(); };
      ['touchend', 'pointerup', 'keydown'].forEach((ev) => addEventListener(ev, wake, { passive: true }));
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });""")
open(p, 'w').write(s)
print('ok')
