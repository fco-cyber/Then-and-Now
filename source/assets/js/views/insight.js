// My PTSD map, Patterns, and Your data.
import { MAP_FIELDS, STAGES, ALL_STEPS, TRAPS, CHECK_TOOLS } from '../content.js';
import * as store from '../store.js';
import { vig, esc, on, toast, confirmBox, promptBox, download, fmtDate, fmtShort, ago } from '../ui.js';
import { lineChart, bindCharts } from '../charts.js';

const refresh = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

// ================================================================== map ===
export function map() {
  const m = store.get().map;
  const links = m.links || [];
  const byId = {};
  MAP_FIELDS.forEach(f => (m[f.key] || []).forEach(n => { byId[n.id] = { ...n, field: f.key, label: f.label }; }));
  const cols = MAP_FIELDS.map(f => {
    const nodes = (m[f.key] || []).map(n => {
      const linked = links.filter(l => l.a === n.id || l.b === n.id).length;
      return `<div class="node" data-node="${n.id}">
        <span class="txt">${esc(n.text)}${linked ? `<span class="tiny"> · ${linked} link${linked > 1 ? 's' : ''}</span>` : ''}</span>
        <button class="x" data-link-from="${n.id}" aria-label="Connect “${esc(n.text)}” to another entry" title="Connect to another entry">⇄</button>
        <button class="x" data-del-node="${f.key}:${n.id}" aria-label="Remove “${esc(n.text)}”" title="Remove">×</button></div>`;
    }).join('');
    return `<section class="card mapcol" aria-labelledby="mc-${f.key}">
      <h2 id="mc-${f.key}" style="font-size:1rem" class="row tight">${vig(f.scene, f.key === 'helps' ? 'green' : 'navy', 34)} ${esc(f.label)}</h2>
      <p class="tiny">${esc(f.hint)}</p>
      ${nodes || '<p class="tiny muted">Nothing here yet.</p>'}
      <form class="row tight" data-add="${f.key}" style="margin-top:.6rem;flex-wrap:nowrap">
        <label class="sr-only" for="add-${f.key}">Add to ${esc(f.label)}</label>
        <input type="text" id="add-${f.key}" name="text" placeholder="Add…" style="flex:1;min-width:0">
        <button class="btn ghost sm">Add</button></form></section>`;
  }).join('');
  const linkList = links.length ? links.map(l => {
    const a = byId[l.a], b = byId[l.b];
    if (!a || !b) return '';
    return `<div class="spread" style="border-bottom:1px solid var(--line);padding:.4rem 0;flex-wrap:nowrap">
      <span class="small"><span class="tag">${esc(a.label)}</span> ${esc(a.text)} <span class="muted">↔</span>
        <span class="tag">${esc(b.label)}</span> ${esc(b.text)}</span>
      <button class="btn quiet sm" data-unlink="${l.a}|${l.b}" aria-label="Remove this connection">×</button></div>`;
  }).join('') : '<p class="tiny muted">No connections yet. Use ⇄ on an entry, then choose another, to connect them: for example a belief and the way of coping that protects it.</p>';
  const total = MAP_FIELDS.reduce((n, f) => n + (m[f.key] || []).length, 0);
  return `
  <div class="hero" style="margin-bottom:1.2rem"><div>
    <div class="eyebrow">Stage 1, in your own words</div>
    <h1>My PTSD map</h1>
    <p class="lede">The cycle that keeps PTSD going, rebuilt from your own experience. Add what is true for you, then connect
      the parts that feed each other. Clinicians call this a formulation; it is a good thing to bring to a therapist.</p></div>
    ${vig('hub_construct', 'navy', 96)}</div>
  ${total ? ring(m) : `<div class="card" style="text-align:center;padding:2rem"><p class="muted" style="margin:0">Add a few entries below
    and your own map will draw itself here. Not sure where to start? <a href="#/learn/cycle">See the general cycle</a>.</p></div>`}
  <div class="mapgrid" style="margin-top:1.2rem">${cols}</div>
  <h2 style="margin:1.8rem 0 .4rem">Connections</h2>
  <div class="card" id="links">${linkList}</div>
  <div class="card" style="margin-top:1rem;display:flex;gap:.9rem;align-items:center">${vig('held', 'teal', 50)}
    <p class="serif-note" style="margin:0">Seeing the cycle laid out is not the same as being stuck in it. Every part on this map is a
      place where change can start.</p></div>`;
}

