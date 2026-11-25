import '@fontsource-variable/eb-garamond';
import '@fontsource-variable/eb-garamond/wght-italic.css';
import '@fontsource-variable/fraunces/full.css';
import '@fontsource-variable/fraunces/full-italic.css';
import '@fontsource-variable/cinzel';
import '@fontsource/im-fell-english/latin-400.css';
import './style.css';
import './sheet.css';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import gsap from 'gsap';
import catalog from './catalog.json';
import sprites from './sprites.json';
import cuts from './cuts.json';
import reviewData from './reviews.json';
import ti_apple from './icons/apple.svg?raw';
import ti_bottle from './icons/bottle.svg?raw';
import ti_bowl from './icons/bowl.svg?raw';
import ti_candle from './icons/candle.svg?raw';
import ti_cherry from './icons/cherry.svg?raw';
import ti_clover from './icons/clover.svg?raw';
import ti_cup from './icons/cup.svg?raw';
import ti_droplet from './icons/droplet.svg?raw';
import ti_flame from './icons/flame.svg?raw';
import ti_flower from './icons/flower.svg?raw';
import ti_grain from './icons/grain.svg?raw';
import ti_leaf from './icons/leaf.svg?raw';
import ti_leaf_2 from './icons/leaf-2.svg?raw';
import ti_lemon from './icons/lemon.svg?raw';
import ti_lemon_2 from './icons/lemon-2.svg?raw';
import ti_mushroom from './icons/mushroom.svg?raw';
import ti_nut from './icons/nut.svg?raw';
import ti_pepper from './icons/pepper.svg?raw';
import ti_plant_2 from './icons/plant-2.svg?raw';
import ti_salt from './icons/salt.svg?raw';
import ti_seedling from './icons/seedling.svg?raw';
import ti_tree from './icons/tree.svg?raw';
import ti_trees from './icons/trees.svg?raw';
import ti_wheat from './icons/wheat.svg?raw';
import ingredientData from './ingredients.json';
const TI = { 'apple': ti_apple, 'bottle': ti_bottle, 'bowl': ti_bowl, 'candle': ti_candle, 'cherry': ti_cherry, 'clover': ti_clover, 'cup': ti_cup, 'droplet': ti_droplet, 'flame': ti_flame, 'flower': ti_flower, 'grain': ti_grain, 'leaf': ti_leaf, 'leaf-2': ti_leaf_2, 'lemon': ti_lemon, 'lemon-2': ti_lemon_2, 'mushroom': ti_mushroom, 'nut': ti_nut, 'pepper': ti_pepper, 'plant-2': ti_plant_2, 'salt': ti_salt, 'seedling': ti_seedling, 'tree': ti_tree, 'trees': ti_trees, 'wheat': ti_wheat };
const ICON = { plant: TI['plant-2'], cup: TI.cup, lotus: TI.flower, leaf: TI.leaf, package: TI.bottle, flower: TI.flower };
import { STATIONS, INFO, STORE, FREE_SHIPPING_AT, SALE, FAQ, RECIPROCITY } from './content.js';
import { openConsult, usesOf, mountAsk } from './consult.js';
import plantPhotos from './plants.json';
import { PLANT_USES } from './plantdata.js';
import plantArt from './plantart.json';
import { runTicker } from './ticker.js';

const $ = (s) => document.querySelector(s);
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const money = (n) => (n % 1 ? `$${n.toFixed(2)}` : `$${n}`);
const now = (n, p) => (p?.sale ? +(n * (1 - (SALE.pct || 0) / 100)).toFixed(2) : n);   // what the buyer pays today
const CARD = 'garden-of-gaia-gift-cards';
const cardRange = (p) => { const v = p.variants.map((x) => parseFloat(x.title.replace(/[^0-9.]/g, ''))).filter(Boolean); return `${money(Math.min(...v))} to ${money(Math.max(...v))}`; };
const priceLabel = (p) => (p.handle === CARD ? cardRange(p) : p.variants[0].price !== p.variants.at(-1).price ? `From ${money(now(p.variants[0].price, p))}` : p.variants[0].price === 0 ? 'Free' : money(now(p.variants[0].price, p)));
const A = (p) => import.meta.env.BASE_URL + p.replace(/^\//, '');
const cutUrl = (p) => A(`assets/cut/${p.handle}.webp`);
const thumbUrl = (p) => A(`assets/thumb/${p.handle}.webp`);   // bright, ungraded, for lists
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const byId = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

/* ---------- renderer ---------- */
const canvas = $('#world');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
let dpr = Math.min(devicePixelRatio, coarse ? 2 : 1.5);
const dprFloor = coarse ? 1.5 : 0.8;
renderer.setPixelRatio(dpr);
const scene = new THREE.Scene();
const FOG = new THREE.Color('#06200f');   // a deep leaf green, not the old blue haze
scene.background = new THREE.Color('#03110a');
scene.fog = new THREE.Fog(FOG, 26, 135);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.2, 0.4, 0.88);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

let portrait = false, built = false;
const wside = () => (portrait ? -1 : 1), wbig = (s) => (portrait || s?.id === 'grove' ? 1 : 1.24);   // Sarah: which side of the stall she stands on, and how tall
function applyQuality() { renderer.setPixelRatio(dpr); composer.setPixelRatio(dpr); renderer.setSize(innerWidth, innerHeight, false); composer.setSize(innerWidth, innerHeight); }
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(dpr); composer.setPixelRatio(dpr); renderer.setSize(w, h, false); composer.setSize(w, h);
  portrait = w / h < 0.8;
  camera.aspect = w / h; camera.fov = portrait ? 64 : 50; camera.updateProjectionMatrix(); fitBackdrop();
  STATIONS.forEach(layout);
  if (built && current) { if (openK) closeOverlays(); flyTo(selected ? closeUp(selected) : current, true); syncFocus(); restShift(); }
}
addEventListener('resize', resize);

/* ---------- loading ---------- */
const small = coarse || Math.min(innerWidth, innerHeight) < 700;   // phones get half-size artwork
const IMG = small ? 'assets/img-s' : 'assets/img';
const bitmaps = typeof createImageBitmap === 'function';
const loader = bitmaps ? new THREE.ImageBitmapLoader().setOptions({ imageOrientation: 'flipY', premultiplyAlpha: 'none' }) : new THREE.TextureLoader();
const asTex = (img) => { const t = bitmaps ? new THREE.Texture(img) : img; if (bitmaps) { t.flipY = false; t.needsUpdate = true; } t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; };
const tex = {};
let loaded = 0; const toLoad = Object.keys(sprites).length + 3;
const tick = () => { loaded++; const b = $('#enter-yes'); if (b.disabled) b.textContent = `Gathering the garden… ${Math.min(99, Math.round((loaded / toLoad) * 100))}%`; };
const loadTex = (name, url = A(`${IMG}/${name}.webp`)) => new Promise((res) => {
  loader.load(url, (img) => { const t = asTex(img); tex[name] = t; tick(); res(t); }, undefined, () => { tick(); res(null); });
});

// ---- the herb grove's scene: one painting of a moonlit glade behind the bed of plants, in place of the built scenery ----
// the painting behind the grove can be changed: six scenes, the choice remembered on this device
const SCENES = [['grove-bg-walled', 'Walled herb garden']];   // the one garden scene
let sceneI = 0;   // the garden is always the walled herb garden (the scene picker was retired)
const prepBackdrop = (t) => { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; return t; };
let backdrop = null; const GROVE = 1;   // layer 1: what is seen in the grove (the painting and the plants)
function buildBackdrop() {
  const t = tex[SCENES[sceneI][0]]; if (!t) return; prepBackdrop(t);
  backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: t, depthTest: false, depthWrite: false, fog: false, color: 0x000000 }));
  backdrop.renderOrder = -999; backdrop.frustumCulled = false; backdrop.layers.set(GROVE); backdrop.visible = false;
  scene.add(camera); camera.add(backdrop); fitBackdrop();
}
function fitBackdrop() {
  if (!backdrop) return;
  const d = 60, vh = 2 * d * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), vw = vh * camera.aspect, img = 16 / 9;
  // the painting always covers the view, with room to slide sideways as you walk and to sit a little high or low
  const h = Math.max(vh * 1.34, (vw * 1.22) / img), w = h * img;
  backdrop.scale.set(w, h, 1); backdrop.userData = { d, slack: (w - vw) / 2, vh, h };
}
function placeBackdrop(g) {
  if (!backdrop?.visible) return; const u = backdrop.userData;
  const along = THREE.MathUtils.clamp(g.gx / Math.max(1, g.gHalf), -1, 1);   // where along the bed you are, -1 to 1
  backdrop.position.set(-along * u.slack * 0.9, u.h * (portrait ? 0.02 : 0.065), -u.d);
}
function groveScene(on) {
  camera.layers.mask = on ? 1 << GROVE : 0xffffffff;
  if (!backdrop) return;
  const c = backdrop.material.color; gsap.killTweensOf(c);
  if (on) { backdrop.visible = true; c.setRGB(1, 1, 1); }
  else { c.setRGB(0, 0, 0); backdrop.visible = false; }
}
let seed = 20261122;
const rnd = () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const rr = (a, b) => a + rnd() * (b - a);

/* ---------- places and where things stand ---------- */
const PED_TOP = [0.45, 1.85, 3.25];
/* Real-world heights, so a 4oz jar is smaller than a tea pouch, and the kind of stand each product rests on. */
function sizeOf(h) {
  if (/anointing-oil/.test(h)) return ['bottle', 1.35];
  if (/potions-of-peace-bundle/.test(h)) return ['bottle', 1.5];
  if (/tincture/.test(h) && !/bundle|trinity/.test(h)) return ['bottle', 1.5];
  if (/hair-oil/.test(h)) return ['bottle', 1.45];
  if (/spray/.test(h)) return ['bottle', 1.7];
  if (/syrup/.test(h)) return ['bottle', 1.9];
  if (/ritual-collection|tallow-balm-bundle/.test(h)) return ['jar', 1.3];
  if (/tallow|sticky-chai/.test(h)) return ['jar', 1.3];
  if (/gift-card/.test(h)) return ['jar', 1.25];
  if (/candle/.test(h)) return ['ritual', 1.05];
  if (/resin-incense|frankincense/.test(h)) return ['ritual', 0.85];
  if (/burner/.test(h)) return ['ritual', 1.6];
  if (/smudge/.test(h)) return ['ritual', 1.3];
  if (/palo-santo/.test(h)) return ['ritual', 1.5];
  if (/cacao-bribri/.test(h)) return ['ritual', 1.15];
  if (/free-guide/.test(h)) return ['pouch', 2.0];
  if (/tea-bags/.test(h)) return ['pouch', 2.0];
  if (/butterfly-chai/.test(h)) return ['pouch', 2.45];
  return ['pouch', 2.25];
}
// surf: where the resting surface sits, as a share of the stand's height from its top; top: usable width of that surface
const STAND = {
  ped0: { surf: 0.2, top: 0.75 }, ped1: { surf: 0.05, top: 0.55 }, ped2: { surf: 0.03, top: 0.5 },
  'stand-mshort': { surf: 0.1, top: 0.9 }, 'stand-mtall': { surf: 0.05, top: 0.95 }, 'stand-mound': { surf: 0.18, top: 0.75 }, 'stand-slice': { surf: 0.15, top: 0.9 },
};
/* The herb grove: every plant we work with, a real photograph held in a drop of night air, drifting slowly.
   Wide screens see the whole cloud at once; phones slide along it with a finger. */
