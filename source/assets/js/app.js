// Then and Now: router, masthead, settings and lock screen.
import * as store from './store.js';
import { PALS, DEFAULT_PAL, newView, setArtMode, vig, esc, h, toast, setRefs, refCard, confirmBox } from './ui.js';
import { REFS } from './refs.js';
import { STAGES, STEP_BY_ID } from './content.js';
import { GUIDE } from './guidedata.js';
import { REGIONS, RORDER, currentRegion, regionData } from './regions.js';
import * as J from './views/journey.js';
import * as P from './views/practice.js';
import * as I from './views/insight.js';
import * as T from './views/tools.js';
import * as G from './views/guide.js';

setRefs(REFS);
const D = document, ROOT = D.documentElement;
const app = D.getElementById('app'), chrome = D.getElementById('chrome');

// ---------------------------------------------------------------- display --
const mq = matchMedia('(prefers-color-scheme: dark)');
const rm = matchMedia('(prefers-reduced-motion: reduce)');
/** The palette in use: the saved choice if it still exists, otherwise the default. */
const palOf = u => PALS.some(p => p.id === u.palette) ? u.palette : DEFAULT_PAL;
function applyDisplay() {
  const u = store.ui(), pal = palOf(u);
  const dark = u.theme === 'dark' || (u.theme !== 'light' && mq.matches);
  if (pal !== 'journey') ROOT.dataset.palette = pal; else delete ROOT.dataset.palette;
  if (dark) ROOT.dataset.dark = '1'; else delete ROOT.dataset.dark;
  ROOT.dataset.size = u.size || 'm';
  ROOT.classList.toggle('still', u.motion === 'still' || rm.matches);
  setArtMode(pal, dark);
  const tc = D.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute('content', getComputedStyle(ROOT).getPropertyValue('--page').trim() || '#F2F6F7');
}
mq.addEventListener?.('change', () => { applyDisplay(); render(); });
rm.addEventListener?.('change', applyDisplay);

// ---------------------------------------------------------------- routes ---
const ROUTES = [
  [/^$/, () => ['home', 'Home', J.home(), J.bind]],
  [/^stage\/(\d)$/, m => ['stage', `Stage ${m[1]}`, J.stage(m[1]), J.bind]],
  [/^step\/([\w-]+)$/, m => ['step', STEP_BY_ID[m[1]]?.title || 'Step', J.step(m[1]), J.bind]],
  [/^checkin$/, () => ['checkin', 'Check-in', P.checkin(), P.bind]],
  [/^journal$/, (m, q) => ['journal', 'Journal', P.journal(q), P.bind]],
  [/^record$/, (m, q) => ['record', 'Then-and-now record', P.record(q), P.bind]],
  [/^pcl$/, () => ['pcl', 'Symptom check', P.pcl(), P.bind]],
  [/^map$/, () => ['map', 'My PTSD map', I.map(), I.bind]],
  [/^patterns$/, () => ['patterns', 'Patterns', I.patterns(), I.bind]],
  [/^data$/, () => ['data', 'Your data', I.data(), I.bind]],
  [/^tools$/, () => ['tools', 'Tools', T.index(), T.bind]],
  [/^tools\/(ground|breathe|thennow|safety|ladder|pie|nightmare|memory)$/, (m, q) =>
    ['tool', (T.TOOLS.find(t => t[0] === m[1]) || [])[3], T[m[1]](q), T.bind]],
  [/^learn$/, () => ['learn', 'Understand it', G.learnIndex(), G.bind]],
  [/^learn\/evidence$/, (m, q) => ['learn', 'Evidence library', G.evidence(q), G.bind]],
  [/^learn\/([\w-]+)$/, m => ['learn', GUIDE.find(g => g.id === m[1])?.title || 'Guide', G.guide(m[1]), G.bind]],
  [/^help$/, () => ['help', 'Get help', G.help(), G.bind]],
  [/^about$/, () => ['about', 'About', G.about(), G.bind]]
];
const NAV = [['', 'Home'], ['stage/1', 'Stages', /^(stage|step)/], ['checkin', 'Practice', /^(checkin|journal|record|pcl|map)$/],
  ['tools', 'Tools', /^tools/], ['learn', 'Understand', /^learn/], ['patterns', 'Patterns', /^patterns$/]];

