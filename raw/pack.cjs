// Package the Vite build for the artifact preview: the garden as the main page (content only),
// the classic site as a second full page, and every built script, stylesheet and asset beside them.
const fs = require('fs');
const out = 'artifact'; fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
const FONTS = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Emilys+Candy&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Instrument+Sans:wght@400..700&display=swap">';
const files = [];
const copy = (rel) => { fs.mkdirSync(require('path').dirname(`${out}/${rel}`), { recursive: true }); fs.copyFileSync(`dist/${rel}`, `${out}/${rel}`); files.push(rel); };

// scripts and stylesheets (font files are served by Google Fonts in the preview)
for (const f of fs.readdirSync('dist/assets')) {
  const rel = `assets/${f}`;
  if (f.endsWith('.js')) copy(rel);
  else if (f.endsWith('.css')) { fs.mkdirSync(`${out}/assets`, { recursive: true }); fs.writeFileSync(`${out}/${rel}`, '@charset "UTF-8";\n' + fs.readFileSync(`dist/${rel}`, 'utf8').replace(/@charset "UTF-8";/, '').replace(/@font-face\{[^}]*\}/g, '')); files.push(rel); }
}
// the garden: the artifact page itself, so only its content
const g = fs.readFileSync('dist/index.html', 'utf8');
const head = g.split('<head>')[1].split('</head>')[0];
const tags = (head.match(/<(script|link)[^>]*(src|href)="\.\/assets\/[^"]+"[^>]*>(<\/script>)?/g) || []).join('\n');
const inline = (head.match(/<script>[\s\S]*?<\/script>/g) || []).join('\n');
const body = g.split(/<body[^>]*>/)[1].split('</body>')[0];
fs.writeFileSync(`${out}/index.html`, `<title>Garden of Gaia Apothecary</title>\n${inline}\n${FONTS}\n${tags}\n${body}`);
// the classic site: a second, complete page
fs.writeFileSync(`${out}/classic.html`, fs.readFileSync('dist/classic.html', 'utf8').replace('</head>', `${FONTS}\n</head>`)); files.push('classic.html');
// images and sound
for (const d of ['img', 'img-s', 'cut', 'card', 'thumb', 'gal', 'sfx', 'stock', 'plants']) for (const f of fs.readdirSync(`dist/assets/${d}`)) copy(`assets/${d}/${f}`);
const walk = (d) => fs.readdirSync(`dist/${d}`, { withFileTypes: true }).forEach((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : copy(`${d}/${e.name}`)));
walk('assets/models');   // scanned 3D plants: model.json + texture
fs.writeFileSync('raw/files.json', JSON.stringify(files.map((p) => ({ path: p }))));
console.log(files.length, 'files', (fs.readFileSync(`${out}/index.html`).length / 1024).toFixed(1) + 'KB page');