const GPLANTS = ingredientData.plants, GCOUNT = {};
for (const ks of Object.values(ingredientData.products)) for (const k of ks) GCOUNT[k] = (GCOUNT[k] || 0) + 1;
const GKEYS = Object.keys(GPLANTS).filter((k) => GCOUNT[k]).sort((a, b) => GCOUNT[b] - GCOUNT[a] || GPLANTS[a].n.localeCompare(GPLANTS[b].n));
const GBED = GKEYS.filter((k) => plantArt[k] || plantPhotos[k]).sort((a, b) => (plantArt[b] ? 1 : 0) - (plantArt[a] ? 1 : 0));
const groveOrbs = [];
const s0 = (o, g) => tmp.copy(o.base).setY(0.06).addScaledVector(g.r, 0.62).addScaledVector(g.f, 0.5);   // a scanned plant sits on the soil beside its stake
const khash = (k) => Math.abs(k.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
function groveLayout(s) {
  const n = GBED.length; s.D = s.p.clone().addScaledVector(s.f, 4); s.gLined = portrait; s.gFree = true; s.gPos = {}; s.gXZ = {};
  {
    // one long bed to walk along. Wide screens see four or five plants at a time; a phone sees one or two, large, and swipes on
    const sx = portrait ? 2.9 : 3.5, half = ((n - 1) / 2) * sx, edge = portrait ? 0.4 : 4.3, mode = portrait ? 'bed-p' : 'bed'; s.gHalf = half + 1.5; s.gDepth = 3; s.gDist = portrait ? 8.2 : 11.5;
    GBED.forEach((k, i) => {
      const h = khash(k), x = (i - (n - 1) / 2) * sx + ((h % 7) - 3) * 0.06, z = (i % 2 ? (portrait ? -0.9 : -1.9) : 0) + (((h >> 6) % 7) - 3) * 0.1;
      s.gXZ[k] = [x, 2.7, 0]; s.gPos[k] = s.D.clone().addScaledVector(s.r, x).addScaledVector(s.f, z).setY(0);
    });
    s.gY0 = s.gY1 = 2.7;
    if (s.gx == null || Math.abs(s.gx) > half || s.gMode !== mode) { s.gMode = mode; s.gSel = null; s.gx = s.gtx = -half + edge; s.gy = s.gty = 2.7; }
    groveView(s);
  }
  s.propPos = s.D.clone().addScaledVector(s.f, -(s.gDepth + 7));
  if (built) placeGrove(s);
}
function groveView(s) {
  const base = s.D.clone().addScaledVector(s.r, s.gx);
  s.camPos = base.clone().addScaledVector(s.f, s.gDist).setY(s.gy + (portrait ? 0.35 : 0.9));
  s.camLook = base.clone().setY(s.gy + (portrait ? 0.15 : -0.5));
  s.witchPos = s.D.clone().addScaledVector(s.r, -(s.gHalf + 1.6)).addScaledVector(s.f, 1.2);
}
const groveFocus = (s) => { if (s.gSel) return s.gSel; let best = GBED[0], bd = Infinity; for (const k of GBED) { const [x, y] = s.gXZ[k], d = (x - s.gtx) ** 2 + (y - s.gty) ** 2; if (d < bd) { bd = d; best = k; } } return best; };
const groveClamp = (s) => { const m = portrait ? 1.9 : 4.3; s.gtx = THREE.MathUtils.clamp(s.gtx, -s.gHalf + m, s.gHalf - m); s.gty = THREE.MathUtils.clamp(s.gty, s.gY0, s.gY1); };
function standFor(kind, top) {
  const low = top < 1.0, mid = top < 2.4;
  if (kind === 'bottle') return low ? 'stand-mshort' : mid ? 'stand-mtall' : 'ped2';
  if (kind === 'pouch') return low ? 'stand-mound' : mid ? 'ped1' : 'ped2';
  if (kind === 'ritual') return low ? 'stand-slice' : mid ? 'ped1' : 'ped2';
  return low ? 'ped0' : mid ? 'ped1' : 'ped2';
}   // each row clears the one in front, like a small amphitheatre
for (const s of STATIONS) { s.p = V(s.pos); s.f = V(s.face).normalize(); s.r = new THREE.Vector3(s.f.z, 0, -s.f.x); s.items = []; }
for (const p of catalog) {
  const c = cuts[p.handle] || { w: 400, h: 400 };
  const t = `${p.handle} ${p.name}`.toLowerCase();
  const [kind, realH] = sizeOf(p.handle);
  let h = realH, w = h * (c.w / c.h);
  if (w > 2.7) { w = 2.7; h = w * (c.h / c.w); }
  const k = h / c.h;
byId[p.station].items.push({ p, kind, w: c.w * k, h: c.h * k, jx: rr(-0.22, 0.22), jz: rr(-0.25, 0.25), ph: rnd() * 6.28, hover: 0, pos: new THREE.Vector3() });
}
for (const s of STATIONS) s.items.forEach((it, i) => { it.station = s; it.index = i; });

function layout(s) {
  if (s.id === 'grove') return groveLayout(s);
  const n = s.items.length;
  if (!n) { s.camPos = V(s.cam); s.camLook = V(s.look); s.witchPos = V(s.witch); if (portrait && s.id === 'gate') { s.camPos.z += 9.5; s.camPos.y += 0.3; s.witchPos.z += 13; }   // and Sarah steps forward through the gate to meet you   // a narrow screen steps back, so both doors of the gate are in view
    return; }
  const per = portrait ? Math.min(3, n) : n <= 5 ? n : Math.ceil(n / (n > 10 ? 3 : 2));
  const rows = Math.ceil(n / per);
  s.D = s.p.clone().addScaledVector(s.f, s.dOff);
  s.lined = portrait; s.mid = 0; if (!s.beside) s.propPos = null;
  if (portrait) return lineLayout(s);
  if (s.ring) return ringLayout(s);
  s.items.forEach((it, i) => {
    const k = Math.floor(i / per), m = Math.min(per, n - k * per), j = i % per;
    const x = (j - (m - 1) / 2) * 2.9 + (k % 2 ? 0.6 : 0) + it.jx, z = 2.4 - k * 2.1 - x * x * 0.025 + it.jz;
    it.row = k; it.pedType = Math.min(k, 2); it.top = PED_TOP[Math.min(k, 2)] + Math.max(0, k - 2) * 0.95;
    it.pos.copy(s.D).addScaledVector(s.r, x).addScaledVector(s.f, z).setY(it.top + it.h / 2 - 0.07);
  });
  const half = ((per - 1) / 2) * 2.9 + 1.6;
  s.half = half;
  const fit = (half + (portrait ? 0.3 : 4.3)) / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
  const d = Math.max(s.minDist ?? 10, fit);
  s.camPos = s.D.clone().addScaledVector(s.f, 2.4 + d).setY(s.camH ?? 3.4 + rows * 0.75);
  // keep headroom above Sarah (she stands 5.9 tall) so her face never slides under the header
  s.camLook = s.D.clone().addScaledVector(s.f, 0.4).setY(portrait ? 0.6 + rows * 0.3 : Math.max(s.lookY ?? 0, 2.3 + rows * 0.45));
  // wide screens: Sarah stands to the right of her wares, clear of the title, and a little larger
  s.witchPos = s.D.clone().addScaledVector(s.r, wside() > 0 ? half + 0.9 : -(half + 1.3)).addScaledVector(s.f, wside() > 0 ? 1.2 : 0.6);
  if (s.beside) { const w = s.propH * sprites[s.prop].w / sprites[s.prop].h; s.propPos = s.D.clone().addScaledVector(s.r, half + w / 2 + 0.2).addScaledVector(s.f, -0.6); }
  if (built) placeItems(s);
}
/* Phones: one row to swipe along. Sarah stands just behind it and walks with you. */
const STEP = 3.3;
function lineLayout(s) {
  const n = s.items.length;
  s.D = s.p.clone().addScaledVector(s.f, s.flat ? s.propH / 2 + 1.2 : s.propH > 15 ? 7 : 5.2);
  s.items.forEach((it, i) => {
    it.row = 0; it.pedType = i % 2; it.top = i % 2 ? 0.95 : 0.45; it.out = null; it.k = 1.35;
    it.pos.copy(s.D).addScaledVector(s.r, i * STEP).addScaledVector(s.f, it.jz * 0.5).setY(it.top + (it.h * it.k) / 2 - 0.05);
  });
  s.mid = ((n - 1) * STEP) / 2; s.half = s.mid + 1.6;
  if (!s.flat && s.propH <= 15) s.propPos = s.D.clone().addScaledVector(s.r, s.mid).addScaledVector(s.f, -5.2);
  s.pan = Math.min(s.pan ?? 0, (n - 1) * STEP); s.panTarget = s.pan;
  panView(s);
  if (built) placeItems(s);
}
function panView(s) {
  const base = s.D.clone().addScaledVector(s.r, s.pan);
  s.camPos = base.clone().addScaledVector(s.f, 9.4).setY(3.3);
  s.camLook = base.clone().setY(2.75);
  s.witchPos = s.D.clone().addScaledVector(s.r, -2.0).addScaledVector(s.f, -1.1);
}
const focusOf = (s) => s.items[THREE.MathUtils.clamp(Math.round(s.panTarget / STEP), 0, s.items.length - 1)];
function ringLayout(s) {
  // products stand on stones around the water, the pond itself stays open in the middle
  const n = s.items.length, R = s.propH / 2 - 1.5;
  s.items.forEach((it, i) => {
    const a = (i / n) * Math.PI * 2 + Math.PI / n, sn = Math.sin(a);
    it.top = 0.45 + (1 - sn) * 0.8; it.pedType = it.top < 0.8 ? 0 : it.top < 1.55 ? 1 : 2; it.row = Math.round((1 - sn) * 2);
    it.pos.copy(s.p).addScaledVector(s.r, Math.cos(a) * R).addScaledVector(s.f, sn * R * 0.82).setY(it.top + it.h / 2 - 0.05);
    it.out = new THREE.Vector3(it.pos.x - s.p.x, 0, it.pos.z - s.p.z).normalize();
  });
  s.half = R + 1.2;
  const d = Math.max(9, (s.half + (portrait ? 0 : 3.6)) / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
  s.camPos = s.p.clone().addScaledVector(s.f, d + R * 0.6).setY(portrait ? 12 : 8.6);
  s.camLook = s.p.clone().setY(portrait ? -1.5 : 0.9);
  s.witchPos = s.p.clone().addScaledVector(s.r, wside() > 0 ? s.half + 0.6 : -(s.half + 1.6)).addScaledVector(s.f, wside() > 0 ? 2.6 : -1.5);
  if (built) placeItems(s);
}
function closeUp(it) {
  const s = it.station, th = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), vis = portrait ? 0.25 : 0.5;
  const dist = Math.max(it.h / vis / (2 * th), it.w / (portrait ? 0.62 : 0.3) / (2 * th * camera.aspect), 3.2);
  it.face = it.out || s.f;
  return { camPos: it.pos.clone().addScaledVector(it.face, dist).add(new THREE.Vector3(0, 0.3, 0)), camLook: it.pos.clone() };
}

/* ---------- world ---------- */
const uniforms = { time: { value: 0 }, camRight: { value: new THREE.Vector3(1, 0, 0) }, fogColor: { value: FOG }, fogNear: { value: 26 }, fogFar: { value: 135 } };

const dimAt = (x, z) => { let d = 1e9; for (const s of STATIONS) { const c = s.D || s.p; d = Math.min(d, Math.hypot(x - c.x, z - c.z)); } return THREE.MathUtils.smoothstep(d, 10, 30); };
function billboardField(map, list) {
  const g = new THREE.InstancedBufferGeometry();
  const base = new THREE.PlaneGeometry(1, 1);
  g.index = base.index; g.attributes.position = base.attributes.position; g.attributes.uv = base.attributes.uv;
  const iPos = new Float32Array(list.length * 3), iScale = new Float32Array(list.length * 2), iPhase = new Float32Array(list.length), iDim = new Float32Array(list.length);
  list.forEach((o, i) => { iPos.set([o.x, 0, o.z], i * 3); iScale.set([o.w, o.h], i * 2); iPhase[i] = o.phase; iDim[i] = dimAt(o.x, o.z); grounded.push({ x: o.x, z: o.z, r: Math.min(o.w, 7) * 0.55, sq: 0.55 }); if (o.glow) pools.push({ x: o.x, z: o.z, r: Math.min(o.w, 6) * 1.25 }); });
  g.setAttribute('iPos', new THREE.InstancedBufferAttribute(iPos, 3));
  g.setAttribute('iScale', new THREE.InstancedBufferAttribute(iScale, 2));
  g.setAttribute('iPhase', new THREE.InstancedBufferAttribute(iPhase, 1));
  g.setAttribute('iDim', new THREE.InstancedBufferAttribute(iDim, 1));
  g.instanceCount = list.length;
  const m = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, map: { value: map } },
    vertexShader: `
      attribute vec3 iPos; attribute vec2 iScale; attribute float iPhase; attribute float iDim;
      uniform vec3 camRight; uniform float time; varying vec2 vUv; varying float vDepth; varying float vPulse; varying float vDim;
      void main(){
        float y = position.y + 0.5;
        vec3 p = iPos + camRight * (position.x * iScale.x) + vec3(0.,1.,0.) * (y * iScale.y);
        p += camRight * sin(time * 1.1 + iPhase) * 0.05 * iScale.y * y * y;
        vec4 mv = viewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv; vUv = uv; vDepth = -mv.z;
        vPulse = 0.9 + 0.22 * sin(time * 0.8 + iPhase * 3.0); vDim = iDim;
      }`,
    fragmentShader: `
      uniform sampler2D map; uniform vec3 fogColor; uniform float fogNear; uniform float fogFar;
      varying vec2 vUv; varying float vDepth; varying float vPulse; varying float vDim;
      void main(){
        vec4 c = texture2D(map, vUv);
        if (vDepth < 3.4) discard;   // nothing looms blurred against the lens
        float edge = clamp((c.a - 0.5) / max(fwidth(c.a), 0.0001) + 0.5, 0.0, 1.0);   // crisp, anti-aliased silhouette
        if (edge < 0.02) discard;
        float lum = max(c.r, max(c.g, c.b));
        c.rgb *= mix(1.0, vPulse, smoothstep(0.45, 0.9, lum));
        c.rgb *= mix(vec3(1.0), vec3(0.4, 0.5, 0.66), vDim * (1.0 - 0.55 * smoothstep(0.6, 0.95, lum)));   // away from the displays the garden goes quiet and blue
        c.rgb = mix(c.rgb, fogColor, smoothstep(fogNear, fogFar, vDepth));
        gl_FragColor = vec4(c.rgb, edge);
        #include <colorspace_fragment>
      }`,
  });
  m.alphaToCoverage = true;
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; scene.add(mesh); return mesh;
}

const props = [], goods = [], upright = [];
let witch, familiar;
const butterflies = [];
const unit = new THREE.PlaneGeometry(1, 1);
const shadowGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
let shadowMat, contactMat, witchShadow;

function flat(name, h, pos, face, opts = {}) {
  const sp = sprites[name], w = h * (sp.w / sp.h);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex[name], alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide, fog: true }));
  if (opts.flat) { mesh.rotation.x = -Math.PI / 2; mesh.position.copy(pos).setY(0.06); }
  else { mesh.position.copy(pos).setY(h / 2 - 0.15); mesh.rotation.y = Math.atan2(face.x, face.z); }
  scene.add(mesh); return mesh;
}
const cutQueue = []; let cutBusy = 0;
function wantCuts(items, front) {
  for (const it of items) if (!it.loaded && !it.queued) { it.queued = true; front ? cutQueue.unshift(it) : cutQueue.push(it); }
  pumpCuts();
}
function pumpCuts() {
  while (cutBusy < 4 && cutQueue.length) {
    const it = cutQueue.shift(); cutBusy++;
    const done = () => { cutBusy--; pumpCuts(); };
    loader.load(cutUrl(it.p), (img) => { it.mesh.material.map = asTex(img); it.mesh.material.needsUpdate = true; it.loaded = true; done(); }, undefined, done);
  }
}
function placeItems(s) {
  if (!s.items[0]?.mesh) return;
  for (const it of s.items) {
    it.mesh.position.copy(it.pos);
    // the stand fits the product: its surface meets the product's base, and it is a little wider than the product
    const name = standFor(it.kind, it.top), st = STAND[name], sp = sprites[name], ph = it.top / (1 - st.surf), w0 = ph * sp.w / sp.h;
    const want = (it.w * (s.lined ? it.k || 1 : 1) * 1.18) / st.top, pw = THREE.MathUtils.clamp(want, w0 * 0.72, w0 * 1.3);
    it.ped.material.map = tex[name]; it.ped.material.needsUpdate = true; it.ped.scale.set(pw, ph, 1);
    it.ped.position.copy(it.pos).setY(ph / 2 - 0.02).addScaledVector(s.f, -0.06);
    // a soft contact shadow where the product rests
    it.contact.position.copy(it.pos).setY(it.top + 0.02).addScaledVector(s.f, -0.03); it.contact.scale.set(it.w * (s.lined ? it.k || 1 : 1) * 1.15, 0.34, 1);
    it.shadow.position.copy(it.pos).setY(0.04); it.shadow.position.x += 0.5; it.shadow.position.z += 0.3; it.shadow.scale.set(3.4, 1, 2.2);
    it.halo.position.copy(it.pos).addScaledVector(s.f, -0.25); it.halo.scale.set(it.w * 2.1, it.h * 1.7, 1);
  }
  if (s.mesh && !s.flat) s.mesh.position.copy(s.propPos || s.p).setY(s.propH / 2 - 0.15);
}

