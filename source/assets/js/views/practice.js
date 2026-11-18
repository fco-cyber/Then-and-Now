// Daily practice: check-in, journal, then-and-now record, and the PCL-5 symptom check.
import { STEP_BY_ID, TRAPS, MOODS, CHECK_TOOLS, PCL5, PCL5_SCALE, PCL5_GROUPS } from '../content.js';
import * as store from '../store.js';
import { vig, esc, on, autogrow, debounce, fmtDate, fmtShort, fmtTime, toast, confirmBox, ev } from '../ui.js';
import { lineChart, bindCharts } from '../charts.js';

const refresh = () => window.dispatchEvent(new HashChangeEvent('hashchange'));
const head = (scene, tone, eyebrow, title, lede) => `
  <div class="hero" style="margin-bottom:1.2rem"><div>
    <div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1>
    <p class="lede">${lede}</p></div>${vig(scene, tone, 96)}</div>`;

// ============================================================= check-in ===
const SEG = {
  nightmare: [['0', 'None'], ['1', 'One'], ['2', 'More than one'], ['', 'Not sure']],
  intrusions: [['0', 'None'], ['1', 'A few'], ['2', 'Many']],
  avoid: [['-1', 'Less than usual'], ['0', 'About the same'], ['1', 'More than usual']]
};
const segLabel = (k, v) => (SEG[k].find(o => o[0] === String(v)) || [, '—'])[1];

export function checkin() {
  const s = store.get();
  const recent = s.checkins.slice(0, 30).reverse();
  const tools = CHECK_TOOLS.map(([k, l]) => `<button type="button" class="chip" data-tool="${k}" aria-pressed="false">${esc(l)}</button>`).join('');
  const seg = (k, label) => `<div class="field"><span class="lbl" id="l-${k}">${label}</span>
    <div class="seg" role="group" aria-labelledby="l-${k}">${SEG[k].map(([v, t]) =>
      `<button type="button" data-seg="${k}" data-v="${v}" aria-pressed="false">${esc(t)}</button>`).join('')}</div></div>`;
  const chart = recent.length > 1 ? lineChart(recent.map(c => ({ y: c.distress, label: fmtShort(c.at), sub: c.note ? c.note.slice(0, 40) : '' })),
    { yMin: 0, yMax: 10, ticks: [0, 5, 10], name: 'Distress at each check-in, oldest to newest', unit: '/10' }) : '';
  const rows = s.checkins.slice(0, 20).map(c => `<tr>
      <td data-l="When">${fmtDate(c.at)}</td><td data-l="Distress">${c.distress}/10</td>
      <td data-l="Sleep">${c.sleep == null ? '—' : c.sleep + '/10'}</td>
      <td data-l="Nightmares">${segLabel('nightmare', c.nightmare)}</td>
      <td data-l="Memories">${segLabel('intrusions', c.intrusions)}</td>
      <td data-l="Avoiding">${segLabel('avoid', c.avoid)}</td>
      <td data-l="Note">${esc(c.note || '')}${c.tools?.length ? `<br><span class="tiny">${c.tools.map(t => esc((CHECK_TOOLS.find(x => x[0] === t) || [, t])[1])).join(', ')}</span>` : ''}</td>
      <td><button class="btn quiet sm" data-del-checkin="${c.id}" aria-label="Delete check-in from ${fmtDate(c.at)}">×</button></td></tr>`).join('');
  return `${head('checkin', 'teal', 'Daily practice', 'Check-in', 'A minute a day. Over weeks, it shows what helps and what is changing.')}
  <form class="card" id="cform">
    <div class="grid g2" style="gap:0 1.4rem">
      <div>
        <div class="field"><label for="c-dist">How distressed have you felt today? <output id="c-dist-o">5</output> out of 10</label>
          <input type="range" id="c-dist" min="0" max="10" value="5" aria-describedby="c-dist-h">
          <p class="tiny" id="c-dist-h" style="margin:.2rem 0 0">0 is calm; 10 is the worst you can imagine.</p></div>
        <div class="field"><label for="c-sleep">How well did you sleep last night? <output id="c-sleep-o">5</output> out of 10</label>
          <input type="range" id="c-sleep" min="0" max="10" value="5"></div>
        ${seg('nightmare', 'Nightmares last night')}
      </div>
      <div>
        ${seg('intrusions', 'Unwanted memories today')}
        ${seg('avoid', 'How much did you avoid reminders?')}
        <div class="field"><span class="lbl">What did you use today?</span><div class="row tight">${tools}</div></div>
      </div>
    </div>
    <div class="field"><label for="c-note">Anything worth noting</label><textarea id="c-note" rows="2"></textarea></div>
    <div class="row end"><button class="btn" type="submit">Save check-in</button></div>
  </form>
  ${chart ? `<h2 style="margin:1.6rem 0 .5rem">Distress over your recent check-ins</h2><div class="card">${chart}</div>` : ''}
  <h2 style="margin:1.6rem 0 .5rem">Recent check-ins <span class="tiny">(${s.checkins.length})</span></h2>
  ${rows ? `<div class="card tablewrap"><table class="tx"><thead><tr><th>When</th><th>Distress</th><th>Sleep</th><th>Nightmares</th>
    <th>Memories</th><th>Avoiding</th><th>Note</th><th><span class="sr-only">Delete</span></th></tr></thead><tbody>${rows}</tbody></table></div>`
    : '<p class="muted">No check-ins yet.</p>'}
  <div class="card" style="margin-top:1rem;display:flex;gap:.9rem;align-items:center">${vig('held', 'teal', 50)}
    <p class="serif-note" style="margin:0">Hard days are part of recovery, not a sign it has failed. If today is very hard,
      <a href="#/tools/ground">ground first</a> or <a href="#/help">reach out</a>.</p></div>`;
}