function ring(m) {
  const W = 760, H = 540, cx = 380, cy = 278;
  const order = ['reminders', 'intrusions', 'body', 'behaviours', 'meanings'];
  const ang = [-90, -18, 54, 126, 198];
  const bw = 196;
  const F = Object.fromEntries(MAP_FIELDS.map(f => [f.key, f]));
  const pos = order.map((k, i) => {
    const a = ang[i] * Math.PI / 180;
    return { k, x: cx + Math.cos(a) * 270 - bw / 2, y: cy + Math.sin(a) * 186 - 46 };
  });
  const box = (k, x, y, hot) => {
    const items = (m[k] || []);
    const lines = items.slice(0, 3).map(n => n.text.length > 28 ? n.text.slice(0, 27) + '…' : n.text);
    const h = 40 + Math.max(1, lines.length) * 16 + (items.length > 3 ? 14 : 0);
    return `<g><rect class="${hot ? 'box-ok' : 'box'}" x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${bw}" height="${h}" rx="12"/>
      <text class="${hot ? 't-ok' : 't-strong'}" x="${(x + 12).toFixed(0)}" y="${(y + 22).toFixed(0)}" font-size="13">${esc(F[k].label)}</text>
      ${lines.length ? lines.map((l, j) => `<text class="t-body" x="${(x + 12).toFixed(0)}" y="${(y + 42 + j * 16).toFixed(0)}" font-size="11.5">${esc(l)}</text>`).join('')
        : `<text class="t-muted" x="${(x + 12).toFixed(0)}" y="${(y + 42).toFixed(0)}" font-size="11.5">(nothing yet)</text>`}
      ${items.length > 3 ? `<text class="t-muted" x="${(x + 12).toFixed(0)}" y="${(y + 42 + 3 * 16).toFixed(0)}" font-size="11">+${items.length - 3} more</text>` : ''}</g>`;
  };
  const arrows = pos.map((p, i) => {
    const q = pos[(i + 1) % pos.length];
    const a1 = { x: p.x + bw / 2, y: p.y + 46 }, a2 = { x: q.x + bw / 2, y: q.y + 46 };
    const mx = (a1.x + a2.x) / 2, my = (a1.y + a2.y) / 2;
    const ox = (mx - cx) * 0.28, oy = (my - cy) * 0.28;
    const sx = a1.x + (a2.x - a1.x) * 0.3, sy = a1.y + (a2.y - a1.y) * 0.3;
    const ex = a1.x + (a2.x - a1.x) * 0.7, ey = a1.y + (a2.y - a1.y) * 0.7;
    return `<path class="arrow-hot" d="M${sx.toFixed(0)},${sy.toFixed(0)} Q${(mx + ox).toFixed(0)},${(my + oy).toFixed(0)} ${ex.toFixed(0)},${ey.toFixed(0)}" marker-end="url(#mh)"/>`;
  }).join('');
  return `<figure class="fig card" style="padding:.6rem"><svg class="dg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="mymap-t mymap-d">
    <title id="mymap-t">My PTSD map</title>
    <desc id="mymap-d">Your own entries arranged as a cycle: ${order.map(k => `${F[k].label}: ${(m[k] || []).map(n => n.text).join('; ') || 'nothing yet'}`).join('. ')}.
      What helps: ${(m.helps || []).map(n => n.text).join('; ') || 'nothing yet'}.</desc>
    <defs><marker id="mh" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fill-warn"/></marker></defs>
    ${arrows}
    <ellipse cx="${cx}" cy="${cy}" rx="92" ry="44" class="box-hot"/>
    <text class="t-warn" x="${cx}" y="${cy - 3}" font-size="13" text-anchor="middle">A sense of</text>
    <text class="t-warn" x="${cx}" y="${cy + 14}" font-size="13" text-anchor="middle">current threat</text>
    ${pos.map(p => box(p.k, p.x, p.y)).join('')}
    ${box('helps', 12, H - 118, true)}
  </svg><figcaption>Your map, drawn from what you have added. The green box is what helps; it can break the cycle at any point.</figcaption></figure>`;
}