function parse() {
  const raw = (location.hash || '#/').slice(2);
  const [path, query = ''] = raw.split('?');
  return { path: path.replace(/\/$/, ''), query };
}
let lastPath = null;
function render() {
  if (store.isLocked()) { lockScreen(); return; }
  T.unbind();
  const { path, query } = parse();
  let out = null, m = null;
  for (const [re, fn] of ROUTES) { m = path.match(re); if (m) { out = fn(m, query); break; } }
  if (!out) out = ['missing', 'Not found', `<div class="card" style="max-width:60ch"><h1>Page not found</h1>
    <p class="muted">That link does not lead anywhere in this app. <a href="#/">Back to the start</a></p></div>`, null];
  const [name, title, html, bind] = out;
  drawChrome(path);
  newView();
  app.innerHTML = html;
  D.title = `${title ? title + ' · ' : ''}Then and Now`;
  if (bind) bind(app, { name, path, query, arg: m && m[1] });
  window.dispatchEvent(new CustomEvent('tn:rendered', { detail: { name } }));
  if (lastPath !== path) {
    if (!/[?&]s=/.test(query) && !/[?&]ref=/.test(query)) window.scrollTo(0, 0);
    if (lastPath !== null) app.focus({ preventScroll: true });
    lastPath = path;
  }
}

// ---------------------------------------------------------------- chrome ---
const ICONS = {
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  ring: '<svg viewBox="0 0 24 24" aria-hidden="true" class="pal-ring"><path class="r1" d="M12 3a9 9 0 0 1 7.8 4.5"/><path class="r2" d="M19.8 16.5A9 9 0 0 1 4.2 16.5"/><path class="r3" d="M4.2 7.5A9 9 0 0 1 12 3"/></svg>'
};
function drawChrome(path) {
  const u = store.ui();
  const showBar = /^(|stage\/\d|step\/.+)$/.test(path);
  const curStage = path.startsWith('stage/') ? +path.split('/')[1] : path.startsWith('step/') ? STEP_BY_ID[path.split('/')[1]]?.stage : null;
  chrome.innerHTML = `
  <header class="masthead"><div class="in">
    <a class="brand" href="#/" aria-label="Then and Now, home">${vig('then_now', 'navy', 38)}
      <span>Then and Now<small>Deconstructing PTSD</small></span></a>
    <nav class="main" aria-label="Main">${NAV.map(([href, label, re]) => {
      const on = re ? re.test(path) : path === href;
      return `<a href="#/${href}" class="${on ? 'on' : ''}" ${on ? 'aria-current="page"' : ''}>${label}</a>`;
    }).join('')}</nav>
    <div class="tools">
      <a class="help-pill" href="#/help"><span class="dot" aria-hidden="true"></span><span>Help<span class="lbl-long">&nbsp;now</span></span></a>
      <button class="icon-btn" id="studio-btn" aria-label="Colours and display" aria-haspopup="dialog" aria-expanded="false" title="Colours and display">${ICONS.ring}</button>
      <button class="icon-btn menu-btn" id="menu-btn" aria-label="Menu" aria-haspopup="dialog">${ICONS.menu}</button>
    </div></div></header>
  ${showBar ? `<nav class="stagebar" aria-label="Stages"><div class="in">${STAGES.map(s =>
    `<a href="#/stage/${s.id}" class="${curStage === s.id ? 'on' : ''}" ${curStage === s.id ? 'aria-current="true"' : ''}><b>${s.id}</b> ${esc(s.short)}</a>`).join('')}</div></nav>` : ''}`;
  D.getElementById('studio-btn').addEventListener('click', e => toggleStudio(e.currentTarget));
  D.getElementById('menu-btn').addEventListener('click', openMenu);
}

