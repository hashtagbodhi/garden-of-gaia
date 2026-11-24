"""Generate src/day-auto.css: an afternoon (light) twin of every colour rule in the shop's stylesheets.

Reads classic.css, sheet.css and consult.css, and for every rule that sets a colour, background or shadow,
writes the same selector under `html.day` with the colour turned for paper:
  light text on night  -> ink;   lime / gold / pink accents used as text -> deep green / dark gold / terracotta
  dark panels          -> paper; violet and blue glows -> sage and honey
  heavy black shadows  -> soft warm shadows
Rules for the footer (which stays deep green), the lime buttons, the ticker and the ribbons are left alone.
Run:  python3 raw/daygen.py
"""
import re, colorsys

SRC = ['src/classic.css', 'src/sheet.css', 'src/consult.css']
OUT = 'src/day-auto.css'
SKIP_SEL = re.compile(r'\.foot\b|\.foot-|\.btn-main|basket-pill|\.ticker|\.ribbon|theme-btn|\.age\b|\.age-|::selection|\.hero-scene|\.h-shade|\.h-sky|\.vhero|\.vh-|\.fm-vid|\.mn-ask|\.mn-gift|\.sale-tag|\.tag20|\.swing|\.cs-begin|\.cs-go|\.badge|\.tkbar|\.tk-')
PROPS = ('color', 'background', 'background-color', 'background-image', 'box-shadow', 'border-color', 'border', 'border-top', 'border-bottom', 'outline-color', 'fill', 'stroke', '-webkit-text-stroke-color', 'text-shadow', 'caret-color')

NAMED = {'white': (255, 255, 255, 1), 'black': (0, 0, 0, 1), '#fff': (255, 255, 255, 1), '#000': (0, 0, 0, 1)}
VARS = {'--leaf': (185, 246, 85, 1), '--cream': (246, 238, 221, 1), '--night': (13, 19, 38, 1), '--dk': (11, 16, 32, 1), '--deep': (7, 11, 22, 1),
        '--ink': (243, 236, 220, 1), '--ink-2': (243, 236, 220, .78), '--ink-3': (243, 236, 220, .5), '--plum': (59, 22, 64, 1), '--moss': (23, 56, 42, 1),
        '--marigold': (238, 164, 58, 1), '--hibiscus': (179, 22, 92, 1), '--lotus': (42, 58, 166, 1), '--paper': (255, 255, 255, .06)}

