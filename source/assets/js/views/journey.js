// Home, stage and step views: the five stages, made workable.
import { STAGES, ALL_STEPS, STEP_BY_ID } from '../content.js';
import * as store from '../store.js';
import { vig, esc, on, viewSignal, autogrow, debounce, ago, fmtDate, toast, ev, confirmBox } from '../ui.js';
import { regionData } from '../regions.js';

const TONES = ['navy', 'teal', 'green', 'gold', 'rose'];
export const TOOL_LINKS = {
  ground: ['#/tools/ground', 'Open grounding'], breathe: ['#/tools/breathe', 'Open the breathing pacer'],
  thennow: ['#/tools/thennow', 'Make a then-and-now card'], safety: ['#/tools/safety', 'Open my safety plan'],
  ladder: ['#/tools/ladder', 'Open my approach ladder'], pie: ['#/tools/pie', 'Open the responsibility pie'],
  memory: ['#/tools/memory', 'Read about memory work'], pcl: ['#/pcl', 'Take the symptom check'],
  nightmare: ['#/tools/nightmare', 'Open nightmare rescripting']
};

const stepIdsFor = stage => stage.panels.filter(p => p.kind === 'path').flatMap(p => p.steps.map(s => s.id));
export const statusOf = id => store.get().steps[id]?.status
  || (Object.values(store.get().steps[id]?.entries || {}).some(t => (t || '').trim()) ? 'working' : 'untouched');
const badge = st => `<span class="badge ${st}">${st === 'untouched' ? 'not started' : st === 'settled' ? 'settled' : 'in progress'}</span>`;

