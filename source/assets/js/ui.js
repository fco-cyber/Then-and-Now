// Small DOM and formatting helpers, palettes and the medallion renderer.
// No framework, no dependencies, no network.
import { SCENES } from './scenes.js';

let vigSeq = 0;

/* ------------------------------------------------------------- palettes --
 * Six palettes, each with a light and a dark version. "Harbour" is the
 * default (version 2 on). "Journey" keeps the exact colours of The Journey.
 * Each palette also carries five medallion tones (navy, teal, green, gold,
 * rose) so the artwork follows the palette.
 * Tone colours are resolved to literal values at render time, so the inline
 * SVG never depends on CSS custom properties cascading into it. */
export const PALS = [
  { id: 'harbour', name: 'Harbour', note: 'Misty blue water and sea glass. The default.',
    dots: ['#1D4A63', '#3F8C86', '#F2F6F7'],
    hues: { navy: [203, 55], teal: [178, 45], green: [150, 30], gold: [36, 55], rose: [352, 40] } },
  { id: 'journey', name: 'Journey', note: 'Warm paper, navy ink and gold. The original.',
    dots: ['#16334E', '#B0873A', '#F6F4EF'],
    hues: { navy: [210, 56], teal: [184, 70], green: [95, 36], gold: [42, 58], rose: [3, 38] } },
  { id: 'eucalypt', name: 'Eucalypt', note: 'Gum-leaf green and soft bark.',
    dots: ['#2C4A3B', '#9A6B3F', '#F4F5EF'],
    hues: { navy: [150, 28], teal: [168, 34], green: [95, 30], gold: [32, 48], rose: [14, 38] } },
  { id: 'dusk', name: 'Dusk', note: 'Lavender sky and a low apricot sun.',
    dots: ['#3B3566', '#C27C4A', '#F5F3F8'],
    hues: { navy: [248, 32], teal: [275, 24], green: [200, 26], gold: [28, 55], rose: [330, 32] } },
  { id: 'clay', name: 'Clay', note: 'Terracotta, sand and river stone.',
    dots: ['#5A3424', '#3E6E6A', '#F8F3EE'],
    hues: { navy: [18, 42], teal: [180, 28], green: [88, 26], gold: [38, 55], rose: [356, 40] } },
  { id: 'slate', name: 'Slate', note: 'Quiet greys. The least stimulating.',
    dots: ['#2A3640', '#4A7A80', '#F3F4F5'],
    hues: { navy: [208, 18], teal: [186, 22], green: [140, 14], gold: [40, 30], rose: [8, 18] } }
];

/* The Journey's own literal medallion colours, kept exactly for its light mode. */
const JOURNEY_LIGHT = {
  navy:  { ink: '#16334E', mid: '#9FBDD4', tint: '#E9F1F7', soft: '#CBDCEA', acc: '#B0873A' },
  teal:  { ink: '#0D555A', mid: '#94C2BF', tint: '#E5F1F0', soft: '#C3DEDB', acc: '#B0873A' },
  green: { ink: '#3D5629', mid: '#AEC49A', tint: '#EDF3E6', soft: '#D0DEC0', acc: '#B0873A' },
  gold:  { ink: '#7E6120', mid: '#DCC58C', tint: '#FBF3E2', soft: '#EBDCB4', acc: '#8C4340' },
  rose:  { ink: '#87403D', mid: '#DDB2AE', tint: '#FAEBE9', soft: '#EDCFCC', acc: '#7E6120' }
};

function hsl(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const x = v => Math.round(v * 255).toString(16).padStart(2, '0');
  return '#' + x(f(0)) + x(f(8)) + x(f(4));
}

function computeTone(pal, tone, dark) {
  const [h, s] = pal.hues[tone];
  const [gh, gs] = pal.hues.gold;
  const accH = tone === 'gold' ? pal.hues.rose[0] : gh;
  const accS = tone === 'gold' ? Math.max(pal.hues.rose[1], 30) : Math.max(gs, 35);
  if (!dark) return {
    ink: hsl(h, Math.min(70, s + 10), 21), mid: hsl(h, Math.max(18, s * .62), 70),
    tint: hsl(h, Math.max(16, s * .7), 94), soft: hsl(h, Math.max(14, s * .6), 85),
    acc: hsl(accH, accS, tone === 'gold' ? 38 : 46) };
  return {
    ink: hsl(h, Math.max(22, s * .7), 84), mid: hsl(h, Math.max(16, s * .5), 46),
    tint: hsl(h, Math.max(12, s * .45), 17), soft: hsl(h, Math.max(12, s * .45), 27),
    acc: hsl(accH, Math.max(35, accS), 64) };
}

