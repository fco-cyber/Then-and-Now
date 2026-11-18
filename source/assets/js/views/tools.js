// Tools: grounding, breathing pacer, then-and-now card, safety plan, approach ladder,
// responsibility pie, nightmare rescripting (opt-in) and memory work (opt-in).
import { SAFETY_FIELDS } from '../content.js';
import * as store from '../store.js';
import { vig, esc, on, autogrow, debounce, toast, confirmBox, ev, fmtDate, h } from '../ui.js';
import { regionData } from '../regions.js';

const refresh = () => window.dispatchEvent(new HashChangeEvent('hashchange'));
const head = (scene, tone, eyebrow, title, lede) => `
  <nav class="tiny" aria-label="Breadcrumb"><a href="#/tools">Tools</a> › ${esc(title)}</nav>
  <div class="hero" style="margin:.4rem 0 1.2rem"><div>
    <div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p class="lede">${lede}</p></div>${vig(scene, tone, 96)}</div>`;
const still = () => document.documentElement.classList.contains('still');

export const TOOLS = [
  ['ground', 'five_senses', 'teal', 'Grounding', 'Come back to the present through your senses.', 'Steady now'],
  ['breathe', 'breath', 'teal', 'Slow breathing', 'A gentle, guided rhythm for a few minutes.', 'Steady now'],
  ['thennow', 'then_now', 'navy', 'Then-and-now card', 'Your own reminder that then is over.', 'Steady now'],
  ['safety', 'safety_plan', 'rose', 'My safety plan', 'What to do and who to call when it gets very hard.', 'Stay safe'],
  ['ladder', 'approach', 'gold', 'Approach ladder', 'Win back what avoidance took, one step at a time.', 'Face, safely'],
  ['pie', 'pie', 'green', 'Responsibility pie', 'Share out responsibility fairly.', 'Make sense'],
  ['nightmare', 'rescript', 'navy', 'Nightmare rescripting', 'Change a recurring nightmare while awake. Optional.', 'Sleep'],
  ['memory', 'with_support', 'gold', 'Memory work', 'What therapy asks you to do with the memory, and a private place to write. Optional.', 'Face, safely']
];

export function index() {
  const groups = [...new Set(TOOLS.map(t => t[5]))];
  return `
  <div class="hero"><div><div class="eyebrow">Tools</div><h1>Tools for hard moments and steady work</h1>
    <p class="lede">The first three take a few minutes and need no reading first. The rest go with the stages.</p></div>
    ${vig('grounding', 'teal', 110)}</div>
  ${groups.map(g => `<h2 style="margin:1.4rem 0 .7rem;font-size:1.15rem">${esc(g)}</h2><div class="toolgrid">${TOOLS.filter(t => t[5] === g).map(([id, sc, tone, t, d]) => `
    <a class="card toolcard" href="#/tools/${id}">${vig(sc, tone, 56)}<span><b>${esc(t)}</b>
      <span class="small muted" style="display:block;margin-top:.2rem">${esc(d)}</span></span></a>`).join('')}</div>`).join('')}
  <div class="toolgrid" style="margin-top:1.4rem">
    <a class="card toolcard" href="#/pcl">${vig('compass', 'gold', 56)}<span><b>Symptom check (PCL-5)</b>
      <span class="small muted" style="display:block;margin-top:.2rem">Track your symptoms month by month.</span></span></a>
    <a class="card toolcard" href="#/help">${vig('lighthouse', 'rose', 56)}<span><b>Get help</b>
      <span class="small muted" style="display:block;margin-top:.2rem">Crisis lines and services where you live.</span></span></a></div>`;
}