// ============================================================= patterns ===
export function patterns() {
  const s = store.get();
  const days = [];
  const d0 = new Date(); d0.setHours(12, 0, 0, 0);
  for (let i = 26 * 7 - 1; i >= 0; i--) {
    const dd = new Date(d0); dd.setDate(d0.getDate() - i);
    const k = store.today(dd);
    days.push({ k, n: Math.min(4, (s.practices[k] || []).length) });
  }
  const heat = `<div class="heat" role="img" aria-label="Days with practice over the last 26 weeks: ${days.filter(x => x.n).length} of ${days.length}">${
    Array.from({ length: 26 }, (_, w) => `<div class="wk">${days.slice(w * 7, w * 7 + 7).map(x =>
      `<i data-n="${x.n}" title="${x.k}: ${x.n ? x.n + ' practice' + (x.n > 1 ? 's' : '') : 'none'}"></i>`).join('')}</div>`).join('')}</div>
    <div class="legend" aria-hidden="true"><span>fewer</span>${[0, 1, 2, 3, 4].map(n => `<i class="lk-sq" style="background:${n ? `color-mix(in srgb, var(--sec) ${[0, 30, 52, 75, 100][n]}%, var(--card))` : 'var(--track)'}"></i>`).join('')}<span>more</span></div>`;
  const cks = s.checkins.slice(0, 60).reverse();
  const distChart = cks.length > 1 ? lineChart(cks.map(c => ({ y: c.distress, label: fmtShort(c.at) })), { name: 'Distress at check-ins', unit: '/10' }) : '';
  const sleepCk = cks.filter(c => c.sleep != null);
  const sleepChart = sleepCk.length > 1 ? lineChart(sleepCk.map(c => ({ y: c.sleep, label: fmtShort(c.at) })), { name: 'Sleep quality at check-ins', unit: '/10' }) : '';
  const pclH = s.pcl.slice(0, 24).reverse();
  const pclChart = pclH.length > 1 ? lineChart(pclH.map(p => ({ y: p.total, label: fmtShort(p.at) })),
    { yMin: 0, yMax: 80, ticks: [0, 40, 80], band: [31, 80, '31 or more: probable PTSD range'], name: 'PCL-5 totals', unit: ' of 80' }) : '';
  const recs = s.records.filter(r => r.distressAfter != null);
  const avgD = recs.length ? (recs.reduce((n, r) => n + (r.distressBefore - r.distressAfter), 0) / recs.length) : null;
  const recB = s.records.filter(r => r.beliefAfter != null);
  const avgB = recB.length ? Math.round(recB.reduce((n, r) => n + (r.beliefBefore - r.beliefAfter), 0) / recB.length) : null;
  const count = arr => arr.reduce((acc, k) => (acc[k] = (acc[k] || 0) + 1, acc), {});
  const top = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const bars = (rows, cls = '', labeler = k => k) => rows.length ? `<div class="freq ${cls}">${rows.map(([k, n]) =>
      `<div class="r"><span class="k" title="${esc(labeler(k))}">${esc(labeler(k))}</span>
        <span class="track"><i style="width:${Math.max(6, (n / rows[0][1]) * 100)}%"></i></span><span class="tiny n">${n}</span></div>`).join('')}</div>`
    : '<p class="tiny muted">Nothing recorded yet.</p>';
  const toolName = k => (CHECK_TOOLS.find(t => t[0] === k) || [, k])[1];
  const byStage = STAGES.map(st => {
    const ids = st.panels.filter(p => p.kind === 'path').flatMap(p => p.steps.map(x => x.id));
    const p = store.stageProgress(ids);
    return `<div class="r"><span class="k">${esc(st.short)}</span><span class="track"><i style="width:${(p.done / p.total) * 100}%"></i></span>
      <span class="tiny n">${p.done}/${p.total}</span></div>`;
  }).join('');
  const ladderDone = s.ladder.filter(r => r.done).length;
  const settled = ALL_STEPS.filter(x => s.steps[x.id]?.status === 'settled')
    .sort((a, b) => (s.steps[b.id].updatedAt || 0) - (s.steps[a.id].updatedAt || 0)).slice(0, 6);
  return `
  <div class="hero" style="margin-bottom:1.2rem"><div>
    <div class="eyebrow">Review</div><h1>Patterns</h1>
    <p class="lede">What has been happening, drawn only from what you have recorded. Review it monthly; adjust, do not abandon.</p></div>
    ${vig('review_adjust', 'gold', 96)}</div>
  <div class="grid g2">
    <section class="card"><h2 style="font-size:1.05rem">Practice, last six months</h2>
      <p class="tiny">Each square is a day; darker means more practice logged.</p>
      <div style="margin-top:.6rem">${heat}</div>
      <p class="tiny" style="margin-top:.5rem">Current streak: <strong>${store.practiceStreak()}</strong> day(s).</p></section>
    <section class="card"><h2 style="font-size:1.05rem">Progress by stage</h2>
      <div class="freq green" style="margin-top:.6rem">${byStage}</div>
      <p class="tiny" style="margin-top:.6rem">Approach ladder: <strong>${ladderDone}</strong> of ${s.ladder.length} steps done.</p></section>
    <section class="card"><h2 style="font-size:1.05rem">Distress at check-ins</h2>
      ${distChart || '<p class="tiny muted">Two or more <a href="#/checkin">check-ins</a> will show a trend here.</p>'}</section>
    <section class="card"><h2 style="font-size:1.05rem">Sleep at check-ins</h2>
      ${sleepChart || '<p class="tiny muted">Two or more check-ins will show a trend here.</p>'}</section>
    <section class="card"><h2 style="font-size:1.05rem">Then-and-now records</h2>
      ${avgD != null ? `<p class="stat" style="text-align:left"><b>${avgD > 0 ? '−' : avgD < 0 ? '+' : ''}${Math.abs(avgD).toFixed(1)}</b>
        <span>average change in distress, from the moment to the end of the record, across ${recs.length} record${recs.length > 1 ? 's' : ''}</span></p>` : ''}
      ${avgB != null ? `<p class="stat" style="text-align:left;margin-top:.6rem"><b>${avgB > 0 ? '−' : avgB < 0 ? '+' : ''}${Math.abs(avgB)}%</b>
        <span>average change in how strongly the thought is believed</span></p>` : ''}
      ${avgD == null && avgB == null ? '<p class="tiny muted">Complete a <a href="#/record">then-and-now record</a> to see this.</p>' : ''}</section>
    <section class="card"><h2 style="font-size:1.05rem">Symptom check totals</h2>
      ${pclChart || `<p class="tiny muted">${s.pcl.length ? 'One result so far; take it again in a month.' : 'Take the <a href="#/pcl">symptom check</a> monthly to see change.'}</p>`}</section>
    <section class="card"><h2 style="font-size:1.05rem">Thinking traps you notice most</h2>${bars(top(count(s.records.flatMap(r => r.traps || []))), 'rose')}</section>
    <section class="card"><h2 style="font-size:1.05rem">What you used at check-ins</h2>${bars(top(count(s.checkins.flatMap(c => c.tools || []))), '', toolName)}</section>
    <section class="card"><h2 style="font-size:1.05rem">Journal tags</h2>${bars(top(count(s.journal.flatMap(e => e.tags || []))), 'gold')}</section>
  </div>
  ${settled.length ? `<h2 style="margin:1.8rem 0 .6rem">Recently settled</h2><div class="grid g3">${settled.map(x => `
    <a class="card" href="#/step/${x.id}" style="text-decoration:none;color:inherit"><div class="row" style="gap:.6rem;flex-wrap:nowrap">${vig(x.scene, 'green', 40)}
      <div><b class="small">${esc(x.title)}</b><div class="tiny">Stage ${x.stage} · ${ago(s.steps[x.id].updatedAt)}</div></div></div></a>`).join('')}</div>` : ''}
  <div class="card" style="margin-top:1.6rem;display:flex;gap:.9rem;align-items:center">${vig('continuity', 'gold', 50)}
    <p class="serif-note" style="margin:0">Numbers are not the point. They are here to show you what you might otherwise forget:
      that you have kept at it, and that some of it has moved.</p></div>`;
}

