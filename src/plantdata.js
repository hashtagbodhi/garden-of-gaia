// What each plant is traditionally used for, shared by the garden and the shop.
export const PLANT_USES = {
  'blue-lotus': ['Calm', 'Dreamy sleep', 'Meditation'], 'white-lotus': ['Clarity', 'Stillness'], hibiscus: ['Heart', 'Hydration', 'Cycle'], 'butterfly-pea': ['Focus', 'Antioxidants'], lavender: ['Calm', 'Sleep', 'Skin'],
  chamomile: ['Calm', 'Digestion', 'Sleep'], calendula: ['Skin', 'Soothing'], rose: ['Heart', 'Skin', 'Mood'], saffron: ['Radiance', 'Mood'], 'ylang-ylang': ['Mood', 'Sensuality'], geranium: ['Balance', 'Skin'],
  damiana: ['Mood', 'Relaxation'], mullein: ['Lungs', 'Breath'], moringa: ['Energy', 'Nourishment'], soursop: ['Resilience', 'Evening calm'], nettle: ['Minerals', 'Seasonal ease'], skullcap: ['Nerves', 'Sleep'],
  'lemon-balm': ['Calm', 'Bright mood'], peppermint: ['Digestion', 'Clarity'], mugwort: ['Dreams', 'Cycle'], 'wild-dagga': ['Uplift', 'Ease'], 'white-sage': ['Cleansing', 'Ritual'], 'black-sage': ['Clearing', 'Rest'],
  sage: ['Cleansing', 'Clarity'], rosemary: ['Memory', 'Scalp'], eucalyptus: ['Breath', 'Freshness'], lemongrass: ['Freshness', 'Digestion'], 'black-tea': ['Energy', 'Focus'], valerian: ['Deep sleep', 'Nerves'],
  dandelion: ['Liver', 'Digestion'], 'milk-thistle': ['Liver', 'Protection'], marshmallow: ['Throat', 'Soothing'], turmeric: ['Inflammation', 'Digestion'], ginger: ['Digestion', 'Warmth', 'Immunity'],
  cinnamon: ['Warmth', 'Digestion'], cardamom: ['Digestion', 'Breath'], clove: ['Warmth', 'Immunity'], 'star-anise': ['Immunity', 'Digestion'], fennel: ['Digestion', 'Bloating'], allspice: ['Warmth', 'Digestion'],
  'black-pepper': ['Absorption', 'Warmth'], 'black-seed': ['Immunity', 'Scalp'], annatto: ['Colour', 'Antioxidants'], elderberry: ['Immunity', 'Seasonal wellness'], orange: ['Brightness', 'Vitamin C'], lemon: ['Brightness', 'Digestion'],
  lime: ['Freshness', 'Hydration'], reishi: ['Resilience', 'Calm'], cacao: ['Skin', 'Massage'], 'cacao-bean': ['Heart', 'Mood', 'Ceremony'], frankincense: ['Prayer', 'Skin', 'Calm'], 'dragons-blood': ['Protection', 'Ritual'],
  benzoin: ['Grounding', 'Sweet smoke'], oud: ['Grounding', 'Devotion'], sandalwood: ['Meditation', 'Skin'], spruce: ['Grounding', 'Breath'], birch: ['Muscles', 'Freshness'], 'palo-santo': ['Uplift', 'Blessing'],
  lilac: ['Softness', 'Scent'], vanilla: ['Comfort', 'Warmth'], 'almond-oil': ['Skin', 'Hair'], tallow: ['Skin barrier', 'Deep moisture'], beeswax: ['Protection', 'Skin'], magnesium: ['Muscles', 'Sleep'],
  'witch-hazel': ['Toning', 'Skin'], 'oat-straw': ['Nerves', 'Minerals'], acv: ['Digestion', 'Extraction'],
};

// broader reasons people come looking, for filtering the plant list
export const USE_GROUPS = {
  Calm: ['Calm', 'Nerves', 'Relaxation', 'Evening calm', 'Stillness', 'Ease', 'Grounding'],
  Sleep: ['Sleep', 'Dreamy sleep', 'Deep sleep', 'Dreams', 'Rest'],
  Digestion: ['Digestion', 'Liver', 'Bloating', 'Absorption'],
  'Breath & immunity': ['Immunity', 'Seasonal wellness', 'Lungs', 'Breath', 'Throat', 'Resilience', 'Seasonal ease'],
  Energy: ['Energy', 'Focus', 'Nourishment', 'Minerals', 'Clarity', 'Memory', 'Vitamin C', 'Brightness'],
  'Skin & body': ['Skin', 'Hair', 'Scalp', 'Skin barrier', 'Deep moisture', 'Toning', 'Radiance', 'Massage', 'Muscles'],
  Mood: ['Mood', 'Heart', 'Uplift', 'Bright mood', 'Sensuality', 'Comfort'],
  Ritual: ['Ritual', 'Meditation', 'Cleansing', 'Clearing', 'Prayer', 'Protection', 'Blessing', 'Devotion', 'Ceremony', 'Sweet smoke'],
};
export const groupsOf = (k) => Object.keys(USE_GROUPS).filter((g) => (PLANT_USES[k] || []).some((u) => USE_GROUPS[g].includes(u)));
export const photoCredit = (ph) => (ph?.by || '').replace(/^\(c\)\s*/, '').replace(/, some rights reserved \((.*?)\)/, ', $1').replace(/^no rights reserved.*/, 'public domain (CC0)');