const credit = (k) => (plantPhotos[k]?.by || '').replace(/^\(c\)\s*/, '').replace(/, some rights reserved \((.*?)\)/, ', $1').replace(/^no rights reserved.*/, 'public domain (CC0)');
function roundRect2(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
// a garden marker: the real photograph of the plant, its name written beneath
function bubbleTexture(k) {
  const pl = GPLANTS[k], art = !!plantArt[k], photo = !art && !!plantPhotos[k], W = 384, H = 500, R = 172, cx = W / 2, cy = 190, c = el('canvas', { width: W, height: H }), x = c.getContext('2d');
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const draw = (img) => {
    x.clearRect(0, 0, W, H);
    x.save(); x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.clip();
    x.fillStyle = photo || art ? '#0d1f1a' : 'rgba(60,110,90,.16)'; x.fillRect(0, 0, W, 384);
    if (img) { const sc = art ? Math.min((R * 1.72) / img.width, (R * 1.72) / img.height) : Math.max((R * 2) / img.width, (R * 2) / img.height), iw = img.width * sc, ih = img.height * sc; x.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih); }
    // the roundness of a bubble: darker towards the edge, a pale reflection up and to the left
    const sh = x.createRadialGradient(cx - 30, cy - 40, R * 0.45, cx, cy, R); sh.addColorStop(0, 'rgba(4,10,20,0)'); sh.addColorStop(0.82, 'rgba(4,10,20,.12)'); sh.addColorStop(1, 'rgba(4,10,20,.62)'); x.fillStyle = sh; x.fillRect(0, 0, W, 384);
    const hl = x.createRadialGradient(cx - 74, cy - 92, 2, cx - 74, cy - 92, 78); hl.addColorStop(0, 'rgba(255,255,255,.42)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = hl; x.fillRect(0, 0, W, 384);
    x.restore();
    x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.lineWidth = 2.5; x.strokeStyle = 'rgba(235,245,255,.6)'; x.stroke();
    x.beginPath(); x.arc(cx, cy, R - 7, Math.PI * 1.08, Math.PI * 1.42); x.lineWidth = 3; x.lineCap = 'round'; x.strokeStyle = 'rgba(255,255,255,.55)'; x.stroke();
    x.textAlign = 'center'; x.fillStyle = '#f6efdc'; x.shadowColor = 'rgba(0,0,0,.95)'; x.shadowBlur = 10;
    let fs = 40; x.font = `${fs}px "IM Fell English", Georgia, serif`; while (x.measureText(pl.n).width > W - 16 && fs > 20) { fs -= 2; x.font = `${fs}px "IM Fell English", Georgia, serif`; }
    x.fillText(pl.n, cx, 422);
    x.font = '600 19px "Fraunces Variable", "Fraunces", Georgia, serif'; x.fillStyle = '#b9f655';
    x.fillText(`${GCOUNT[k]} ${GCOUNT[k] === 1 ? 'product' : 'products'}`, cx, 456); x.shadowBlur = 0;
    t.needsUpdate = true;
  };
  draw(null); document.fonts.ready.then(() => draw(t.userData.img || null));
  if (photo || art) { const img = new Image(); img.decoding = 'async'; img.onload = () => { t.userData.img = img; draw(img); }; img.src = A(`assets/${photo ? 'plants' : 'plantart'}/${k}.webp`); }
  return { t, ratio: H / W };
}
function buildGrove(s) {
  const stakeMat = new THREE.MeshBasicMaterial({ color: 0x2b1f15, fog: true }), md = sprites['stand-mound'], air = portrait, loader = new THREE.TextureLoader();
  for (const k of GBED) {
    const art = plantArt[k], h0 = khash(k); let mesh, w, h, label = null;
    if (art) {
      // the plant itself, painted for this garden, standing in the bed
      const t = loader.load(A(`assets/plantart/${k}.webp`)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      h = air ? 2.2 + (h0 % 5) * 0.06 : 3.9 + (h0 % 5) * 0.12; w = h * art.w / art.h; if (air && w > 1.95) { w = 1.95; h = w * art.h / art.w; }
      mesh = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ map: t, alphaTest: 0.35, fog: true, color: 0xf2f2f2 }));
      label = el('div', { className: 'gtag' }, el('b', { textContent: GPLANTS[k].n }), el('i', { textContent: `${GCOUNT[k]} ${GCOUNT[k] === 1 ? 'product' : 'products'}` }), el('u', { textContent: 'Meet the plant' })); $('#gtags').append(label);
    } else {
      const b = bubbleTexture(k); w = (air ? 1.62 : 2.3) + Math.min(GCOUNT[k], 9) * 0.035; h = w * b.ratio;
      mesh = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ map: b.t, transparent: true, depthWrite: false, fog: true, color: 0xe8e6e0 }));
    }
    mesh.userData.plant = k; mesh.renderOrder = 2; mesh.layers.enable(GROVE);
    const stake = new THREE.Mesh(unit, stakeMat);
    const mound = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ map: tex['stand-mound'], alphaTest: 0.5, fog: true, color: 0xb8c0b4 })); mound.scale.set(1.1, 1.1 * md.h / md.w, 1);
    stake.visible = mound.visible = !air && !art;
    scene.add(stake, mound, mesh); upright.push(mesh, stake, mound); 
    buildGrove.mat ||= new THREE.MeshBasicMaterial({ map: softPuff(), color: 0x010502, opacity: 0.8, transparent: true, depthWrite: false, fog: false });
    const shade = new THREE.Mesh(shadowGeo, buildGrove.mat); shade.renderOrder = 1; shade.layers.set(GROVE); scene.add(shade);
    groveOrbs.push({ shade, k, mesh, stake, mound, label, air, art: !!art, w, h, ph: (h0 % 628) / 100, sp: 0.16 + ((h0 >> 4) % 10) * 0.012, hover: 0, model: null });
  }
  placeGrove(s);
}
function placeGrove(s) {
  for (const o of groveOrbs) {
    const p = s.gPos[o.k]; if (!p) continue;
    // the window can change shape after the grove is built (a phone turned, a preview frame that grows): size each plant for the shape it has now
    if (o.art) { const a = plantArt[o.k], h0 = khash(o.k); o.air = false; o.h = 3.9 + (h0 % 5) * 0.12; o.w = o.h * a.w / a.h; if (portrait && o.w > 2.7) { o.w = 2.7; o.h = o.w * a.h / a.w; } o.mesh.scale.set(o.w, o.h, 1); }
    if (o.air) { o.base = p.clone(); o.mesh.position.copy(p); continue; }
    if (o.art) { o.base = p.clone().setY(o.h / 2 - 0.3); o.mesh.position.copy(o.base); o.shade.scale.set(o.w * 1.25, 1, Math.max(0.9, o.w * 0.42)); o.shade.position.copy(p).setY(0.03).addScaledVector(s.f, 0.12); continue; }
    const lift = 1.25 + (khash(o.k) % 4) * 0.12;   // no painting yet: its photograph in a round frame, on a stake
    o.base = p.clone().setY(lift + o.h * 0.62); o.mesh.position.copy(o.base);
    o.stake.scale.set(0.07, o.base.y - o.h * 0.12, 1); o.stake.position.copy(p).setY((o.base.y - o.h * 0.12) / 2).addScaledVector(s.f, -0.04);
    o.mound.position.copy(p).setY(0.16).addScaledVector(s.f, 0.06);
  }
  if (s.mesh) s.mesh.position.copy(s.propPos || s.p).setY(s.propH / 2 - 0.15);
}