// ============================================================ grounding ===
const SENSES = [
  [5, 'things you can see', 'Look around slowly. Name each one, out loud or in your head: its colour, its shape.'],
  [4, 'things you can feel', 'Your feet on the floor, your weight in the chair, your clothes, the air on your skin.'],
  [3, 'things you can hear', 'Near and far: traffic, a fridge, birds, your own breathing.'],
  [2, 'things you can smell', 'If nothing comes, name two smells you like.'],
  [1, 'thing you can taste', 'Or one good thing about right now, however small.']
];
export function ground() {
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return `${head('five_senses', 'teal', 'Steady now', 'Grounding', 'Five senses, one at a time. It brings attention back to the here and now.')}
  <section class="card" id="ground" aria-live="polite" data-step="0" data-n="0" style="text-align:center;padding:1.6rem 1.1rem">
    <div id="g-body"></div>
  </section>
  <div class="grid g2" style="margin-top:1rem">
    <section class="card"><h2 style="font-size:1.05rem">Other quick ways to ground</h2>
      <ul class="small" style="margin:.3rem 0 0;padding-left:1.2rem">
        <li>Press your feet into the floor and notice the pressure.</li>
        <li>Say where you are and the date: "I am in my kitchen. It is ${esc(today)}."</li>
        <li>Describe an object near you in detail, as if to someone who cannot see it.</li>
        <li>Count backwards from 100 in sevens.</li>
        <li>Hold something with an interesting texture and describe it.</li>
        <li>Look at your <a href="#/tools/thennow">then-and-now card</a>.</li>
      </ul></section>
    <section class="card"><h2 style="font-size:1.05rem">About grounding</h2>
      <p class="small">Grounding uses your senses to anchor attention in the present when memories pull you back. It is widely used
        alongside trauma treatment. It has not been tested on its own as a treatment for PTSD, so think of it as a way to steady
        yourself, not a cure. ${ev('weak', '')}</p>
      <p class="small" style="margin:0">Practise when you are calm, so it is easier to reach for when you are not.</p></section>
  </div>`;
}
function groundStep(root) {
  const box = root.querySelector('#ground'); if (!box) return;
  const i = +box.dataset.step, n = +box.dataset.n;
  const body = box.querySelector('#g-body');
  if (i >= SENSES.length) {
    const d = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    body.innerHTML = `${vig('presence', 'teal', 90)}
      <h2 style="margin-top:.6rem">You are here, now.</h2>
      <p class="lede" style="margin:.4rem auto;max-width:44ch">Say it to yourself: "It is ${esc(d)}. That was then. This is now."</p>
      <div class="row" style="justify-content:center;margin-top:1rem">
        <button class="btn" data-g="log">Log this practice</button><button class="btn ghost" data-g="again">Start again</button></div>`;
    return;
  }
  const [count, what, hint] = SENSES[i];
  body.innerHTML = `<div class="eyebrow">Step ${i + 1} of 5</div>
    <h2 style="font-size:clamp(1.6rem,4vw,2.3rem);margin:.4rem 0">Notice ${count} ${what}</h2>
    <p class="small muted" style="max-width:46ch;margin:0 auto">${esc(hint)}</p>
    <div class="row" style="justify-content:center;gap:.6rem;margin:1.2rem 0" aria-hidden="true">${Array.from({ length: count }, (_, k) =>
      `<span style="width:18px;height:18px;border-radius:50%;border:2px solid var(--sec);background:${k < n ? 'var(--sec)' : 'transparent'}"></span>`).join('')}</div>
    <p class="sr-only">${n} of ${count} noticed.</p>
    <div class="row" style="justify-content:center">
      ${i > 0 ? '<button class="btn ghost" data-g="back">Back</button>' : ''}
      <button class="btn" data-g="one">${n + 1 < count ? 'I noticed one' : 'I noticed the last one'}</button>
      <button class="btn quiet" data-g="skip">Skip this sense</button></div>`;
}

// ============================================================= breathing ===
let breathTimer = null, breathEnd = 0;
export function breathe() {
  return `${head('breath', 'teal', 'Steady now', 'Slow breathing', 'Breathe in for 4, out for 6. A slightly longer out-breath helps many people settle.')}
  <section class="card" style="text-align:center">
    <div class="orb-wrap"><div class="orb" id="orb"><div><div class="ph" id="ph">Ready</div><div class="ct" id="ct">Choose a length and press Start</div></div></div></div>
    <p class="sr-only" aria-live="polite" id="b-live"></p>
    <div class="row" style="justify-content:center" role="group" aria-label="Length">
      ${[1, 2, 3, 5].map(m => `<button type="button" class="chip" data-len="${m}" aria-pressed="${m === 2}">${m} min</button>`).join('')}</div>
    <div class="row" style="justify-content:center;margin-top:1rem">
      <button class="btn" id="b-start">Start</button><button class="btn ghost" id="b-stop" disabled>Stop</button></div>
    <p class="tiny" style="margin:1rem auto 0;max-width:52ch">If slow breathing makes you feel more anxious or light-headed, stop, breathe
      normally and ground with your eyes open instead. ${ev('weak', '')}</p>
  </section>`;
}
function stopBreath(root, done) {
  clearTimeout(breathTimer); breathTimer = null;
  const orb = root.querySelector('#orb');
  if (orb) { orb.style.transform = 'scale(1)'; root.querySelector('#ph').textContent = done ? 'Done' : 'Stopped';
    root.querySelector('#ct').textContent = done ? 'Notice how you feel now.' : 'Press Start when you are ready.';
    root.querySelector('#b-start').disabled = false; root.querySelector('#b-stop').disabled = true; }
  if (done) { store.markPractice('breathe'); toast('Practice logged.'); }
}
function runBreath(root, mins) {
  const orb = root.querySelector('#orb'), ph = root.querySelector('#ph'), ct = root.querySelector('#ct'), live = root.querySelector('#b-live');
  breathEnd = Date.now() + mins * 60000;
  const phase = (name, secs, scale) => new Promise(res => {
    if (!document.body.contains(orb)) { res(false); return; }
    ph.textContent = name; live.textContent = name;
    orb.style.transitionDuration = still() ? '0s' : secs + 's';
    orb.style.transform = still() ? 'scale(1)' : `scale(${scale})`;
    let left = secs;
    ct.textContent = left;
    const tick = () => {
      if (!breathTimer) { res(false); return; }
      if (document.hidden) { breathTimer = setTimeout(tick, 500); return; }   // pause while off screen
      left -= 1;
      if (left <= 0) { res(true); return; }
      ct.textContent = left; breathTimer = setTimeout(tick, 1000);
    };
    breathTimer = setTimeout(tick, 1000);
  });
  (async () => {
    while (breathTimer !== null && Date.now() < breathEnd) {
      if (!(await phase('Breathe in', 4, 1.35))) return;
      if (!(await phase('Breathe out', 6, 1))) return;
    }
    if (breathTimer !== null) stopBreath(root, true);
  })();
}

