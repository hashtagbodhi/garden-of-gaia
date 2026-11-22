"""Build src/ingredients.json: a small plant glossary and, for each product, the plants inside it.

Notes are kept to character and traditional use, in the store's own register, and avoid health claims."""
import json, re

# key: (name, botanical, icon, note, match pattern)
G = {
 'blue-lotus':   ('Blue lotus', 'Nymphaea caerulea', 'flower', 'A sacred water lily, picked by hand from our family lakes. Traditionally sipped for calm, gentle mood and dreamy sleep.', r'blue (water ?)?l(otus|ily)|blue waterlily|nymphaea caerulea'),
 'white-lotus':  ('White water lily', 'Nymphaea alba', 'flower', 'The softer, more introspective sister of the blue lotus. Enjoyed for quiet, clear calm.', r'white (water )?l(ily|otus)|nymphaea alba'),
 'hibiscus':     ('Hibiscus', 'Hibiscus sabdariffa & rosa-sinensis', 'flower', 'Tart, ruby-red calyx and petals, rich in natural plant pigments. A cooling, refreshing cup hot or iced.', r'hibiscus|roselle'),
 'butterfly-pea':('Butterfly pea flower', 'Clitoria ternatea', 'flower', 'A deep blue flower used in Ayurveda, prized for its colour and antioxidant plant compounds.', r'butterfly pea'),
 'lavender':     ('Lavender', 'Lavandula angustifolia', 'flower', 'Soft floral herb traditionally used to settle the mind and ease into rest.', r'lavender'),
 'chamomile':    ('Chamomile', 'Matricaria chamomilla', 'flower', 'Delicate golden flowers with an apple-like sweetness. A classic evening herb.', r'chamomile'),
 'calendula':    ('Calendula', 'Calendula officinalis', 'flower', 'Sunny marigold petals long used in balms and teas for their soothing nature.', r'calendula'),
 'rose':         ('Rose', 'Rosa spp.', 'flower', 'Fragrant petals that bring sweetness and a gentle, heart-opening note.', r'rose petal|\brose\b(?!-)'),
 'saffron':      ('Saffron', 'Crocus sativus', 'flower', 'Hand-gathered threads of the crocus flower, treasured in beauty rituals for radiance.', r'saffron'),
 'ylang-ylang':  ('Ylang ylang', 'Cananga odorata', 'flower', 'A rich, sweet tropical flower that gives perfume its depth.', r'ylang'),
 'geranium':     ('Geranium', 'Pelargonium graveolens', 'flower', 'Egyptian rose geranium: green, floral and balancing.', r'geranium'),
 'damiana':      ('Damiana', 'Turnera diffusa', 'leaf', 'A fragrant Central American leaf traditionally enjoyed for a relaxed, uplifted mood.', r'damiana'),
 'mullein':      ('Mullein', 'Verbascum thapsus', 'leaf', 'Soft, fluffy leaves traditionally used to support the lungs and as a smooth base for herbal blends.', r'mullein'),
 'moringa':      ('Moringa', 'Moringa oleifera', 'leaf', 'The "miracle tree": tender leaves naturally rich in vitamins, minerals and antioxidants.', r'moringa'),
 'soursop':      ('Soursop leaf', 'Annona muricata', 'leaf', 'Glossy leaves of the graviola tree with gentle citrus notes, a traditional tea herb.', r'soursop|graviola'),
 'nettle':       ('Nettle', 'Urtica dioica', 'leaf', 'A mineral-rich green, long used as a nourishing everyday tonic.', r'nettle'),
 'skullcap':     ('Skullcap', 'Scutellaria lateriflora', 'leaf', 'A gentle nervine herb traditionally used to soften tension.', r'skullcap'),
 'lemon-balm':   ('Lemon balm', 'Melissa officinalis', 'leaf', 'A bright, lemony mint traditionally used to lift the mood and calm nerves.', r'lemon balm'),
 'peppermint':   ('Peppermint', 'Mentha × piperita', 'leaf', 'Cool and clearing, an ancient herb of the Egyptians and Romans.', r'peppermint'),
 'mugwort':      ('Mugwort', 'Artemisia vulgaris', 'leaf', 'An old dreaming herb, earthy and slightly bitter.', r'mugwort'),
 'wild-dagga':   ('Wild dagga', 'Leonotis leonurus', 'flower', 'Bright orange flowers from South Africa, traditionally smoked for a relaxed, uplifted mood.', r'wild dagga'),
 'white-sage':   ('White sage', 'Salvia apiana', 'leaf', 'A sacred cleansing herb, burned with reverence for the peoples who carry its tradition.', r'white sage'),
 'black-sage':   ('Black sage', 'Artemisia nova', 'leaf', 'Earthy, sweet and musky, used for deep cleansing and dreamwork.', r'black sage'),
 'sage':         ('Sage', 'Salvia spp.', 'leaf', 'Aromatic and clearing.', r'\bsage\b'),
 'rosemary':     ('Rosemary', 'Salvia rosmarinus', 'leaf', 'Traditionally used in hair rituals for an invigorated scalp.', r'rosemary'),
 'eucalyptus':   ('Eucalyptus', 'Eucalyptus globulus', 'leaf', 'Fresh, cooling and clearing.', r'eucalyptus'),
 'lemongrass':   ('Lemongrass', 'Cymbopogon citratus', 'wheat', 'Zesty grass with a clean citrus scent.', r'lemongrass'),
 'black-tea':    ('Ceylon black tea', 'Camellia sinensis', 'leaf-2', 'Bold Sri Lankan black tea. Naturally contains caffeine.', r'ceylon black tea|black tea'),
 'valerian':     ('Valerian root', 'Valeriana officinalis', 'plant-2', 'An earthy root traditionally taken in the evening for deep rest.', r'valerian'),
 'dandelion':    ('Dandelion root', 'Taraxacum officinale', 'plant-2', 'A gently bitter root traditionally used to support digestion and the liver.', r'dandelion'),
 'milk-thistle': ('Milk thistle', 'Silybum marianum', 'seedling', 'Seeds traditionally used to support the liver.', r'milk thistle'),
 'marshmallow':  ('Marshmallow root', 'Althaea officinalis', 'plant-2', 'A soft, soothing root traditionally used for the throat and gut.', r'marshmallow'),
 'turmeric':     ('Turmeric', 'Curcuma longa', 'plant-2', 'Golden Ceylon root, warming and traditionally used for balance and digestion.', r'turmeric|haldi'),
 'ginger':       ('Ginger', 'Zingiber officinale', 'plant-2', 'A warming, spicy root that brightens every blend.', r'ginger'),
 'cinnamon':     ('Ceylon cinnamon', 'Cinnamomum verum', 'tree', 'True cinnamon from Sri Lanka: sweet, delicate and warming.', r'cinnamon'),
 'cardamom':     ('Cardamom', 'Elettaria cardamomum', 'nut', 'Fragrant green pods, the soul of a masala chai.', r'cardamom'),
 'clove':        ('Clove', 'Syzygium aromaticum', 'nut', 'Intensely warming flower buds, used in Ayurveda for balance.', r'clove'),
 'star-anise':   ('Star anise', 'Illicium verum', 'clover', 'Sweet, liquorice-like star-shaped seed pods.', r'star anise'),
 'fennel':       ('Fennel seed', 'Foeniculum vulgare', 'grain', 'Sweet seeds traditionally taken after meals to ease digestion.', r'fennel'),
 'allspice':     ('Allspice', 'Pimenta dioica', 'nut', 'Berries that taste of clove, nutmeg and cinnamon at once.', r'all ?spice'),
 'black-pepper': ('Black pepper', 'Piper nigrum', 'pepper', 'A pinch of heat that helps turmeric do its work.', r'black pepper'),
 'black-seed':   ('Black seed', 'Nigella sativa', 'grain', 'A revered seed in Middle Eastern and South Asian hair and skin oils.', r'black seed|nigella'),
 'annatto':      ('Annatto seed', 'Bixa orellana', 'grain', 'Brick-red seeds that lend balms their warm golden colour.', r'annatto'),
 'elderberry':   ('Elderberry', 'Sambucus nigra', 'cherry', 'Dark berries traditionally simmered into syrup for the colder months.', r'elderberr'),
 'orange':       ('Orange', 'Citrus sinensis', 'lemon', 'Bright citrus peel and zest.', r'orange'),
 'lemon':        ('Lemon peel', 'Citrus limon', 'lemon', 'Fresh, sunny citrus.', r'lemon peel'),
 'lime':         ('Lime', 'Citrus aurantiifolia', 'lemon-2', 'Tangy, dried lime for a bright finish.', r'\blime\b'),
 'reishi':       ('Reishi', 'Ganoderma lucidum', 'mushroom', 'The mushroom of immortality, rich in antioxidants.', r'reishi'),
 'cacao':        ('Cacao butter', 'Theobroma cacao', 'nut', 'Pure Peruvian cacao butter, rich in fatty acids, that melts at skin temperature.', r'cacao butter'),
 'cacao-bean':   ('Ceremonial cacao', 'Theobroma cacao', 'nut', '100% pure, full-bean cacao from the Bribri people of Costa Rica.', r'bribri|ceremonial grade'),
 'frankincense': ('Frankincense', 'Boswellia serrata', 'flame', 'A sacred tree resin with a bright, resinous smoke, used in ritual for thousands of years.', r'frankincense|boswellia'),
 'dragons-blood':('Dragon\'s blood', 'Daemonorops draco', 'flame', 'A deep red plant resin, burned for protection.', r'dragon.?s blood'),
 'benzoin':      ('Benzoin', 'Styrax benzoin', 'flame', 'A warm, vanilla-like resin.', r'benzoin'),
 'oud':          ('Oud', 'Aquilaria spp.', 'tree', 'Rare, deep and woody agarwood.', r'\boud\b'),
 'sandalwood':   ('Sandalwood', 'Santalum album', 'tree', 'Creamy, grounding heartwood.', r'sandalwood'),
 'spruce':       ('Spruce', 'Picea spp.', 'trees', 'Fresh pine from the forest.', r'spruce'),
 'birch':        ('Birch', 'Betula spp.', 'trees', 'A crisp, woody note.', r'birch'),
 'palo-santo':   ('Palo santo', 'Bursera graveolens', 'tree', 'Holy wood from South America, gathered only after the tree has fallen naturally.', r'palo santo'),
 'lilac':        ('Lilac & lily of the valley', '', 'flower', 'Floral notes blended into the resin.', r'lily of the valley'),
 'vanilla':      ('Vanilla', 'Vanilla planifolia', 'seedling', 'Soft, sweet and comforting.', r'vanilla'),
 'almond-oil':   ('Almond oil', 'Prunus dulcis', 'droplet', 'A light, nourishing oil that carries the herbs into the skin.', r'almond oil'),
 'tallow':       ('Grass-fed tallow', '', 'bowl', 'Organic grass-fed beef tallow, one of the most skin-compatible moisturisers there is.', r'tallow'),
 'beeswax':      ('Beeswax', '', 'candle', 'Gives balms their soft, whipped body.', r'beeswax'),
 'magnesium':    ('Magnesium', 'Magnesium chloride', 'salt', 'A mineral that soaks in through the skin, traditionally used to relax muscles.', r'magnesium'),
 'witch-hazel':  ('Witch hazel', 'Hamamelis virginiana', 'droplet', 'A gentle, toning plant water.', r'witch hazel'),
 'oat-straw':    ('Oat straw', 'Avena sativa', 'wheat', 'A nourishing, mineral-rich green stem traditionally used to steady the nerves.', r'oat straw'),
 'acv':          ('Apple cider vinegar', '', 'apple', 'Raw, tangy and preserving.', r'apple cider'),
}
ORDER = list(G)
cat = json.load(open('src/catalog.json'))
SKIP = {'garden-of-gaia-gift-cards', 'cotton-reusable-tea-bags-unbleached', 'free-guide-creating-your-own-divine-pantry', 'brass-resin-burner-w-wooden-handle'}
FORCE = {  # where the text alone is ambiguous
    'blue-water-lily-flowers-organic-whole-flower': ['blue-lotus'], 'white-lotus-flower-1': ['white-lotus'],
    'ceylon-alba-cinnamon-true-ceylon-cinnamon': ['cinnamon'], 'wildcrafted-mullein': ['mullein'], 'butterfly-pea-flower-copy': ['butterfly-pea'],
    'moringa-leaves-organic-whole-leaves': ['moringa'], 'moringa-moringa': ['moringa'], 'soursop-leaves-organic-whole-leaves': ['soursop'],
    'full-spectrum-hibiscus-flower-premium-loose-leaf-tea': ['hibiscus'], 'frankincense-resin-boswellia-serrata': ['frankincense'],
    'palo-santo': ['palo-santo'], 'black-sage-smudge-stick': ['black-sage'], 'dragons-blood-sage-smudge-stick': ['white-sage', 'dragons-blood'],
    'lemon-balm-peppermint-smudge-stick': ['lemon-balm', 'peppermint'], 'blue-water-lily-tincture': ['blue-lotus'],
    'ceremonial-grade-costa-rican-cacao-bribri': ['cacao-bean'], 'theobroma-cacao-butter-massage-candle': ['cacao'],
    'theobroma-cacao-butter-massage-candles-orange': ['cacao', 'orange'], 'lotus-trinity-bundle-tea-tincture-blend': ['blue-lotus', 'mullein'],
    'pure-resin-incense-mount-athos': ['frankincense'], 'rising-star-resin-incense': ['frankincense', 'lilac'],
    'moringa-tincture-superfood-herbal-tincture': ['moringa'],
    'elderberry-syrup-immune-support-elixir': ['elderberry', 'ginger', 'clove', 'star-anise', 'marshmallow', 'cinnamon', 'mullein', 'soursop', 'orange', 'acv'],
    'lavender-loom-loose-leaf-herbal-tea-calming-tea-blend': ['lavender', 'chamomile', 'oat-straw'],
    'herbal-wellness-tinctures-potions-of-peace-bundle': ['moringa', 'blue-lotus', 'valerian', 'lavender', 'skullcap'],
}
products = {}
for c in cat:
    h = c['handle']
    if h in SKIP: continue
    if h in FORCE: products[h] = FORCE[h]; continue
    ing = [b for s in c['sections'] if re.search(r'ingredient|botanical|blend|inside', s['title'], re.I) for b in s['blocks']]
    txt = ' '.join(b.get('term', '') + ' ' + b['t'] for b in ing) if ing else ''
    txt += ' ' + c['lede'] + ' ' + ' '.join(b.get('term', '') + ' ' + b['t'] for s in c['sections'] for b in s['blocks'])
    txt = txt.lower()
    found = [k for k in ORDER if re.search(G[k][4], txt)]
    if 'white-sage' in found or 'black-sage' in found: found = [k for k in found if k != 'sage']
    if 'cacao-bean' in found and 'cacao' in found: found.remove('cacao-bean')
    products[h] = found[:12]
for h, v in products.items(): print(f'{h[:38]:38} {v}')
out = {'plants': {k: {'n': v[0], 'b': v[1], 'ic': v[2], 'note': v[3]} for k, v in G.items()}, 'products': products}
json.dump(out, open('src/ingredients.json', 'w'), ensure_ascii=False)
print(len(products), 'products,', sum(len(v) for v in products.values()), 'links')