function buildWorld() {
  // the garden is the herb grove: a painted glade and the plants. Nothing else is built or loaded
  buildGrove(byId.grove); built = true; return;
  const SR = 190, H = Math.PI * SR * (tex.sky.image.height / tex.sky.image.width);
  tex.sky.wrapS = THREE.RepeatWrapping; tex.sky.generateMipmaps = false; tex.sky.minFilter = THREE.LinearFilter;
  const flip = tex.sky.clone(); flip.repeat.x = -1; flip.offset.x = 1; flip.needsUpdate = true;
  [tex.sky, flip].forEach((map, i) => {
    const half = new THREE.Mesh(new THREE.CylinderGeometry(SR, SR, H, 48, 1, true, i * Math.PI, Math.PI), new THREE.MeshBasicMaterial({ map, side: THREE.BackSide, fog: false }));
    half.position.y = H / 2 - H * 0.2; half.rotation.y = Math.PI * 0.5; scene.add(half);
  });
  tex.ground.wrapS = tex.ground.wrapT = THREE.RepeatWrapping; tex.ground.repeat.set(44, 44);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(170, 64), new THREE.MeshBasicMaterial({ map: tex.ground, color: 0xb6f29a }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);

  shadowMat = new THREE.MeshBasicMaterial({ map: softPuff(), color: 0x000308, opacity: 0.7, transparent: true, depthWrite: false, fog: true });
  contactMat = new THREE.MeshBasicMaterial({ map: softPuff(), color: 0x000000, opacity: 0.6, transparent: true, depthWrite: false, fog: true });
  for (const s of STATIONS) {
    s.mesh = flat(s.prop, s.propH, s.propPos || s.p, s.f, { flat: s.flat });
    s.mesh.userData.station = s.id; props.push(s.mesh);
    for (const it of s.items) {
      it.ped = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ map: tex.ped0, alphaTest: 0.5, alphaToCoverage: true, fog: true, color: 0xd0d8e0 }));
      it.mesh = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ alphaTest: 0.4, alphaToCoverage: true, fog: true, color: 0xaab4be }));
      it.mesh.scale.set(it.w, it.h, 1); it.mesh.userData.item = it;
      it.mesh.visible = false; it.loaded = false;
      it.halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: softPuff(), color: 0xcfe6b0, opacity: 0.06, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: true }));
      it.shadow = new THREE.Mesh(shadowGeo, shadowMat); it.shadow.renderOrder = 1;
      it.contact = new THREE.Mesh(unit, contactMat);
      scene.add(it.ped, it.mesh, it.halo, it.shadow, it.contact); goods.push(it.mesh); upright.push(it.ped, it.mesh, it.contact);
    }
    if (s.items.length) placeItems(s);
    if (s.id === 'grove') buildGrove(s);
  }
  witch = flat('witch', 5.9, byId.gate.witchPos, byId.gate.f);
  witch.userData.witch = true; props.push(witch);
  witchShadow = new THREE.Mesh(shadowGeo, shadowMat); witchShadow.scale.set(4.2, 1, 2.2); witchShadow.renderOrder = 1; scene.add(witchShadow);

  // vegetation, kept clear of displays and sight lines
  const corridors = STATIONS.map((s) => [s.D || s.p, s.camPos.clone().setY(0)]);
  corridors.push([V([0, 0, 70]), V([0, 0, 2])]);
  const segDist = (x, z, a, b) => { const abx = b.x - a.x, abz = b.z - a.z; const t = THREE.MathUtils.clamp(((x - a.x) * abx + (z - a.z) * abz) / (abx * abx + abz * abz), 0, 1); return Math.hypot(x - (a.x + abx * t), z - (a.z + abz * t)); };
  const free = (x, z, clear, lane) => {
    // nothing grows between the walker and the bed of herbs, along its whole length
    { const g = byId.grove, lx = (x - g.D.x) * g.r.x + (z - g.D.z) * g.r.z, lz = (x - g.D.x) * g.f.x + (z - g.D.z) * g.f.z; if (Math.abs(lx) < 125 && lz > -11 && lz < 24) return false; }
    for (const s of STATIONS) {
      const c = s.D || s.p; if (Math.hypot(x - c.x, z - c.z) < (s.half ? s.half + 1.5 : 3) + clear) return false;
      if (s.flat && Math.hypot(x - s.p.x, z - s.p.z) < s.propH / 2 + 0.5) return false;
      if (s.propPos && Math.hypot(x - s.propPos.x, z - s.propPos.z) < s.propH * 0.5 + clear * 0.4) return false;
    }
    for (const s of STATIONS) {
      if (Math.hypot(x - s.camPos.x, z - s.camPos.z) < 8) return false;
      if (Math.hypot(x - s.witchPos.x, z - s.witchPos.z) < 3.6) return false;   // never in front of Sarah
      if (!s.items.length) continue;
      if (s.ring && Math.hypot(x - s.p.x, z - s.p.z) < s.propH / 2 + 5) return false;
      const lx = (x - s.D.x) * s.r.x + (z - s.D.z) * s.r.z, lz = (x - s.D.x) * s.f.x + (z - s.D.z) * s.f.z;
      if (!s.lined && lx < -s.half * 0.15 && lx > -(s.half + 11) && lz > 3.4 && lz < 17) return false;   // calm ground where the title sits
      if (Math.abs(lx - s.mid) < s.half + 2.2 && lz > (s.lined ? -6.5 : -4) && lz < 34) return false;   // nothing grows between the visitor and the display
    }
    for (const [a, b] of corridors) if (segDist(x, z, a, b) < lane) return false;
    const g = byId.grove; if (g?.gHalf) { const lx = (x - g.D.x) * g.r.x + (z - g.D.z) * g.r.z, lz = (x - g.D.x) * g.f.x + (z - g.D.z) * g.f.z; if (Math.abs(lx) < g.gHalf + 2.5 && lz > -(g.gDepth + 4.5) && lz < 16) return false; }
    return true;
  };
  const flowers = Array.from({ length: 16 }, () => []);
  for (let i = 0; i < 1700; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 58, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.95 + 2;
    if (!free(x, z, 0.4, 2.6)) continue;
    const k = (rnd() * 16) | 0, h = rr(1.1, 2.7), sp = sprites['flower' + k];
    flowers[k].push({ x, z, h, w: h * sp.w / sp.h, phase: rnd() * 6.28 });
  }
  flowers.forEach((l, k) => l.length && billboardField(tex['flower' + k], l));
  const plantH = [[6, 10], [3.5, 6], [10, 16], [6, 10], [2, 4.5], [2.4, 4], [6, 9], [7, 11], [3, 5]];
  const plants = Array.from({ length: 9 }, () => []);
  const addPlant = (x, z, k) => { const [a, b] = plantH[k]; const h = rr(a, b), sp = sprites['plant' + k]; plants[k].push({ x, z, h, w: h * sp.w / sp.h, phase: rnd() * 6.28 }); };
  for (let i = 0; i < 280; i++) {
    const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * 46, x = Math.cos(a) * r, z = Math.sin(a) * r, k = (rnd() * 9) | 0, big = plantH[k][1] > 5;
    if (free(x, z, big ? 3.5 : 1.5, big ? 6.5 : 3.6)) addPlant(x, z, k);
  }
  for (let i = 0; i < 240; i++) {
    const a = rnd() * Math.PI * 2, r = rr(48, 80), x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (free(x, z, 4, 7)) addPlant(x, z, [0, 2, 2, 3, 6, 7, 1, 0][(rnd() * 8) | 0]);
  }
  plants.forEach((l, k) => l.length && billboardField(tex['plant' + k], l));
  // stranger, brighter plants gathered around each clearing
  if (sprites.fx0) {
    const fxH = [[4, 7], [3, 5], [5, 8], [3, 5.5], [3.5, 6], [3, 5], [4, 7], [1.8, 3.2], [5, 8]], fx = Array.from({ length: 9 }, () => []);
    for (let i = 0; i < 520 && fx.flat().length < 110; i++) {
      const st = STATIONS[i % STATIONS.length], c = st.D || st.p, a = rnd() * 6.28, r = rr(11, 26), x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r, k = (rnd() * 9) | 0;
      if (!free(x, z, 1.5, 4.5)) continue;
      const h = rr(...fxH[k]), sp = sprites['fx' + k]; fx[k].push({ x, z, h, w: h * sp.w / sp.h, phase: rnd() * 6.28, glow: true });
    }
    fx.forEach((l, k) => l.length && billboardField(tex['fx' + k], l));
  }
  for (const st of STATIONS) if (!st.flat) { const c = st.propPos || st.p; grounded.push({ x: c.x, z: c.z, r: st.propH * 0.5, sq: 0.4 }); }
  groundDiscs(grounded, 0x000308, 0.62, false);
  groundDiscs(pools, 0x58e0c8, 0.11, true);
  // warm lantern light where the products stand, against the cool moonlit garden
  groundDiscs(STATIONS.filter((x) => x.items.length).map((x) => { const c = x.D.clone().addScaledVector(x.r, x.mid || 0); return { x: c.x, z: c.z, r: x.half + 3.5, sq: 0.7 }; }), 0xffa24a, 0.13, true);
  atmosphere();
  // lilies and lotus standing in the pond
  const pond = byId.pond, lilies = { 0: [], 4: [], 8: [] };
  for (let i = 0; i < 54; i++) {
    const a = rnd() * 6.28, r = Math.sqrt(rnd()) * (pond.propH / 2 - 3.2), k = [0, 4, 8, 0][(rnd() * 4) | 0], h = rr(0.8, 1.5), sp = sprites['flower' + k];
    lilies[k].push({ x: pond.p.x + Math.cos(a) * r, z: pond.p.z + Math.sin(a) * r, h, w: h * sp.w / sp.h, phase: rnd() * 6.28 });
  }
  Object.entries(lilies).forEach(([k, l]) => billboardField(tex['flower' + k], l));

  // butterflies
  const hx = new THREE.PlaneGeometry(0.5, 1).rotateX(Math.PI / 2);
  const mkWing = (side) => { const g = hx.clone().translate(side * 0.25, 0, 0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, side < 0 ? uv.getX(i) * 0.5 : 0.5 + uv.getX(i) * 0.5); return g; };
  const wingL = mkWing(-1), wingR = mkWing(1);
  const mkFly = (k, size) => {
    const sp = sprites['bfly' + k], mat = new THREE.MeshBasicMaterial({ map: tex['bfly' + k], alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide, fog: true });
    const g = new THREE.Group(), l = new THREE.Mesh(wingL, mat), r = new THREE.Mesh(wingR, mat);
    g.add(l, r); g.scale.set(size, size, size * sp.h / sp.w); g.userData = { l, r }; scene.add(g); return g;
  };
  const homes = STATIONS.map((s) => s.D || s.p);
  for (let i = 0; i < 40; i++) {
    const g = mkFly(i % 6, rr(0.35, 0.8)), h = homes[i % homes.length];
    Object.assign(g.userData, { c: new THREE.Vector3(h.x + rr(-6, 6), rr(2.4, 6), h.z + rr(-6, 6)), rx: rr(2, 7), ry: rr(0.4, 1.4), rz: rr(2, 7), s: rr(0.12, 0.3), ph: rnd() * 20, flap: rr(9, 15) });
    butterflies.push(g);
  }
  familiar = null;

  // drifting motes of light
  const N = 700, pos = new Float32Array(N * 3), ph = new Float32Array(N), col = new Float32Array(N * 3);
  const palette = ['#b9f655', '#b08cff', '#ff7ad1', '#9fe8ff'].map((c) => new THREE.Color(c));
  for (let i = 0; i < N; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 60; pos.set([Math.cos(a) * r, rr(0.3, 9), Math.sin(a) * r + 4], i * 3); ph[i] = rnd() * 6.28; palette[(rnd() * 4) | 0].toArray(col, i * 3); }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('ph', new THREE.BufferAttribute(ph, 1)); pg.setAttribute('col', new THREE.BufferAttribute(col, 3));
  const motes = new THREE.Points(pg, new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float ph; attribute vec3 col; uniform float time; varying float vA; varying vec3 vC;
      void main(){ vec3 p = position; p.y += sin(time*0.35+ph)*0.9; p.x += sin(time*0.2+ph*2.)*1.2; p.z += cos(time*0.17+ph)*1.2;
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position = projectionMatrix*mv; gl_PointSize = (26.0 + 16.0*sin(ph*7.)) / -mv.z * 3.2;
        vA = 0.35 + 0.65*abs(sin(time*0.9+ph*3.)); vC = col; }`,
    fragmentShader: `varying float vA; varying vec3 vC; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d); gl_FragColor = vec4(vC*1.6, a*a*vA); }`,
  }));
  motes.frustumCulled = false; scene.add(motes);
  built = true;
}

/* ---------- atmosphere: mist, moonlight, lit paths, ripples ---------- */
const drift = [];
function groundDiscs(list, color, opacity, additive) {
  // list: [{x, z, r}] soft discs lying on the ground, one draw call
  if (!list.length) return;
  const m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: softPuff(), color, opacity, transparent: true, depthWrite: false, fog: true, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }), list.length);
  const o = new THREE.Object3D();
  list.forEach((d, i) => { o.position.set(d.x + (additive ? 0 : d.r * 0.32), additive ? 0.05 : 0.035, d.z + (additive ? 0 : d.r * 0.2)); o.scale.set(d.r * 2, 1, d.r * 2 * (d.sq ?? 1)); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
  m.frustumCulled = false; m.renderOrder = additive ? 2 : 1; scene.add(m); return m;
}
const grounded = [], pools = [];
let _puff; const softPuff = () => (_puff ||= softTex((x) => { const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(0.5, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }));
function softTex(draw) { const c = el('canvas', { width: 256, height: 256 }), x = c.getContext('2d'); draw(x); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function atmosphere() {
  const puff = softPuff();
  const tints = [0x3fd0c0, 0x7a6cff, 0x58e08a, 0xc060e0];
  for (let i = 0; i < 22; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: puff, color: tints[i % 4], opacity: rr(0.05, 0.11), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: true }));
    const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 62; m.position.set(Math.cos(a) * r, rr(0.6, 2.4), Math.sin(a) * r); m.scale.set(rr(16, 30), rr(4, 8), 1);
    m.userData = { x: m.position.x, v: rr(0.2, 0.6), ph: rnd() * 6.28 }; scene.add(m); drift.push(m);
  }
  const shaft = softTex((x) => { const g = x.createLinearGradient(0, 0, 256, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); const v = x.createLinearGradient(0, 0, 0, 256); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = v; x.fillRect(0, 0, 256, 256); });
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: shaft, color: 0xbfe8ff, opacity: rr(0.05, 0.1), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, rotation: rr(0.28, 0.42) }));
    const a = rnd() * 6.28, r = rr(8, 44); m.position.set(Math.cos(a) * r, 19, Math.sin(a) * r); m.scale.set(rr(7, 13), 48, 1); m.userData = { shaft: true, o: m.material.opacity, ph: rnd() * 6.28 }; scene.add(m); drift.push(m);
  }
  // paths of light from the gate to every clearing
  const pts = [], ph = [];
  const hub = new THREE.Vector3(0, 0, 14);
  const trail = (a, b, off) => { const n = Math.floor(a.distanceTo(b) / 1.5); for (let i = 1; i < n; i++) { const t = i / n; pts.push(a.x + (b.x - a.x) * t + Math.sin(t * 9 + off) * 0.5, 0.16, a.z + (b.z - a.z) * t + Math.cos(t * 7 + off) * 0.5); ph.push(i * 0.42 + off); } };
  trail(new THREE.Vector3(0, 0, 40), hub, 0);
  STATIONS.filter((x) => x.items.length).forEach((x, i) => trail(hub, x.camPos.clone().setY(0).lerp(x.D, 0.45), i * 2));
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setAttribute('ph', new THREE.Float32BufferAttribute(ph, 1));
  const path = new THREE.Points(g, new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float ph; uniform float time; varying float vA; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); gl_Position = projectionMatrix*mv; float w = 0.5+0.5*sin(ph - time*1.6); vA = 0.25 + 0.75*w*w*w; gl_PointSize = (22.0 + 26.0*vA) / -mv.z * 3.0; }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5,0.0,d); gl_FragColor = vec4(vec3(0.72,0.96,0.33)*1.5, a*a*vA); }` }));
  path.frustumCulled = false; scene.add(path);
  // light moving on the pond
  const pond = byId.pond;
  const water = new THREE.Mesh(new THREE.CircleGeometry(pond.propH / 2 - 1.3, 48), new THREE.ShaderMaterial({ uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float time; varying vec2 vUv; void main(){ vec2 p = vUv-0.5; float d = length(p); float r1 = sin(d*46.0 - time*1.4); float r2 = sin(length(p-vec2(0.16,0.1))*58.0 - time*1.9); float v = smoothstep(0.86,1.0,r1)*0.5 + smoothstep(0.9,1.0,r2)*0.4; float sp = smoothstep(0.985,1.0,sin(p.x*90.0+time)*sin(p.y*110.0-time*0.7)); gl_FragColor = vec4(vec3(0.45,0.95,0.9)*(v+sp), (v*0.5+sp)*smoothstep(0.5,0.36,d)); }` }));
  water.rotation.x = -Math.PI / 2; water.position.copy(pond.p).setY(0.09); scene.add(water);
}

/* ---------- camera ---------- */
const camPos = new THREE.Vector3(0, 7, 64), camLook = new THREE.Vector3(0, 4.6, 20);
const pointer = new THREE.Vector2(), par = new THREE.Vector2(), parS = new THREE.Vector2();
const travel = { t: 0 }, shift = { x: 0, y: 0, tx: 0, ty: 0 };
let current = null, selected = null;
function flyTo(target, instant, dur) {
  const from = camPos.clone(), fromL = camLook.clone(), to = target.camPos, toL = target.camLook;
  gsap.killTweensOf(travel);
  // into the grove (and back out to the gate) there is no flight: the scene simply fades up with every plant already standing
  const cut = target.id === 'grove' || (target.id === 'gate' && flyTo.last === 'grove'); if (target.id) flyTo.last = target.id;
  if (cut && !instant && !reduce) { travel.t = 1; camPos.copy(to); camLook.copy(toL); canvas.style.transition = 'none'; canvas.style.opacity = '0'; requestAnimationFrame(() => { shift.x = shift.tx; shift.y = shift.ty; requestAnimationFrame(() => { shift.x = shift.tx; shift.y = shift.ty; canvas.style.transition = 'opacity .7s ease'; canvas.style.opacity = '1'; }); }); return; }
  if (instant || reduce) { camPos.copy(to); camLook.copy(toL); return; }
  const dist = from.distanceTo(to), lift = dist > 14 ? Math.min(6, dist * 0.14) : 0;
  travel.t = 0;
  gsap.to(travel, { t: 1, duration: dur ?? THREE.MathUtils.clamp(dist / 15, 1.3, 3.2), ease: 'power2.inOut',
    onUpdate() { camPos.lerpVectors(from, to, travel.t).y += Math.sin(travel.t * Math.PI) * lift; camLook.lerpVectors(fromL, toL, travel.t); } });
}
const mood = { near: 26, far: 135 };
function setMood(close) {
  gsap.to(mood, { near: close ? 8 : 26, far: close ? 34 : 135, duration: reduce ? 0 : 1.4, ease: 'power2.inOut', onUpdate() { scene.fog.near = uniforms.fogNear.value = mood.near; scene.fog.far = uniforms.fogFar.value = mood.far; } });
}
const POSE = { gate: 'witch', tea: 'witch-sip', potions: 'witch-present', pond: 'witch-sip', altar: 'witch-present', grove: 'witch-present', roots: 'witch' };
let witchHidden = false, flash;
const witchOff = { v: 0 };
const mirrored = (s) => wside() > 0 && s.items.length > 0 && s.id !== 'grove';   // on the right she turns to face her wares
function witchAt(s, out) { return out.copy(s.witchPos).addScaledVector(s.r, witchOff.v); }
function setPose(s) {
  const n = tex[POSE[s.id]] ? POSE[s.id] : 'witch', sp = sprites[n], base = sprites.witch;
  witch.material.map = tex[n];
  const m = mirrored(s) ? -1 : 1;
  witch.scale.set(m * wbig(s) * (sp.w / sp.h) / (base.w / base.h), wbig(s), 1);
  witchOff.v = (m * wbig(s) * 5.9 * (sp.w / sp.h - base.w / base.h)) / 2;   // keep her body where it was when the arm reaches out
}
function puffAt(pos) {
  if (!flash) { flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: softPuff(), color: 0xdfeecb, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); scene.add(flash); }
  gsap.killTweensOf(flash.scale); gsap.killTweensOf(flash.material);
  flash.position.set(pos.x, 3, pos.z); flash.scale.set(3, 5.5, 1); flash.material.opacity = 0;
  gsap.to(flash.scale, { x: 5.5, y: 8.5, duration: 1.6, ease: 'sine.out' });
  gsap.timeline().to(flash.material, { opacity: 0.2, duration: 0.45, ease: 'sine.out' }).to(flash.material, { opacity: 0, duration: 1.15, ease: 'sine.inOut' });
}
function moveWitch(s, instant) {
  if (!witch) return;
  const place = () => { setPose(s); const w = witchAt(s, new THREE.Vector3()); witch.position.set(w.x, 2.8 * wbig(s), w.z); witch.rotation.y = Math.atan2(s.f.x, s.f.z); };
  if (instant || reduce) { place(); return; }
  puffAt(witch.position); witchHidden = true;
  gsap.delayedCall(1.15, () => { place(); witchHidden = false; puffAt(witch.position); });
}

/* ---------- audio ---------- */
// Sound, kept minimal: no background tone or music. A rare quiet bell, small signs of life, and a small
// chime when something goes in the basket. No music track, no nature recordings.
// ---- the garden's sound kit: no music and no ambience, only small answers to what you do ----
// Everything is made from two materials that suit the shop: a kalimba-like wooden pluck and a breath of leaves.
// The plants along the bed are tuned to a D major pentatonic, so walking past them plays a quiet scale.
const sfx = { ctx: null, out: null, last: {} };
const PENTA = [293.66, 329.63, 369.99, 440, 493.88];   // D E F# A B
const noteAt = (i) => PENTA[((i % 5) + 5) % 5] * 2 ** Math.floor(i / 5);
function sfxCtx() {
  if (sfx.ctx) return sfx.ctx;
  try {
    const c = (sfx.ctx = new (window.AudioContext || window.webkitAudioContext)());
    const soft = c.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 4200; soft.Q.value = 0.4;
    const dry = c.createGain(), room = c.createDelay(1), fb = c.createGain(), wet = c.createGain(), master = c.createGain();
    room.delayTime.value = 0.13; fb.gain.value = 0.32; wet.gain.value = 0.2; master.gain.value = coarse ? 0.85 : 1;
    dry.connect(soft); soft.connect(master); soft.connect(room); room.connect(fb).connect(room); room.connect(wet).connect(master); master.connect(c.destination);
    sfx.out = dry;
    const n = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; sfx.noise = n;
  } catch (e) { sfx.ctx = null; }
  return sfx.ctx;
}
// a wooden pluck: a body tone, a quiet octave, and a tiny click of the tine
function pluck(f, vol, at = 0, len = 0.9) {
  const c = sfx.ctx, t = c.currentTime + at;
  [[1, 'sine', vol], [2, 'triangle', vol * 0.28], [4.2, 'sine', vol * 0.08]].forEach(([m, type, v], i) => {
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.value = f * m;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + len / (1 + i * 1.6));
    o.connect(g).connect(sfx.out); o.start(t); o.stop(t + len + 0.05);
  });
}
// a breath of leaves: filtered noise that swells and settles
function leaves(vol, len, from = 1800, to = 4200, at = 0) {
  const c = sfx.ctx, t = c.currentTime + at, src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
  src.buffer = sfx.noise; bp.type = 'bandpass'; bp.Q.value = 0.8; bp.frequency.setValueAtTime(from, t); bp.frequency.exponentialRampToValueAtTime(to, t + len);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + len * 0.4); g.gain.linearRampToValueAtTime(0, t + len);
  src.connect(bp).connect(g).connect(sfx.out); src.start(t, Math.random() * 0.2); src.stop(t + len + 0.05);
}
// a seed dropping into a wooden bowl
function tok(vol, at = 0) {
  const c = sfx.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(320, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.09);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.connect(g).connect(sfx.out); o.start(t); o.stop(t + 0.2);
}
const KIT = {
  hover: (i) => pluck(noteAt(i + 10), 0.018, 0, 0.5),                            // a fingertip on a high tine
  step: (i) => pluck(noteAt(i), 0.05, 0, 1.1),                                    // walking the bed: one note per plant
  bloom: (i) => { const r = i ?? 0; [0, 2, 4, 7].forEach((d, j) => pluck(noteAt(r + d + 5), 0.05 - j * 0.006, j * 0.075, 1.4)); leaves(0.022, 0.5, 1400, 3800); },   // a plant opens
  close: (i) => { const r = i ?? 0; pluck(noteAt(r + 9), 0.03, 0, 0.7); pluck(noteAt(r + 5), 0.026, 0.09, 0.9); leaves(0.012, 0.3, 3600, 1600); },
  page: () => { leaves(0.02, 0.28, 900, 3200); pluck(noteAt(3), 0.03, 0.05, 0.8); },   // a product page turns open
  add: () => { tok(0.12); pluck(noteAt(12), 0.05, 0.07, 1.2); pluck(noteAt(14), 0.04, 0.16, 1.4); },   // into the basket
  photo: () => leaves(0.016, 0.22, 2200, 4800),
};
let sfxOn = (() => { try { return localStorage.getItem('gaia-sfx') !== 'off'; } catch (e) { return true; } })();
const audio = { on: sfxOn, start() {}, place() {},
  play(name, arg) {
    if (!sfxOn || !KIT[name] || document.visibilityState !== 'visible') return;
    const now = performance.now(); if (now - (sfx.last[name] || 0) < (name === 'hover' ? 140 : name === 'step' ? 60 : 40)) return; sfx.last[name] = now;
    const c = sfxCtx(); if (!c) return; if (c.state !== 'running') c.resume?.();
    try { KIT[name](typeof arg === 'number' ? arg : undefined); } catch (e) { /* silence is fine */ }
  },
  set(on) { sfxOn = this.on = on; try { localStorage.setItem('gaia-sfx', on ? 'on' : 'off'); } catch (e) { /* private mode */ } if (on) this.play('bloom', 0); },
};
// browsers start sound only after a touch or a click: wake it on the first one
['pointerdown', 'keydown', 'touchend'].forEach((ev) => addEventListener(ev, () => { if (sfxOn) { const c = sfxCtx(); if (c && c.state !== 'running') c.resume?.(); } }, { passive: true }));

/* ---------- basket ---------- */
const variantIndex = new Map();
catalog.forEach((p) => p.variants.forEach((v) => variantIndex.set(String(v.id), { p, v })));
let basket = [];
try { basket = JSON.parse(localStorage.getItem('gaia-basket') || '[]').filter((l) => variantIndex.has(l.id)); } catch (e) { basket = []; }
function saveBasket() { try { localStorage.setItem('gaia-basket', JSON.stringify(basket)); } catch (e) { /* private mode */ } renderBasket(); }
function addToBasket(id, qty) {
  const line = basket.find((l) => l.id === String(id));
  if (line) line.qty += qty; else basket.push({ id: String(id), qty });
  saveBasket();
  const c = $('#basket-count'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
  audio.play('add');
}
const about = (p) => p.lede || p.sections.flatMap((x) => x.blocks).find((b) => b.k === 'p')?.t || '';
function nameBtn(p) {
  const b = el('button', { className: 'n', textContent: p.name });
  b.onclick = () => { const it = allItems.find((x) => x.p === p); $('#basket').hidden = true; if (it) { go(it.station.id); select(it); } };
  return b;
}
function renderBasket() {
  const ul = $('#basket-items'); ul.replaceChildren();
  let total = 0, count = 0;
  basket.forEach((l, i) => {
    const { p, v } = variantIndex.get(l.id); const each = now(v.price, p); total += each * l.qty; count += l.qty;
    const minus = el('button', { textContent: '−', ariaLabel: `One fewer ${p.name}` }), plus = el('button', { textContent: '+', ariaLabel: `One more ${p.name}` }), drop = el('button', { className: 'tc-drop', textContent: 'Remove', ariaLabel: `Remove ${p.name}` });
    minus.onclick = () => { l.qty--; if (l.qty < 1) basket = basket.filter((x) => x !== l); saveBasket(); };
    plus.onclick = () => { l.qty++; saveBasket(); };
    drop.onclick = () => { basket = basket.filter((x) => x !== l); saveBasket(); };
    const li = el('li', { className: 'tc' }, el('div', { className: 'tc-art' }, el('img', { src: thumbUrl(p), alt: '' })),
      el('div', { className: 'tc-info' }, nameBtn(p), el('div', { className: 'v', textContent: [p.sub, v.title && p.handle !== CARD ? v.title : ''].filter(Boolean).join(' · ') }),
        el('div', { className: 'tc-row' }, el('div', { className: 'q' }, minus, el('span', { textContent: l.qty }), plus), el('div', { className: 'pr', textContent: money(+(each * l.qty).toFixed(2)) })), drop));
    li.style.setProperty('--i', i); ul.append(li);
  });
  $('#basket-count').textContent = count;
  $('#basket-n').textContent = count ? `· ${count} ${count === 1 ? 'item' : 'items'}` : '';
  $('#basket-total').textContent = `$${total.toFixed(2)}`;
  $('#basket-note').textContent = basket.some((l) => variantIndex.get(l.id).p.sale) && SALE.pct ? `Prices include ${SALE.pct}% off, applied at checkout.` : '';
  $('#basket-empty').hidden = basket.length > 0; $('#basket-foot').hidden = basket.length === 0;
  // the free-shipping vine grows toward a flower as the basket fills
  const left = FREE_SHIPPING_AT - total, pct = Math.min(100, (total / FREE_SHIPPING_AT) * 100), ship = $('#basket-ship');
  ship.replaceChildren(el('span', { className: 'vine-t', textContent: !basket.length ? `Free U.S. shipping over ${money(FREE_SHIPPING_AT)}` : left > 0 ? `${money(+left.toFixed(2))} away from free U.S. shipping` : 'Free U.S. shipping is yours' }),
    el('div', { className: `vine-bar${left <= 0 ? ' done' : ''}` }, el('i', { style: `--p:${pct}%` }), el('b', { className: 'vine-bud', style: `left:${pct}%` }), el('em', { className: 'vine-flower', textContent: '✿' })));
  $('#basket-checkout').href = `${STORE}/cart/${basket.map((l) => `${l.id}:${l.qty}`).join(',')}`;
  // a few things that would carry the basket to free shipping
  const inB = new Set(basket.map((l) => variantIndex.get(l.id).p)), price = (p) => now((p.variants.find((x) => x.available) || p.variants[0]).price, p);
  const pool = catalog.filter((p) => !inB.has(p) && p.handle !== CARD && price(p) > 0 && p.variants.some((x) => x.available));
  const picks = (left > 0 && basket.length ? pool.filter((p) => price(p) >= left).sort((x, y) => price(x) - price(y)) : pool.filter((p) => p.sale)).slice(0, 4);
  const more = $('#basket-more'); more.replaceChildren();
  if (picks.length) more.append(el('p', { className: 'label', textContent: left > 0 && basket.length ? 'Add any one of these for free shipping' : 'Loved in the garden' }), el('div', { className: 'more-row' }, ...picks.map((p) => {
    const add = el('button', { className: 'more-add', textContent: '+ Add', ariaLabel: `Add ${p.name} to basket` });
    add.onclick = () => addToBasket((p.variants.find((x) => x.available) || p.variants[0]).id, 1);
    return el('div', { className: 'more-c' }, el('img', { src: thumbUrl(p), alt: '' }), el('div', {}, nameBtn(p), el('span', { className: 'pr', textContent: money(price(p)) })), add);
  })));
}

/* ---------- reading a product ---------- */
let chosen = null, qty = 1, paged = false;
const narrow = matchMedia('(max-width: 820px)');
const ALIAS = { 'sweet-dreamz-loose-leaf-sleepy-tea-blend': 'sweet-dreamz-sleep-support-loose-leaf-tea-blend', 'cleansing-lungs-respiratory-digestion-immunity-herbal-tea-blend': 'cleansing-lungs-respiratory-digestion-immunity-loose-leaf-herbal-tea' };
const reviews = reviewData.reviews.map((r) => ({ ...r, handle: ALIAS[r.handle] || r.handle })).sort((a, b) => b.date.localeCompare(a.date));
const reviewsFor = (h) => reviews.filter((r) => r.handle === h);
const stars = (n) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
const nameOf = Object.fromEntries(catalog.map((p) => [p.handle, p.name]));
function reviewEl(r, withProduct) {
  const when = r.date ? new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';
  return el('li', {},
    el('p', { className: 'stars', textContent: stars(r.score), ariaLabel: `${r.score} out of 5 stars` }),
    ...(r.title ? [el('p', { className: 'rt', textContent: r.title })] : []),
    ...(r.body ? [el('p', { className: 'rb', textContent: r.body })] : []),
    el('p', { className: 'rm', textContent: [r.author, r.verified ? 'Verified buyer' : '', when, withProduct ? nameOf[r.handle] || r.product : ''].filter(Boolean).join(' · ') }));
}
function reviewBlock(p) {
  const own = reviewsFor(p.handle), list = own.length ? own : reviews.slice(0, 6);
  const avg = (list.reduce((a, r) => a + r.score, 0) / list.length).toFixed(1);
  const sec = el('section', { className: 'reviews', id: 'detail-reviews' },
    el('h3', { className: 'h-serif', textContent: own.length ? 'In their words' : 'Kind words from the garden' }),
    el('p', { className: 'note', textContent: own.length ? `${stars(Math.round(avg))} ${avg} out of 5 · ${own.length} review${own.length > 1 ? 's' : ''}` : 'No reviews for this one yet. Here is what people say about the rest of the garden.' }),
    el('ul', {}, ...list.map((r) => reviewEl(r, !own.length))));
  return sec;
}
function extras(p) {
  const out = [];
  const w = reviewData.wholesale[p.handle];
  if (w) out.push(el('section', { className: 'callout' }, el('p', { className: 'label', textContent: 'Wholesale' }), el('h3', { className: 'h-serif', textContent: w.h }), el('p', { textContent: w.t }), el('a', { className: 'text-link', href: `${STORE}/pages/wholesale-blue-water-lily`, target: '_blank', rel: 'noopener', textContent: 'Apply for wholesale' })));
  out.push(reviewBlock(p));
  out.push(el('section', { className: 'callout' }, el('h3', { className: 'h-serif', textContent: RECIPROCITY.h }), el('p', { textContent: RECIPROCITY.t })));
  const faq = el('section', { className: 'faq' }, el('h3', { className: 'h-serif', textContent: 'Questions, answered' }));
  FAQ.forEach(([q, a]) => { const d = el('details'); d.append(el('summary', {}, el('span', { textContent: q })), el('p', { textContent: a })); faq.append(d); });
  out.push(faq);
  return out;
}
const PLANTS = ingredientData.plants;
const plantsOf = (p) => (ingredientData.products[p.handle] || []).map((k) => ({ k, ...PLANTS[k] }));
const plantNames = (p, n = 3) => { const l = plantsOf(p).map((x) => x.n); return l.length ? (l.length > n ? `${l.slice(0, n).join(', ')} & more` : l.join(', ')) : ''; };
function icon(name) { const i = el('span', { className: 'ti', ariaHidden: 'true' }); i.innerHTML = TI[name] || TI.leaf; return i; }
function insideBlock(p) {
  const list = plantsOf(p);
  if (!list.length) return null;
  const sec = el('section', { className: 'inside', id: 'detail-inside' },
    el('p', { className: 'label', textContent: list.length === 1 ? 'The plant' : `${list.length} plants inside` }),
    el('h3', { className: 'h-serif', textContent: list.length === 1 ? 'What it is' : 'What’s inside' }));
  const ul = el('ul');
  for (const x of list) ul.append(el('li', {}, icon(x.ic), el('div', {}, el('p', { className: 'in-n' }, x.n, ...(x.b ? [el('em', { textContent: x.b })] : [])), el('p', { className: 'in-d', textContent: x.note }))));
  sec.append(ul);
  return sec;
}
function block(b) {
  if (b.k === 'dt') return el('p', { className: 'dt' }, el('b', { textContent: b.term }), el('span', { textContent: b.t }));
  if (b.k === 'note' && b.t.includes('•')) return el('ul', { className: 'tags' }, ...b.t.split('•').map((x) => x.trim()).filter(Boolean).map((x) => el('li', { textContent: x })));
  if (b.k === 'note') return el('p', { className: 'aside', textContent: b.t });
  return el('p', { textContent: b.t });
}
function prose(p) {
  const out = [], secs = p.sections.map((x) => ({ ...x, blocks: [...x.blocks] }));
  let lede = p.lede;
  if (!lede) for (const sec of secs) { const i = sec.blocks.findIndex((b) => b.k === 'p'); if (i >= 0) { lede = sec.blocks.splice(i, 1)[0].t; break; } }
  if (lede) out.push(el('p', { className: 'first', textContent: lede }));
  secs.filter((x) => x.blocks.length).forEach((sec, n) => {
    const d = el('details', { open: n < 2 });
    const sum = el('summary'); sum.innerHTML = ICON[sec.icon] || ICON.flower; sum.append(el('span', { textContent: sec.title }));
    d.append(sum);
    let ul = null;
    for (const b of sec.blocks) {
      if (b.k === 'li') { if (!ul) { ul = el('ul'); d.append(ul); } ul.append(b.term ? el('li', {}, el('b', { textContent: b.term + '. ' }), b.t) : el('li', { textContent: b.t })); }
      else { ul = null; d.append(block(b)); }
    }
    out.push(d);
  });
  return out;
}
let backPlant = null;   // the plant whose page a product was opened from
function select(it, quiet) {
  closeOverlays(true);
  selected = it; qty = 1; const p = it.p;
  document.body.classList.add('reading'); $('#detail').hidden = false;
  $('#detail-close').textContent = backPlant && GPLANTS[backPlant] ? `Back to ${GPLANTS[backPlant].n.toLowerCase()}` : 'Back to the grove';
  $('#detail-kind').textContent = it.station.label; $('#detail-pos').textContent = '';
  $('#detail-name').textContent = p.name; $('#detail-name').classList.toggle('long', p.name.length > 24); $('#detail-sub').textContent = p.sub; $('#detail-sub').hidden = !p.sub;
  const vs = $('#detail-variants'); vs.replaceChildren(); vs.hidden = p.variants.length < 2;
  chosen = p.variants.find((v) => v.available) || p.variants[0];
  p.variants.forEach((v) => { const b = el('button', { textContent: v.title || 'One size', disabled: !v.available }); b.setAttribute('role', 'radio'); b.dataset.id = v.id; b.onclick = () => { chosen = v; syncDetail(); }; vs.append(b); });
  const line = $('#detail-plants'), pl = plantsOf(p); line.replaceChildren(); line.hidden = !pl.length;
  pl.slice(0, 6).forEach((x) => { const b = el('button', { type: 'button' }, icon(x.ic), x.n); b.onclick = () => $('#detail-inside')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); line.append(b); });
  if (pl.length > 6) line.append(el('span', { className: 'more', textContent: `+${pl.length - 6} more` }));
  const ins = insideBlock(p); $('#detail-inside-slot').replaceChildren(...(ins ? [ins] : []));
  $('#detail-desc').replaceChildren(...prose(p));
  $('#detail-extras').replaceChildren(...extras(p));
  const own = reviewsFor(p.handle), rate = $('#detail-rating'); rate.hidden = !own.length;
  if (own.length) rate.textContent = `★ ${(own.reduce((a, r) => a + r.score, 0) / own.length).toFixed(1)} · ${own.length} review${own.length > 1 ? 's' : ''}`;
  const gal = $('#detail-gallery'); gal.replaceChildren(); gal.hidden = !p.gallery.length; $('#detail-added').hidden = true;
  p.gallery.forEach((src, i) => { const b = el('button', { ariaLabel: `Photo ${i + 1} of ${p.gallery.length}` }, el('img', { src: A(src), alt: '', loading: 'lazy' })); b.onclick = () => openLightbox(p, i); gal.append(b); });
  $('#detail .column-in').scrollTop = 0;
  syncDetail();
  if (!narrow.matches) { shift.tx = portrait ? 0 : Math.min(620, innerWidth * 0.52) * 0.42; shift.ty = portrait ? innerHeight * 0.5 - (64 + innerHeight * 0.4) / 2 : 0; }
  paged = narrow.matches;   // phones: a full page, the garden steps aside
  document.body.classList.toggle('paged', paged);
  if (!quiet) audio.play('page');
  history.replaceState(null, '', `#grove--p--${p.handle}`);
  $('#detail-close').focus({ preventScroll: true });
}
function syncDetail() {
  $('#qty-val').textContent = qty;
  $('#detail-price').replaceChildren(chosen.price === 0 ? 'Free' : `$${(now(chosen.price, selected.p) * qty).toFixed(2)}`, ...(SALE.pct && selected.p.sale && chosen.price ? [el('s', { textContent: `$${(chosen.price * qty).toFixed(2)}` }), el('em', { textContent: `${SALE.pct}% off` })] : []));
  $('#detail-variants').querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.id === String(chosen.id))));
  const add = $('#detail-add'); add.disabled = !chosen.available; add.textContent = chosen.available ? 'Add to basket' : 'Sold out';
  const total = basket.reduce((a, l) => a + now(variantIndex.get(l.id).v.price, variantIndex.get(l.id).p) * l.qty, 0), left = FREE_SHIPPING_AT - total - now(chosen.price, selected.p) * qty;
  $('#detail-ship').textContent = selected.p.handle === CARD ? 'Sent by email. Gift cards are not part of the sale.' : [selected.p.sale ? SALE.note : '', left > 0 ? `Adding this leaves you ${money(+left.toFixed(2))} away from free U.S. shipping.` : 'With this in your basket, U.S. shipping is free.'].filter(Boolean).join(' ');
}
function closeOverlays(keep) {
  ['#detail', '#info', '#basket', '#index', '#menu', '#lightbox'].forEach((s) => { $(s).hidden = true; });
  if (!keep && location.hash.startsWith('#grove--')) history.replaceState(null, '', '#grove');
  if (openK && $('#detail').hidden) audio.play('close', GBED.indexOf(openK));
  document.body.classList.remove('reading', 'pop-on', 'companion'); openK = null; restShift();
  const wasPaged = paged; paged = false; document.body.classList.remove('paged');
  if (selected && current?.lined) hoverItem = focusOf(current);
  if (selected) { if (!wasPaged) setMood(false); selected = null; if (!keep && current) { if (!wasPaged) flyTo(current, false, 1.4); history.replaceState(null, '', `#${current.id}`); } }
}
const WORDS = { id: 'words', title: 'Kind words', build: () => [el('p', { className: 'lede', textContent: 'In their words' }), el('h2', { id: 'info-title', textContent: 'Kind words' }), el('p', { className: 'note', textContent: `★★★★★ ${(reviews.reduce((a, r) => a + r.score, 0) / reviews.length).toFixed(1)} out of 5 · ${reviews.length} reviews` }), el('section', { className: 'reviews' }, el('ul', {}, ...reviews.map((r) => reviewEl(r, true))))] };
function openInfo(i) {
  closeOverlays(true); $('#info').hidden = false; document.body.classList.add('reading');
  paged = narrow.matches; document.body.classList.toggle('paged', paged);   // phones: a full page, like a product
  $('#info-close').textContent = i.back || 'Back to the roots'; $('#info-close').removeAttribute('aria-label');
  if (i.build) $('#info-body').replaceChildren(...i.build()); else $('#info-body').innerHTML = i.html; $('#info .column-in').scrollTop = 0;
  $('#info-close').focus({ preventScroll: true });
}
function plantProducts(k) { return allItems.filter((it) => (ingredientData.products[it.p.handle] || []).includes(k)); }
function openPlant(k) {
  const pl = GPLANTS[k]; if (!pl) return;
  const side = current?.id === 'grove' && !portrait && !narrow.matches, swap = side && !!openK;
  const list = plantProducts(k), ph = plantPhotos[k], art = plantArt[k];
  openInfo({ id: 'plant', back: side ? 'Close' : 'Back to the grove', build: () => [
    side ? el('p', { className: 'side-hint', textContent: portrait ? 'Keep wandering above. Tap another plant, or the garden to close.' : 'Keep walking. Tap another plant to read about it, or the ground to close.' }) : '',
    el('div', { className: `plant-head${ph || art ? '' : ' no-photo'}` },
      ph ? el('figure', { className: 'plant-photo' }, el('img', { src: A(`assets/plants/${k}.webp`), alt: pl.n }), el('figcaption', {}, 'Photo: ', el('a', { href: ph.src, target: '_blank', rel: 'noopener', textContent: credit(k) }))) : art ? el('figure', { className: 'plant-photo painted' }, el('img', { src: A(`assets/plantart/${k}.webp`), alt: pl.n })) : '',
      el('div', {},
        el('p', { className: 'label', textContent: 'Meet the plant' }),
        el('h2', { id: 'info-title', textContent: pl.n }),
        pl.b ? el('p', { className: 'plant-bot', textContent: pl.b }) : '',
        el('p', { className: 'lede', textContent: pl.note || '' }),
        PLANT_USES[k] ? el('p', { className: 'plant-uses' }, el('span', { className: 'label', textContent: 'Traditionally used for' }), ...PLANT_USES[k].map((u) => el('b', { textContent: u }))) : '')),
    el('p', { className: 'label', textContent: `${list.length} ${list.length === 1 ? 'product' : 'products'} we make with ${pl.n.toLowerCase()}` }),
    el('ul', { className: 'plant-goods' }, ...list.map((it) => {
      const pr = it.p, v = pr.variants.find((x) => x.available) || pr.variants[0], uses = usesOf(pr.handle);
      const see = el('button', { type: 'button', className: 'text-link', textContent: 'View product' }), show = () => { backPlant = k; select(it); };
      const add = el('button', { className: 'pg-add', textContent: v.available ? '+ Add' : 'Sold out', disabled: !v.available });
      add.onclick = () => { addToBasket(v.id, 1); add.textContent = 'Added ✓'; setTimeout(() => { add.textContent = '+ Add'; }, 1600); };
      const row = el('li', { className: 'pg-row' }, el('img', { src: thumbUrl(pr), alt: '' }), el('div', {}, el('strong', { textContent: pr.name }), el('span', { textContent: [priceLabel(pr), pr.sub].filter(Boolean).join(' · ') }), uses.length ? el('em', { className: 'pg-use', textContent: `For ${uses.join(', ').toLowerCase()}` }) : '', see), add);
      row.onclick = (e) => { if (!e.target.closest('.pg-add')) show(); }; return row;
    })),
  ] });
  if (location.hash !== `#grove--${k}`) history.replaceState(null, '', `#grove--${k}`);
  audio.play('bloom', GBED.indexOf(k));
  if (side) {
    $('#info-close').setAttribute('aria-label', 'Close');
    const g = current; openK = k; paged = false; document.body.classList.remove('reading', 'paged'); document.body.classList.add('companion');
    g.gSel = k; g.gtx = g.gXZ[k][0]; if (portrait) g.gty = g.gXZ[k][1]; groveClamp(g); restShift();
    const b = $('#info-body'); b.classList.remove('swap'); if (swap) { void b.offsetWidth; b.classList.add('swap'); }
  }
}
function openPlantList() {
  openInfo({ id: 'plants', back: 'Back to the grove', build: () => [
    el('p', { className: 'label', textContent: 'Shop by plant' }),
    el('h2', { id: 'info-title', textContent: 'Every plant in the grove' }),
    el('p', { className: 'lede', textContent: `${GKEYS.length} flowers, leaves, roots, spices and resins. Pick one to see everything we make with it.` }),
    el('div', { className: 'plant-grid' }, ...GKEYS.map((k) => { const b = el('button', { className: 'pchip' }, icon(GPLANTS[k].ic), el('span', { textContent: GPLANTS[k].n }), el('small', { textContent: String(GCOUNT[k]) })); b.onclick = () => openPlant(k); return b; })),
  ] });
}
let indexFilter = 'all';
const allItems = STATIONS.flatMap((x) => x.items);
function indexRow(it) {
  const b = el('button', {}, el('img', { src: thumbUrl(it.p), alt: '', loading: 'lazy' }), el('span', {}, el('span', { className: 'n', textContent: it.p.name }), el('span', { className: 's', textContent: plantNames(it.p, 4) || it.p.sub })), el('span', { className: 'p', textContent: priceLabel(it.p) }));
  b.onclick = () => { go(it.station.id); select(it); };
  return b;
}
function openIndex(filter = 'all') {
  closeOverlays(false); indexFilter = filter; $('#index').hidden = false; $('#index').scrollTop = 0; document.body.classList.add('reading');
  const gift = filter.startsWith('gift'), G = { gift25: [0, 25, 'Under $25'], gift40: [25, 40, '$25 to $40'], gift75: [40, 75, '$40 to $75'] };
  $('#index-title').textContent = gift ? 'Gifts' : 'Shop index';
  $('#index-lede').textContent = gift ? 'Give a gift that keeps on giving. Pick a budget and we will show what fits.' : 'Everything growing in the garden, in one list.';
  const tab = (id, name) => { const b = el('button', { textContent: name }); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(id === indexFilter)); b.onclick = () => openIndex(id); return b; };
  $('#index-filter').replaceChildren(tab('all', 'Everything'), ...STATIONS.filter((x) => x.items.length).map((x) => tab(x.id, x.name)));
  $('#index-gifts').replaceChildren(el('span', { className: 'label', textContent: 'Gifts' }), tab('gift25', 'Under $25'), tab('gift40', '$25 to $40'), tab('gift75', '$40 to $75'));
  const list = $('#index-list'); list.replaceChildren();
  if (gift) {
    const [lo, hi, title] = G[filter] || G.gift25;
    const cost = (it) => { const v = it.p.variants.find((x) => x.available) || it.p.variants[0]; return now(v.price, it.p); };
    const card = allItems.find((it) => it.p.handle === CARD);
    list.append(el('h3', { textContent: 'Let them choose' })); if (card) list.append(indexRow(card));
    list.append(el('h3', { textContent: `Gifts ${title.toLowerCase()}` }));
    allItems.filter((it) => it.p.handle !== CARD && cost(it) > lo && cost(it) <= hi).sort((a, b) => cost(a) - cost(b)).forEach((it) => list.append(indexRow(it)));
  } else for (const st of STATIONS.filter((x) => x.items.length && (indexFilter === 'all' || x.id === indexFilter))) {
    list.append(el('h3', { textContent: `${st.name} · ${st.label}` }));
    [...st.items].sort((a, b) => a.p.name.localeCompare(b.p.name)).forEach((it) => list.append(indexRow(it)));
  }
  $('#index-search').value = '';
  $('#index-close').focus({ preventScroll: true });
}
/* ---------- photos ---------- */
let lb = { p: null, i: 0 };
function openLightbox(p, i) { audio.play('photo'); lb = { p, i }; $('#lightbox').hidden = false; showPhoto(); $('#lightbox-close').focus({ preventScroll: true }); }
function showPhoto() {
  const n = lb.p.gallery.length; lb.i = (lb.i + n) % n;
  $('#lightbox-img').src = A(lb.p.gallery[lb.i]); $('#lightbox-img').alt = `${lb.p.title}, photo ${lb.i + 1}`;
  $('#lightbox-count').textContent = `${lb.i + 1} / ${n}`; $('#lightbox-prev').hidden = $('#lightbox-next').hidden = n < 2;
}
/* ---------- menu ---------- */
function openMenu() {
  closeOverlays(false); $('#menu').hidden = false; document.body.classList.add('reading');
  const places = $('#menu-places'); places.replaceChildren(...STATIONS.map((x) => el('li', {}, el('a', { href: `#${x.id}` }, el('img', { src: A(`assets/img-s/${x.icon}.webp`), alt: '', loading: 'lazy' }), el('span', { textContent: x.name })))));
  $('#menu-search').value = '';
  const about = $('#menu-about'); about.replaceChildren(...[...INFO, WORDS].map((i) => { const b = el('button', { textContent: i.title }); b.onclick = () => { go('roots'); openInfo(i); }; return el('li', {}, b); }));
  $('#menu-close').focus({ preventScroll: true });
}

