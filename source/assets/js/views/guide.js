// "Understand it" pages, the evidence library, help and about.
import { GUIDE, TX } from '../guidedata.js';
import * as D from '../diagrams.js';
import { vig, esc, ev, refs, refLinks, GRADE, on, toast } from '../ui.js';
import { REGIONS, RORDER, currentRegion } from '../regions.js';
import * as store from '../store.js';

const FIGS = { cycle: D.cycle, memory: D.memory, alarm: D.alarm, brain: D.brain, window: D.windowTol, cptsd: D.cptsd };
const TOPICS = { what: 'What PTSD is', how: 'How it works', treat: 'Treatment', self: 'Self-help and lifestyle',
  meds: 'Medicines', safe: 'Safety', measure: 'Measuring symptoms' };

export function learnIndex() {
  const cards = GUIDE.map(g => `<a class="card toolcard" href="#/learn/${g.id}">
      ${vig(g.scene, g.tone, 56)}
      <span><span class="eyebrow">${esc(g.eyebrow)}</span><br><b>${esc(g.title)}</b>
        <span class="small muted" style="display:block;margin-top:.2rem">${esc(g.lede)}</span></span></a>`).join('');
  return `
  <div class="hero"><div>
    <div class="eyebrow">Understand it</div>
    <h1>How PTSD works, and what helps</h1>
    <p class="lede">Short guides in plain English. Every key claim carries a grade for how strong the evidence is,
      and the study it comes from.</p></div>
    ${vig('discernment', 'gold', 120)}</div>
  <div class="toolgrid">${cards}
    <a class="card toolcard" href="#/learn/evidence">${vig('separate_fact', 'gold', 56)}
      <span><span class="eyebrow">Sources</span><br><b>The evidence library</b>
      <span class="small muted" style="display:block;margin-top:.2rem">Every source, with who was studied and what was found.</span></span></a>
  </div>
  ${grades()}`;
}

export function grades() {
  return `<section class="card" id="grades" style="margin-top:1.6rem" aria-labelledby="h-grades">
    <h2 id="h-grades" style="font-size:1.15rem">How the evidence is graded</h2>
    <div class="grid g2" style="margin-top:.6rem;gap:.7rem">
      <p class="small" style="margin:0"><span class="g g-strong">Strong</span> Consistent results from several good randomised
        trials or large reviews of them, or very large population surveys. Unlikely to change.</p>
      <p class="small" style="margin:0"><span class="g g-mod">Moderate</span> Good evidence with some limits: fewer trials, mixed
        results, or studies that show a link rather than cause. Could be refined.</p>
      <p class="small" style="margin:0"><span class="g g-weak">Weak</span> Early, small or low-quality studies, or a widely used
        clinical idea that has not been properly tested. Treat as promising, not proven.</p>
      <p class="small" style="margin:0"><span class="g g-no">Not supported</span> Tested, and the evidence goes against it, or it
        has been tested and found not to help.</p>
    </div>
    <p class="tiny" style="margin:.7rem 0 0">Statistics, guidelines and questionnaires are cited without a grade. "Clinical consensus"
      marks advice that is standard practice without a specific study behind it.</p>
  </section>`;
}

function block(b) {
  if (b.fig) return FIGS[b.fig] ? FIGS[b.fig]() : '';
  if (b.cards) return `<div class="grid g2" style="margin:.4rem 0 1rem">${b.cards.map(c => `
      <div class="card itemcard">${vig(c.scene, 'navy', 54)}<div><h3 style="font-size:1.02rem">${esc(c.t)}</h3>
        <p class="small muted" style="margin:.2rem 0 0">${esc(c.d)}</p></div></div>`).join('')}</div>`;
  if (b.tx) return txTable(TX[b.tx]);
  return `<p>${b.html ? b.p : esc(b.p)} ${b.g || b.r ? ev(b.g, b.r) : ''}</p>`;
}
function txTable(rows) {
  return `<div class="tablewrap card" style="padding:.3rem .6rem;margin:.6rem 0 1rem"><table class="tx">
    <thead><tr><th scope="col">Treatment</th><th scope="col">Where it stands</th><th scope="col">Evidence</th></tr></thead>
    <tbody>${rows.map(r => `<tr>
      <td data-l="Treatment"><strong>${esc(r.t)}</strong><br><span class="small muted">${esc(r.d)}</span></td>
      <td data-l="Where it stands">${esc(r.line)}</td>
      <td data-l="Evidence">${ev(r.g, r.r)}</td></tr>`).join('')}</tbody></table></div>`;
}

