// Places in the garden. Copy is drawn from the live store's own pages.
export const STORE = 'https://gardenofgaiaapothecary.com';
export const EMAIL = 'thegardenofgaiaapothecary@gmail.com';
export const INSTAGRAM = 'https://instagram.com/thegardenofgaiaapothecary';
export const FREE_SHIPPING_AT = 65;
// Current promotion on the live store. Clear both strings when it ends.
export const SALE = { pct: 20, line: '20% off everything through November 26, applied at checkout. Free U.S. shipping over $65.', note: '20% off is applied at checkout.' };
export const RECIPROCITY = { h: 'Farm direct, rooted in reciprocity', t: 'We source in direct trade with multigenerational regenerative farmers in Sri Lanka, partnering with agricultural projects that restore the earth while we harvest. Our bodies, our farming partners, the plants, the land we harvest from and the planet are all one garden to nourish with respect & reciprocity.' };
export const FAQ = [
  ['Where do your herbs come from?', 'Our herbs, flowers and spices come directly from regenerative family farms in Sri Lanka that use multigenerational growing practices and Ayurvedic knowledge.'],
  ['How should I store my herbs?', 'Keep them sealed in a cool, dry, dark place away from direct sunlight and moisture to keep their color, aroma and potency at their best.'],
  ['Do you offer free shipping?', 'Yes. Shipping is free on all orders over $65.'],
  ['Do you sell wholesale?', 'We do. Email us at thegardenofgaiaapothecary@gmail.com for wholesale herbal supply or to book our Elixir Bar for private events.'],
];

export const STATIONS = [
  {
    id: 'gate', name: 'The gate', icon: 'gate',
    pos: [0, 0, 30], face: [0, 0, 1], prop: 'gate', propH: 14,
    cam: [0, 3.8, 47], look: [0, 4.6, 20], witch: [0, 0, 31.2],
  },
  {
    id: 'tea', says: 'Steep slow. Stay rooted.', label: 'Loose leaf blends', dOff: 3.2, name: 'Tea meadow', icon: 'teatable',
    pos: [-17, 0, 6], face: [0.45, 0, 0.893], prop: 'teatable', propH: 5.2, beside: true, camH: 3.6, lookH: 3.1, side: -1,
    line: 'Loose leaf blends, mixed by hand in small batches. Steep one or two teaspoons in just-boiled water for five to seven minutes.',
  },
  {
    id: 'potions', says: 'Every potion here is made in-house, in small batches.', label: 'Potions of Peace', dOff: 4.6, name: 'Potion cart', icon: 'cart',
    pos: [17, 0, 6], face: [-0.45, 0, 0.893], prop: 'cart', propH: 8.4, camH: 3.8, lookH: 3.5, side: -1,
    line: 'Potions of Peace: tinctures, sprays and whipped tallow that call on Gaia’s medicine, curated in-house over full moon cycles.',
  },
  {
    id: 'pond', says: 'These flowers are picked by hand from our family lakes.', label: 'The Divine Pantry', dOff: 0, name: 'Lotus pond', icon: 'pond',
    pos: [-16, 0, -19], face: [0.3, 0, 0.954], prop: 'pond', propH: 19, flat: true, ring: true, camH: 5.2, side: -1,
    line: 'The Divine Pantry: sacred flowers, herbs and leaves, hand harvested from our family lakes and farms in Sri Lanka.',
  },
  {
    id: 'altar', says: 'Light something, slow down, clear the air.', label: 'Smoke and ritual tools', dOff: 3.2, name: 'Smoke altar', icon: 'altar',
    pos: [16, 0, -19], face: [-0.3, 0, 0.954], prop: 'altar', propH: 5.6, beside: true, camH: 3.6, lookH: 3.1, side: -1,
    line: 'Sage, smudges, palo santo, high quality resins and cacao butter candles, for clearing the air and slowing down.',
  },
  {
    id: 'grove', says: 'Every product starts with a plant.', label: 'Shop by plant', name: 'Herb grove', icon: 'fx6',
    pos: [-46, 0, -8], face: [0.96, 0, 0.28], prop: 'fx3', propH: 9, side: -1,
    cam: [-30, 5, -3], look: [-46, 2, -8], witch: [-44, 0, -3],
    line: 'Every flower, leaf, root, spice and resin we work with, glowing in one grove. Tap a plant to meet it and see everything we make with it.',
  },
  {
    id: 'roots', says: 'Earth is always here to nourish you.', label: 'Our roots', dOff: 7, minDist: 13, lookY: 4.4, name: 'The roots', icon: 'banyan',
    pos: [0, 0, -36], face: [0, 0, 1], prop: 'banyan', propH: 24, camH: 4.2, lookH: 4.4, side: -1, ringOut: 9,
    line: 'Sit under the banyan a while. This is where we keep our story, how to brew, wholesale and the Elixir Bar.',
  },
];