/* ---------- places ---------- */
let entered = false;

let labels = [], lastFocus = null, reading = false, openK = null;   // openK: the plant whose page is open beside the garden
new MutationObserver(() => { reading = document.body.classList.contains('reading'); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
function syncFocus() {
  if (current?.gLined) {
    $('#focus').hidden = false; document.body.classList.add('lined', 'grove-air');
    const k = groveFocus(current), pl = GPLANTS[k];
    lastFocus = k;
    $('#focus-count').textContent = 'Swipe any way to wander · tap a plant to meet it';
    $('#focus-name').textContent = pl.n; $('#focus-price').textContent = [pl.b, `${GCOUNT[k]} ${GCOUNT[k] === 1 ? 'product' : 'products'}`].filter(Boolean).join(' · ');
    $('#focus-open').textContent = 'Meet the plant'; $('#focus-list').textContent = 'See all plants as a list';
    $('#focus-prev').disabled = GBED.indexOf(k) === 0; $('#focus-next').disabled = GBED.indexOf(k) === GBED.length - 1;
    return;
  }
  $('#focus-open').textContent = 'View product'; $('#focus-list').textContent = 'See them all as a list';
  document.body.classList.remove('grove-air');
  const s = current, on = !!(s && s.lined && s.items.length);
  $('#focus').hidden = !on; document.body.classList.toggle('lined', on);
  if (!on) { lastFocus = null; return; }
  const it = focusOf(s); hoverItem = selected ? null : it;
  $('#focus-prev').disabled = it.index === 0; $('#focus-next').disabled = it.index === s.items.length - 1;
  if (it === lastFocus) return;
  lastFocus = it;
  $('#focus-count').textContent = `${s.label} · ${it.index + 1} of ${s.items.length}`;
  $('#focus-name').textContent = it.p.name; $('#focus-price').textContent = [priceLabel(it.p), plantNames(it.p) || it.p.sub].filter(Boolean).join(' · ');
}
function buildLabels(s) {
  const box = $('#labels'); box.replaceChildren();
  labels = s.items.map((it) => { const d = el('div', { className: 'lab' }, el('span', { textContent: it.p.name }), el('small', { textContent: [priceLabel(it.p), plantNames(it.p, 2)].filter(Boolean).join(' · ') })); box.append(d); return { it, el: d }; });
}
function restShift() { if (current?.id === 'gate' && !portrait) { shift.tx = 0; shift.ty = innerHeight * 0.13; return; }   // the gate rides a little high, leaving the foot of the page for the welcome
  if (!openK && current?.id === 'grove') { shift.tx = 0; shift.ty = innerHeight * (portrait ? 0.03 : -0.12); return; } if (openK) { shift.ty = portrait ? innerHeight * 0.3 : 0; shift.tx = portrait ? 0 : Math.min(250, innerWidth * 0.16); return; } shift.ty = portrait ? innerHeight * (current?.items.length ? 0.17 : 0.17) : 0; shift.tx = (current?.items.length || current?.id === 'grove') && !portrait ? -innerWidth * 0.085 : 0; }
function go(id, instant) {
  id = 'grove';   // the garden is the herb grove and nothing else: no gate, no other clearings
  const s = byId[id] || byId.gate, changed = s !== current; current = s;
  if (location.hash.slice(1).split('--')[0] !== s.id && !(s.id === 'gate' && !location.hash.slice(1))) history.pushState(null, '', `#${s.id}`);
  const home = s.id === 'gate', place = $('#place');
  place.toggleAttribute('data-home', home); document.body.classList.toggle('home', home); place.hidden = s.id === 'grove'; $('#grove-cap').hidden = s.id !== 'grove'; document.body.classList.toggle('in-grove', s.id === 'grove'); groveScene(s.id === 'grove');   // the places bar appears once you are inside the garden
  $('#place-label').hidden = home && narrow.matches;
  $('#place-label').replaceChildren(...(home ? ['Organic herbal teas, ', el('br'), 'tinctures and ritual tools'] : [s.label]));
  $('#place-title').textContent = home ? 'Reconnecting you with your roots' : s.name;
  $('#place-says').hidden = home || !s.says; $('#place-says-text').textContent = s.says ? `“${s.says}”` : '';
  audio.place(s.id);
  $('#place-line').textContent = home ? 'Loose leaf, whole flower, farm-direct. Grown slow, harvested by hand, sent straight to your cup.' : s.line;
  const menu = $('#place-menu'); menu.hidden = s.id !== 'roots'; menu.replaceChildren();
  if (s.id === 'roots') [...INFO, WORDS].forEach((i) => { const b = el('button', { textContent: i.title }); b.onclick = () => openInfo(i); menu.append(el('li', {}, b)); });
  const acts = $('#place-actions'); acts.replaceChildren();
  if (home) acts.append(el('a', { className: 'btn', href: '#grove', textContent: 'Walk into the garden' }));
  else if (s.id === 'grove') { const b = el('button', { className: 'text-link', textContent: `See all ${GKEYS.length} plants as a list` }); b.onclick = () => openPlantList(); acts.append(b); }
  else if (s.id !== 'roots') { const b = el('button', { className: 'text-link', textContent: `Read all ${s.items.length} as a list` }); b.onclick = () => openIndex(s.id); acts.append(b); }
  document.querySelectorAll('#places-list a').forEach((a) => (a.dataset.id === s.id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  document.querySelector('#places-list a[aria-current]')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  $('#places-count').textContent = `${STATIONS.indexOf(s) + 1} / ${STATIONS.length}`;
  document.title = home ? 'The Garden of Gaia Apothecary | Organic Herbal Teas & Tinctures' : `${s.name} | The Garden of Gaia Apothecary`;
  if (!selected) restShift();
  if (changed) { buildLabels(s); wantCuts(s.items, true); }
  lastFocus = null; syncFocus();
  if (changed) { travel.t = instant ? 1 : 0; flyTo(s, instant); moveWitch(s, instant); }
}
function route(instant) {
  const [id, handle] = location.hash.slice(1).split('--');
  closeOverlays(true); go(id || 'gate', instant);
  // a product: read here, beside the grove (older links named the clearing it used to stand in)
  const ph = handle === 'p' ? location.hash.split('--')[2] : id !== 'grove' ? handle : null, pit = ph && allItems.find((x) => x.p.handle === ph);
  if (pit) { backPlant = null; select(pit, true); return; }
  if (id === 'grove' && handle && GPLANTS[handle]) { openPlant(handle); return; }
  const it = handle && current.items.find((x) => x.p.handle === handle);
  if (it) select(it, true); else if (!instant) flyTo(current);
}
addEventListener('hashchange', () => route(false));

/* ---------- pointer ---------- */
const ray = new THREE.Raycaster();
let down = null, hoverItem = null, kb = -1;
const alphaCache = new Map();
function opaqueAt(mesh, uv) {
  const img = mesh.material.map?.image; if (!img) return true; let d = alphaCache.get(img);
  if (!d) { const c = el('canvas', { width: 128, height: 128 }), x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(img, 0, 0, 128, 128); d = x.getImageData(0, 0, 128, 128).data; alphaCache.set(img, d); }
  return d[(((bitmaps ? uv.y : 1 - uv.y) * 127) | 0) * 512 + ((uv.x * 127) | 0) * 4 + 3] > 60;
}
function pick(e) {
  pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(pointer, camera); ray.layers.mask = camera.layers.mask;
  for (const h of ray.intersectObjects([...goods, ...groveOrbs.map((o) => o.mesh), ...props], false)) {
    const u = h.object.userData;
    if (u.plant) return { plant: u.plant };
    if (!opaqueAt(h.object, h.uv)) continue;
    if (u.item) return { item: u.item };
    if (u.witch) return { witch: true };
    if (u.station && u.station !== current.id) return { station: u.station };
  }
  return null;
}
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, last: e.clientX }; try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* fine */ } });
canvas.addEventListener('pointermove', (e) => {
  if (down && entered && current?.gFree && ($('#info').hidden || openK) && travel.t >= 0.999) {
    // a finger among the circles: the cloud follows it, any way you move
    const perPx = (2 * current.gDist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / innerHeight, s = current, dx = e.clientX - down.last, dy = e.clientY - (down.lastY ?? down.y);
    s.gtx -= dx * perPx * 1.1; if (portrait) s.gty += dy * perPx * 1.1; s.gSel = null; groveClamp(s); canvas.style.cursor = 'grabbing';
    down.vx = dx; down.vy = dy; down.last = e.clientX; down.lastY = e.clientY; syncFocus(); return;
  }
  if (down && entered && current?.lined && current.items.length && !selected) {
    // swipe along the row
    const perPx = (2 * 9.4 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect) / innerWidth;
    current.panTarget = THREE.MathUtils.clamp(current.panTarget - (e.clientX - down.last) * perPx * 1.15, -0.6, (current.items.length - 1) * STEP + 0.6);
    down.last = e.clientX; syncFocus(); return;
  }
  par.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  if (coarse || !entered) return;
  hoverEvt = { clientX: e.clientX, clientY: e.clientY };   // resolved in the frame loop
});
let hoverEvt = null, lastHover = 0, hoverPlant = null;
function resolveHover(now) {
  if (!hoverEvt || now - lastHover < 70 || travel.t < 0.999) return;
  lastHover = now; const hit = pick(hoverEvt); hoverEvt = null; kb = -1;
  if (!current?.lined) hoverItem = hit?.item && hit.item !== selected ? hit.item : null;
  if (hit?.plant && hit.plant !== hoverPlant) audio.play('hover', GBED.indexOf(hit.plant));
  hoverPlant = hit?.plant || null;
  const cur = hit ? 'pointer' : ''; if (canvas.style.cursor !== cur) canvas.style.cursor = cur;
}
canvas.addEventListener('pointerup', (e) => {
  if (!down || !entered) return; const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), downWas = down; down = null;
  if (current?.lined && current.items.length && !selected) { current.panTarget = focusOf(current).index * STEP; syncFocus(); }
  if (current?.gFree && moved > 8 && downWas) { const perPx = (2 * current.gDist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / innerHeight; current.gtx -= (downWas.vx || 0) * perPx * 7; if (portrait) current.gty += (downWas.vy || 0) * perPx * 7; groveClamp(current); canvas.style.cursor = ''; syncFocus(); }
  if (moved > 8) return;
  let hit = pick(e);
  // a tap on a plant's name, or on its "Meet the plant" pill, counts as a tap on the plant
  if (!hit && current?.id === 'grove' && !openK) { const o = groveOrbs.find((q) => q.tagA > 0.2 && Math.abs(e.clientX - q.sx) < 84 && e.clientY > q.sy - 16 && e.clientY < q.sy + 96); if (o) hit = { plant: o.k }; }
  if (!hit) { if (selected || openK) closeOverlays(); return; }
  if (hit.station) { closeOverlays(true); go(hit.station); }
  else if (hit.witch) { closeOverlays(true); go(current.id === 'gate' ? 'tea' : 'potions'); }
  else if (hit.item) { if (hit.item.station !== current) go(hit.item.station.id); select(hit.item); }
  else if (hit.plant) {
    if (current.id !== 'grove') go('grove');
    if (hit.plant !== openK) {
      // the page opens under the finger: swallow the click that follows this tap, so it cannot land on whatever appears there
      const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); }; addEventListener('click', stop, true); setTimeout(() => removeEventListener('click', stop, true), 420);
      openPlant(hit.plant);
    }
  }
});
addEventListener('keydown', (e) => {
  if (!entered) return;
  if (!$('#lightbox').hidden) { if (e.key === 'Escape') $('#lightbox').hidden = true; if (e.key === 'ArrowRight') { lb.i++; showPhoto(); } if (e.key === 'ArrowLeft') { lb.i--; showPhoto(); } return; }
  if (e.key === 'Escape') { closeOverlays(); return; }
  if (false) { const L = selected.station.items, n2 = L.length; select(L[(selected.index + (e.key === 'ArrowRight' ? 1 : -1) + n2) % n2], true); e.preventDefault(); return; }
  if (selected || !current?.items.length || e.target.closest?.('.panel, .index, .column')) return;
  const n = current.items.length;
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { kb = (kb + (e.key === 'ArrowRight' ? 1 : -1) + n) % n; hoverItem = current.items[kb]; }
  if (e.key === 'Enter' && kb >= 0 && e.target === document.body) select(current.items[kb]);
});

