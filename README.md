# The Garden of Gaia Apothecary — immersive storefront

A one-screen 3D garden that is also the shop. Visitors walk between six places (the gate, tea meadow, potion cart, lotus pond, smoke altar and the roots), pick products up from the garden, and check out through the live Shopify store.

## Run it

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

## Where things live

- `index.html` — page structure: entry gate, header, place block, product column, basket, shop index, menu, photo viewer.
- `src/main.js` — the 3D world (Three.js), navigation, product display, basket and all interface behaviour.
- `src/style.css` — type system (EB Garamond + Instrument Sans), colour tokens and layout, including the phone-specific rules.
- `src/content.js` — places, story/brewing/wholesale copy, FAQ, the current sale line and store links.
- `src/catalog.json` — products, variants, structured descriptions and photo galleries, taken from the live store.
- `src/reviews.json`, `src/gifts.json` — customer reviews and the store's gift collections.
- `public/assets/img` — garden artwork (generated in Higgsfield). `public/assets/cut` — product cut-outs. `public/assets/gal` — product photos. `public/assets/audio` — score, ambience and effects.
- `raw/` — the scripts used to build the above: `data.py` (catalog), `cut2.py` + `finish.py` (cut-outs), `process.cjs` (artwork), `pack.cjs` (artifact package), `shot.cjs` (walkthrough screenshots).

## Notes

- Checkout hands the basket to `gardenofgaiaapothecary.com/cart/…`, so a completed checkout is a real order.
- The sale line is set in `src/content.js` (`SALE`); clear it when the promotion ends.
- Phones (portrait) use a single swipeable row per place and a full-page product view; desktop uses tiered displays and a side column.
