# Night garden -> Riviera garden: remap every colour in the stylesheets by what it is doing.
# Dark grounds become linen and sea, pale type becomes navy ink, the lime glow becomes poppy, gold becomes cobalt,
# purples become terracotta and sea. Shadows stay shadows (soft navy). Masks are left alone.
import re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAVY, NAVY_RGB = '#1b2a52', (27, 42, 82)
LINEN_RGB = (246, 238, 222)

def rgba(rgb, a): return f'rgba({rgb[0]}, {rgb[1]}, {rgb[2]}, {a})'
DARK = {(5,12,21),(13,19,38),(7,11,22),(5,10,20),(8,12,26),(6,9,20),(8,19,27),(11,13,31),(12,10,30),(18,13,36),(8,10,26),(3,5,14),(14,16,36),(29,20,38),(0,0,0),(10,16,32),(4,10,22),(9,22,30)}
PALE = {(244,239,227),(246,240,226),(246,239,220),(246,238,221),(255,243,224),(255,255,255),(243,236,220),(246,220,151),(255,214,150),(255,236,200),(246,240,226)}
ACCENT = {  # rgb -> (as colour/fill, as glow)
  (185,246,85): ((212,80,47), (226,85,58)),      # lime -> poppy
  (240,195,90): ((35,64,143), (35,64,143)),      # gold -> cobalt
  (246,196,69): ((35,64,143), (35,64,143)),
  (217,178,86): ((35,64,143), (35,64,143)),
  (255,140,203): ((222,120,112), (233,143,138)), # pink -> blush
  (179,22,92): ((201,84,56), (201,84,56)),       # hibiscus -> terracotta
  (220,40,120): ((201,84,56), (201,84,56)),
  (163,38,111): ((217,101,63), (217,101,63)),
  (126,74,196): ((30,63,143), (30,63,143)), (150,60,170): ((30,63,143), (30,63,143)), (120,40,160): ((30,63,143), (30,63,143)),
  (60,38,110): ((30,63,143), (30,63,143)), (59,22,64): ((30,63,143), (30,63,143)),
  (28,130,104): ((47,91,46), (47,91,46)), (28,106,86): ((47,91,46), (47,91,46)), (23,56,42): ((47,91,46), (47,91,46)),
  (238,164,58): ((235,180,70), (235,180,70)),
}
HEX = {  # hex -> (as colour/text, as ground/fill)
  '#b9f655': ('#c8462b', '#e2553a'), '#d6ff8a': ('#c8462b', '#f07a5a'), '#e6ffb0': ('#e98a6b', '#f6b39a'), '#8fd13a': ('#b23b22', '#c8462b'), '#2f7d4b': ('#2f5b2e', '#2f5b2e'),
  '#f0c35a': ('#23408f', '#23408f'), '#f7dc97': ('#23408f', '#dfe6f6'), '#f6d98a': ('#23408f', '#dfe6f6'), '#f6c445': ('#23408f', '#23408f'), '#ffd98a': ('#23408f', '#dfe6f6'),
  '#ff8ccb': ('#c9605a', '#f2a7a0'), '#ff8fc0': ('#c9605a', '#f2a7a0'), '#ffd9ec': ('#c9605a', '#f9d9d3'),
  '#a3266f': ('#c8502f', '#d9653f'), '#7a1f63': ('#a8401f', '#b84a28'), '#3a1466': ('#1e3f8f', '#1e3f8f'), '#5a2a9c': ('#1e3f8f', '#2a4fa6'), '#1c6a56': ('#2f5b2e', '#3f7a35'), '#14463f': ('#2f5b2e', '#2f5b2e'),
  '#050c15': (NAVY, '#f6eede'), '#0b1020': (NAVY, '#f6eede'), '#0d1326': (NAVY, '#f6eede'), '#0c0a1e': (NAVY, '#f6eede'), '#0d1428': (NAVY, '#f6eede'), '#070b16': (NAVY, '#f6eede'), '#060914': (NAVY, '#f6eede'), '#03110a': (NAVY, '#f6eede'), '#0a1c14': (NAVY, '#eef0dc'), '#0f2a1c': (NAVY, '#e6ecd2'), '#0a1719': (NAVY, '#eef0dc'), '#17362c': (NAVY, '#e6ecd2'), '#0c1a16': (NAVY, '#efe6d2'), '#081726': (NAVY, '#f6eede'), '#2a1650': (NAVY, '#dfe6f6'), '#1a0f3a': (NAVY, '#f6eede'), '#0c1220': (NAVY, '#f6eede'),
  '#120d24': ('#fbf6ea', NAVY), '#0b1410': ('#fbf6ea', NAVY), '#10300f': ('#fbf6ea', NAVY),
  '#f6efdc': (NAVY, '#fbf6ea'), '#fff3e0': (NAVY, '#fbf6ea'), '#fff3d6': (NAVY, '#fbf6ea'), '#f4efe3': (NAVY, '#fbf6ea'), '#fff6dc': (NAVY, '#fbf6ea'), '#fff1d0': (NAVY, '#fbf6ea'), '#fff1c2': ('#23408f', '#f2cf6b'), '#e9d9b0': (NAVY, '#e9d9b0'), '#f3dcae': (NAVY, '#f3dcae'), '#e9c98f': ('#23408f', '#e9c98f'), '#fff': (NAVY, '#fff'), '#ffffff': (NAVY, '#fff'),
  '#000': ('#1b2a52', '#1b2a52'), '#000000': ('#1b2a52', '#1b2a52'),
}
WOOD = {'#2a1608', '#3a2009', '#1c0f05', '#3f6b2a'}   # the wooden sale tag keeps its wood
SHADOWY = ('shadow', 'filter', 'drop-shadow')