COLOR_RE = re.compile(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|var\(--[a-z0-9-]+\)')

def parse(c):
    c = c.strip()
    if c.startswith('var('):
        return VARS.get(c[4:-1].split(',')[0].strip())
    if c.startswith('#'):
        h = c[1:]
        if len(h) in (3, 4): h = ''.join(x * 2 for x in h)
        r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1
        return (r, g, b, a)
    m = re.findall(r'[\d.]+%?', c)
    if len(m) < 3: return None
    def num(x): return float(x[:-1]) * 2.55 if x.endswith('%') else float(x)
    r, g, b = num(m[0]), num(m[1]), num(m[2])
    a = float(m[3][:-1]) / 100 if len(m) > 3 and m[3].endswith('%') else (float(m[3]) if len(m) > 3 else 1)
    return (r, g, b, a)

def fmt(r, g, b, a):
    a = round(max(0, min(1, a)), 3)
    return f'rgba({int(r)}, {int(g)}, {int(b)}, {a})' if a < 1 else f'#{int(r):02x}{int(g):02x}{int(b):02x}'

def lum(r, g, b): return (0.299 * r + 0.587 * g + 0.114 * b) / 255

def hue(r, g, b):
    """hue in degrees, lightness, and a saturation that reads cream and grey as neutral (HSV, not HLS)"""
    h, l, _ = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    mx, mn = max(r, g, b), min(r, g, b)
    sv = (mx - mn) / mx if mx else 0
    return h * 360, l, sv

INK = (43, 29, 20)
PAPER = (255, 253, 247)
GREEN = (47, 107, 58)
GOLD = (138, 90, 18)
TERRA = (172, 72, 38)
SAGE = (143, 174, 126)
HONEY = (226, 179, 79)

def as_text(col):
    """a colour used for text or icons: make it read on paper"""
    r, g, b, a = col
    h, l, s = hue(r, g, b)
    if l < 0.45 and s < 0.5: return None                      # already dark: keep
    if s > 0.35:
        if 60 <= h < 170: base = GREEN                           # lime, leaf, mint
        elif 30 <= h < 60: base = GOLD                           # gold, marigold
        elif h < 30 or h >= 330: base = TERRA                    # pink, coral, red
        else: base = GREEN                                       # blue, violet: no violet in the day
    else:
        base = INK                                               # cream, white, grey
    return fmt(*base, max(a, 0.6) if base != INK else a)

def as_ground(col):
    """a colour used for a panel or a glow"""
    r, g, b, a = col
    h, l, s = hue(r, g, b)
    if l < 0.28:                                                 # night panels -> paper
        return fmt(*PAPER, min(1, a + 0.05) if a > .5 else a * .9)
    if s > 0.35 and 190 <= h < 330:                              # violet and blue glows -> sage
        return fmt(*SAGE, a * .7)
    if s > 0.35 and (h >= 330 or h < 20):                        # pink glows -> soft honey
        return fmt(*HONEY, a * .5)
    if l > 0.85 and a < 0.3:                                     # faint white veils on night -> faint ink veils on paper
        return fmt(*INK, a * .5)
    return None

def as_line(col):
    r, g, b, a = col
    h, l, s = hue(r, g, b)
    if l > 0.7 and s < 0.4: return fmt(*INK, min(.22, a * .8 + .05))   # cream hairlines
    if s > 0.35 and 190 <= h < 330: return fmt(*SAGE, a)
    if l < 0.25: return fmt(*INK, a * .25)
    return None

def as_shadow(col):
    r, g, b, a = col
    h, l, s = hue(r, g, b)
    if l < 0.25: return fmt(84, 56, 20, min(.28, a * .45))       # heavy black -> soft warm
    if s > 0.35 and 190 <= h < 330: return fmt(*SAGE, a * .6)
    if l > 0.8 and s < 0.3 and a < 0.4: return fmt(*INK, a * .5)  # cream rings
    return None

def convert(prop, val):
    kind = 'text' if prop in ('color', 'fill', 'stroke', '-webkit-text-stroke-color', 'caret-color') else \
           'shadow' if prop in ('box-shadow', 'text-shadow') else \
           'line' if prop.startswith('border') or prop == 'outline-color' else 'ground'
    if prop == 'background' and 'url(' in val: return None
    changed = False
    def rep(m):
        nonlocal changed
        c = parse(m.group(0))
        if not c: return m.group(0)
        n = {'text': as_text, 'shadow': as_shadow, 'line': as_line, 'ground': as_ground}[kind](c)
        if n is None: return m.group(0)
        changed = True
        return n
    out = COLOR_RE.sub(rep, val)
    if prop == 'text-shadow' and changed: return 'none'
    return out if changed else None

def blocks(css):
    """yield (prelude, body) for top-level rules; @media yields ('@media …', [(sel, body), …])"""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    i, n = 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0: break
        pre = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        body = css[j + 1:k - 1]
        if pre.startswith('@media') or pre.startswith('@supports'):
            yield pre, list(blocks(body))
        elif not pre.startswith('@'):
            yield pre, body
        i = k

def decls(body):
    for d in re.split(r';(?![^(]*\))', body):
        if ':' not in d: continue
        p, v = d.split(':', 1)
        yield p.strip().lower(), v.strip()

def scope(sel):
    out = []
    for s in re.split(r',(?![^(]*\))', sel):
        s = s.strip()
        if not s or SKIP_SEL.search(s): continue
        s = re.sub(r'^(html\s*)?(body\s*)?', '', s).strip() if s.startswith(('html', 'body')) else s
        if s.startswith(':root') or s == '' : continue
        out.append(f'html.day {s}' if s else 'html.day body')
    return ', '.join(out)

def rule(sel, body):
    sc = scope(sel)
    if not sc: return ''
    ds = []
    for p, v in decls(body):
        if p not in PROPS: continue
        imp = '!important' in v
        v2 = convert(p, v.replace('!important', '').strip())
        if v2: ds.append(f'{p}: {v2} !important')
    return f'{sc} {{ {"; ".join(ds)}; }}\n' if ds else ''

def run():
    out = ['/* generated by raw/daygen.py from the night stylesheets: do not edit by hand, run the script */\n']
    for f in SRC:
        css = open(f).read()
        out.append(f'\n/* ---- {f} ---- */\n')
        for pre, body in blocks(css):
            if isinstance(body, list):
                inner = ''.join(rule(s, b) for s, b in body if not isinstance(b, list))
                if inner: out.append(f'{pre} {{\n{inner}}}\n')
            else:
                out.append(rule(pre, body))
    open(OUT, 'w').write(''.join(out))
    print(OUT, sum(1 for l in ''.join(out).splitlines() if '{' in l), 'rules')

run()
