p = 'src/main.js'
s = open(p).read()


def rep(a, b):
    global s
    assert a in s, 'MISSING: ' + a[:80]
    s = s.replace(a, b, 1)


# phones: quieter overall, highs rolled off (small speakers make hiss and chirps harsh), ambience well under the score
rep("      this.master = this.ctx.createGain(); this.master.gain.value = on ? 1 : 0; this.master.connect(this.ctx.destination);",
    "      this.level = coarse ? 0.6 : 1;\n      this.master = this.ctx.createGain(); this.master.gain.value = on ? this.level : 0;\n      if (coarse) { const soft = this.ctx.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 5200; soft.Q.value = 0.5; this.master.connect(soft).connect(this.ctx.destination); } else this.master.connect(this.ctx.destination);")
rep("      this.loop('ambience', 0.5); this.loop('ambience', 0.3, 0.84, 4); this.loop('score', 0.34);",
    "      this.loop('ambience', coarse ? 0.2 : 0.5); this.loop('ambience', coarse ? 0.12 : 0.3, 0.84, 4); this.loop('score', 0.34);")
rep("g.gain.setTargetAtTime(k === id ? 1 : 0, t, 0.7);", "g.gain.setTargetAtTime(k === id ? (coarse ? 0.45 : 1) : 0, t, 0.7);")
rep("if (this.master) this.master.gain.linearRampToValueAtTime(on ? 1 : 0, this.ctx.currentTime + 0.4);", "if (this.master) this.master.gain.linearRampToValueAtTime(on ? this.level : 0, this.ctx.currentTime + 0.4);")
open(p, 'w').write(s)
print('ok')