function openMenu() {
  const { path } = parse();
  const groups = [
    ['Start', [['', 'Home'], ['help', 'Get help now']]],
    ['The five stages', STAGES.map(s => [`stage/${s.id}`, `${s.id}. ${s.title}`])],
    ['Daily practice', [['checkin', 'Check-in'], ['journal', 'Journal'], ['record', 'Then-and-now record'], ['map', 'My PTSD map'], ['pcl', 'Symptom check']]],
    ['Tools', [['tools', 'All tools'], ['tools/ground', 'Grounding'], ['tools/breathe', 'Slow breathing'], ['tools/safety', 'My safety plan']]],
    ['Understand it', [['learn', 'All guides'], ...GUIDE.map(g => [`learn/${g.id}`, g.title]), ['learn/evidence', 'Evidence library']]],
    ['You', [['patterns', 'Patterns'], ['data', 'Your data'], ['about', 'About']]]
  ];
  const dlg = h(`<dialog class="menu" aria-label="Menu"><div class="in">
    <div class="spread"><strong style="font-family:var(--sans);color:var(--head)">Menu</strong>
      <form method="dialog"><button class="btn quiet" aria-label="Close menu">✕</button></form></div>
    <nav>${groups.map(([t, items]) => `<div class="grp-t">${esc(t)}</div>${items.map(([href, l]) =>
      `<a href="#/${href}" class="${path === href ? 'on' : ''}">${esc(l)}</a>`).join('')}`).join('')}</nav></div></dialog>`);
  D.body.append(dlg);
  dlg.addEventListener('close', () => dlg.remove());
  dlg.addEventListener('click', e => { if (e.target.closest('a')) dlg.close(); if (e.target === dlg) dlg.close(); });
  dlg.showModal();
}

// ---------------------------------------------------------------- studio ---
let studio = null;
function toggleStudio(btn) {
  if (studio) { closeStudio(); return; }
  const u = store.ui();
  const rk = currentRegion();
  studio = h(`<div class="studio" id="studio" role="dialog" aria-label="Colours and display" tabindex="-1">
    <div class="spread"><h3>Colours and display</h3><button class="btn quiet sm" data-close aria-label="Close">✕</button></div>
    <div class="grp"><span class="lbl" id="st-pal">Palette</span>
      <div class="pals" role="radiogroup" aria-labelledby="st-pal">${PALS.map(p => `<button type="button" class="pal" role="radio" aria-checked="${palOf(u) === p.id}" data-pal="${p.id}">
        <span class="dots" aria-hidden="true">${p.dots.map(c => `<i style="background:${c}"></i>`).join('')}</span>
        <span><b>${esc(p.name)}</b><small>${esc(p.note)}</small></span></button>`).join('')}</div></div>
    <div class="grp"><span class="lbl" id="st-th">Light or dark</span><div class="seg" role="group" aria-labelledby="st-th">
      ${[['light', 'Light'], ['dark', 'Dark'], ['', 'Match device']].map(([v, l]) => `<button type="button" data-theme="${v}" aria-pressed="${(u.theme || '') === v}">${l}</button>`).join('')}</div></div>
    <div class="grp"><span class="lbl" id="st-sz">Text size</span><div class="seg" role="group" aria-labelledby="st-sz">
      ${[['m', 'Standard'], ['l', 'Large'], ['xl', 'Larger']].map(([v, l]) => `<button type="button" data-size="${v}" aria-pressed="${(u.size || 'm') === v}">${l}</button>`).join('')}</div></div>
    <div class="grp"><span class="lbl" id="st-mo">Motion</span><div class="seg" role="group" aria-labelledby="st-mo">
      ${[['flow', 'Gentle'], ['still', 'Still']].map(([v, l]) => `<button type="button" data-motion="${v}" aria-pressed="${(u.motion || 'flow') === v}">${l}</button>`).join('')}</div>
      <p class="tiny" style="margin:.35rem 0 0">Still turns off all animation. Your device's reduce-motion setting is always respected.</p></div>
    <div class="grp"><label class="lbl" for="st-reg">Help services for</label>
      <select id="st-reg">${RORDER.map(k => `<option value="${k}" ${k === rk ? 'selected' : ''}>${esc(REGIONS[k].n)}</option>`).join('')}</select></div>
    <div class="grp"><a href="#/data" class="small" data-close>Privacy, passphrase and your data</a></div>
  </div>`);
  D.body.append(studio);
  const r = btn.getBoundingClientRect();
  studio.style.top = (r.bottom + 8) + 'px';
  studio.style.right = Math.max(10, innerWidth - r.right) + 'px';
  btn.setAttribute('aria-expanded', 'true');
  studio.focus();
  studio.addEventListener('click', e => {
    const t = e.target.closest('[data-pal],[data-theme],[data-size],[data-motion],[data-close]');
    if (!t) return;
    if (t.hasAttribute('data-close')) { closeStudio(); return; }
    if (t.dataset.pal) store.setUI({ palette: t.dataset.pal, palPicked: true });
    if (t.hasAttribute('data-theme')) store.setUI({ theme: t.dataset.theme });
    if (t.dataset.size) store.setUI({ size: t.dataset.size });
    if (t.dataset.motion) store.setUI({ motion: t.dataset.motion });
    studio.querySelectorAll('[data-pal]').forEach(b => b.setAttribute('aria-checked', b.dataset.pal === palOf(store.ui())));
    ['theme', 'size', 'motion'].forEach(k => studio.querySelectorAll(`[data-${k}]`).forEach(b =>
      b.setAttribute('aria-pressed', b.dataset[k] === ((store.ui()[k]) ?? '') || (k === 'theme' && !b.dataset[k] && !store.ui().theme))));
    applyDisplay(); rerenderKeepStudio();
  });
  studio.querySelector('#st-reg').addEventListener('change', e => { store.setUI({ region: e.target.value }); toast('Showing services for ' + REGIONS[e.target.value].n); rerenderKeepStudio(); });
  window.dispatchEvent(new CustomEvent('tn:studio'));
}
function rerenderKeepStudio() { const y = scrollY; render(); window.scrollTo(0, y); D.getElementById('studio-btn')?.setAttribute('aria-expanded', studio ? 'true' : 'false'); }
function closeStudio() {
  if (!studio) return;
  studio.remove(); studio = null;
  const b = D.getElementById('studio-btn'); if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); }
}
D.addEventListener('pointerdown', e => {
  if (studio && !studio.contains(e.target) && !e.target.closest('#studio-btn')) closeStudio();
  if (pop && !pop.contains(e.target) && !e.target.closest('.cite')) closePop();
});