// Extra cards that hang at the roots: they open information instead of a product.
export const INFO = [
  {
    id: 'story', title: 'Our story', color: '#2e6b3b',
    html: `
      <p class="lede">Grown slow. Harvested by hand. Sent straight to your cup.</p>
      <h2 id="info-title">Our story</h2>
      <figure><img src="assets/img/story-harvest.webp" alt="Four people standing in a lake holding freshly picked blue water lilies, with a basin full of the flowers" loading="lazy"><figcaption>Harvest day at the family lakes in Sri Lanka.</figcaption></figure>
      <p>Every flower, root and spice comes directly from regenerative family farms in Sri Lanka that carry generations of Ayurvedic know-how. No middlemen, no fillers, nothing you can’t pronounce.</p>
      <h3>Organic and pesticide-free</h3>
      <p>Grown in nutrient-rich soil and hand harvested by multigenerational farmers. Our Blue Lotus is tested and backed by a COA.</p>
      <h3>Farmer direct</h3>
      <p>Since the founding of GGA, we have focused on nourishing relationships with multigenerational farmers in Sri Lanka. Farm-direct sourcing is our commitment to quality and to preserving the stewardship of regenerative farms.</p>
      <h3>Made in-house</h3>
      <p>Our products are handmade in small batches. Signature blends like Butterfly Chai and Full Spectrum Hibiscus set a higher standard for quality, flavor and efficacy.</p>
      <div class="pair"><img src="assets/img/story-blue-lotus-1.webp" alt="A blue water lily in bloom among lily pads" loading="lazy"><img src="assets/img/story-blue-lotus-2.webp" alt="A pale water lily opening on dark water" loading="lazy"></div>
      <a class="btn" href="#pond">See the Divine Pantry</a>`,
  },
  {
    id: 'brew', title: 'Brew it your way', color: '#3f5be0',
    html: `
      <p class="lede">Steep slow. Stay rooted.</p>
      <h2 id="info-title">Brew it your way</h2>
      <ol>
        <li><strong>Hot cup</strong><span>Steep 1–2 tsp in just-boiled water for 5–7 minutes. Add honey and lemon if you like.</span></li>
        <li><strong>Cold brew</strong><span>Steep overnight in the fridge for a strong herbal infusion that extracts over time. Pour over a glass of ice.</span></li>
        <li><strong>Sun brew</strong><span>Fill a jar with herbs and water and let the sunshine do the work for 3–4 hours.</span></li>
      </ol>
      <a class="btn" href="#tea">Shop loose leaf</a>`,
  },
  {
    id: 'wholesale', title: 'Wholesale herbs', color: '#e3247f',
    html: `
      <p class="lede">Organic, farm-direct, wholesale supply</p>
      <h2 id="info-title">Wholesale herbs and ingredients</h2>
      <p>We distribute premium organic herbal ingredients and our own Garden of Gaia line: loose leaf tea blends, herbal smoke blends, tinctures and wellness products, alongside whole flower Blue Lotus, every lotus and lily variant, whole flower herbs and leaves.</p>
      <p>Everything is grown and harvested on our family-operated farm in Sri Lanka: 100% organic, free from pesticides, fillers, additives or shortcuts, and tested to the highest standards.</p>
      <p>Trusted by brands, apothecaries, formulators and beverage companies building herbal products, infused beverages, teas and tinctures.</p>
      <a class="btn" href="https://gardenofgaiaapothecary.com/pages/wholesale-blue-water-lily" target="_blank" rel="noopener">Apply for wholesale</a>
      <p>Or write to <strong class="sel">thegardenofgaiaapothecary@gmail.com</strong></p>`,
  },
  {
    id: 'elixir', title: 'Elixir Bar', color: '#ffb21a', dark: true,
    html: `
      <p class="lede">Mocktails and elixirs, poured by us</p>
      <h2 id="info-title">The Elixir Bar</h2>
      <p>Bring our mocktail and elixir bar to your next event, or stock your shop and café with farm-direct herbs at wholesale prices.</p>
      <p>To book, write to <strong class="sel">thegardenofgaiaapothecary@gmail.com</strong></p>`,
  },
  {
    id: 'hello', title: 'Say hello', color: '#2a1033',
    html: `
      <p class="lede">Let’s stay connected</p>
      <h2 id="info-title">Say hello</h2>
      <p>Questions, wholesale orders or private Elixir Bar bookings? Drop us a note.</p>
      <p><strong class="sel">thegardenofgaiaapothecary@gmail.com</strong></p>
      <p><a href="https://instagram.com/thegardenofgaiaapothecary" target="_blank" rel="noopener">Find us on Instagram</a></p>
      <h3>The small print</h3>
      <p><a href="https://gardenofgaiaapothecary.com/policies/refund-policy" target="_blank" rel="noopener">Refund policy</a><br>
      <a href="https://gardenofgaiaapothecary.com/policies/privacy-policy" target="_blank" rel="noopener">Privacy policy</a><br>
      <a href="https://gardenofgaiaapothecary.com/policies/terms-of-service" target="_blank" rel="noopener">Terms of service</a><br>
      <a href="https://gardenofgaiaapothecary.com/policies/contact-information" target="_blank" rel="noopener">Contact information</a></p>`,
  },
];