def role(prop):
    p = prop.strip().lower()
    if 'mask' in p: return 'mask'
    if any(k in p for k in SHADOWY): return 'shadow'
    if p in ('color', 'fill', '-webkit-text-fill-color', 'caret-color', 'stroke', 'text-decoration-color', 'outline-color'): return 'ink'
    return 'ground'   # background, border, box-shadow handled above, gradients

def map_rgba(m, r):
    rgb = tuple(int(x) for x in m.group(1, 2, 3)); a = m.group(4); a = '1' if a is None else a
    af = float(a)
    if rgb in DARK:
        if r == 'shadow': return rgba(NAVY_RGB, round(min(.42, af * .38), 3))
        if r == 'ink': return rgba(NAVY_RGB, a)
        return rgba(LINEN_RGB, a)
    if rgb in PALE:
        if r == 'shadow': return rgba((255, 255, 255), a) if af < .6 else rgba(NAVY_RGB, round(af * .12, 3))
        if r == 'ground' and rgb == (255, 255, 255): return rgba((255, 255, 255), round(min(1, af * 2.4 + .25), 3))
        return rgba(NAVY_RGB, a)
    if rgb in ACCENT:
        col, glow = ACCENT[rgb]; return rgba(glow if r == 'shadow' else col, round(af * (.5 if r == 'shadow' else 1), 3))
    return m.group(0)

def map_hex(m, r):
    h = m.group(0).lower()
    if h in WOOD: return m.group(0)
    if h not in HEX: return m.group(0)
    ink, ground = HEX[h]
    if r == 'shadow':
        if h in ('#000', '#000000') or ground.startswith('#f6ee') or ink == NAVY and ground.startswith('#f'):
            return 'rgba(27, 42, 82, .3)'
        return ground if ink != NAVY else 'rgba(27, 42, 82, .3)'
    return ink if r == 'ink' else ground

DECL = re.compile(r'([a-zA-Z-]+)(\s*:\s*)([^;{}]+)')
RGBA = re.compile(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)')
HEXRE = re.compile(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b')

def remap_css(text):
    def one(d):
        prop, sep, val = d.group(1), d.group(2), d.group(3)
        if prop.startswith('--'): return d.group(0)
        r = role(prop)
        if r == 'mask': return d.group(0)
        val = RGBA.sub(lambda m: map_rgba(m, r), val)
        val = HEXRE.sub(lambda m: map_hex(m, r), val)
        return prop + sep + val
    out, i = [], 0
    # only touch declarations inside rule blocks, never selectors (ids like #0b1020 do not exist, but be safe)
    for m in re.finditer(r'\{([^{}]*)\}', text):
        out.append(text[i:m.start() + 1]); out.append(DECL.sub(one, m.group(1))); i = m.end() - 1
    out.append(text[i:]); return ''.join(out)

if __name__ == '__main__':
    for f in sys.argv[1:]:
        p = os.path.join(ROOT, f); t = open(p).read(); n = remap_css(t); open(p, 'w').write(n); print(f, 'changed' if n != t else 'same')