// ================================================================== home ===
export function home() {
  const s = store.get();
  const settled = ALL_STEPS.filter(st => statusOf(st.id) === 'settled').length;
  const last = Object.entries(s.steps).sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))[0];
  const resume = last && STEP_BY_ID[last[0]];
  const R = regionData();

  const cards = STAGES.map(st => {
    const p = store.stageProgress(stepIdsFor(st));
    const pct = Math.round((p.done / p.total) * 100);
    return `<a class="card stagecard" href="#/stage/${st.id}">
      ${vig(st.scene, st.tone, 74)}
      <div>
        <div class="num">Stage ${st.id}</div>
        <h3>${esc(st.title)}</h3>
        <p class="small muted" style="margin:.25rem 0 0">${esc(st.subtitle)}</p>
        <div class="bar" role="img" aria-label="${p.done} of ${p.total} steps settled"><i style="width:${pct}%"></i></div>
        <div class="tiny" style="margin-top:.35rem">${p.done} of ${p.total} steps settled${p.started > p.done ? ` · ${p.started - p.done} in progress` : ''}</div>
      </div></a>`;
  }).join('');

  return `
  <section class="hero" id="v-start">
    <div>
      <div class="eyebrow">A private guide in five stages</div>
      <h1>Then and Now</h1>
      <p class="lede">Deconstructing and overcoming post-traumatic stress, at your own pace.
        It explains how PTSD works, guides you through the steps that the best-tested
        treatments use, and gives you tools for hard moments. Everything you write stays on this device.</p>
      <div class="row" style="margin-top:1rem">
        ${resume ? `<a class="btn" href="#/step/${resume.id}">Continue: ${esc(resume.title)}</a>
                    <a class="btn ghost" href="#/stage/${resume.stage}">Stage ${resume.stage} overview</a>`
                 : `<a class="btn" href="#/stage/1">Begin at Stage 1</a>
                    <a class="btn ghost" href="#/learn/what">What PTSD is</a>`}
      </div>
    </div>
    ${vig('then_now', 'navy', 132, 'Then and Now: a medallion showing a path from a dark past into a lit present')}
  </section>

  <section class="card calm" aria-labelledby="h-now" style="margin-bottom:1.4rem">
    <div class="spread">
      <div><h2 id="h-now" style="font-size:1.2rem">If it is hard right now</h2>
        <p class="small muted" style="margin:.2rem 0 0">Three tools that take a few minutes. Nothing to read first.</p></div>
      <a class="help-pill" href="#/help"><span class="dot" aria-hidden="true"></span>Get help now</a>
    </div>
    <div class="quick" style="margin-top:.8rem">
      <a href="#/tools/ground">${vig('five_senses', 'teal', 40)}<span><b>Ground</b><span class="tiny">Five senses, one at a time</span></span></a>
      <a href="#/tools/breathe">${vig('breath', 'teal', 40)}<span><b>Breathe</b><span class="tiny">A slow, guided rhythm</span></span></a>
      <a href="#/tools/thennow">${vig('then_now', 'navy', 40)}<span><b>Then and now</b><span class="tiny">Your reminder card</span></span></a>
    </div>
  </section>

  <div class="card" style="margin-bottom:1.4rem">
    <div class="stats">
      <div class="stat"><b>${settled}</b><span>steps settled of 40</span></div>
      <div class="stat"><b>${s.checkins.length}</b><span>check-ins</span></div>
      <div class="stat"><b>${s.journal.length}</b><span>journal entries</span></div>
      <div class="stat"><b>${store.practiceStreak()}</b><span>day practice streak</span></div>
    </div>
  </div>

  <h2 style="margin-bottom:.8rem">The five stages</h2>
  <div class="grid g2">${cards}</div>

  <h2 style="margin:2rem 0 .8rem">Daily practice</h2>
  <div class="quick">
    <a href="#/checkin">${vig('checkin', 'teal', 40)}<span><b>Check-in</b><span class="tiny">A minute a day</span></span></a>
    <a href="#/record">${vig('then_now', 'green', 40)}<span><b>Then-and-now record</b><span class="tiny">Work a reminder through</span></span></a>
    <a href="#/journal">${vig('honest_checkin', 'navy', 40)}<span><b>Journal</b><span class="tiny">Somewhere to put the day</span></span></a>
    <a href="#/map">${vig('hub_construct', 'navy', 40)}<span><b>My PTSD map</b><span class="tiny">What keeps it going for you</span></span></a>
    <a href="#/pcl">${vig('compass', 'gold', 40)}<span><b>Symptom check</b><span class="tiny">The PCL-5, monthly</span></span></a>
    <a href="#/patterns">${vig('review_adjust', 'gold', 40)}<span><b>Patterns</b><span class="tiny">What is changing</span></span></a>
  </div>

  <h2 style="margin:2rem 0 .8rem">Understand it</h2>
  <div class="quick">
    <a href="#/learn/what">${vig('fragments', 'navy', 40)}<span><b>What PTSD is</b><span class="tiny">And how common it is</span></span></a>
    <a href="#/learn/cycle">${vig('alarm', 'rose', 40)}<span><b>Why it keeps going</b><span class="tiny">The cycle, step by step</span></span></a>
    <a href="#/learn/treatment">${vig('healing', 'green', 40)}<span><b>Treatments that work</b><span class="tiny">And how to get them</span></span></a>
    <a href="#/learn/evidence">${vig('discernment', 'gold', 40)}<span><b>The evidence</b><span class="tiny">Every source, graded</span></span></a>
  </div>

  <div class="safety" style="margin-top:2rem">
    <strong>Please read.</strong> Then and Now is a self-help guide, not therapy, diagnosis or
    treatment, and no one sees what you write. It works best alongside a GP, psychologist or
    other trauma-trained professional. If you are in danger or thinking about ending your life,
    call ${esc(R.emText)} now${R.crisis ? `, or ${esc(R.crisis)}` : ''}. <a href="#/help">All help options</a>.
  </div>`;
}