// ====================================================== then-and-now card ===
export function thennow() {
  const c = store.get().card;
  const d = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const f = (k, label, hint, ph) => `<div class="field"><label for="card-${k}">${esc(label)}</label>
    <p class="tiny" style="margin:-.15rem 0 .3rem">${esc(hint)}</p>
    <textarea id="card-${k}" data-card="${k}" rows="2" placeholder="${esc(ph)}">${esc(c[k] || '')}</textarea></div>`;
  return `${head('then_now', 'navy', 'Steady now', 'Then-and-now card', 'Write it once, on a calm day. Read it when a reminder pulls you back.')}
  <div class="stepwrap">
    <div class="card">
      ${f('then', 'That was then', 'A few words to name it: what, and when. No details needed.', 'The accident, 2019')}
      ${f('now', 'This is now', 'Where you are, who is with you, how your life is different.', 'I am at home. I live somewhere new. My partner is here.')}
      ${f('because', 'I know it is now because', 'What you can see, hear and feel that was not there then.', 'The blue kitchen wall. The dog. The radio.')}
      ${f('can', 'What I can do now', 'What you can do now that you could not do then.', 'I can leave, call someone, open the door, ask for help.')}
      <p class="tiny" aria-live="polite" id="card-saved">${c.updatedAt ? 'Saved.' : 'It saves as you type.'}</p>
    </div>
    <div>
      <div class="thennow-card" id="card-view">${cardHTML(c, d)}</div>
      <div class="row" style="margin-top:.8rem"><button class="btn" id="card-full">Show full screen</button>
        <button class="btn ghost" onclick="window.print()">Print</button></div>
      <p class="tiny" style="margin-top:.8rem">Telling apart a reminder and the original danger is a core part of cognitive therapy
        for PTSD. ${ev('mod', 'INTRUSIONS CTPTSD')}</p>
    </div>
  </div>`;
}
function cardHTML(c, d) {
  return `<div class="eyebrow">That was then</div>
    <p class="serif-note" style="font-size:1.1rem;margin:.2rem 0 1rem">${esc(c.then || '…')}</p>
    <div class="eyebrow">This is now · ${esc(d)}</div>
    <p class="now-line" style="margin:.2rem 0 .8rem">${esc(c.now || '…')}</p>
    ${c.because ? `<p class="small" style="margin:.2rem 0"><strong>I know because:</strong> ${esc(c.because)}</p>` : ''}
    ${c.can ? `<p class="small" style="margin:.2rem 0"><strong>What I can do now:</strong> ${esc(c.can)}</p>` : ''}`;
}

// ============================================================ safety plan ===
export function safety() {
  const sp = store.get().safety;
  const R = regionData();
  return `${head('safety_plan', 'rose', 'Stay safe', 'My safety plan', 'Written on a calmer day, for the hardest ones. Keep it short and in your own words.')}
  <div class="emerg" role="note" style="margin-bottom:1rem">
    ${R.em ? `<a class="big" href="tel:${R.em}">${esc(R.em)}</a>` : ''}
    <p style="margin:0"><strong>In immediate danger, call ${esc(R.emText)}.</strong> If you are thinking about ending your life, ${esc(R.crisis)}.
      <a href="#/help">All help options</a>.</p></div>
  <div class="grid g2">${SAFETY_FIELDS.map(([k, t, hint], i) => `<section class="card"><h2 style="font-size:1.02rem"><span class="tag">${i + 1}</span> ${esc(t)}</h2>
    <p class="tiny" style="margin:.2rem 0 .4rem">${esc(hint)}</p>
    <label class="sr-only" for="sp-${k}">${esc(t)}</label>
    <textarea id="sp-${k}" data-safety="${k}" rows="3">${esc(sp[k] || '')}</textarea>
    <span class="saved" data-saved="sp-${k}" aria-live="polite">saved</span></section>`).join('')}</div>
  <div class="row" style="margin-top:1rem"><button class="btn ghost" onclick="window.print()">Print my plan</button>
    ${sp.updatedAt ? `<span class="tiny">Last updated ${fmtDate(sp.updatedAt)}</span>` : ''}</div>
  <p class="tiny" style="margin-top:1rem">The structure follows the Safety Planning Intervention. A written safety plan with follow-up
    calls was linked with fewer suicidal behaviours in a large study. ${ev('mod', 'SAFETYPLAN SUICIDE')}</p>`;
}