/* ---------- DOM wiring ---------- */
for (const s of STATIONS) { const i = el('i'); i.style.backgroundImage = `url(${A(`assets/img-s/${s.id === 'gate' ? 'witch-face' : s.icon}.webp`)})`; if (s.id === 'gate') i.style.backgroundSize = 'cover'; const a = el('a', { href: `#${s.id}` }, i, el('span', { textContent: s.name })); a.dataset.id = s.id; $('#places-list').append(a); }
let askBtn = null;
const askSarah = () => openConsult({ catalog, now, figure: A('assets/img/witch-sip.webp'), img: (p) => (p.gallery?.[0] ? A(p.gallery[0]) : A(`assets/card/${p.handle}.webp`)), add: (p, v) => addToBasket(v.id, 1), open: (p) => { location.href = `./classic.html#p--${p.handle}`; } });
$('#gifts-top').onclick = () => openIndex('gift25');
$('#ask-top').onclick = () => { closeOverlays(true); askSarah(); };
const step = (d) => { closeOverlays(true); location.hash = `#${STATIONS[(STATIONS.indexOf(current) + d + STATIONS.length) % STATIONS.length].id}`; };
$('#places-prev').onclick = () => step(-1); $('#places-next').onclick = () => step(1);
$('#gifts-open').onclick = () => openIndex('gift25');
$('#menu-open').onclick = () => ($('#menu').hidden ? openMenu() : closeOverlays()); $('#menu-close').onclick = () => closeOverlays();
$('#menu').addEventListener('click', (e) => { const t = e.target.closest('[data-act], a[href^="#"]'); if (!t) return; if (t.dataset.act === 'ask') { closeOverlays(true); askSarah(); } else if (t.dataset.act === 'index') openIndex(); else if (t.dataset.act?.startsWith('gift')) openIndex(t.dataset.act); else if (t.dataset.act === 'sound') $('#sound-toggle').click(); else closeOverlays(true); });
$('#lightbox-close').onclick = () => { $('#lightbox').hidden = true; };
// a click anywhere on the open photograph (not just the button) goes back; the arrows still turn the page
$('#lightbox').addEventListener('click', (e) => { if (!e.target.closest('#lightbox-prev, #lightbox-next')) $('#lightbox').hidden = true; });
$('#lightbox-prev').onclick = () => { lb.i--; showPhoto(); }; $('#lightbox-next').onclick = () => { lb.i++; showPhoto(); };
$('#detail-close').onclick = () => { const k = backPlant; backPlant = null; closeOverlays(); if (k) openPlant(k); };
const stepSel = (d) => { const L = selected.station.items; select(L[(selected.index + d + L.length) % L.length], true); };
$('#detail-prev').onclick = () => stepSel(-1); $('#detail-next').onclick = () => stepSel(1);
$('#focus-open').onclick = () => (current.gLined ? openPlant(groveFocus(current)) : select(focusOf(current)));
const groveStep = (d) => { const s = current, k = GBED[THREE.MathUtils.clamp(GBED.indexOf(groveFocus(s)) + d, 0, GBED.length - 1)]; s.gSel = k; [s.gtx, s.gty] = s.gXZ[k]; groveClamp(s); syncFocus(); };
$('#focus-prev').onclick = () => { if (current.gLined) return groveStep(-1); current.panTarget = Math.max(0, focusOf(current).index - 1) * STEP; syncFocus(); };
$('#focus-next').onclick = () => { if (current.gLined) return groveStep(1); current.panTarget = Math.min(current.items.length - 1, focusOf(current).index + 1) * STEP; syncFocus(); };
$('#focus-list').onclick = () => (current.gLined ? openPlantList() : openIndex(current.id));
$('#info-close').onclick = () => closeOverlays();
$('#basket-close').onclick = $('#basket-tab').onclick = $('#basket-scrim').onclick = () => { $('#basket').hidden = true; };
$('#index-close').onclick = () => closeOverlays();
$('#index-open').onclick = () => ($('#index').hidden ? openIndex() : closeOverlays());
$('#basket-open').onclick = () => { if (!$('#basket').hidden) { $('#basket').hidden = true; return; } renderBasket(); $('#basket').hidden = false; $('#basket-close').focus({ preventScroll: true }); };
// the menu button shows which state it is in
new MutationObserver(() => { const open = !$('#menu').hidden; $('#menu-open').setAttribute('aria-expanded', String(open)); $('#menu-open').classList.toggle('open', open); $('#menu-open .mt').textContent = open ? 'Close' : 'Menu'; $('#index-open').textContent = $('#index').hidden ? 'Shop index' : 'Close index'; }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
$('#qty-minus').onclick = () => { qty = Math.max(1, qty - 1); syncDetail(); };
$('#qty-plus').onclick = () => { qty++; syncDetail(); };
$('#detail-add').onclick = () => { selected.hop = 1; addToBasket(chosen.id, qty); $('#detail-added').hidden = false; $('#detail-added-text').textContent = `${qty} × ${selected.p.name} added.`; };
$('#detail-view-basket').onclick = () => $('#basket-open').click();
$('#detail-rating').onclick = () => $('#detail-reviews')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
$('#sale-line').replaceChildren(el('span', { className: 'sl-text', textContent: SALE.line }), el('span', { className: 'sl-bar' }, el('span', { className: 'ticker-track', id: 'sl-track' }))); $('#menu-sale').textContent = SALE.line;
runTicker($('#sl-track'), [SALE.line, 'Organic & pesticide-free', 'Farm-direct from Sri Lanka', 'Made in-house in small batches', `Free U.S. shipping over $${FREE_SHIPPING_AT}`].filter(Boolean), reduce);
const searchIndex = (v) => { const q = v.trim().toLowerCase(); $('#index-list').querySelectorAll('button').forEach((b) => { b.hidden = !!q && !b.textContent.toLowerCase().includes(q); }); $('#index-list').querySelectorAll('h3').forEach((h) => { let n = h.nextElementSibling, any = false; while (n && n.tagName !== 'H3') { if (!n.hidden) any = true; n = n.nextElementSibling; } h.hidden = !any; }); };
$('#index-search').oninput = (e) => searchIndex(e.target.value);
$('#menu-search-form').onsubmit = (e) => { e.preventDefault(); const q = $('#menu-search').value; openIndex('all'); $('#index-search').value = q; searchIndex(q); };
$('#sound-toggle').setAttribute('aria-pressed', String(sfxOn)); $('#sound-toggle .sr').textContent = sfxOn ? 'Sound on' : 'Sound off'; $('#sound-toggle').classList.toggle('off', !sfxOn);
$('#sound-toggle').onclick = (e) => { e.currentTarget.classList.toggle('off', audio.on); const on = !audio.on; audio.set(on); e.currentTarget.setAttribute('aria-pressed', String(on)); e.currentTarget.querySelector('.sr').textContent = on ? 'Sound on' : 'Sound off'; $('#menu-sound').textContent = on ? 'Turn sound off' : 'Turn sound on'; };
$('#info-body').addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) closeOverlays(true); });
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
try { localStorage.setItem('gaia-view', '"garden"'); } catch (e) { /* private mode */ }
document.querySelectorAll('.to-classic, .to-classic-m').forEach((x) => x.addEventListener('click', () => { try { localStorage.setItem('gaia-view', '"classic"'); } catch (e) { /* private mode */ } }));
$('#enter-no').onclick = () => { $('#entry-ask').hidden = true; $('#entry-denied').hidden = false; };
$('#enter-yes').onclick = () => {
  const withSound = $('#entry-sound').checked;
  try { localStorage.setItem('gaia-21', 'true'); } catch (e) { /* private mode */ }
  $('#entry').hidden = true;
  $('#topbar').hidden = false; $('#hud').hidden = false;
  gsap.killTweensOf(camPos); entered = true; current = null; route(false);
};