// ================================================================= stage ===
export function stage(id) {
  const st = STAGES.find(s => s.id === +id);
  if (!st) return `<p>Stage not found. <a href="#/">Back to the start</a></p>`;
  const s = store.get();
  const [inputs, construct, path] = ['inputs', 'construct', 'path'].map(k => st.panels.find(p => p.kind === k));
  const tone2 = TONES[(st.id) % 5];
  const wroteHere = [...inputs.items, ...construct.satellites].some(i => (s.items[i.id]?.text || '').trim());

  const learn = st.learn.map(b => `
    <div class="learn-block">
      <h3>${esc(b.h)}</h3>
      <p>${esc(b.p)} ${b.g || b.r ? ev(b.g, b.r) : ''}</p>
    </div>`).join('');

  const itemCards = inputs.items.map(it => {
    const saved = s.items[it.id]?.text || '';
    return `<div class="card itemcard">
      ${vig(it.scene, st.tone, 62)}
      <div>
        <h3 style="font-size:1.05rem">${esc(it.title)}</h3>
        <p class="desc" style="margin:.2rem 0 0">${esc(it.desc)}</p>
        <p class="cue">${esc(it.cue)} ${it.g || it.r ? ev(it.g, it.r) : ''}</p>
        <div class="writing">
          <label class="lbl" for="it-${it.id}">${esc(it.prompt)}</label>
          <textarea id="it-${it.id}" data-item="${it.id}" placeholder="Write as much or as little as you like. It saves as you go." rows="2">${esc(saved)}</textarea>
          <div class="spread" style="margin-top:.2rem">
            <span class="tiny">${saved ? 'Last written ' + ago(s.items[it.id].updatedAt) : ''}</span>
            <span class="saved" data-saved="${it.id}" aria-live="polite">saved</span>
          </div>
        </div>
      </div></div>`;
  }).join('');

  const sats = construct.satellites.map(sat => {
    const saved = s.items[sat.id]?.text || '';
    return `<div class="card satcard">
      ${vig(sat.scene, tone2, 66)}
      <h3 style="font-size:1.02rem;color:var(--sec)">${esc(sat.title)}</h3>
      <p>${esc(sat.desc)}</p>
      <details style="margin-top:.5rem;text-align:left" ${saved ? 'open' : ''}>
        <summary>${saved ? 'Your note' : 'Add your own words'}</summary>
        <label class="lbl" for="it-${sat.id}" style="margin-top:.5rem">${esc(sat.prompt)}</label>
        <textarea id="it-${sat.id}" data-item="${sat.id}" rows="3">${esc(saved)}</textarea>
        <span class="saved" data-saved="${sat.id}" aria-live="polite">saved</span>
      </details></div>`;
  }).join('');

  const strip = construct.strip.items.map(i =>
    `<figure>${vig(i.scene, construct.strip.tone || 'rose', 56)}<figcaption>${esc(i.label)}</figcaption></figure>`).join('');

  const steps = path.steps.map((step, i) => `<a class="steprow" href="#/step/${step.id}">
      <span class="n" aria-hidden="true">${i + 1}</span>
      ${vig(step.scene, 'green', 48)}
      <span><b>${esc(step.title)}</b>${step.care ? ' <span class="tag">optional, with support</span>' : ''}<br>
        <span class="q">${esc(step.question)}</span></span>
      ${badge(statusOf(step.id))}
    </a>`).join('');

  const toward = path.toward.items.map(i =>
    `<figure>${vig(i.scene, 'gold', 56)}<figcaption>${esc(i.label)}</figcaption></figure>`).join('');

  const nav = STAGES.map(x => `<a href="#/stage/${x.id}" class="${x.id === st.id ? 'on' : ''}" ${x.id === st.id ? 'aria-current="page"' : ''}>
      <b>${x.id}</b> ${esc(x.short)}</a>`).join('');

  return `
  <nav class="tiny" aria-label="Breadcrumb"><a href="#/">Home</a> › Stage ${st.id}</nav>
  <div class="hero" style="margin-top:.4rem">
    <div>
      <div class="eyebrow">Stage ${st.id} of 5 · Panels ${inputs.n} to ${path.n} of 15</div>
      <h1>${esc(st.full)}</h1>
      <p class="lede">${esc(st.subtitle)}</p>
      <p class="small muted prose">${esc(st.intro)}</p>
    </div>
    ${vig(st.scene, st.tone, 132)}
  </div>

  <details class="card" ${wroteHere ? '' : 'open'} style="margin-top:.6rem">
    <summary style="cursor:pointer"><span class="eyebrow">Read first</span>
      <span style="font-weight:650;color:var(--head);margin-left:.4rem">What the evidence says</span></summary>
    <div class="learn-grid" style="margin-top:.8rem">${learn}</div>
    <p class="tiny" style="margin-top:.4rem">Grades: <a href="#/about?s=grades">what Strong, Moderate, Weak and Not supported mean</a>. Tap a source to see who was studied.</p>
  </details>

  <section aria-labelledby="h-p${inputs.n}">
  <div class="panelhead"><span class="n">${inputs.n}</span>
    <div><h2 id="h-p${inputs.n}">${esc(inputs.heading)}</h2><p class="tiny">${esc(inputs.lead)}</p></div></div>
  <div class="grid g2">${itemCards}</div>
  <div class="card" style="margin-top:1rem;display:flex;gap:.9rem;align-items:center">
    ${vig(inputs.note.scene, st.tone, 54)}
    <p class="serif-note" style="margin:0">${esc(inputs.note.text)}</p></div>
  </section>

  <section aria-labelledby="h-p${construct.n}">
  <div class="panelhead teal"><span class="n">${construct.n}</span>
    <div><h2 id="h-p${construct.n}">${esc(construct.heading)}</h2><p class="tiny">${esc(construct.lead)}</p></div></div>
  <div class="card" style="text-align:center;margin-bottom:1rem">
    ${vig(construct.hub.scene, tone2, 96)}
    <h3 style="color:var(--sec);margin-top:.5rem">${esc(construct.hub.label)}</h3>
    ${st.id === 1 ? `<p class="small muted" style="margin:.2rem auto 0;max-width:52ch">Add your own words to each part.
      They also feed <a href="#/map">your PTSD map</a>. For how the parts connect, see
      <a href="#/learn/cycle">why PTSD keeps going</a>.</p>` : ''}
  </div>
  <div class="satgrid">${sats}</div>
  <div class="card tintbox" style="margin-top:1rem">
    <h3 style="text-align:center;font-size:1rem;color:var(--warn)">${esc(construct.strip.title)}</h3>
    <div class="stripline">${strip}</div></div>
  <div class="card" style="margin-top:1rem;display:flex;gap:.9rem;align-items:center">
    ${vig(construct.close.scene, tone2, 54)}
    <p class="serif-note" style="margin:0">${esc(construct.close.text)}</p></div>
  </section>

  <section aria-labelledby="h-p${path.n}">
  <div class="panelhead green"><span class="n">${path.n}</span>
    <div><h2 id="h-p${path.n}">${esc(path.heading)}</h2><p class="tiny">${esc(path.lead)}</p></div></div>
  <div class="steplist">${steps}</div>
  <div class="card tintbox" style="margin-top:1rem">
    <h3 style="text-align:center;font-size:1rem;color:var(--acc)">${esc(path.toward.title)}</h3>
    <div class="stripline">${toward}</div></div>
  </section>

  <div class="card" style="margin-top:1.6rem;display:flex;gap:1rem;align-items:center">
    ${vig('lotus', 'gold', 58)}
    <div><div class="eyebrow">Key reminder</div>
      <p class="serif-note" style="margin:.2rem 0 0;font-size:1.05rem">${esc(st.key)}</p></div>
  </div>

  <div class="spread" style="margin-top:1.4rem">
    ${st.id > 1 ? `<a class="btn ghost" href="#/stage/${st.id - 1}">← Stage ${st.id - 1}</a>` : '<span></span>'}
    ${st.id < 5 ? `<a class="btn" href="#/stage/${st.id + 1}">Stage ${st.id + 1}: ${esc(st.next)} →</a>` : `<a class="btn" href="#/patterns">See your patterns →</a>`}
  </div>
  <nav class="stagebar" aria-label="Stages" style="margin-top:1.4rem;border-radius:10px;border:1px solid var(--line)">
    <div class="in">${nav}</div></nav>`;
}