// ========================================================= approach ladder ===
export function ladder() {
  const rungs = store.get().ladder.slice().sort((a, b) => a.suds - b.suds);
  const rungHTML = rungs.map(r => {
    const last = r.tries.at(-1);
    return `<div class="rung${r.done ? ' done' : ''}">
      <span class="sud" aria-label="Rated ${r.suds} out of 10">${r.suds}</span>
      <div style="min-width:0"><strong style="overflow-wrap:anywhere">${esc(r.text)}</strong>
        <div class="tiny">${r.tries.length ? `${r.tries.length} tr${r.tries.length > 1 ? 'ies' : 'y'} · last: ${last.before} → peak ${last.peak} → ${last.after}` : 'Not tried yet'}${r.done ? ' · done' : ''}</div>
        <details style="margin-top:.4rem"><summary class="tiny" style="cursor:pointer;color:var(--sec)">Log a try</summary>
          <form class="grid g3" data-try="${r.id}" style="gap:.4rem 1rem;margin-top:.5rem">
            ${['before', 'peak', 'after'].map(k => `<label class="field" style="margin:0"><span class="lbl">${k === 'before' ? 'Distress before' : k === 'peak' ? 'At its highest' : 'At the end'}: <output>5</output></span>
              <input type="range" min="0" max="10" value="5" name="${k}"></label>`).join('')}
            <div class="row" style="grid-column:1/-1"><button class="btn sm">Save this try</button></div></form></details></div>
      <div class="row tight" style="flex-direction:column;align-items:flex-end">
        <button class="btn quiet sm" data-done="${r.id}" aria-pressed="${!!r.done}">${r.done ? 'Undo done' : 'Mark done'}</button>
        <button class="btn quiet sm" data-del-rung="${r.id}" aria-label="Delete “${esc(r.text)}”">Delete</button></div></div>`;
  }).join('');
  return `${head('approach', 'gold', 'Stage 4', 'Approach ladder', 'List what you avoid that is safe now, rate how hard each would be, and climb from the bottom.')}
  <div class="grid g2">
    <form class="card" id="rung-form"><h2 style="font-size:1.05rem">Add a step</h2>
      <div class="field"><label for="rung-text">Something you avoid that is safe now</label>
        <input type="text" id="rung-text" placeholder="Drive past the street where it happened, in daylight"></div>
      <div class="field"><label for="rung-suds">How hard would it be? <output id="rung-o">4</output> out of 10</label>
        <input type="range" id="rung-suds" min="0" max="10" value="4"></div>
      <div class="row end"><button class="btn">Add to my ladder</button></div></form>
    <section class="card"><h2 style="font-size:1.05rem">Before each step</h2>
      <ul class="small" style="margin:.3rem 0 0;padding-left:1.2rem">
        <li><strong>Is it safe now?</strong> Approach reminders, never real danger.</li>
        <li><strong>Start low:</strong> about 3 or 4 out of 10.</li>
        <li><strong>Stay</strong> long enough to learn something new, ideally until the distress starts to ease.</li>
        <li><strong>Drop one safety behaviour</strong> each time: escaping early, checking, holding something.</li>
        <li><strong>Repeat</strong> until it is almost boring, then climb.</li></ul>
      <p class="tiny" style="margin:.6rem 0 0">Approaching feared but safe situations is part of the best-tested treatments for PTSD.
        ${ev('strong', 'PE CUSACK')} <a href="#/learn/treatment?s=1">What to expect</a></p></section>
  </div>
  <h2 style="margin:1.6rem 0 .6rem">My ladder <span class="tiny">(easiest at the bottom)</span></h2>
  ${rungs.length ? `<div class="ladder-list">${rungHTML}</div>` : '<p class="muted">No steps yet. Add the first one above.</p>'}`;
}