export const DEFAULT_PAL = 'harbour';
let current = { palette: DEFAULT_PAL, dark: false };
const toneCache = new Map();

/** Called by the app shell whenever palette or theme changes. */
export function setArtMode(palette, dark) {
  current = { palette: PALS.some(p => p.id === palette) ? palette : DEFAULT_PAL, dark: !!dark };
}
export function artMode() { return { ...current }; }

export function tones(tone) {
  const key = current.palette + (current.dark ? ':d:' : ':l:') + tone;
  if (toneCache.has(key)) return toneCache.get(key);
  let t;
  if (current.palette === 'journey' && !current.dark) t = JOURNEY_LIGHT[tone] || JOURNEY_LIGHT.navy;
  else {
    const pal = PALS.find(p => p.id === current.palette) || PALS[0];
    t = computeTone(pal, pal.hues[tone] ? tone : 'navy', current.dark);
  }
  toneCache.set(key, t);
  return t;
}

/** Swap the scene's paint classes for literal fill/stroke attributes. */
function paint(body, P) {
  return body.replace(/class="([^"]*)"/g, (m, cls) => {
    const out = [];
    for (const c of cls.split(/\s+/)) {
      const k = c.slice(2);
      if (c.startsWith('f-') && P[k]) out.push(`fill="${P[k]}"`);
      else if (c.startsWith('s-') && P[k]) out.push(`stroke="${P[k]}"`);
    }
    return out.join(' ');
  });
}