// ================================================================== step ===
export function step(id) {
  const st = STEP_BY_ID[id];
  if (!st) return `<p>Step not found. <a href="#/">Back to the start</a></p>`;
  const s = store.get();
  const rec = s.steps[id] || { entries: {}, history: [] };
  const stg = STAGES.find(x => x.id === st.stage);
  const siblings = stg.panels.find(p => p.kind === 'path').steps;
  const idx = siblings.findIndex(x => x.id === id);
  const prev = siblings[idx - 1], next = siblings[idx + 1];
  const practisedToday = (s.practices[store.today()] || []).includes(id);
  const tool = st.tool && TOOL_LINKS[st.tool];

  const prompts = st.prompts.map((p, i) => `
    <div class="prompt">
      <label class="q" for="sp-${i}">${esc(p)}</label>
      <textarea id="sp-${i}" data-step="${id}" data-index="${i}" rows="3">${esc(rec.entries?.[i] || '')}</textarea>
      <span class="saved" data-saved="${id}-${i}" aria-live="polite">saved</span>
    </div>`).join('');

  const history = (rec.history || []).slice().reverse().slice(0, 6).map(hst =>
    `<details class="small"><summary class="tiny">${fmtDate(hst.at)}: earlier version of
      “${esc(st.prompts[hst.index] || '')}”</summary>
      <p class="muted" style="white-space:pre-wrap">${esc(hst.text)}</p></details>`).join('');

  const care = st.care ? `
    <div class="care" role="note">
      <h3>Before this step</h3>
      <p class="small">Working with the memory itself is the part of treatment that helps most, and it is also
        the part most worth doing with a trained therapist, who can pace it, notice when it is too much and help
        you make sense of what comes up. This step is about planning, not about writing the memory down.</p>
      <ul class="small">
        <li>If you are still in danger, or the trauma is ongoing, focus on Stage 2 and on getting help first.</li>
        <li>If you often lose track of time, feel far away or "switch off" when reminded, talk to a professional before working with the memory.</li>
        <li>If you are drinking heavily or using drugs to cope, raise this with your GP first.</li>
      </ul>
      <p class="small" style="margin-bottom:0">When you and your therapist are ready, <a href="#/tools/memory">the memory work page</a>
        explains what the main therapies ask you to do and offers a private space to write. ${ev('mod', 'WET EXACERBATE')}</p>
    </div>` : '';

  const related = ALL_STEPS.filter(x => x.stage === st.stage && x.id !== id).slice(0, 3)
    .map(x => `<a class="btn quiet sm" href="#/step/${x.id}">${esc(x.title)}</a>`).join('');

  return `
  <nav class="tiny" aria-label="Breadcrumb"><a href="#/">Home</a> ›
    <a href="#/stage/${st.stage}">Stage ${st.stage}</a> › ${esc(st.pathTitle)}</nav>

  <div class="stepwrap" style="margin-top:.6rem">
    <div>
      <div class="row stephead" style="gap:1rem;align-items:flex-start">
        ${vig(st.scene, 'green', 96)}
        <div style="min-width:0">
          <div class="eyebrow">${esc(st.pathTitle)} · step ${idx + 1} of ${siblings.length}</div>
          <h1 style="font-size:clamp(1.5rem,3vw,1.95rem)">${esc(st.title)}</h1>
          <p class="lede" style="margin-top:.4rem">${esc(st.question)}</p>
        </div>
      </div>
      <p class="small"><strong>Practice cue.</strong> ${esc(st.cue)}</p>
      ${st.why ? `<div class="why"><strong>Why this step.</strong> ${esc(st.why.t)} ${ev(st.why.g, st.why.r)}</div>` : ''}
      ${care}
      ${tool ? `<p><a class="btn sec" href="${tool[0]}">${esc(tool[1])}</a></p>` : ''}

      ${prompts}

      <div class="row" style="margin-top:1.2rem">
        <button class="btn" data-settle="${id}">${rec.status === 'settled' ? 'Reopen this step' : 'Mark as settled for now'}</button>
        <button class="btn ghost" data-practice="${id}" aria-pressed="${practisedToday}">${practisedToday ? '✓ Practised today' : 'Log practice today'}</button>
        <a class="btn ghost" href="#/journal?step=${id}">Journal about this</a>
      </div>

      ${history ? `<hr class="rule"><h2 style="font-size:1.1rem">Earlier versions</h2>
        <p class="tiny">Kept automatically, so you can see how your answers change.</p>${history}` : ''}

      <div class="spread" style="margin-top:1.8rem">
        ${prev ? `<a class="btn ghost" href="#/step/${prev.id}">← ${esc(prev.title)}</a>` : `<a class="btn ghost" href="#/stage/${st.stage}">← Back to the stage</a>`}
        ${next ? `<a class="btn" href="#/step/${next.id}">${esc(next.title)} →</a>` : `<a class="btn" href="#/stage/${st.stage}">Finish the path →</a>`}
      </div>
    </div>

    <aside class="card sidecard" aria-label="About this step">
      <div class="eyebrow">Where this sits</div>
      <h2 style="font-size:1rem;margin:.3rem 0 .5rem">${esc(stg.full)}</h2>
      <p class="small muted">${esc(stg.subtitle)}</p>
      <hr class="rule" style="margin:.9rem 0">
      <div class="eyebrow">This step is</div>
      <p class="small" style="margin:.3rem 0 .8rem">${badge(statusOf(id))}
        ${rec.updatedAt ? `<span class="tiny"> · updated ${ago(rec.updatedAt)}</span>` : ''}</p>
      <div class="eyebrow">Elsewhere in this stage</div>
      <div class="stack tight" style="margin-top:.4rem">${related}</div>
      <hr class="rule" style="margin:.9rem 0">
      <p class="tiny" style="margin:0">Feeling flooded? <a href="#/tools/ground">Ground first</a>, then come back. Your words are saved.</p>
    </aside>
  </div>`;
}