export function guide(id) {
  const g = GUIDE.find(x => x.id === id);
  if (!g) return `<p>Page not found. <a href="#/learn">All guides</a></p>`;
  const i = GUIDE.indexOf(g), prev = GUIDE[i - 1], next = GUIDE[i + 1];
  const toc = g.sections.map((s, k) => `<a href="#/learn/${g.id}?s=${k}" data-toc="${k}">${esc(s.h)}</a>`).join('');
  return `
  <nav class="tiny" aria-label="Breadcrumb"><a href="#/learn">Understand it</a> › ${esc(g.title)}</nav>
  <div class="hero" style="margin-top:.4rem"><div>
    <div class="eyebrow">${esc(g.eyebrow)}</div>
    <h1>${esc(g.title)}</h1>
    <p class="lede">${esc(g.lede)}</p></div>
    ${vig(g.scene, g.tone, 120)}</div>
  <div class="stepwrap">
    <article class="prose-wide">
      ${g.sections.map((s, k) => `<section id="sec-${k}" aria-labelledby="h-sec-${k}" style="margin-bottom:1.6rem">
        <h2 id="h-sec-${k}" style="margin-bottom:.4rem">${esc(s.h)}</h2>
        ${s.blocks.map(block).join('')}</section>`).join('')}
      <div class="spread" style="margin-top:1.4rem">
        ${prev ? `<a class="btn ghost" href="#/learn/${prev.id}">← ${esc(prev.title)}</a>` : `<a class="btn ghost" href="#/learn">← All guides</a>`}
        ${next ? `<a class="btn" href="#/learn/${next.id}">${esc(next.title)} →</a>` : `<a class="btn" href="#/learn/evidence">The evidence library →</a>`}
      </div>
    </article>
    <aside class="card sidecard" aria-label="On this page">
      <div class="eyebrow">On this page</div>
      <nav class="stack tight" style="margin-top:.5rem;font-family:var(--sans);font-size:.86rem">${toc}</nav>
      <hr class="rule" style="margin:.9rem 0">
      <p class="tiny" style="margin:0"><a href="#/about?s=grades">How grades work</a> · <a href="#/learn/evidence">All sources</a></p>
    </aside>
  </div>`;
}

export function evidence(query) {
  const params = new URLSearchParams(query || '');
  const focus = params.get('ref');
  const topic = params.get('t') || '';
  const R = refs();
  const ids = Object.keys(R).filter(k => !topic || R[k].t === topic)
    .sort((a, b) => (R[a].t || '').localeCompare(R[b].t || '') || R[a].s.localeCompare(R[b].s));
  const tabs = [['', 'All'], ...Object.entries(TOPICS)].map(([k, v]) =>
    `<a href="#/learn/evidence${k ? '?t=' + k : ''}" class="${k === topic ? 'on' : ''}" ${k === topic ? 'aria-current="true"' : ''}>${esc(v)}</a>`).join('');
  const items = ids.map(k => {
    const r = R[k];
    return `<article class="ref${k === focus ? ' flash' : ''}" id="ref-${k}">
      <h3 style="font-size:1.02rem">${esc(r.s)} ${r.g && GRADE[r.g] ? `<span class="g ${GRADE[r.g][0]}">${GRADE[r.g][1]}</span>` : ''}</h3>
      <p class="tiny" style="margin:.1rem 0 .3rem">${esc(r.k)} · ${esc(TOPICS[r.t] || '')}</p>
      <p class="small" style="margin:.2rem 0"><strong>Who:</strong> ${esc(r.pop)}</p>
      <p class="small" style="margin:.2rem 0"><strong>Found:</strong> ${esc(r.f)}</p>
      <p class="tiny" style="margin:.3rem 0">${esc(r.c)}</p>
      <div class="links">${refLinks(r)}</div></article>`;
  }).join('');
  return `
  <nav class="tiny" aria-label="Breadcrumb"><a href="#/learn">Understand it</a> › Evidence library</nav>
  <div class="hero" style="margin-top:.4rem"><div>
    <div class="eyebrow">Sources</div>
    <h1>The evidence library</h1>
    <p class="lede">${Object.keys(R).length} sources behind the claims in this app: who was studied, what was found, and links to
      the original papers. Every PubMed number and DOI was checked against PubMed. Reviewed to November 2026.</p></div>
    ${vig('separate_fact', 'gold', 110)}</div>
  ${grades()}
  <nav class="tabs" aria-label="Filter by topic" style="margin-top:1.4rem">${tabs}</nav>
  <div class="card reflist">${items}</div>`;
}