/** Render a medallion vignette. `tone` is navy|teal|green|gold|rose. */
export function vig(name, tone = 'navy', size = 64, label = '') {
  const body = SCENES[name] || SCENES.lotus;
  const P = tones(tone);
  const id = `vc${++vigSeq}`;
  const px = typeof size === 'number' ? `${size}px` : size;
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<span class="v" style="width:${px};height:${px}">
    <svg class="vig" viewBox="0 0 100 100" ${a11y} focusable="false">
      <defs><clipPath id="${id}"><circle cx="50" cy="50" r="47"/></clipPath></defs>
      <circle cx="50" cy="50" r="47" fill="${P.tint}"/>
      <g clip-path="url(#${id})">${paint(body, P)}</g>
      <circle cx="50" cy="50" r="47" fill="none" stroke="${P.ink}" stroke-width="1.6" opacity=".45"/>
    </svg></span>`;
}

export const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* Pages attach their handlers to the page area, which stays in place from page to
 * page. Each handler carries the current view's signal, and the app starts a new view
 * before every page binds, so handlers from earlier visits are removed instead of piling
 * up (version 1 let them pile up: a button could act once per earlier visit). */
let viewCtl = new AbortController();
export function newView() { viewCtl.abort(); viewCtl = new AbortController(); }
export function viewSignal() { return viewCtl.signal; }
export function on(root, evt, sel, fn) {
  root.addEventListener(evt, e => {
    const t = e.target.closest(sel);
    if (t && root.contains(t)) fn(e, t);
  }, { signal: viewCtl.signal });
}
export function debounce(fn, ms = 400) {
  let id;
  return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), ms); };
}
export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString(undefined,
    { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
export function fmtShort(ts) {
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
export function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
export function ago(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 90) return 'just now';
  const m = s / 60; if (m < 60) return `${Math.round(m)} min ago`;
  const hr = m / 60; if (hr < 24) return `${Math.round(hr)} h ago`;
  const d = hr / 24; if (d < 7) return `${Math.round(d)} d ago`;
  return fmtDate(ts);
}

let toastTimer;
export function toast(msg) {
  document.querySelector('.toast')?.remove();
  const el = h(`<div class="toast" role="status">${esc(msg)}</div>`);
  document.body.append(el);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2800);
}

/** Promise-based confirm dialog. Returns true/false. */
export function confirmBox({ title, body, ok = 'Continue', danger = false }) {
  return new Promise(resolve => {
    const dlg = h(`<dialog class="dlg"><form method="dialog" class="in">
      <h3>${esc(title)}</h3>
      <p class="muted small">${body}</p>
      <div class="row end" style="margin-top:1rem">
        <button value="no" class="btn ghost">Cancel</button>
        <button value="yes" class="btn ${danger ? 'danger' : ''}">${esc(ok)}</button>
      </div></form></dialog>`);
    document.body.append(dlg);
    dlg.addEventListener('close', () => { resolve(dlg.returnValue === 'yes'); dlg.remove(); });
    dlg.showModal();
  });
}

/** Prompt for a single line of text (or a passphrase). */
export function promptBox({ title, body = '', label, type = 'text', ok = 'Save' }) {
  return new Promise(resolve => {
    const dlg = h(`<dialog class="dlg"><form method="dialog" class="in">
      <h3>${esc(title)}</h3>
      ${body ? `<p class="muted small">${body}</p>` : ''}
      <label class="field"><span class="lbl">${esc(label)}</span>
        <input type="${type}" name="value" autocomplete="off"></label>
      <div class="row end">
        <button value="no" class="btn ghost">Cancel</button>
        <button value="yes" class="btn">${esc(ok)}</button>
      </div></form></dialog>`);
    document.body.append(dlg);
    dlg.addEventListener('close', () => {
      const v = dlg.querySelector('[name=value]').value;
      resolve(dlg.returnValue === 'yes' ? v : null);
      dlg.remove();
    });
    dlg.showModal();
    setTimeout(() => dlg.querySelector('input')?.focus(), 30);
  });
}

/** Auto-growing textarea. */
export function autogrow(ta) {
  const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.max(ta.scrollHeight + 2, 84) + 'px'; };
  ta.addEventListener('input', fit);
  requestAnimationFrame(fit);
  return fit;
}

export function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Small line chart in SVG. points = [{y:0..1, label}] ; colours from CSS. */
export function sparkline(points, { w = 300, hgt = 70, label = 'Trend', yTicks = null } = {}) {
  if (!points.length) return '<p class="tiny">Not enough entries yet.</p>';
  const n = points.length, pad = 8;
  const px = i => (n === 1 ? w / 2 : pad + (i / (n - 1)) * (w - pad * 2));
  const py = v => hgt - pad - v * (hgt - pad * 2);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
  const dots = points.map((p, i) =>
    `<circle class="sp-dot" cx="${px(i).toFixed(1)}" cy="${py(p.y).toFixed(1)}" r="3"><title>${esc(p.label || '')}</title></circle>`).join('');
  const grid = (yTicks || []).map(t => `<line class="sp-grid" x1="${pad}" x2="${w - pad}" y1="${py(t).toFixed(1)}" y2="${py(t).toFixed(1)}"/>`).join('');
  return `<svg class="spark" viewBox="0 0 ${w} ${hgt}" role="img" aria-label="${esc(label)}">
    ${grid}<path class="sp-line" d="${d}"/>${dots}</svg>`;
}

/* --------------------------------------------------------- evidence ------
 * Evidence chips and popovers, as in Lymphatica: a grade pill followed by the
 * short name of each source; tapping a source opens who was studied and what
 * was found, with PubMed and DOI links. */
export const GRADE = { strong: ['g-strong', 'Strong'], mod: ['g-mod', 'Moderate'],
                       weak: ['g-weak', 'Weak'], no: ['g-no', 'Not supported'] };
let REFS = {};
export function setRefs(r) { REFS = r; }
export function refs() { return REFS; }
export function ev(g, ids = '') {
  let out = '';
  if (g && GRADE[g]) out += `<span class="g ${GRADE[g][0]}">${GRADE[g][1]}</span>`;
  const list = ids.split(/\s+/).filter(Boolean);
  for (const id of list) {
    const r = REFS[id];
    if (r) out += `<button type="button" class="cite" data-r="${id}" aria-haspopup="dialog" aria-expanded="false">${esc(r.s)}</button>`;
  }
  if (!list.length && g) out += `<span class="cn">clinical consensus</span>`;
  return `<span class="ev">${out}</span>`;
}
export function refLinks(r) {
  let l = '';
  if (r.p) l += `<a href="https://pubmed.ncbi.nlm.nih.gov/${r.p}/" target="_blank" rel="noopener">PMID ${r.p}</a>`;
  if (r.d) l += `<a href="https://doi.org/${r.d}" target="_blank" rel="noopener">DOI ${esc(r.d)}</a>`;
  if (r.u) l += `<a href="${r.u}" target="_blank" rel="noopener">Source</a>`;
  return l;
}
export function refCard(id) {
  const r = REFS[id];
  if (!r) return '<p>Source not found.</p>';
  return `<h4>${esc(r.s)}</h4>
    <p class="small muted">${esc(r.k)}${r.g && GRADE[r.g] ? ` · <span class="g ${GRADE[r.g][0]}">${GRADE[r.g][1]}</span>` : ''}</p>
    <p class="small"><strong>Who:</strong> ${r.pop}</p>
    <p class="small"><strong>Found:</strong> ${r.f}</p>
    <p class="tiny">${esc(r.c)}</p>
    <div class="links">${refLinks(r)}<a href="#/learn/evidence?ref=${id}">Open in library</a></div>`;
}