/* ---------- frame ---------- */
const $index = $('#index'), $menu = $('#menu'); let acc = 0, frames = 0;
const clock = new THREE.Timer(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3(), white = new THREE.Color(0xf2f2f2), bright = new THREE.Color(0xffffff), rest = new THREE.Color(0xdfe2e4), dim = new THREE.Color(0x3c4650), goal = new THREE.Color();
function frame() {
  clock.update();
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.getElapsed(), k = reduce ? 0 : 1;
  uniforms.time.value = t;
  if (current?.lined && current.items.length) {
    const s = current; s.pan += (s.panTarget - s.pan) * Math.min(1, dt * 9); panView(s);
    if (!selected && travel.t >= 0.999) { camPos.lerp(s.camPos, Math.min(1, dt * 10)); camLook.lerp(s.camLook, Math.min(1, dt * 10)); if (witch && !witchHidden) { witchAt(s, tmp); witch.position.x += (tmp.x - witch.position.x) * Math.min(1, dt * 3.5); witch.position.z += (tmp.z - witch.position.z) * Math.min(1, dt * 3.5); } }
  }
  if (current?.gFree) {
    const s = current, e = Math.min(1, dt * 7); s.gx += (s.gtx - s.gx) * e; s.gy += (s.gty - s.gy) * e; groveView(s);
    if (travel.t >= 0.999) { camPos.lerp(s.camPos, Math.min(1, dt * 10)); camLook.lerp(s.camLook, Math.min(1, dt * 10)); }
  }
  if (current?.id === 'grove') {
    placeBackdrop(current);
    const g = current, n = GBED.length, sx = (2 * (g.gHalf - 1.5)) / Math.max(1, n - 1), i = THREE.MathUtils.clamp(Math.round((g.gx + (g.gHalf - 1.5)) / sx), 0, n - 1);
    if (g.stepAt == null) g.stepAt = i; else if (i !== g.stepAt) { g.stepAt = i; if (travel.t >= 0.999 && !openK) audio.play('step', i); }
  }
  if (groveOrbs.length) {
    const near = current?.id === 'grove', fk = near && current.gLined ? groveFocus(current) : null, g = byId.grove;
    for (const o of groveOrbs) {
      if (!o.base) continue;
      const want = o.k === hoverPlant || o.k === fk || o.k === openK ? 1 : 0; o.hover += (want - o.hover) * Math.min(1, dt * 8);
      if (o.air) {
        // slow, weightless drift: each bubble on its own little orbit
        const a = t * o.sp + o.ph, dx = Math.sin(a) * 0.3 * k, dy = Math.sin(a * 1.31 + o.ph) * 0.22 * k, dz = Math.cos(a * 0.8) * 0.25 * k;
        o.mesh.position.set(o.base.x + g.r.x * dx + g.f.x * dz, o.base.y + dy + o.hover * 0.08, o.base.z + g.r.z * dx + g.f.z * dz);
        const sc = (1 + o.hover * 0.14) * (1 + Math.sin(a * 2.1) * 0.015 * k); o.mesh.scale.set(o.w * sc, o.h * sc, 1);
        if (o.model) { const inside = !plantPhotos[o.k]; o.model.position.copy(o.mesh.position).addScaledVector(g.r, inside ? 0 : o.w * 0.4).addScaledVector(g.f, 0.35); o.model.position.y += (inside ? o.h * 0.12 : -o.h * 0.14) - (o.mh || 0.4) / 2; }
      } else {
        // rooted in the soil: a plant leans in a little when you reach for it
        const sc = 1 + o.hover * 0.06; o.mesh.scale.set(o.w * sc, o.h * sc, 1); o.mesh.position.y = o.base.y + (o.art ? o.h * (sc - 1) / 2 : o.hover * 0.1);
        if (o.model) { const inside = !plantPhotos[o.k] && !o.art; o.model.visible = inside; if (inside) { o.model.position.copy(o.mesh.position).addScaledVector(g.f, 0.35); o.model.position.y += o.h * 0.12 - (o.mh || 0.4) / 2; } }
      }
      if (o.model) o.model.rotation.y = t * 0.5 * (k || 0) + o.ph;
    }
  }
  if (witch) witch.visible = !witchHidden && current?.id !== 'grove' && !(portrait && selected && !paged);   // Sarah keeps the gate; she does not come into the grove
  camera.position.copy(camPos); camera.lookAt(camLook);
  const amt = selected ? 0.25 : 1;
  parS.lerp(par, 1 - Math.exp(-dt * 2.6));
  camera.translateX(parS.x * 0.75 * k * amt); camera.translateY(-parS.y * 0.38 * k * amt + Math.sin(t * 0.5) * 0.04 * k);
  camera.lookAt(camLook);
  shift.x += (shift.tx - shift.x) * Math.min(1, dt * 4); shift.y += (shift.ty - shift.y) * Math.min(1, dt * 4);
  if (Math.abs(shift.x) + Math.abs(shift.y) > 0.5) camera.setViewOffset(innerWidth, innerHeight, shift.x, shift.y, innerWidth, innerHeight); else if (camera.view) camera.clearViewOffset();
  camera.updateMatrixWorld();
  tmp.subVectors(camLook, camPos).setY(0).normalize(); uniforms.camRight.value.set(-tmp.z, 0, tmp.x);   // from the resting view, so the parallax reads as depth

  // products and pedestals turn to face the visitor
  const yaw = Math.atan2(camPos.x - camLook.x, camPos.z - camLook.z);
  for (const m of upright) m.rotation.y = yaw;
  if (selected?.mesh) selected.mesh.rotation.y = yaw + parS.x * 0.32 * k;   // the product turns a little with the pointer
  for (const s of []) for (const it of s.items) {
    const on = it === hoverItem || it === selected;
    it.hover += ((on ? 1 : 0) - it.hover) * Math.min(1, dt * 9);
    if (it.hop > 0) it.hop = Math.max(0, it.hop - dt * 2.2);
    it.mesh.position.y = it.pos.y + it.hover * 0.14 + Math.sin(t * 1.1 + it.ph) * 0.015 * k + (it.hop > 0 ? Math.sin((1 - it.hop) * Math.PI) * 0.42 * k : 0);
    const sc = (1 + it.hover * 0.07) * (it.station.lined ? it.k || 1 : 1); it.mesh.scale.set(it.w * sc, it.h * sc, 1);
    goal.copy(selected && it !== selected && it.station === current ? dim : rest).lerp(bright, it.hover);
    it.mesh.material.color.lerp(goal, Math.min(1, dt * 6));
    const show = it.loaded && (paged || !(selected && it !== selected && it.station === selected.station)); it.mesh.visible = show; it.ped.visible = show; it.contact.visible = show;
    it.shadow.visible = show; it.halo.visible = show; it.halo.material.opacity = (it === selected ? 0.16 + (it.hop || 0) * 0.14 : 0.06 + it.hover * 0.12) * (0.9 + 0.1 * Math.sin(t * 1.3 + it.ph));
  }
  // every product in this clearing carries its name
  const showLabels = entered && !selected && !reading && travel.t >= 0.999;
  for (const l of labels) {
    const it = l.it; tmp.copy(it.pos); tmp.y = it.top - 0.02; tmp.project(camera);
    const ok = showLabels && tmp.z < 1 && Math.abs(tmp.x) < 1.05;
    l.el.style.opacity = ok && it === hoverItem && !current.lined ? 1 : 0;
    if (ok) { l.el.style.transform = `translate(${((tmp.x + 1) / 2) * innerWidth}px, ${((1 - tmp.y) / 2) * innerHeight}px) translate(-50%, 6px)`; l.el.classList.toggle('on', it === hoverItem); }
  }

  if (groveOrbs.length) {
    const g = byId.grove, fk2 = portrait && current === g ? groveFocus(g) : null, headH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--head-h')) || 120, barH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar-h')) || 90, sheetTop = openK && portrait ? innerHeight * 0.44 : innerHeight + 200, live = entered && current === g && travel.t >= 0.999 && (!reading || openK) && $index.hidden && $menu.hidden, edge = openK ? innerWidth - Math.min(470, innerWidth * 0.36) : innerWidth + 200;
    for (const o of groveOrbs) {
      if (!o.label) continue; let a = 0;
      if (live) {
        if (o.air) { tmp.copy(o.mesh.position); tmp.y -= o.h * 0.52; } else { tmp.copy(g.gPos[o.k]); tmp.y = 0.2; } tmp.project(camera); const x = ((tmp.x + 1) / 2) * innerWidth, y = ((1 - tmp.y) / 2) * innerHeight;
        if (tmp.z < 1 && x > -120 && x < innerWidth + 120) {
          const on = o.k === hoverPlant || o.k === openK || o.k === fk2;
          a = y > sheetTop - 30 || (portrait && (y < headH + 26 || y > innerHeight - 96)) ? 0 : portrait ? (on ? 1 : THREE.MathUtils.clamp(1.3 - Math.hypot((x - innerWidth / 2) / innerWidth, (y - innerHeight * 0.45) / innerHeight) * 1.7, 0.3, 1)) : x > edge - 40 ? 0 : on ? 1 : THREE.MathUtils.clamp(1.25 - Math.abs(x - (openK ? edge / 2 : innerWidth * 0.5)) / (innerWidth * 0.5), 0.35, 1);
          o.label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, 0)`; o.sx = x; o.sy = y;
          if (o.tagOn !== on) { o.tagOn = on; o.label.classList.toggle('on', on); } if ((o.k === openK) !== o.tagOpen) { o.tagOpen = o.k === openK; o.label.classList.toggle('open', o.tagOpen); }
        }
      }
      if (o.tagA !== a) { o.tagA = a; o.label.style.opacity = a.toFixed(2); }
    }
  }
  for (const m of drift) { const u = m.userData; if (u.shaft) m.material.opacity = u.o * (0.6 + 0.4 * Math.sin(t * 0.25 + u.ph)); else m.position.x = u.x + Math.sin(t * 0.05 * u.v + u.ph) * 6; }
  if (witchShadow) { witchShadow.position.set(witch.position.x + 0.7, 0.045, witch.position.z + 0.4); witchShadow.visible = witch.visible; }
  if (witch) { witch.position.y = 2.8 * Math.abs(witch.scale.y) + Math.sin(t * 1.1) * 0.05 * k; witch.rotation.z = Math.sin(t * 0.8) * 0.012 * k; }
  for (const g of butterflies) {
    const u = g.userData, tt = t * u.s + u.ph;
    tmp.set(u.c.x + Math.sin(tt) * u.rx, u.c.y + Math.sin(tt * 2.3) * u.ry, u.c.z + Math.cos(tt * 0.8) * u.rz);
    g.lookAt(tmp2.copy(tmp).sub(g.position).add(tmp)); g.position.copy(tmp);
    const f = Math.sin(t * u.flap + u.ph) * 0.95 + 0.25; u.l.rotation.z = f; u.r.rotation.z = -f;
  }
  if (familiar?.visible) {
    ray.setFromCamera(tmp2.set(par.x, -par.y, 0), camera);
    tmp.copy(ray.ray.origin).addScaledVector(ray.ray.direction, 6.5); tmp.y += 0.8 + Math.sin(t * 3) * 0.15;
    const before = tmp2.copy(familiar.position);
    familiar.position.lerp(tmp, Math.min(1, dt * 2.2));
    if (before.distanceToSquared(familiar.position) > 1e-6) familiar.lookAt(tmp.copy(familiar.position).sub(before).add(familiar.position));
    const f = Math.sin(t * 14) * 0.95 + 0.25; familiar.userData.l.rotation.z = f; familiar.userData.r.rotation.z = -f;
  }
  resolveHover(performance.now());
  const covered = !$index.hidden || !$menu.hidden || paged;
  if (!covered) composer.render();
  // adaptive quality: if the device cannot hold a smooth rate, trade resolution, then glow, for speed
  acc += dt; frames++;
  if (acc > 1.5) {
    const fps = frames / acc; acc = 0; frames = 0;
    if (!covered && document.visibilityState === 'visible') {
      if (fps < 42 && bloomPass.enabled) bloomPass.enabled = false;
      else if (fps < 36 && dpr > dprFloor) { dpr = Math.max(dprFloor, dpr - 0.25); applyQuality(); }
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- boot ---------- */
resize();
// change the scene: fade the painting down, swap it, bring it back up
let sceneBusy = false, sceneToastT = 0;
async function setScene(i) {
  if (sceneBusy || !backdrop) return; sceneBusy = true;
  sceneI = (i + SCENES.length) % SCENES.length; const [k, name] = SCENES[sceneI];
  try { localStorage.setItem('gaia-scene', k); } catch (e) { /* private mode */ }
  const btn = $('#scene-toggle'); btn.classList.add('busy'); $('#scene-name').textContent = name; btn.setAttribute('aria-label', `Garden scene: ${name}. Change scene`);
  const toast = $('#scene-toast'); toast.textContent = name; toast.hidden = false; toast.classList.remove('out'); clearTimeout(sceneToastT); sceneToastT = setTimeout(() => toast.classList.add('out'), 1800);
  const t = tex[k] || await loadTex(k);
  const c = backdrop.material.color; gsap.killTweensOf(c);
  await new Promise((res) => gsap.to(c, { r: 0.08, g: 0.08, b: 0.12, duration: 0.28, ease: 'sine.in', onComplete: res }));
  if (t) { backdrop.material.map = prepBackdrop(t); backdrop.material.needsUpdate = true; }
  gsap.to(c, { r: 1, g: 1, b: 1, duration: 0.6, ease: 'sine.out' });
  btn.classList.remove('busy'); sceneBusy = false; audio.play('page');
}
Promise.all([SCENES[sceneI][0]].map((n) => loadTex(n))).then(() => {
  buildWorld(); buildBackdrop();
  renderBasket();
  camPos.set(0, 7, 64); camLook.copy(byId.gate.camLook);
  gsap.to(camPos, { z: 58, duration: 6, ease: 'sine.out' });
  const b = $('#enter-yes'); b.disabled = false; b.textContent = 'I am 21 or older, enter the garden';
  // age already confirmed (here or in the apothecary): straight in, to the plants
  setTimeout(() => b.click(), 0);   // there is no opening screen: age is confirmed in the apothecary, which is the only way in
  requestAnimationFrame(frame);
  window.__ready = true; window.__dbg = { STATIONS, camPos, camLook, get selected() { return selected; } };
});

// a wheel turned anywhere scrolls whatever is open to read
addEventListener('wheel', (e) => { const box = ['#info .column-in', '#detail .panel-in'].map((q) => document.querySelector(q)).find((n) => n && !n.closest('[hidden]')); if (box && !box.contains(e.target) && !e.target.closest('.consult, .sheet, #menu, #index')) box.scrollTop += e.deltaY; }, { passive: true });

new ResizeObserver(() => document.documentElement.style.setProperty('--bar-h', `${$('#places').offsetHeight}px`)).observe($('#places'));

// the header tells the page how tall it is, so nothing that opens beneath it (a way back, a title) can hide under the logo
const headH = () => { const m = document.querySelector('.top .mark'); if (m && m.offsetParent) document.documentElement.style.setProperty('--head-h', `${Math.ceil(m.getBoundingClientRect().bottom + 12)}px`); };
new ResizeObserver(headH).observe($('#topbar')); addEventListener('resize', headH); document.fonts?.ready.then(headH); new MutationObserver(headH).observe($('#topbar'), { attributes: true, attributeFilter: ['hidden'] }); headH();

// in the grove the wheel (or a sideways swipe on a trackpad) walks along the bed
canvas.addEventListener('wheel', (e) => { const s = current; if (!entered || s?.id !== 'grove' || !s.gFree || portrait || !($('#info').hidden || openK) || travel.t < 0.999) return; e.preventDefault(); s.gtx += (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * 0.012; s.gSel = null; groveClamp(s); }, { passive: false });
addEventListener('keydown', (e) => { const s = current; if (!entered || s?.id !== 'grove' || !s.gFree || portrait || !($('#info').hidden || openK) || !$('#menu').hidden || e.target.closest?.('input, textarea')) return; if (e.key === 'ArrowRight') { s.gtx += 3.5; groveClamp(s); } if (e.key === 'ArrowLeft') { s.gtx -= 3.5; groveClamp(s); } });

// phones: the photo strip takes the height of its tallest photograph, so a product is never cropped
$('#detail-gallery').addEventListener('load', () => {
  const g = $('#detail-gallery'), b = g.firstElementChild; if (!b) return; let h = 0;
  for (const im of g.querySelectorAll('img')) if (im.naturalWidth) h = Math.max(h, b.clientWidth * im.naturalHeight / im.naturalWidth);
  if (h) g.style.setProperty('--gal-h', `${Math.round(Math.min(h, innerHeight * 0.78))}px`);
}, true);
