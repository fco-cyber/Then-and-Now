// Small, accessible charts for your own records: one series per chart, solid hairline
// grid, a 2px line, 9px points with a surface ring, a crosshair and tooltip that follow
// the pointer, and the same readout on keyboard focus. Every value also appears in a
// table or list next to the chart, so nothing is shown by hover alone. Charts are drawn
// at the width they are shown, so their text stays the same size on every screen.
import { esc } from './ui.js';

/**
 * points: [{ y, label, sub }] in time order (oldest first)
 * opts: { yMin, yMax, ticks, band:[lo,hi,label], ref:[value,label], h, name, unit }
 */
export function lineChart(points, opts = {}) {
  if (!points.length) return '<p class="tiny">Nothing recorded yet.</p>';
  const spec = esc(JSON.stringify({ points, opts }));
  return `<div class="chart" data-spec="${spec}" role="group" aria-label="${esc(opts.name || 'Chart')}"><div class="tip" hidden></div></div>`;
}

function draw(el) {
  const { points, opts } = JSON.parse(el.dataset.spec);
  const { yMin = 0, yMax = 10, ticks = [yMin, (yMin + yMax) / 2, yMax], band = null, ref = null, name = 'Chart', unit = '' } = opts;
  const w = Math.max(240, Math.round(el.clientWidth || 320));
  const h = opts.h || Math.round(Math.min(240, Math.max(150, w * 0.42)));
  const L = 34, R = 14, T = 14, B = 26, n = points.length;
  const px = i => n === 1 ? (L + (w - R)) / 2 : L + (i / (n - 1)) * (w - L - R);
  const py = v => T + (1 - (v - yMin) / (yMax - yMin)) * (h - T - B);
  const grid = ticks.map(t => `<line class="ax" x1="${L}" x2="${w - R}" y1="${py(t).toFixed(1)}" y2="${py(t).toFixed(1)}"/>
    <text x="${L - 7}" y="${(py(t) + 4).toFixed(1)}" text-anchor="end">${t}</text>`).join('');
  const bTop = band ? py(Math.min(band[1], yMax)) : 0;
  const bandEl = band ? `<rect class="band" x="${L}" width="${w - L - R}" y="${bTop.toFixed(1)}" height="${(py(band[0]) - bTop).toFixed(1)}"/>
    <text x="${w - R - 4}" y="${(bTop + 13).toFixed(1)}" text-anchor="end">${esc(band[2])}</text>` : '';
  const refEl = ref ? `<line class="thr" x1="${L}" x2="${w - R}" y1="${py(ref[0]).toFixed(1)}" y2="${py(ref[0]).toFixed(1)}"/>
    <text x="${L + 6}" y="${(py(ref[0]) - 5).toFixed(1)}">${esc(ref[1])}</text>` : '';
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
  const area = n > 1 && !band ? `<path class="area" d="${d} L${px(n - 1).toFixed(1)},${py(yMin).toFixed(1)} L${px(0).toFixed(1)},${py(yMin).toFixed(1)} Z"/>` : '';
  const pts = points.map((p, i) => `<g>
      <circle class="hit" cx="${px(i).toFixed(1)}" cy="${py(p.y).toFixed(1)}" r="12" tabindex="0" role="img"
        aria-label="${esc(p.label)}: ${p.y}${esc(unit)}${p.sub ? ', ' + esc(p.sub) : ''}"/>
      <circle class="pt" cx="${px(i).toFixed(1)}" cy="${py(p.y).toFixed(1)}" r="${n > 40 ? 3.5 : 4.5}"/></g>`).join('');
  const xl = [0, n - 1].filter((v, i, a) => a.indexOf(v) === i).map(i =>
    `<text x="${px(i).toFixed(1)}" y="${h - 6}" text-anchor="${n === 1 ? 'middle' : i ? 'end' : 'start'}">${esc(points[i].label)}</text>`).join('');
  el.querySelector('svg')?.remove();
  el.insertAdjacentHTML('afterbegin', `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="false">
    <title>${esc(name)}</title>${bandEl}${grid}${refEl}${area}<path class="ln" d="${d}"/>
    <line class="xh" x1="0" x2="0" y1="${T}" y2="${h - B}" visibility="hidden"/>${pts}${xl}</svg>`);
  wire(el, points.map((p, i) => [px(i), py(p.y), p.y, p.label, p.sub || '']), unit);
}

function wire(el, pts, unit) {
  const svg = el.querySelector('svg'), tip = el.querySelector('.tip'), xh = svg.querySelector('.xh');
  const show = i => {
    const [x, y, v, label, sub] = pts[i];
    xh.setAttribute('x1', x); xh.setAttribute('x2', x); xh.setAttribute('visibility', 'visible');
    svg.querySelectorAll('.pt').forEach((c, j) => c.classList.toggle('on', j === i));
    tip.textContent = '';
    const b = document.createElement('b'); b.textContent = v + unit; tip.append(b);
    tip.append(document.createTextNode(label + (sub ? ' · ' + sub : '')));
    tip.hidden = false;
    const tw = tip.offsetWidth, W = svg.clientWidth;
    tip.style.left = Math.max(0, Math.min(x - tw / 2, W - tw)) + 'px';
    tip.style.top = Math.max(0, y - tip.offsetHeight - 14) + 'px';
  };
  const hide = () => { tip.hidden = true; xh.setAttribute('visibility', 'hidden'); svg.querySelectorAll('.pt.on').forEach(c => c.classList.remove('on')); };
  svg.addEventListener('pointermove', e => {
    const r = svg.getBoundingClientRect(), x = e.clientX - r.left;
    let best = 0, bd = Infinity;
    pts.forEach((p, i) => { const dd = Math.abs(p[0] - x); if (dd < bd) { bd = dd; best = i; } });
    show(best);
  });
  svg.addEventListener('pointerleave', hide);
  svg.querySelectorAll('.hit').forEach((c, i) => { c.addEventListener('focus', () => show(i)); c.addEventListener('blur', hide); });
}

let ro = null;
export function bindCharts(root) {
  const els = [...root.querySelectorAll('.chart[data-spec]')];
  els.forEach(draw);
  if (!ro && 'ResizeObserver' in window) {
    const last = new WeakMap();
    ro = new ResizeObserver(entries => entries.forEach(en => {
      const w = Math.round(en.contentRect.width);
      if (Math.abs((last.get(en.target) || 0) - w) > 8) { last.set(en.target, w); if (en.target.isConnected) draw(en.target); }
    }));
  }
  els.forEach(e => ro && ro.observe(e));
}