// ============================================================== journal ===
const moodColour = m => m == null ? 'var(--line-2)' : m <= 3 ? 'var(--warn)' : m <= 6 ? 'var(--focus)' : 'var(--ok)';
export function journal(query) {
  const s = store.get();
  const params = new URLSearchParams(query || '');
  const linked = params.get('step');
  const filter = (params.get('q') || '').toLowerCase();
  const entries = s.journal.filter(e => !filter || (e.text || '').toLowerCase().includes(filter) ||
    (e.tags || []).some(t => t.toLowerCase().includes(filter)));
  const list = entries.length ? entries.map(e => `
    <article class="entry" data-entry="${e.id}">
      <div class="meta"><span class="moodpip" style="background:${moodColour(e.mood)}" aria-hidden="true"></span>
        <strong>${fmtDate(e.at)}</strong> · ${fmtTime(e.at)}
        ${e.mood ? `· ${esc(MOODS.find(m => m[0] === e.mood)?.[1] || '')}` : ''}
        ${e.stepId && STEP_BY_ID[e.stepId] ? `· <a href="#/step/${e.stepId}">${esc(STEP_BY_ID[e.stepId].title)}</a>` : ''}
        <button class="btn quiet sm" data-del-entry="${e.id}" aria-label="Delete entry from ${fmtDate(e.at)}">×</button></div>
      <div class="body">${esc(e.text)}</div>
      ${(e.tags || []).length ? `<div class="row tight" style="margin-top:.4rem">${e.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
    </article>`).join('')
    : `<p class="muted">${filter ? 'Nothing matches that search.' : 'No entries yet. There is no right way to use this space.'}</p>`;
  const moods = MOODS.map(([v, l]) => `<button type="button" class="chip" data-mood="${v}" aria-pressed="false" title="${esc(l)}" aria-label="${v}: ${esc(l)}">${v}</button>`).join('');
  return `${head('honest_checkin', 'navy', 'Daily practice', 'Journal', 'Free writing, kept in date order. Nothing here is analysed or sent anywhere.')}
  <div class="card">
    ${linked && STEP_BY_ID[linked] ? `<p class="tiny">Writing alongside <a href="#/step/${linked}">${esc(STEP_BY_ID[linked].title)}</a>:
      “${esc(STEP_BY_ID[linked].question)}”</p>` : ''}
    <label class="sr-only" for="jtext">Journal entry</label>
    <textarea id="jtext" rows="5" placeholder="What is going on today?"></textarea>
    <div class="spread" style="margin-top:.7rem;align-items:flex-end">
      <div><span class="lbl" id="l-mood">How is today, roughly? (1 very low, 10 at peace)</span><div class="row tight" role="group" aria-labelledby="l-mood">${moods}</div></div>
      <div style="min-width:200px;flex:1;max-width:320px"><label class="lbl" for="jtags">Tags, separated by commas</label>
        <input type="text" id="jtags" placeholder="sleep, work, anniversary"></div>
      <button class="btn" id="jsave" data-step="${esc(linked || '')}">Save entry</button>
    </div>
  </div>
  <div class="spread" style="margin:1.6rem 0 .6rem">
    <h2>Previous entries <span class="tiny">(${s.journal.length})</span></h2>
    <label class="sr-only" for="jsearch">Search entries</label>
    <input type="search" id="jsearch" placeholder="Search entries" value="${esc(params.get('q') || '')}" style="max-width:240px">
  </div>
  ${list}`;
}

// ================================================ then-and-now record ===
export function record(query) {
  const s = store.get();
  const editing = new URLSearchParams(query || '').get('id');
  const r = editing ? s.records.find(x => x.id === editing) : null;
  const traps = TRAPS.map(([k, d]) => `<button type="button" class="chip rose" data-trap="${esc(k)}" aria-pressed="${!!(r && r.traps?.includes(k))}" title="${esc(d)}">${esc(k)}</button>`).join('');
  const f = (name, label, hint, val, rows = 2) => `<div class="field"><label for="r-${name}">${esc(label)}</label>
      ${hint ? `<p class="tiny" style="margin:-.15rem 0 .3rem">${esc(hint)}</p>` : ''}
      <textarea id="r-${name}" name="${name}" rows="${rows}">${esc(val || '')}</textarea></div>`;
  const rng = (name, label, val, max) => `<div class="field"><label for="r-${name}">${esc(label)} <output data-out="${name}">${val}</output>${max === 10 ? ' out of 10' : '%'}</label>
      <input type="range" id="r-${name}" name="${name}" min="0" max="${max}" step="${max === 10 ? 1 : 5}" value="${val}"></div>`;
  const past = s.records.length ? s.records.map(x => `
    <div class="card" style="margin-top:.7rem">
      <div class="spread"><div class="tiny">${fmtDate(x.at)} · ${fmtTime(x.at)}</div>
        <div class="row tight"><a class="btn quiet sm" href="#/record?id=${x.id}">Open</a>
          <button class="btn quiet sm" data-del-record="${x.id}" aria-label="Delete record from ${fmtDate(x.at)}">×</button></div></div>
      <p style="margin:.3rem 0"><strong>${esc(x.reminder || x.situation || 'Untitled')}</strong></p>
      ${x.nowIs ? `<p class="small" style="margin:.2rem 0"><span class="tiny">Now:</span> ${esc(x.nowIs)}</p>` : ''}
      ${x.reframe ? `<p class="small" style="margin:.2rem 0">→ ${esc(x.reframe)}</p>` : ''}
      ${x.distressAfter != null ? `<p class="tiny">Distress ${x.distressBefore} → ${x.distressAfter} out of 10${x.beliefAfter != null ? ` · belief in the thought ${x.beliefBefore}% → ${x.beliefAfter}%` : ''}</p>` : ''}
    </div>`).join('') : '<p class="muted">No records yet.</p>';
  return `${head('then_now', 'green', 'Daily practice', 'Then-and-now record',
    'The Noticing Path in one worked example. Take a single reminder through from what happened to what you will do.')}
  <form class="card" id="rform" data-id="${esc(editing || '')}">
    <div class="grid g2" style="gap:0 1.4rem">
      <div>
        <p class="eyebrow">1 · Notice</p>
        ${f('situation', 'What happened?', 'Facts only: what a camera would have recorded.', r?.situation)}
        ${f('reminder', 'What reminded me of then?', 'A sight, sound, smell, place, date, tone of voice or body feeling.', r?.reminder)}
        ${f('body', 'What did my body do?', 'Where it landed, and what it felt like.', r?.body)}
        ${rng('distressBefore', 'Distress at the time:', r?.distressBefore ?? 6, 10)}
        <p class="eyebrow" style="margin-top:1rem">2 · Then, not now</p>
        ${f('thenWas', 'What it was like then', 'In a few words; no details needed.', r?.thenWas)}
        ${f('nowIs', 'What is different now', 'Where I am, when it is, who is with me, what I can do now that I could not then.', r?.nowIs, 3)}
      </div>
      <div>
        <p class="eyebrow">3 · The thought</p>
        ${f('thought', 'The thought, as it arrived', '', r?.thought)}
        ${rng('beliefBefore', 'How strongly I believed it:', r?.beliefBefore ?? 60, 100)}
        <div class="field"><span class="lbl" id="l-traps">Thinking traps I notice</span><div class="row tight" role="group" aria-labelledby="l-traps">${traps}</div></div>
        ${f('evidenceFor', 'What supports the thought', 'Only facts that would stand up.', r?.evidenceFor)}
        ${f('evidenceAgainst', 'What does not fit it', 'Including what a kind friend would point out.', r?.evidenceAgainst)}
        <p class="eyebrow" style="margin-top:1rem">4 · Reframe and act</p>
        ${f('reframe', 'A truer, kinder sentence', 'Not a cheerful one: a more accurate one.', r?.reframe, 3)}
        ${f('action', 'One grounded action', 'Small, specific and doable today.', r?.action)}
        ${rng('distressAfter', 'Distress now:', r?.distressAfter ?? 4, 10)}
        ${rng('beliefAfter', 'How strongly I believe the original thought now:', r?.beliefAfter ?? 40, 100)}
      </div>
    </div>
    <div class="row end" style="margin-top:.6rem">
      ${editing ? `<a class="btn ghost" href="#/record">Start a new record</a>` : ''}
      <button class="btn" type="submit">${editing ? 'Update record' : 'Save record'}</button></div>
  </form>
  <p class="tiny" style="margin-top:.6rem">Why this works: spotting how a reminder differs from the original danger, and examining the
    thoughts that come with it, are core parts of cognitive therapy for PTSD and cognitive processing therapy. ${ev('strong', 'CTPTSD CPT')}</p>
  <h2 style="margin:1.6rem 0 .4rem">Previous records <span class="tiny">(${s.records.length})</span></h2>
  ${past}`;
}

// ================================================================ PCL-5 ===
let pendingResult = null;
export function pcl() {
  const s = store.get();
  const res = pendingResult; pendingResult = null;
  const items = PCL5.map((q, i) => `<fieldset class="pcl-q"><legend><strong>${i + 1}.</strong> ${esc(q)}</legend>
      <div class="pcl-opts">${PCL5_SCALE.map((l, v) => `<label><input type="radio" name="q${i}" value="${v}"> ${esc(l)}</label>`).join('')}</div>
    </fieldset>`).join('');
  const hist = s.pcl.slice(0, 24).slice().reverse();
  const chart = hist.length ? lineChart(hist.map(p => ({ y: p.total, label: fmtShort(p.at) })),
    { yMin: 0, yMax: 80, ticks: [0, 20, 40, 60, 80], band: [31, 80, '31 or more: probable PTSD range'], name: 'PCL-5 totals, oldest to newest', unit: ' of 80' }) : '';
  const rows = s.pcl.map((p, i) => {
    const prev = s.pcl[i + 1];
    const diff = prev ? p.total - prev.total : null;
    return `<tr><td data-l="When">${fmtDate(p.at)}</td><td data-l="Total"><strong>${p.total}</strong> of 80</td>
      <td data-l="Change">${diff == null ? '—' : (diff > 0 ? '+' : diff < 0 ? '−' : '') + Math.abs(diff)}</td>
      <td data-l="Groups">${PCL5_GROUPS.map(g => `${esc(g.name.split(' (')[0])}: ${g.items.reduce((a, k) => a + (+p.items[k] || 0), 0)}`).join(' · ')}</td>
      <td><button class="btn quiet sm" data-del-pcl="${p.id}" aria-label="Delete result from ${fmtDate(p.at)}">×</button></td></tr>`;
  }).join('');
  return `${head('compass', 'gold', 'Track change', 'Symptom check (PCL-5)',
    'The PTSD Checklist for DSM-5: 20 questions about the past month, widely used by clinicians to measure PTSD symptoms and track change.')}
  <div class="safety" style="margin-bottom:1rem"><strong>This is a self-check, not a diagnosis.</strong> It shows how strong your
    reactions are and helps you see change over time. Share the results with your GP or therapist, who can interpret them with you.
    ${ev('', 'NCPTSD PCL5DEV')}</div>
  <form class="card" id="pform">
    <p class="small" style="margin-top:0"><strong>In the past month, how much were you bothered by:</strong> (thinking about the
      worst stressful experience you have had)</p>
    ${items}
    <p class="tiny" id="pmiss" aria-live="polite"></p>
    <div class="row end"><button class="btn" type="submit">See my total</button></div>
  </form>
  <div id="presult" aria-live="polite">${res ? pclResult(res.total, res.items) : ''}</div>
  ${chart ? `<h2 style="margin:1.6rem 0 .5rem">Your totals over time</h2><div class="card">${chart}
    <p class="tiny" style="margin:.4rem 0 0">A drop of 10 points or more is suggested as a sign of response to treatment,
      though there is limited evidence behind that figure. ${ev('', 'NCPTSD')}</p></div>` : ''}
  ${rows ? `<h2 style="margin:1.6rem 0 .5rem">Previous results</h2><div class="card tablewrap"><table class="tx"><thead><tr>
    <th>When</th><th>Total</th><th>Change</th><th>By symptom group</th><th><span class="sr-only">Delete</span></th></tr></thead>
    <tbody>${rows}</tbody></table></div>` : ''}
  <p class="tiny" style="margin-top:1rem">PCL-5 developed by Weathers, Litz, Keane, Palmieri, Marx and Schnurr at the US National Center
    for PTSD; in the public domain. Reproduced word for word, so it keeps its US spelling. Suggested once a month.</p>`;
}

function pclResult(total, items) {
  const groups = PCL5_GROUPS.map(g => `<li>${esc(g.name)}: <strong>${g.items.reduce((a, k) => a + items[k], 0)}</strong> of ${g.items.length * 4}</li>`).join('');
  const msg = total >= 31
    ? `A total of 31 or more is in the range that suggests probable PTSD. It is not a diagnosis, but it is a good reason to talk with
       a GP or psychologist about trauma-focused treatment, which helps most people.`
    : `This total is below the range that usually suggests probable PTSD. If your reactions still trouble you, they are still worth
       talking about with a professional.`;
  return `<div class="result" style="margin-top:1rem"><h2 style="font-size:1.3rem">Your total: ${total} of 80</h2>
    <p class="small">${msg} ${ev('', 'NCPTSD PCL5VET')}</p><ul class="small">${groups}</ul>
    <p class="tiny" style="margin:0">Saved to your history below. <a href="#/learn/treatment">Treatments that work</a> · <a href="#/help">Get help</a></p></div>`;
}

// ---------------------------------------------------------------- wiring ---
export function bind(root) {
  root.querySelectorAll('textarea').forEach(autogrow);
  bindCharts(root);
  root.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('input', () => {
    const o = root.querySelector(`#${r.id}-o`) || root.querySelector(`[data-out="${r.name}"]`);
    if (o) o.textContent = r.value;
  }));
  const press = (sel, single) => on(root, 'click', sel, (e, b) => {
    if (single) root.querySelectorAll(single(b)).forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    else b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
  });

  // ---- check-in
  const cform = root.querySelector('#cform');
  if (cform) {
    press('[data-tool]');
    press('[data-seg]', b => `[data-seg="${b.dataset.seg}"]`);
    cform.addEventListener('submit', e => {
      e.preventDefault();
      const segv = k => { const b = root.querySelector(`[data-seg="${k}"][aria-pressed="true"]`); return b && b.dataset.v !== '' ? +b.dataset.v : null; };
      store.addCheckin({ distress: +root.querySelector('#c-dist').value, sleep: +root.querySelector('#c-sleep').value,
        nightmare: segv('nightmare'), intrusions: segv('intrusions'), avoid: segv('avoid'),
        tools: [...root.querySelectorAll('[data-tool][aria-pressed="true"]')].map(b => b.dataset.tool),
        note: root.querySelector('#c-note').value.trim() });
      store.markPractice('checkin');
      toast('Check-in saved.');
      refresh();
    });
  }
  on(root, 'click', '[data-del-checkin]', async (e, b) => {
    if (await confirmBox({ title: 'Delete this check-in?', body: 'It cannot be recovered.', ok: 'Delete', danger: true })) { store.removeCheckin(b.dataset.delCheckin); refresh(); }
  });

  // ---- journal
  press('[data-mood]', () => '[data-mood]');
  const save = root.querySelector('#jsave');
  if (save) save.addEventListener('click', () => {
    const text = root.querySelector('#jtext').value.trim();
    if (!text) { toast('Nothing to save yet.'); return; }
    const m = root.querySelector('[data-mood][aria-pressed="true"]');
    const tags = root.querySelector('#jtags').value.split(',').map(t => t.trim()).filter(Boolean);
    store.addJournal({ text, mood: m ? +m.dataset.mood : null, tags, stepId: save.dataset.step || null });
    store.markPractice('journal');
    toast('Entry saved.');
    location.hash = '#/journal';
    refresh();
  });
  const search = root.querySelector('#jsearch');
  if (search) search.addEventListener('input', debounce(() => {
    const v = search.value.trim();
    history.replaceState(null, '', `#/journal${v ? '?q=' + encodeURIComponent(v) : ''}`);
    refresh();
    setTimeout(() => { const el = document.querySelector('#jsearch'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 0);
  }, 350));
  on(root, 'click', '[data-del-entry]', async (e, b) => {
    if (await confirmBox({ title: 'Delete this entry?', body: 'It cannot be recovered.', ok: 'Delete', danger: true })) { store.removeJournal(b.dataset.delEntry); refresh(); }
  });

  // ---- record
  const rform = root.querySelector('#rform');
  if (rform) {
    press('[data-trap]');
    rform.addEventListener('submit', e => {
      e.preventDefault();
      const val = n => rform.querySelector(`[name="${n}"]`)?.value.trim() || '';
      const num = n => +rform.querySelector(`[name="${n}"]`).value;
      const payload = { situation: val('situation'), reminder: val('reminder'), body: val('body'), thenWas: val('thenWas'),
        nowIs: val('nowIs'), thought: val('thought'), evidenceFor: val('evidenceFor'), evidenceAgainst: val('evidenceAgainst'),
        reframe: val('reframe'), action: val('action'),
        traps: [...rform.querySelectorAll('[data-trap][aria-pressed="true"]')].map(b => b.dataset.trap),
        distressBefore: num('distressBefore'), distressAfter: num('distressAfter'),
        beliefBefore: num('beliefBefore'), beliefAfter: num('beliefAfter') };
      if (!payload.situation && !payload.reminder && !payload.thought) { toast('Add at least what happened, the reminder or the thought.'); return; }
      if (rform.dataset.id) { store.updateRecord(rform.dataset.id, payload); toast('Record updated.'); }
      else { store.addRecord(payload); toast('Record saved.'); }
      store.markPractice('record');
      location.hash = '#/record';
      refresh();
    });
  }
  on(root, 'click', '[data-del-record]', async (e, b) => {
    if (await confirmBox({ title: 'Delete this record?', body: 'It cannot be recovered.', ok: 'Delete', danger: true })) { store.removeRecord(b.dataset.delRecord); refresh(); }
  });

  // ---- PCL-5
  const pform = root.querySelector('#pform');
  if (pform) pform.addEventListener('submit', e => {
    e.preventDefault();
    const items = PCL5.map((q, i) => { const c = pform.querySelector(`input[name="q${i}"]:checked`); return c ? +c.value : null; });
    const missing = items.map((v, i) => v == null ? i + 1 : null).filter(Boolean);
    if (missing.length) {
      root.querySelector('#pmiss').textContent = `Please answer question${missing.length > 1 ? 's' : ''} ${missing.join(', ')}.`;
      pform.querySelector(`input[name="q${missing[0] - 1}"]`).focus();
      return;
    }
    const rec = store.addPCL(items);
    store.markPractice('pcl');
    pendingResult = { total: rec.total, items };
    refresh();
  });
  const out = root.querySelector('#presult');
  if (out && out.textContent.trim()) setTimeout(() => out.scrollIntoView({ block: 'start' }), 30);
  on(root, 'click', '[data-del-pcl]', async (e, b) => {
    if (await confirmBox({ title: 'Delete this result?', body: 'It cannot be recovered.', ok: 'Delete', danger: true })) { store.removePCL(b.dataset.delPcl); refresh(); }
  });
}
