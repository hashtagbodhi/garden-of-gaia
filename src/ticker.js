// The announcement bar: a slow marquee. When someone has asked their device for less motion, the marquee is
// replaced by the same messages shown one at a time, so the bar never just sits there cut off mid-sentence.
export function runTicker(track, items, reduce) {
  const span = (t) => { const s = document.createElement('span'); s.append(t, Object.assign(document.createElement('i'), { textContent: '✦', ariaHidden: 'true' })); return s; };
  if (reduce) {
    track.classList.add('still'); let i = 0;
    items = items.flatMap((t) => (t.length > 46 ? t.split(/(?<=\.)\s+/) : [t]));   // long lines are shown a sentence at a time so nothing is cut off
    const show = () => { track.replaceChildren(Object.assign(document.createElement('span'), { textContent: items[i % items.length] })); i++; };
    show(); setInterval(show, 4200);
    return;
  }
  const set = () => { const d = document.createElement('div'); d.className = 'ticker-set'; d.append(...items.map(span)); return d; };
  track.replaceChildren(set(), set());
  // long lines on a small screen need longer to cross: keep the reading pace even at any width
  const pace = () => { track.style.animationDuration = `${Math.max(18, Math.round(track.scrollWidth / 2 / 55))}s`; };
  pace(); addEventListener('resize', pace);
}