// ======================================================= responsibility pie ===
let draftPie = null;
export function pie(query) {
  const s = store.get();
  const id = new URLSearchParams(query || '').get('id');
  if (!draftPie || (id && draftPie.id !== id)) {
    const saved = id && s.pies.find(p => p.id === id);
    draftPie = saved ? JSON.parse(JSON.stringify(saved)) : { id: null, event: '', slices: [] };
  }
  const p = draftPie;
  const others = p.slices.filter(x => !x.me), me = p.slices.find(x => x.me);
  const used = p.slices.reduce((a, x) => a + (+x.pct || 0), 0);
  const left = Math.max(0, 100 - used);
  const segs = [...others, ...(me ? [me] : [])].filter(x => +x.pct > 0);
  const bar = segs.length ? `<div class="segbar" role="img" aria-label="${segs.map(x => `${x.label}: ${x.pct}%`).join('; ')}${left ? `; not yet shared out: ${left}%` : ''}">
      ${segs.map(x => `<i style="flex:${x.pct} 1 0;background:${x.me ? 'var(--acc)' : 'var(--line-2)'};color:${x.me ? 'var(--card)' : 'var(--text)'}" title="${esc(x.label)}: ${x.pct}%">${x.pct >= 9 ? x.pct + '%' : ''}</i>`).join('')}
      ${left ? `<i style="flex:${left} 1 0;background:transparent;border:1px dashed var(--line-2);color:var(--faint)">${left >= 12 ? left + '% left' : ''}</i>` : ''}</div>` : '';
  const row = (x, i) => `<div class="row tight" style="flex-wrap:nowrap;margin-top:.45rem">
      <i class="lk-sq" style="background:${x.me ? 'var(--acc)' : 'var(--line-2)'}" aria-hidden="true"></i>
      <label class="sr-only" for="sl-${i}">Who or what</label>
      <input type="text" id="sl-${i}" data-sl="${i}" data-k="label" value="${esc(x.label)}" ${x.me ? 'readonly' : ''} style="flex:1;min-width:0">
      <label class="sr-only" for="sp-${i}">Share for ${esc(x.label)}</label>
      <input type="number" id="sp-${i}" data-sl="${i}" data-k="pct" min="0" max="100" value="${x.pct || 0}" style="width:5.2rem">
      <span class="tiny">%</span>
      <button type="button" class="btn quiet sm" data-rm="${i}" aria-label="Remove ${esc(x.label)}">×</button></div>`;
  return `${head('pie', 'green', 'Stage 3', 'Responsibility pie', 'A tool from cognitive processing therapy for the feeling that it was your fault.')}
  <div class="grid g2">
    <section class="card"><h2 style="font-size:1.05rem">1 · Name it</h2>
      <label class="lbl" for="pie-event">The event, by title only</label>
      <input type="text" id="pie-event" value="${esc(p.event)}" placeholder="What happened at work in March">
      <h2 style="font-size:1.05rem;margin-top:1rem">2 · Everyone and everything else first</h2>
      <p class="tiny">List every person, circumstance and chance factor that played a part, and give each a share. Leave yourself until last.</p>
      ${p.slices.map((x, i) => x.me ? '' : row(x, i)).join('')}
      <form class="row tight" id="pie-add" style="margin-top:.6rem;flex-wrap:nowrap"><label class="sr-only" for="pie-new">Add someone or something</label>
        <input type="text" id="pie-new" placeholder="The person who did it, the weather, no warning…" style="flex:1;min-width:0"><button class="btn ghost sm">Add</button></form>
      <h2 style="font-size:1.05rem;margin-top:1rem">3 · Then your share</h2>
      ${me ? row(me, p.slices.indexOf(me)) : `<button class="btn ghost sm" data-addme>Add my share</button>`}
      <p class="tiny" style="margin-top:.6rem">Total: <strong>${used}%</strong>${used > 100 ? ' (more than 100%: reduce some shares)' : ''}</p>
    </section>
    <section class="card"><h2 style="font-size:1.05rem">The whole picture</h2>
      ${bar || '<p class="tiny muted">Add shares to see them here.</p>'}
      ${segs.length ? `<div class="legend"><span><i class="lk-sq" style="background:var(--line-2)"></i>Everyone and everything else</span>
        <span><i class="lk-sq" style="background:var(--acc)"></i>My share</span></div>
        <table class="tx" style="margin-top:.6rem"><tbody>${segs.map(x => `<tr><td>${esc(x.label)}</td><td style="text-align:right">${x.pct}%</td></tr>`).join('')}</tbody></table>` : ''}
      <div class="why" style="margin-top:1rem"><strong>Questions to ask.</strong> Did I intend harm? Could I really have known what
        would happen? What choices did I actually have, in the time I had? Responsibility is not the same as blame, and being
        part of what happened is not the same as causing it.</div>
      <div class="row" style="margin-top:.8rem"><button class="btn" data-savepie>${p.id ? 'Save changes' : 'Save this pie'}</button>
        <button class="btn ghost" data-newpie>Start a new one</button></div>
      <p class="tiny" style="margin-top:.8rem">From cognitive processing therapy, which has strong evidence for PTSD. Shown as a bar so
        the shares are easy to compare. ${ev('strong', 'CPT')}</p>
    </section>
  </div>
  ${s.pies.length ? `<h2 style="margin:1.6rem 0 .5rem">Saved</h2><div class="card">${s.pies.map(x => {
    const mine = x.slices.find(y => y.me);
    return `<div class="spread" style="border-bottom:1px solid var(--line);padding:.45rem 0;flex-wrap:nowrap"><span class="small"><strong>${esc(x.event || 'Untitled')}</strong>
      <span class="tiny"> · ${fmtDate(x.at)}${mine ? ` · my share ${mine.pct}%` : ''}</span></span>
      <span class="row tight" style="flex-wrap:nowrap"><a class="btn quiet sm" href="#/tools/pie?id=${x.id}">Open</a>
      <button class="btn quiet sm" data-delpie="${x.id}" aria-label="Delete ${esc(x.event || 'untitled pie')}">×</button></span></div>`;
  }).join('')}</div>` : ''}`;
}