// ================================================================== help ===
export function help() {
  const rk = currentRegion(), R = REGIONS[rk];
  const chips = RORDER.map(k => `<button type="button" class="chip" data-region="${k}" aria-pressed="${k === rk}">${esc(REGIONS[k].n)}</button>`).join('');
  const groups = R.groups.map(g => `
    <section class="card" style="margin-top:1rem" aria-labelledby="hg-${esc(g.t).replace(/\W+/g, '')}">
      <h2 id="hg-${esc(g.t).replace(/\W+/g, '')}" style="font-size:1.1rem${g.crisis ? ';color:var(--warn)' : ''}">${esc(g.t)}</h2>
      ${g.items.map(it => `<div class="helpline">
        <div><div class="who">${esc(it.who)}</div>
          <strong>${esc(it.o)}</strong>
          <p class="small muted" style="margin:.15rem 0 0">${esc(it.d)}${it.h ? ` <span class="tiny">(${esc(it.h)})</span>` : ''}</p>
          ${it.u ? `<a class="tiny" href="${it.u}" target="_blank" rel="noopener">${esc(it.u.replace(/^https?:\/\/(www\.)?/, ''))}</a>` : ''}</div>
        ${it.ph ? `<a class="ph" href="tel:${it.ph.replace(/[^\d+]/g, '')}">${esc(it.ph)}</a>` : ''}
      </div>`).join('')}
    </section>`).join('');
  return `
  <div class="hero"><div>
    <div class="eyebrow">Get help</div>
    <h1>Help, now and later</h1>
    <p class="lede">You do not have to manage this on your own. Showing services for ${esc(R.n)}.</p>
    <div class="row tight" style="margin-top:.6rem" role="group" aria-label="Choose your region">${chips}</div></div>
    ${vig('lighthouse', 'rose', 120)}</div>
  <div class="emerg" role="note">
    ${R.em ? `<a class="big" href="tel:${R.em}">${esc(R.em)}</a>` : vig('one_call', 'rose', 48)}
    <p style="margin:0"><strong>If you or someone else is in immediate danger,</strong> call ${esc(R.emText)}.
      If you are thinking about ending your life, ${esc(R.crisis)}.</p>
  </div>
  ${groups}
  <section class="card" style="margin-top:1rem" aria-labelledby="h-care">
    <h2 id="h-care" style="font-size:1.1rem">Getting treatment</h2>
    <p class="small">${esc(R.care)} ${rk === 'au' ? ev('', 'BETTERACCESS') : ''}</p>
    <p class="small" style="margin-bottom:0"><a href="#/learn/treatment">Which treatments work</a> ·
      <a href="#/tools/safety">My safety plan</a></p>
  </section>
  <section class="card" style="margin-top:1rem" aria-labelledby="h-supp">
    <h2 id="h-supp" style="font-size:1.1rem">If you are supporting someone</h2>
    <ul class="small" style="margin:.3rem 0 0;padding-left:1.2rem">
      <li>Listen without pushing for details. Let them decide how much to share.</li>
      <li>Learn about PTSD together: the reactions are understandable, and they can be treated.</li>
      <li>Encourage them to see a GP or a trauma-trained therapist, and offer practical help to get there.</li>
      <li>Avoid taking irritability or withdrawal personally, and agree what helps when they are overwhelmed.</li>
      <li>Look after yourself too. The services above also support family and friends.</li>
    </ul>
    <p class="tiny" style="margin:.5rem 0 0">Clinical consensus, consistent with the support after the event that protects
      against PTSD. ${ev('strong', 'PREDICT')}</p>
  </section>`;
}