// ------------------------------------------------------------- citations ---
let pop = null, popBtn = null;
function closePop() { if (!pop) return; pop.remove(); pop = null; if (popBtn) { popBtn.setAttribute('aria-expanded', 'false'); popBtn.focus(); popBtn = null; } }
D.addEventListener('click', e => {
  const b = e.target.closest('.cite');
  if (!b) return;
  e.preventDefault();
  if (pop && popBtn === b) { closePop(); return; }
  closePop();
  popBtn = b; b.setAttribute('aria-expanded', 'true');
  pop = h(`<div class="pop" role="dialog" aria-label="Source" tabindex="-1">${refCard(b.dataset.r)}
    <div class="row end" style="margin-top:.5rem"><button class="btn quiet sm" data-popclose>Close</button></div></div>`);
  D.body.append(pop);
  const r = b.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = Math.min(Math.max(12, r.left), innerWidth - pw - 12);
  let top = r.bottom + 8; if (top + ph > innerHeight - 12) top = Math.max(12, r.top - ph - 8);
  pop.style.left = left + 'px'; pop.style.top = top + 'px';
  pop.focus();
  pop.querySelector('[data-popclose]').addEventListener('click', closePop);
  pop.addEventListener('click', ev2 => { if (ev2.target.closest('a[href^="#/"]')) { pop.remove(); pop = null; popBtn = null; } });
});
addEventListener('scroll', () => { if (pop) closePop(); }, { passive: true });

// ---------------------------------------------------------------- escape ---
// Escape closes a glossary pop-up or the colours and display panel.
D.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (pop) { closePop(); return; }
  if (studio) closeStudio();
});