// ========================================================= opt-in pages ===
function consent(kind, title, points, scene) {
  return `<section class="care" style="max-width:720px"><h2 style="font-size:1.2rem">${esc(title)}</h2>
    <ul class="small">${points.map(p => `<li>${p}</li>`).join('')}</ul>
    <label class="row tight" style="font-family:var(--sans);font-size:.92rem;cursor:pointer;margin:.6rem 0">
      <input type="checkbox" id="consent-box"> I have read this, and I want to continue</label>
    <div class="row"><button class="btn" data-consent="${kind}" disabled>Continue</button><a class="btn ghost" href="#/tools/ground">Not now: ground instead</a></div>
  </section>`;
}
export function nightmare() {
  const n = store.get().nightmare;
  const head1 = head('rescript', 'navy', 'Sleep · optional', 'Nightmare rescripting', 'Based on imagery rehearsal therapy: change a recurring nightmare while you are awake, then rehearse the new version.');
  if (!n.consent) return head1 + consent('nightmare', 'Before you start', [
    'This asks you to bring a recurring nightmare briefly to mind, so you can change it. You do not need to write it out in detail.',
    'If the nightmare replays the trauma closely, if you have nightmares most nights, or if recalling it feels overwhelming, do this with a therapist.',
    'Stop whenever you need to. <a href="#/tools/ground">Grounding</a> is one tap away, and your words are saved as you go.',
    `Imagery rehearsal reduced nightmares and improved sleep in many studies, with benefits lasting 6 to 12 months. ${ev('mod', 'IRT AASM')}`]);
  const reh = n.rehearsals.slice().reverse().slice(0, 14).map(r => `<li>${fmtDate(r.at)}${r.vivid != null ? ` · vividness ${r.vivid} out of 10` : ''}</li>`).join('');
  return `${head1}
  <div class="grid g2">
    <section class="card"><h2 style="font-size:1.05rem">1 · Name the nightmare</h2>
      <label class="lbl" for="nm-title">A short title, no details</label>
      <input type="text" id="nm-title" data-nm="title" value="${esc(n.title)}" placeholder="The corridor dream">
      <h2 style="font-size:1.05rem;margin-top:1.1rem">2 · Change it, any way you like</h2>
      <p class="tiny">Change the ending, the place, a detail, or bring in a helper. It does not need to be realistic. Write the new
        version in the present tense, with sights and sounds, as if it is happening now.</p>
      <label class="sr-only" for="nm-changed">The new version</label>
      <textarea id="nm-changed" data-nm="changed" rows="7">${esc(n.changed)}</textarea>
      <span class="saved" data-saved="nm" aria-live="polite">saved</span></section>
    <section class="card"><h2 style="font-size:1.05rem">3 · Rehearse the new version</h2>
      <p class="small">Once a day, while awake and calm (not at bedtime if it stirs you up), spend a few minutes imagining the new
        version in as much detail as you can. Rehearse only the new version, not the old one.</p>
      <div class="field"><label for="nm-viv">How vivid was it? <output id="nm-viv-o">5</output> out of 10</label>
        <input type="range" id="nm-viv" min="0" max="10" value="5"></div>
      <button class="btn" data-rehearse>Log today's rehearsal</button>
      ${reh ? `<h3 style="font-size:.95rem;margin-top:1rem">Recent rehearsals</h3><ul class="small">${reh}</ul>` : ''}
      <p class="tiny" style="margin-top:.8rem">Track your nights in the <a href="#/checkin">check-in</a> to see whether the nightmares change.</p></section>
  </div>
  <p class="tiny" style="margin-top:1rem"><button class="btn quiet sm" data-unconsent="nightmare">Hide this tool again</button></p>`;
}

export function memory() {
  const m = store.get().memory;
  const head1 = head('with_support', 'gold', 'Stage 4 · optional', 'Memory work', 'What trauma-focused therapies ask you to do with the memory, and a private place to write about its meaning.');
  const therapies = `<section class="card"><h2 style="font-size:1.05rem">What the therapies do</h2>
    <ul class="small" style="margin:.3rem 0 0;padding-left:1.2rem">
      <li><strong>Cognitive processing therapy</strong> starts with an <em>impact statement</em>: why you think it happened, and how it has changed
        what you believe about yourself, others and the world. ${ev('strong', 'CPT')}</li>
      <li><strong>Cognitive therapy for PTSD</strong> finds the worst moments of the memory (hotspots) and links them to what you know now. ${ev('strong', 'CTPTSD')}</li>
      <li><strong>Prolonged exposure</strong> involves recounting the memory aloud, in detail, with a therapist, and listening back between sessions. ${ev('strong', 'PE')}</li>
      <li><strong>Written exposure therapy</strong> involves writing about the trauma for set periods across five sessions with a therapist. ${ev('mod', 'WET')}</li>
      <li><strong>EMDR</strong> involves holding the memory in mind while following side-to-side eye movements or taps. ${ev('mod', 'EMDR')}</li></ul>
    <p class="small" style="margin:.6rem 0 0">Writing or recounting the full account of the trauma is best done with a therapist, who can pace it and
      help you make sense of what comes up. The spaces below are about meaning, not a full account.</p></section>`;
  if (!m.consent) return head1 + therapies + `<div style="margin-top:1rem">` + consent('memory', 'Before you write', [
    'These spaces ask you to think about the meaning of what happened. They do not ask you to describe it in detail.',
    'If you are still in danger, if the trauma is ongoing, or if you often lose track of time or feel far away when reminded, talk to a professional first.',
    'If you are drinking heavily or using drugs to cope, raise it with your GP first.',
    'Stop whenever you need to. Your words are saved as you go, and <a href="#/tools/ground">grounding</a> is one tap away.']) + `</div>`;
  return `${head1}
  <div class="grid g2">
    <section class="card"><h2 style="font-size:1.05rem">My impact statement</h2>
      <p class="tiny">Why do I think this happened? How has it changed what I believe about safety, trust, power and control,
        self-worth and closeness? (From cognitive processing therapy.)</p>
      <label class="sr-only" for="mem-text">My impact statement</label>
      <textarea id="mem-text" data-mem="text" rows="10">${esc(m.text)}</textarea>
      <span class="saved" data-saved="mem" aria-live="polite">saved</span></section>
    <div class="stack">
      <section class="card"><h2 style="font-size:1.05rem">Updating a worst moment</h2>
        <p class="tiny">Name the moment in a few words, what it meant at the time, and what you know now that changes that meaning.
          (From cognitive therapy for PTSD.) The step <a href="#/step/s3-5">Find the Update</a> walks through it.</p>
        <label class="sr-only" for="mem-title">The worst moment, in a few words, and its update</label>
        <textarea id="mem-title" data-mem="title" rows="5">${esc(m.title)}</textarea></section>
      ${therapies}
    </div>
  </div>
  <p class="tiny" style="margin-top:1rem"><button class="btn quiet sm" data-unconsent="memory">Hide this tool again</button></p>`;
}

