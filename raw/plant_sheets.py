# Build the Artlist jobs for the remaining grove plants: several plants per image (a sheet), to be split afterwards.
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = {
 'white-lotus': 'White water lily (Nymphaea alba): white star-shaped water lily flowers with golden centres rising above a small cluster of round floating lily pads (lily pads instead of a soil mound)',
 'ylang-ylang': 'Ylang ylang (Cananga odorata): a slender young tree with drooping glossy leaves and hanging clusters of long, twisted yellow-green petals',
 'geranium': 'Rose geranium (Pelargonium graveolens): a bushy plant with deeply lobed velvety leaves and small pink flowers with darker veins',
 'damiana': 'Damiana (Turnera diffusa): a small shrub with small serrated leaves and little five-petalled yellow flowers',
 'mullein': 'Mullein (Verbascum thapsus): a rosette of large woolly grey-green leaves with one tall spike of small yellow flowers',
 'moringa': 'Moringa (Moringa oleifera): a slender young tree with feathery leaves of many small oval leaflets and long hanging green drumstick pods',
 'soursop': 'Soursop (Annona muricata): a small tree with glossy dark oblong leaves and one large spiky green heart-shaped fruit',
 'nettle': 'Stinging nettle (Urtica dioica): upright stems with opposite serrated heart-shaped leaves and drooping greenish tassel flowers',
 'skullcap': 'Skullcap (Scutellaria lateriflora): a slender branching herb with toothed leaves and small blue-violet hooded flowers along its stems',
 'lemon-balm': 'Lemon balm (Melissa officinalis): a bushy clump of bright green crinkled heart-shaped toothed leaves with tiny white flowers',
 'peppermint': 'Peppermint (Mentha piperita): upright purple-tinged stems with dark green toothed pointed leaves and pale lilac flower spikes',
 'mugwort': 'Mugwort (Artemisia vulgaris): a tall herb with deeply cut leaves, dark green above and silvery beneath, topped with plumes of small reddish-brown buds',
 'wild-dagga': "Wild dagga, lion's tail (Leonotis leonurus): tall stems with stacked whorls of fuzzy bright orange tubular flowers",
 'white-sage': 'White sage (Salvia apiana): a shrubby rosette of silvery-white leaves with tall wands of small white flowers',
 'black-sage': 'Black sage (Salvia mellifera): a shrub with dark green wrinkled leaves and stacked whorls of pale lavender-blue flowers',
 'sage': 'Garden sage (Salvia officinalis): a bushy plant of grey-green pebbled oval leaves with violet-blue flower spikes',
 'rosemary': 'Rosemary (Salvia rosmarinus): an upright woody shrub with needle-like leaves and small pale blue flowers',
 'eucalyptus': 'Eucalyptus (Eucalyptus globulus): a young tree with round silvery-blue juvenile leaves, long sickle-shaped adult leaves, fluffy cream flowers and gumnuts',
 'lemongrass': 'Lemongrass (Cymbopogon citratus): a dense fountain-shaped clump of long arching green blades with pale bulbous bases',
 'black-tea': 'Tea bush (Camellia sinensis): a compact bush with glossy serrated leaves, bright young shoots and small white flowers with yellow stamens',
 'valerian': 'Valerian (Valeriana officinalis): tall stems with pinnate leaves and domed clusters of tiny pale pink flowers, pale roots showing at the base',
 'dandelion': 'Dandelion (Taraxacum officinale): a rosette of jagged leaves with yellow flowers, one round seed-head clock, and the taproot partly exposed',
 'milk-thistle': 'Milk thistle (Silybum marianum): a spiny plant with glossy white-marbled leaves and large purple thistle flower heads',
 'marshmallow': 'Marshmallow (Althaea officinalis): a tall plant with velvety grey-green leaves and pale pink five-petalled flowers',
 'turmeric': 'Turmeric (Curcuma longa): broad lance-shaped leaves, a pale pink-white cone flower, and bright orange rhizomes exposed at the soil',
 'cardamom': 'Cardamom (Elettaria cardamomum): tall leafy reed-like shoots with small green cardamom pods on trailing stems at the base',
 'clove': 'Clove (Syzygium aromaticum): a small evergreen tree with glossy leaves and clusters of pink-red clove buds',
 'star-anise': 'Star anise (Illicium verum): a small evergreen tree with glossy leaves and brown eight-pointed star-shaped fruits',
 'fennel': 'Fennel (Foeniculum vulgare): feathery thread-like foliage with flat yellow umbrella flower heads and a pale bulb at the base',
 'allspice': 'Allspice (Pimenta dioica): a small tree with glossy oval leaves and clusters of small green and brown berries',
 'black-pepper': 'Black pepper (Piper nigrum): a climbing vine on a short wooden post with heart-shaped leaves and hanging strings of green and red peppercorns',
 'black-seed': 'Black seed (Nigella sativa): a delicate plant with fine feathery leaves, pale blue-white flowers and inflated seed capsules',
 'annatto': 'Annatto (Bixa orellana): a shrub with heart-shaped leaves, pink flowers and clusters of spiky red seed pods, one open to show red seeds',
 'elderberry': 'Elderberry (Sambucus nigra): a shrub with pinnate leaves, flat creamy flower heads and drooping clusters of purple-black berries',
 'orange': 'Sweet orange (Citrus sinensis): a small tree with glossy leaves, white blossom and ripe oranges',
 'lemon': 'Lemon (Citrus limon): a small tree with glossy leaves, white blossom and bright yellow lemons',
 'lime': 'Lime (Citrus aurantiifolia): a small thorny tree with glossy leaves and small green limes',
 'reishi': 'Reishi (Ganoderma lucidum): glossy red-brown lacquered kidney-shaped mushrooms growing from a short mossy log',
 'cacao': 'Cacao tree (Theobroma cacao): a small tree with large leaves and ribbed yellow and red cacao pods growing straight from the trunk',
 'cacao-bean': 'Ceremonial cacao: one opened cacao pod showing white pulp-covered beans beside a small heap of dark roasted cacao beans',
 'dragons-blood': "Dragon's blood palm (Daemonorops draco): a rattan palm with spiny stems, feathery fronds and clusters of scaly red fruits coated in deep red resin",
 'benzoin': 'Benzoin (Styrax benzoin): a small tree with oval leaves, drooping white bell flowers and amber resin tears on the bark',
 'oud': 'Agarwood, oud (Aquilaria): a slender tree with glossy leaves, a cut in the trunk showing dark resinous heartwood',
 'sandalwood': 'Sandalwood (Santalum album): a small tree with slender drooping branches, oval leaves, tiny maroon flowers and pale wood chips at its base',
 'spruce': 'Spruce (Picea abies): a young conical spruce tree with hanging brown cones',
 'birch': 'Silver birch (Betula pendula): a young birch with white peeling bark and delicate drooping branches of small triangular leaves',
 'palo-santo': 'Palo santo (Bursera graveolens): a small gnarled tree with smooth grey bark and sparse feathery leaves, a few pale holy-wood sticks at its base',
 'lilac': 'Lilac with lily of the valley (Syringa vulgaris, Convallaria majalis): a lilac shrub with cone-shaped clusters of lilac-purple flowers, and small white bell flowers of lily of the valley at its foot',
 'vanilla': 'Vanilla orchid (Vanilla planifolia): a vine climbing a short post with fleshy leaves, pale yellow-green orchid flowers and long hanging vanilla pods',
 'almond-oil': 'Almond (Prunus dulcis): a small almond tree in pale pink-white blossom with fuzzy green almond fruits',
 'tallow': 'Grass-fed tallow: a lush tuft of pasture grass and clover with a small open glass jar of creamy white whipped balm resting in it',
 'beeswax': 'Beeswax: a chunk of golden honeycomb resting among small wildflowers with two honeybees on it',
 'magnesium': 'Magnesium: a cluster of translucent white mineral salt crystals rising from the mound with a faint blue inner glow',
 'witch-hazel': 'Witch hazel (Hamamelis virginiana): a shrub with broad scalloped leaves and spidery yellow ribbon-petalled flowers along its twigs',
 'oat-straw': 'Oat straw (Avena sativa): a clump of tall oat stalks with drooping green-gold oat seed heads',
 'acv': 'Apple (Malus domestica): a small apple tree with red apples and a few pink-white blossoms',
}
GROUPS = [
 ['white-lotus', 'geranium', 'damiana', 'skullcap', 'lemon-balm'], ['mullein', 'nettle', 'peppermint', 'mugwort', 'wild-dagga'],
 ['white-sage', 'black-sage', 'sage', 'rosemary', 'lemongrass'], ['valerian', 'dandelion', 'milk-thistle', 'marshmallow', 'black-seed'],
 ['turmeric', 'cardamom', 'fennel', 'black-pepper', 'vanilla'], ['ylang-ylang', 'moringa', 'soursop', 'eucalyptus', 'black-tea'],
 ['clove', 'star-anise', 'allspice', 'annatto', 'elderberry'], ['orange', 'lemon', 'lime', 'cacao', 'almond-oil'],
 ['dragons-blood', 'benzoin', 'oud', 'sandalwood', 'palo-santo'], ['spruce', 'birch', 'lilac', 'witch-hazel', 'acv'],
 ['reishi', 'cacao-bean', 'oat-straw'], ['tallow', 'beeswax', 'magnesium'],
]
assert sorted(sum(GROUPS, [])) == sorted(D), set(D) ^ set(sum(GROUPS, []))
WORD = {3: 'three', 5: 'five'}
jobs = []
for g in GROUPS:
    n = len(g)
    items = ' '.join(f'{i + 1}) {D[k]}.' for i, k in enumerate(g))
    jobs.append({'type': 'image', 'modelGroupId': 669, 'settings': {'aspect_ratio': '16:9', 'background': 'transparent', 'resolution': 'high', 'arlist_model': 'sunburst'},
      'prompt': f"A sprite sheet of {WORD[n]} separate subjects standing in one single row, evenly spaced from left to right with a wide clear empty gap between each, none touching or overlapping, all drawn large so they fill most of the image height, their bases aligned on the same line, each on its own small mossy mound of dark soil, isolated on a transparent background. From left to right: {items} Botanically accurate. Painted in a lush, luminous storybook style for an enchanted night garden: rich saturated colour, soft cool moonlight from the upper left, a gentle rim light, and a faint bioluminescent glow on petals and leaf edges. Front view at eye level, crisp clean edges. No text, no labels, no numbers, no pots, no frames, no background."})
json.dump({'groups': GROUPS, 'jobs': jobs}, open(os.path.join(ROOT, 'raw', 'plant_sheets.json'), 'w'), indent=1)
print(len(jobs), 'sheets for', len(D), 'plants'); print(json.dumps(jobs))