// ---------------------------------------------------------------- wiring ---
export function bind(root, route) {
  const flash = key => {
    const el = root.querySelector(`[data-saved="${key}"]`);
    if (!el) return;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1200);
  };
  // One debounced writer per field, so moving quickly between fields never loses text.
  const writers = new Map();
  const writer = (key, fn) => {
    if (!writers.has(key)) writers.set(key, debounce(fn, 450));
    return writers.get(key);
  };
  root.addEventListener('input', e => {
    const ta = e.target;
    if (ta.matches('textarea[data-step]')) {
      const { step: id, index } = ta.dataset;
      writer(`${id}-${index}`, v => { store.saveStep(id, +index, v); flash(`${id}-${index}`); })(ta.value);
    } else if (ta.matches('textarea[data-item]')) {
      const id = ta.dataset.item;
      writer(id, v => { store.saveItem(id, v); flash(id); })(ta.value);
    }
  }, { signal: viewSignal() });
  root.querySelectorAll('textarea').forEach(autogrow);

  on(root, 'click', '[data-settle]', (e, b) => {
    const id = b.dataset.settle;
    const now = store.get().steps[id]?.status === 'settled' ? 'working' : 'settled';
    store.setStepStatus(id, now);
    toast(now === 'settled' ? 'Marked as settled. You can reopen it any time.' : 'Reopened.');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  on(root, 'click', '[data-practice]', (e, b) => {
    store.logPractice(b.dataset.practice);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}