// ---------------------------------------------------------------- wiring ---
export function bind(root, route) {
  root.querySelectorAll('textarea').forEach(autogrow);
  const flash = key => { const el = root.querySelector(`[data-saved="${key}"]`); if (el) { el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1200); } };
  const writers = new Map();
  const w = (key, fn) => { if (!writers.has(key)) writers.set(key, debounce(fn, 450)); return writers.get(key); };

  // grounding
  if (root.querySelector('#ground')) {
    groundStep(root);
    on(root, 'click', '[data-g]', (e, b) => {
      const box = root.querySelector('#ground');
      let i = +box.dataset.step, n = +box.dataset.n;
      const act = b.dataset.g;
      if (act === 'one') { n += 1; if (n >= SENSES[i][0]) { i += 1; n = 0; } }
      else if (act === 'skip') { i += 1; n = 0; }
      else if (act === 'back') { i = Math.max(0, i - 1); n = 0; }
      else if (act === 'again') { i = 0; n = 0; }
      else if (act === 'log') { store.markPractice('ground'); toast('Practice logged.'); return; }
      box.dataset.step = i; box.dataset.n = n; groundStep(root);
      root.querySelector('#g-body button.btn:not(.ghost):not(.quiet)')?.focus();
    });
  }
  // breathing
  if (root.querySelector('#orb')) {
    let mins = 2;
    on(root, 'click', '[data-len]', (e, b) => { mins = +b.dataset.len; root.querySelectorAll('[data-len]').forEach(x => x.setAttribute('aria-pressed', x === b)); });
    root.querySelector('#b-start').addEventListener('click', () => {
      root.querySelector('#b-start').disabled = true; root.querySelector('#b-stop').disabled = false;
      breathTimer = -1; runBreath(root, mins);
    });
    root.querySelector('#b-stop').addEventListener('click', () => stopBreath(root, false));
  }
  // card
  root.querySelectorAll('[data-card]').forEach(ta => ta.addEventListener('input', () => {
    w('card', () => {
      const v = {}; root.querySelectorAll('[data-card]').forEach(x => { v[x.dataset.card] = x.value; });
      store.patch('card', { ...v, updatedAt: Date.now() });
      const d = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      root.querySelector('#card-view').innerHTML = cardHTML(store.get().card, d);
      root.querySelector('#card-saved').textContent = 'Saved.';
    })();
  }));
  root.querySelector('#card-full')?.addEventListener('click', () => {
    const d = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const dlg = h(`<dialog class="dlg" style="max-width:760px;width:96vw" aria-label="Then-and-now card"><div class="in thennow-card" style="border:0;border-radius:0;font-size:1.15rem">
      ${cardHTML(store.get().card, d)}<form method="dialog" class="row end" style="margin-top:1rem"><button class="btn">Close</button></form></div></dialog>`);
    document.body.append(dlg); dlg.addEventListener('close', () => dlg.remove()); dlg.showModal();
    store.markPractice('thennow');
  });
  // safety plan
  root.querySelectorAll('[data-safety]').forEach(ta => ta.addEventListener('input', () =>
    w(ta.dataset.safety, v => { store.saveSafety(ta.dataset.safety, v); flash('sp-' + ta.dataset.safety); })(ta.value)));
  // ladder
  const rf = root.querySelector('#rung-form');
  if (rf) {
    const sl = root.querySelector('#rung-suds');
    sl.addEventListener('input', () => { root.querySelector('#rung-o').textContent = sl.value; });
    rf.addEventListener('submit', e => {
      e.preventDefault();
      const t = root.querySelector('#rung-text').value.trim();
      if (!t) { toast('Describe the step first.'); return; }
      store.addRung(t, sl.value); refresh();
    });
  }
  root.querySelectorAll('form[data-try]').forEach(f => {
    f.querySelectorAll('input[type=range]').forEach(r => r.addEventListener('input', () => { r.closest('label').querySelector('output').textContent = r.value; }));
    f.addEventListener('submit', e => {
      e.preventDefault();
      const g = k => +f.querySelector(`[name="${k}"]`).value;
      store.addTry(f.dataset.try, { before: g('before'), peak: g('peak'), after: g('after') });
      store.markPractice('ladder'); toast('Try logged. Well done for facing it.'); refresh();
    });
  });
  on(root, 'click', '[data-done]', (e, b) => { const r = store.get().ladder.find(x => x.id === b.dataset.done); store.updateRung(b.dataset.done, { done: !r.done }); refresh(); });
  on(root, 'click', '[data-del-rung]', async (e, b) => {
    if (await confirmBox({ title: 'Delete this step?', body: 'Its tries will be deleted too.', ok: 'Delete', danger: true })) { store.removeRung(b.dataset.delRung); refresh(); }
  });
  // pie
  if (root.querySelector('#pie-event')) {
    const P = draftPie;
    root.querySelector('#pie-event').addEventListener('input', e => { P.event = e.target.value; });
    root.querySelector('#pie-add').addEventListener('submit', e => {
      e.preventDefault(); const v = root.querySelector('#pie-new').value.trim(); if (!v) return;
      const me = P.slices.findIndex(x => x.me);
      const item = { label: v, pct: 0 };
      if (me >= 0) P.slices.splice(me, 0, item); else P.slices.push(item);
      refresh(); setTimeout(() => document.querySelector('#pie-new')?.focus(), 0);
    });
    root.querySelectorAll('[data-sl]').forEach(inp => inp.addEventListener('change', () => {
      const x = P.slices[+inp.dataset.sl];
      if (inp.dataset.k === 'pct') x.pct = Math.max(0, Math.min(100, Math.round(+inp.value || 0))); else x.label = inp.value;
      refresh();
    }));
    on(root, 'click', '[data-rm]', (e, b) => { P.slices.splice(+b.dataset.rm, 1); refresh(); });
    on(root, 'click', '[data-addme]', () => { P.slices.push({ label: 'Me', pct: 0, me: true }); refresh(); });
    on(root, 'click', '[data-savepie]', () => {
      if (!P.slices.length) { toast('Add at least one share first.'); return; }
      if (!P.id) P.id = store.uid();
      store.savePie(JSON.parse(JSON.stringify(P))); toast('Saved.'); store.markPractice('pie');
      history.replaceState(null, '', '#/tools/pie?id=' + P.id); refresh();
    });
    on(root, 'click', '[data-newpie]', () => { draftPie = { id: null, event: '', slices: [] }; history.replaceState(null, '', '#/tools/pie'); refresh(); });
    on(root, 'click', '[data-delpie]', async (e, b) => {
      if (await confirmBox({ title: 'Delete this pie?', body: 'It cannot be recovered.', ok: 'Delete', danger: true })) {
        store.removePie(b.dataset.delpie); if (P.id === b.dataset.delpie) draftPie = null; refresh();
      }
    });
  }
  // opt-in consent
  const cb = root.querySelector('#consent-box');
  if (cb) cb.addEventListener('change', () => { root.querySelector('[data-consent]').disabled = !cb.checked; });
  on(root, 'click', '[data-consent]', (e, b) => { store.patch(b.dataset.consent, { consent: true }); refresh(); });
  on(root, 'click', '[data-unconsent]', (e, b) => { store.patch(b.dataset.unconsent, { consent: false }); refresh(); });
  // nightmare
  root.querySelectorAll('[data-nm]').forEach(inp => inp.addEventListener('input', () =>
    w('nm-' + inp.dataset.nm, v => { store.patch('nightmare', { [inp.dataset.nm]: v }); flash('nm'); })(inp.value)));
  const viv = root.querySelector('#nm-viv');
  if (viv) viv.addEventListener('input', () => { root.querySelector('#nm-viv-o').textContent = viv.value; });
  on(root, 'click', '[data-rehearse]', () => {
    const n = store.get().nightmare;
    store.patch('nightmare', { rehearsals: [...n.rehearsals, { at: Date.now(), vivid: +viv.value }] });
    store.markPractice('nightmare'); toast('Rehearsal logged.'); refresh();
  });
  // memory
  root.querySelectorAll('[data-mem]').forEach(inp => inp.addEventListener('input', () =>
    w('mem-' + inp.dataset.mem, v => { store.patch('memory', { [inp.dataset.mem]: v }); flash('mem'); })(inp.value)));
}

export function unbind() { if (breathTimer) { clearTimeout(breathTimer); breathTimer = null; } }