// ============================================================ your data ===
export function data() {
  const s = store.get();
  const enc = store.isEncrypted();
  const can = store.cryptoAvailable();
  const works = store.storageWorks();
  const counts = [['journal entries', s.journal.length], ['check-ins', s.checkins.length], ['then-and-now records', s.records.length],
    ['symptom checks', s.pcl.length], ['steps written in', Object.keys(s.steps).length]].map(([l, n]) => `<li>${n} ${l}</li>`).join('');
  return `
  <div class="hero" style="margin-bottom:1.2rem"><div>
    <div class="eyebrow">Privacy</div><h1>Your data</h1>
    <p class="lede">Everything you write lives in this browser, on this device. Nothing is sent anywhere.</p></div>
    ${vig('boundaries', 'navy', 96)}</div>
  ${works ? '' : `<div class="safety" style="margin-bottom:1rem"><strong>This browser is not saving anything.</strong> Storage is blocked here
    (often in private browsing, or when a file is opened in some browsers), so what you write will be lost when you close the tab.
    Export a copy before you leave, or open the app in another browser.</div>`}
  <div class="grid g2">
    <section class="card"><h2 style="font-size:1.1rem">Lock with a passphrase</h2>
      <p class="small">${enc ? 'Your writing is <strong>encrypted</strong>. The app asks for your passphrase each time it opens.'
        : 'Encrypts everything you write with a passphrase only you know (AES-256, a strong standard). Anyone opening this browser would see only scrambled text.'}</p>
      <p class="tiny">There is no way to recover a forgotten passphrase. Keep it somewhere safe, or export a copy first.</p>
      <div class="row">${can ? (enc ? `<button class="btn ghost" data-act="change-pass">Change passphrase</button>
        <button class="btn danger" data-act="remove-pass">Remove the lock</button><button class="btn ghost" data-act="lock-now">Lock now</button>`
        : `<button class="btn" data-act="set-pass">Set a passphrase</button>`) : '<p class="tiny">This browser does not support encryption.</p>'}</div></section>
    <section class="card"><h2 style="font-size:1.1rem">Export and import</h2>
      <p class="small">Save a copy of everything to a file (useful for moving to a new device). The file is not encrypted, so keep it somewhere private.</p>
      <ul class="small">${counts}</ul>
      <div class="row"><button class="btn" data-act="export">Export a copy</button>
        <label class="btn ghost" style="cursor:pointer">Import a copy<input type="file" accept="application/json,.json" data-act="import" class="sr-only"></label></div></section>
    <section class="card"><h2 style="font-size:1.1rem">Erase everything</h2>
      <p class="small">Deletes all your writing from this browser. Display settings are kept. This cannot be undone.</p>
      <button class="btn danger" data-act="erase">Erase all my data</button></section>
  </div>`;
}

