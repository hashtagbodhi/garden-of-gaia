// Package the Vite build as an artifact page: content-only HTML + app.js + assets/
const fs = require('fs'), path = require('path');
const out = 'artifact'; fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
const html = fs.readFileSync('dist/index.html', 'utf8');
const js = html.match(/src="\.\/(assets\/index-[^"]+\.js)"/)[1], cssf = html.match(/href="\.\/(assets\/index-[^"]+\.css)"/)[1];
let css = fs.readFileSync('dist/' + cssf, 'utf8').replace(/@font-face\{[^}]*\}/g, '');
let body = html.split(/<body[^>]*>/)[1].split('</body>')[0].replace(/<script[^>]*src="\.\/assets\/index-[^"]*"[^>]*><\/script>/, '');
const page = `<title>Garden of Gaia Apothecary</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Emilys+Candy&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Instrument+Sans:wght@400..700&display=swap">
<style>${css}</style>
${body}
<script type="module" src="./app.js"></script>
`;
fs.writeFileSync(out + '/index.html', page);
fs.copyFileSync('dist/' + js, out + '/app.js');
const files = ['app.js'];
for (const d of ['img', 'img-s', 'cut', 'thumb', 'audio', 'gal']) { fs.mkdirSync(`${out}/assets/${d}`, { recursive: true }); for (const f of fs.readdirSync(`dist/assets/${d}`)) { fs.copyFileSync(`dist/assets/${d}/${f}`, `${out}/assets/${d}/${f}`); files.push(`assets/${d}/${f}`); } }
fs.writeFileSync('raw/files.json', JSON.stringify(files.map((p) => ({ path: p }))));
console.log(files.length, 'files', (fs.readFileSync(out + '/index.html').length / 1024).toFixed(1) + 'KB page');