// ================================================================= about ===
export function about() {
  return `
  <div class="hero"><div>
    <div class="eyebrow">About</div>
    <h1>About Then and Now</h1>
    <p class="lede">What this app is, what it is not, and how it keeps what you write private.</p></div>
    ${vig('then_now', 'navy', 110)}</div>
  <div class="grid g2">
    <section class="card"><h2 style="font-size:1.1rem">What it is</h2>
      <p class="small">A private guide in five stages, built on the parts of treatment with the best evidence: understanding how
        PTSD keeps going (from cognitive therapy for PTSD), examining the beliefs trauma left (from cognitive processing therapy),
        gradually approaching what is safe now (from exposure therapy), and steadying and rebuilding skills used alongside them.
        It follows the form of <em>The Journey</em>: for each stage, what went in, how it works, and a path of eight steps.</p></section>
    <section class="card"><h2 style="font-size:1.1rem">What it is not</h2>
      <p class="small">It is not therapy, diagnosis or treatment, and no one monitors it. It cannot help in a crisis: if you are in
        danger, use <a href="#/help">Get help</a>. Self-help apps have weaker evidence than therapy with a trained professional,
        so use it alongside care, not instead of it. ${ev('weak', 'PTSDCOACH')}</p></section>
    <section class="card"><h2 style="font-size:1.1rem">Your privacy</h2>
      <p class="small">Everything you write stays in this browser on this device. Nothing is sent anywhere: the app has no
        server, no account and no tracking. You can lock what you write with a passphrase, export a copy, and erase it all, in
        <a href="#/data">Your data</a>.</p></section>
    <section class="card"><h2 style="font-size:1.1rem">Content care</h2>
      <p class="small">Nothing in the app describes trauma in detail. The parts that ask you to approach memories are optional,
        marked, and best done with a therapist. You can stop at any point; your words are saved as you go.</p></section>
  </div>
  ${grades()}
  <section class="card" style="margin-top:1.2rem"><h2 style="font-size:1.1rem">Sources and credits</h2>
    <p class="small">Evidence reviewed to 17 November 2026. The PTSD Checklist for DSM-5 (PCL-5) was developed by the US National
      Center for PTSD and is in the public domain. Typefaces: Newsreader and Atkinson Hyperlegible, both under the SIL Open Font
      Licence. The medallion artwork follows The Journey series.</p>
    <p class="small" style="margin:0"><a href="#/learn/evidence">The evidence library</a></p></section>`;
}

export function bind(root, route) {
  on(root, 'click', '[data-region]', (e, b) => {
    store.setUI({ region: b.dataset.region });
    toast('Showing services for ' + REGIONS[b.dataset.region].n);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  D.bindDiagrams(root);
  // In-page section links for guide pages: ?s=N scrolls to that section.
  const s = new URLSearchParams(route.query || '').get('s');
  if (s != null) { const el = root.querySelector(`#sec-${s}`) || root.querySelector(`#${CSS.escape(s)}`); if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 30); }
  const focus = new URLSearchParams(route.query || '').get('ref');
  if (focus) { const el = root.querySelector(`#ref-${focus}`); if (el) setTimeout(() => el.scrollIntoView({ block: 'center' }), 30); }
}