// ---------------------------------------------------------------- wiring ---
let linkFrom = null;
export function bind(root) {
  bindCharts(root);
  root.querySelectorAll('form[data-add]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const t = f.querySelector('input').value.trim();
    if (!t) return;
    store.addMapNode(f.dataset.add, t);
    refresh();
    setTimeout(() => document.querySelector(`#add-${f.dataset.add}`)?.focus(), 0);
  }));
  on(root, 'click', '[data-del-node]', (e, b) => { const [k, id] = b.dataset.delNode.split(':'); store.removeMapNode(k, id); refresh(); });
  on(root, 'click', '[data-link-from]', (e, b) => {
    const id = b.dataset.linkFrom;
    if (!linkFrom) {
      linkFrom = id;
      root.querySelectorAll('.node').forEach(n => n.classList.toggle('sel', n.dataset.node === id));
      toast('Now choose ⇄ on the entry to connect it with.');
    } else if (linkFrom === id) {
      linkFrom = null; root.querySelectorAll('.node.sel').forEach(n => n.classList.remove('sel'));
    } else { store.toggleLink(linkFrom, id); linkFrom = null; toast('Connected.'); refresh(); }
  });
  on(root, 'click', '[data-unlink]', (e, b) => { const [a, c] = b.dataset.unlink.split('|'); store.toggleLink(a, c); refresh(); });

  on(root, 'click', '[data-act]', async (e, b) => {
    const act = b.dataset.act;
    if (act === 'set-pass' || act === 'change-pass') {
      const p1 = await promptBox({ title: act === 'set-pass' ? 'Set a passphrase' : 'Choose a new passphrase', label: 'Passphrase (at least 8 characters)', type: 'password', ok: 'Next' });
      if (!p1) return;
      if (p1.length < 8) { toast('Please use at least 8 characters.'); return; }
      const p2 = await promptBox({ title: 'Type it again', label: 'Passphrase', type: 'password', ok: 'Lock' });
      if (p1 !== p2) { toast('Those did not match. Nothing changed.'); return; }
      await store.enableEncryption(p1); toast('Locked. You will need the passphrase next time.'); refresh();
    } else if (act === 'remove-pass') {
      if (await confirmBox({ title: 'Remove the lock?', body: 'Your writing will be stored without encryption in this browser.', ok: 'Remove lock', danger: true })) {
        await store.disableEncryption(); toast('Lock removed.'); refresh();
      }
    } else if (act === 'lock-now') { window.dispatchEvent(new CustomEvent('tn:lock')); }
    else if (act === 'export') {
      download(store.exportBlob(), `then-and-now-${store.today()}.json`); toast('Exported. Keep the file somewhere private.');
    } else if (act === 'erase') {
      if (await confirmBox({ title: 'Erase everything?', body: 'All your writing in this browser will be deleted. This cannot be undone.', ok: 'Erase', danger: true })) {
        await store.eraseAll(); toast('Erased.'); location.hash = '#/'; refresh();
      }
    }
  });
  on(root, 'change', '[data-act="import"]', async (e, inp) => {
    const file = inp.files && inp.files[0]; if (!file) return;
    if (!(await confirmBox({ title: 'Replace your data?', body: 'Importing replaces everything currently stored in this browser with the file\'s contents.', ok: 'Import', danger: true }))) { inp.value = ''; return; }
    const res = await store.importJSON(await file.text());
    toast(res.ok ? 'Imported.' : res.error); inp.value = ''; refresh();
  });
}
