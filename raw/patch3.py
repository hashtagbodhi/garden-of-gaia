p = 'src/main.js'
s = open(p).read()
quiet = "      if (!s.lined && lx < -s.half * 0.15 && lx > -(s.half + 11) && lz > 3.4 && lz < 17) return false;   // calm ground where the title sits\n"
assert quiet in s
s = s.replace(quiet, "", 1)
anchor = "      const lx = (x - s.D.x) * s.r.x + (z - s.D.z) * s.r.z, lz = (x - s.D.x) * s.f.x + (z - s.D.z) * s.f.z;\n"
assert anchor in s
s = s.replace(anchor, anchor + quiet, 1)
open(p, 'w').write(s)
print('ok')
