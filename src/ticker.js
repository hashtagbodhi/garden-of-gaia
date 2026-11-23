// The announcement bar: a slow, ornate marquee. Each message is dressed differently (a starburst for the offer,
// a gold-edged pill, a leaf-green tag, hand lettering) with little garden marks between them.
// When someone has asked their device for less motion, the messages are shown one at a time instead.
const MARKS = ['✦', '❀', '☾', '✿', '❋', '☽'];
const mk = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
function dress(text, i) {
  const s = mk('span', `tk tk-${'abcd'[i % 4]}`);
  const offer = text.match(/^(\d+%\s*off)\s*(.*)$/i);
  if (offer) { s.className = 'tk tk-offer'; s.append(mk('b', 'tk-burst', offer[1]), mk('span', 'tk-rest', offer[2])); } else s.append(mk('span', 'tk-t', text));
  return s;
}
export function runTicker(track, items, reduce) {
  track.parentElement.classList.add('tkbar');
  // long lines read better a sentence at a time
  items = items.flatMap((t) => (t.length > 46 ? t.split(/(?<=[a-z0-9]\.)\s+(?=[A-Z])/) : [t])).map((t) => t.replace(/\.$/, ''));
  if (reduce) {
    track.classList.add('still'); let i = 0;
    const show = () => { track.replaceChildren(dress(items[i % items.length], i)); i++; };
    show(); setInterval(show, 4200);
    return;
  }
  const set = () => { const d = mk('div', 'ticker-set'); items.forEach((t, i) => d.append(dress(t, i), mk('i', `tk-m tk-m${i % 3}`, MARKS[i % MARKS.length]))); return d; };
  track.replaceChildren(set(), set());
  // keep an even reading pace at any width
  const pace = () => { track.style.animationDuration = `${Math.max(20, Math.round(track.scrollWidth / 2 / 52))}s`; };
  pace(); addEventListener('resize', pace); document.fonts?.ready.then(pace);
}