// ----------------------------------------------------------- lock screen ---
function lockScreen() {
  newView();
  chrome.innerHTML = `<header class="masthead"><div class="in"><span class="brand">${vig('then_now', 'navy', 38)}<span>Then and Now</span></span>
    <div class="tools"><a class="help-pill" href="#/help" id="lock-help"><span class="dot" aria-hidden="true"></span>Help</a></div></div></header>`;
  const R = regionData();
  app.innerHTML = `<div class="card" style="max-width:460px;margin:3rem auto;text-align:center">
    ${vig('boundaries', 'navy', 84)}
    <h1 style="font-size:1.6rem;margin-top:.6rem">Locked</h1>
    <p class="small muted">Your writing is encrypted. Enter your passphrase to open it.</p>
    <form id="unlock" style="text-align:left">
      <label class="lbl" for="pass">Passphrase</label>
      <input id="pass" autocomplete="off" autocapitalize="off" spellcheck="false" data-1p-ignore data-lpignore="true" required>
      <p class="tiny" id="unlock-msg" aria-live="assertive" style="color:var(--warn)"></p>
      <div class="row end"><button class="btn">Unlock</button></div></form>
    <hr class="rule">
    <p class="tiny">In danger? Call ${esc(R.emText)}. ${R.crisis ? 'Or ' + esc(R.crisis) + '.' : ''}</p>
    <button class="btn quiet sm" id="forgot">Forgotten it? Erase and start again</button></div>`;
  D.title = 'Then and Now';
  D.getElementById('pass').type = 'password'; D.getElementById('pass').focus();
  D.getElementById('lock-help').addEventListener('click', e => { e.preventDefault(); helpWhileLocked(); });
  D.getElementById('unlock').addEventListener('submit', async e => {
    e.preventDefault();
    const res = await store.unlock(D.getElementById('pass').value);
    if (res.ok) render(); else D.getElementById('unlock-msg').textContent = res.error;
  });
  D.getElementById('forgot').addEventListener('click', async () => {
    if (await confirmBox({ title: 'Erase everything?', body: 'Without the passphrase, your writing cannot be recovered. Erasing deletes it from this browser so you can start again.', ok: 'Erase', danger: true })) {
      await store.eraseAll(); render();
    }
  });
}
function helpWhileLocked() { newView(); app.innerHTML = G.help() + '<p style="margin-top:1rem"><button class="btn" id="back-lock">Back to unlock</button></p>'; G.bind(app, { query: '' }); D.getElementById('back-lock').addEventListener('click', lockScreen); }

// --------------------------------------------------------------- welcome ---
function welcome() {
  const R = regionData();
  const dlg = h(`<dialog class="dlg" aria-labelledby="w-t"><div class="in">
    <div style="text-align:center">${vig('then_now', 'navy', 76)}</div>
    <h2 id="w-t" style="text-align:center;margin:.6rem 0 .4rem">Welcome to Then and Now</h2>
    <ul class="small" style="padding-left:1.1rem">
      <li><strong>Private.</strong> Everything you write stays in this browser on this device. There is no account and nothing is sent anywhere.</li>
      <li><strong>Self-help, not therapy.</strong> It works best alongside a GP or trauma-trained therapist, and no one monitors it.</li>
      <li><strong>At your pace.</strong> Nothing here describes trauma in detail. Parts that approach memories are optional and marked.</li>
      <li><strong>If you are in danger</strong>, call ${esc(R.emText)}${R.crisis ? `, or ${esc(R.crisis)}` : ''}.</li></ul>
    <p class="tiny">You can lock your writing with a passphrase in <a href="#/data" data-wclose>Your data</a>.</p>
    <form method="dialog" class="row end"><button class="btn" value="ok" autofocus>Begin</button></form></div></dialog>`);
  D.body.append(dlg);
  dlg.addEventListener('close', () => { store.setUI({ seenWelcome: true }); dlg.remove(); });
  dlg.querySelector('[data-wclose]').addEventListener('click', () => dlg.close());
  dlg.showModal();
}

// ------------------------------------------------------------------ boot ---
window.addEventListener('hashchange', () => { closePop(); render(); });
window.addEventListener('tn:lock', async () => { if (await store.relock()) render(); });
window.addEventListener('tn:storage-full', () => toast('This browser\'s storage is full. Export a copy of your data to be safe.'));
window.addEventListener('pagehide', () => { store.flush(); });
window.addEventListener('storage', async e => { if (e.key === 'thenandnow.v1' && await store.reload()) render(); });
D.addEventListener('visibilitychange', () => { if (D.visibilityState === 'hidden') store.flush(); });

(async function boot() {
  applyDisplay();
  const res = await store.boot();
  if (!res.ok) toast(res.error);
  render();
  if (!store.isLocked() && !store.ui().seenWelcome) welcome();
})();
