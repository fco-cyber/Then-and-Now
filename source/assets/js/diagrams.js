// Diagrams drawn to the subject, in SVG that takes its colours from the palette.
// Each comes in a wide layout and a narrow one for phones, so the text stays
// readable at every width. Each has a text description for screen readers and,
// where it is interactive, works with keyboard as well as touch and mouse.
import { esc, ev } from './ui.js';

/* Break text into lines of at most n characters, at word boundaries. */
function wrap(text, n) {
  const words = String(text).split(/\s+/); const lines = []; let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > n && cur) { lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}
function tspans(lines, x, y, lh, cls = 't-body', size = 12.5, anchor = 'start') {
  return `<text class="${cls}" x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}">${
    lines.map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`).join('')}</text>`;
}
const arrows = s => `<defs>
  <marker id="ah${s}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fill-sec"/></marker>
  <marker id="ahh${s}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fill-warn"/></marker>
  <marker id="aho${s}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="fill-ok"/></marker>
</defs>`;
const both = (w, n) => `<div class="dg-w">${w}</div><div class="dg-n">${n}</div>`;

// ===================================================== 1. the PTSD cycle ===
const CYCLE = {
  reminders: { t: 'Reminders', b: 'A smell, a sound, a date, a body feeling',
    e: 'Reminders are often small and sensory: a smell, a tone of voice, a time of year, a body feeling. They tend to resemble things that were present just before or during the event, which is why they can set off the memory before you know why.',
    g: 'mod', r: 'INTRUSIONS' },
  memory: { t: 'How the memory is stored', b: 'In vivid pieces of sight, sound, smell and body feeling, without a clear time and place.',
    e: 'Under extreme threat, memory is laid down differently: vivid sensory pieces, poorly linked to when and where they happened and to what you know now. When a reminder sets one off, it arrives with the feelings of then, as if it is happening now.',
    g: 'mod', r: 'EHLERS_MODEL BREWIN' },
  meanings: { t: 'What it seems to mean', b: '"I am not safe." "It was my fault." "I am going mad." "No one can be trusted."',
    e: 'The conclusions drawn from the event, and from your reactions since, keep a sense of danger going. Across 135 studies, these beliefs were strongly linked with PTSD, especially beliefs about the self.',
    g: 'mod', r: 'APPRAISALS' },
  threat: { t: 'A sense of current threat', b: 'The danger feels as if it is still here, now, or about to happen.', hot: true,
    e: 'The way the memory is stored and the meanings drawn from it combine into a sense that the danger is not over. This keeps the body on guard and the memory alive. It is the centre of the model that cognitive therapy for PTSD is built on.',
    g: 'mod', r: 'EHLERS_MODEL' },
  symptoms: { t: 'What you feel', b: 'Memories that feel like now, nightmares, being on guard, poor sleep, fear, shame, anger or numbness.',
    e: 'These are the reactions that make up PTSD: the event coming back, being constantly on guard, and changes in mood such as fear, shame, guilt, anger or feeling numb and cut off.',
    g: '', r: 'DSM5' },
  coping: { t: 'Ways of coping', b: 'Avoiding reminders, pushing memories away, checking, going over it, alcohol.',
    e: 'These make sense and bring relief in the short term. But they stop the memory being filed as past and stop the meanings from being tested, so the sense of threat stays. Alcohol misuse is common: between 10% and 61% of people with PTSD across studies.',
    g: 'mod', r: 'EHLERS_MODEL ALCOHOL' }
};
const CYCLE_TX = { reminders: 'Tell then from now', memory: 'Update the memory', meanings: 'Re-examine the meanings', coping: 'Drop what keeps it going' };
const CYCLE_LAYOUT = {
  w: { W: 760, H: 540, title: 15, body: 12.5, chars: 37, lh: 16,
    box: { reminders: [285, 4, 190, 64, 1], memory: [30, 92, 260, 112], meanings: [470, 92, 260, 112], threat: [250, 238, 260, 96],
      symptoms: [30, 372, 260, 112], coping: [470, 372, 260, 112] },
    paths: `<path class="arrow" d="M300,46 C190,52 170,64 160,88" marker-end="url(#ah_w)"/>
      <path class="arrow" d="M160,206 C170,232 210,262 246,276" marker-end="url(#ah_w)"/>
      <path class="arrow" d="M600,206 C590,232 550,262 514,276" marker-end="url(#ah_w)"/>
      <path class="arrow-hot" d="M330,336 C300,352 250,356 210,370" marker-end="url(#ahh_w)"/>
      <path class="arrow-hot" d="M430,336 C460,352 510,356 550,370" marker-end="url(#ahh_w)"/>
      <path class="arrow" d="M292,428 L466,428" marker-end="url(#ah_w)"/>
      <text class="t-muted" x="379" y="420" font-size="11" text-anchor="middle">to make it stop</text>
      <path class="arrow-hot dash" d="M732,438 C756,438 756,150 734,150" marker-end="url(#ahh_w)"/>
      <path class="arrow-hot dash" d="M600,486 C600,526 18,530 14,330 C12,200 16,160 26,150" marker-end="url(#ahh_w)"/>
      <text class="t-warn" x="740" y="300" font-size="11" text-anchor="middle" transform="rotate(90 740 300)">beliefs never get tested</text>
      <text class="t-warn" x="300" y="522" font-size="11" text-anchor="middle">so the memory is never filed as past</text>` },
  n: { W: 360, H: 600, title: 13, body: 11.5, chars: 22, lh: 15,
    box: { reminders: [80, 6, 200, 60, 1], memory: [12, 92, 156, 132], meanings: [192, 92, 156, 132], threat: [52, 262, 256, 80],
      symptoms: [12, 384, 156, 148], coping: [192, 384, 156, 148] },
    paths: `<path class="arrow" d="M112,66 C106,74 98,80 92,88" marker-end="url(#ah_n)"/>
      <path class="arrow" d="M90,226 C96,240 112,252 128,260" marker-end="url(#ah_n)"/>
      <path class="arrow" d="M270,226 C264,240 248,252 232,260" marker-end="url(#ah_n)"/>
      <path class="arrow-hot" d="M140,348 C126,358 112,368 100,380" marker-end="url(#ahh_n)"/>
      <path class="arrow-hot" d="M220,348 C234,358 248,368 260,380" marker-end="url(#ahh_n)"/>
      <path class="arrow" d="M170,470 L188,470" marker-end="url(#ah_n)"/>
      <path class="arrow-hot dash" d="M348,452 C358,452 358,158 350,158" marker-end="url(#ahh_n)"/>
      <path class="arrow-hot dash" d="M270,534 C270,560 6,566 6,360 C6,220 6,168 10,160" marker-end="url(#ahh_n)"/>
      <text class="t-warn" x="180" y="580" font-size="11" text-anchor="middle">so the memory and beliefs never get updated</text>` }
};
function cycleSVG(L) {
  const C = CYCLE_LAYOUT[L];
  const node = k => {
    const n = CYCLE[k], [x, y, w, hgt, small] = C.box[k];
    const ts = small ? C.title - 1.5 : C.title, bs = small ? C.body - 1 : C.body;
    const tl = wrap(n.b, Math.floor((w - 24) / (bs * 0.53)));
    const tt = wrap(n.t, Math.floor((w - 24) / (ts * 0.57)));
    const ty = y + (small ? 21 : 24);
    return `<g data-node="${k}" tabindex="0" role="button" aria-label="${esc(n.t)}: ${esc(n.b)}">
      <rect class="${n.hot ? 'box-hot' : 'box'}" x="${x}" y="${y}" width="${w}" height="${hgt}" rx="12"/>
      ${tspans(tt, x + 12, ty, C.lh + 1, n.hot ? 't-warn' : 't-strong', ts)}
      ${tspans(tl, x + 12, ty + (tt.length - 1) * (C.lh + 1) + (small ? 17 : 21), C.lh, 't-body', bs)}
    </g>`;
  };
  const tx = Object.entries(CYCLE_TX).map(([k, label]) => {
    const [x, y, w, hgt, small] = C.box[k];
    const pw = Math.min(w - 12, label.length * 6.4 + 30);
    const py = small ? y + hgt + 4 : y + hgt - 13;
    return `<g class="tx-layer" aria-hidden="true">
      <rect class="box-ok" x="${x + w / 2 - pw / 2}" y="${py}" width="${pw}" height="24" rx="12"/>
      <text class="t-ok" x="${x + w / 2}" y="${py + 16}" font-size="11.5" text-anchor="middle">✓ ${esc(label)}</text></g>`;
  }).join('');
  return `<svg class="dg" viewBox="0 0 ${C.W} ${C.H}" role="group" aria-labelledby="cyc-t-${L} cyc-d-${L}">
    <title id="cyc-t-${L}">Why PTSD keeps going</title>
    <desc id="cyc-d-${L}">A cycle diagram. Reminders set off a memory stored in vivid pieces without a clear time and place. Together with
      the meanings drawn from the event, this creates a sense of current threat, which leads to the feelings of PTSD and to ways
      of coping such as avoidance. Those ways of coping loop back and stop the memory and the meanings from being updated.</desc>
    ${arrows('_' + L)}${C.paths}
    ${Object.keys(CYCLE).map(node).join('')}${tx}</svg>`;
}
export function cycle() {
  return `<figure class="fig" data-fig="cycle">
    ${both(cycleSVG('w'), cycleSVG('n'))}
    <div class="row" style="margin-top:.6rem">
      <button type="button" class="btn ghost sm" data-tx aria-pressed="false">Show where treatment breaks the cycle</button>
      <span class="tiny">Tap any box to read more.</span>
    </div>
    <div class="explain card" aria-live="polite" style="margin-top:.6rem">
      <p class="small" style="margin:0">Based on the cognitive model of PTSD by Ehlers and Clark. ${ev('mod', 'EHLERS_MODEL')}</p>
    </div>
  </figure>`;
}

// ================================================= 2. two kinds of memory ===
const ICON = {
  image: `<path d="M-15,-6 Q0,-17 15,-6 Q0,5 -15,-6 z" class="ln stroke-head" fill="none" stroke-width="1.6"/><circle cx="0" cy="-6" r="4" class="fill-head"/>`,
  sound: `<path d="M-5,-15 C6,-17 11,-9 8,-3 C6,1 2,2 2,6 C2,9 -2,10 -4,7" class="ln stroke-head" fill="none" stroke-width="1.8"/><path d="M14,-12 Q19,-6 14,0 M18,-15 Q25,-6 18,3" class="ln stroke-muted" fill="none" stroke-width="1.4"/>`,
  smell: `<path d="M-10,0 C-14,-5 -6,-9 -10,-14 M0,0 C-4,-5 4,-9 0,-14 M10,0 C6,-5 14,-9 10,-14" class="ln stroke-head" fill="none" stroke-width="1.7"/>`,
  body: `<path d="M0,2 C-14,-7 -10,-17 -3,-15 C-1,-14 0,-12 0,-11 C0,-12 1,-14 3,-15 C10,-17 14,-7 0,2 z" class="fill-warn"/>`
};
const FRAG_LABEL = { image: 'an image', sound: 'a sound', smell: 'a smell', body: 'a racing heart' };
function folder(x, y, w, hh) {
  return `M${x + 8},${y + 16} h${w * 0.32} l12,-16 h${w * 0.55 - 12} a8,8 0 0 1 8,8 v${hh - 8} a8,8 0 0 1 -8,8 h-${w - 8} a8,8 0 0 1 -8,-8 v-${hh - 16} a8,8 0 0 1 8,-8 z`;
}
function memorySVG(L) {
  const wide = L === 'w';
  const A = wide ? { x: 30, y: 48, w: 320, h: 270 } : { x: 10, y: 40, w: 340, h: 276 };
  const B = wide ? { x: 400, y: 48, w: 330, h: 270 } : { x: 10, y: 370, w: 340, h: 270 };
  const W = wide ? 760 : 360, H = wide ? 380 : 726;
  const fA = { x: A.x + 48, y: A.y + 66, w: 210, h: 158 };
  const fB = { x: B.x + 52, y: B.y + 66, w: 218, h: 174 };
  const fr = wide
    ? { image: [470, 100, -8], sound: [650, 92, 7], smell: [520, 214, 5], body: [668, 218, -6] }
    : { image: [70, 426, -8], sound: [280, 422, 7], smell: [120, 542, 5], body: [272, 546, -6] };
  const after = { image: [fB.x + 58, fB.y + 92], sound: [fB.x + 160, fB.y + 92], smell: [fB.x + 58, fB.y + 142], body: [fB.x + 160, fB.y + 142] };
  const frags = Object.keys(fr).map(k => `<g class="frag" data-frag="${k}" style="--x:${fr[k][0]}px;--y:${fr[k][1]}px;--r:${fr[k][2]}deg;--ax:${after[k][0]}px;--ay:${after[k][1]}px">
      <rect class="box" x="-46" y="-26" width="92" height="52" rx="9"/>${ICON[k]}
      <text class="t-body" x="0" y="17" font-size="11" text-anchor="middle">${FRAG_LABEL[k]}</text></g>`).join('');
  const rem = wide ? { x: 402, y: 346 } : { x: 14, y: 688 };
  const pill = wide ? { x: 590, y: 322 } : { x: 210, y: 666 };
  const sm = { x: fr.smell[0], y: fr.smell[1] };
  return `<svg class="dg mem" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="mem-t-${L} mem-d-${L}">
    <title id="mem-t-${L}">Two kinds of memory</title>
    <desc id="mem-d-${L}">An ordinary memory is filed in a folder labelled with when and where it happened and that it is over.
      A trauma memory before it has been processed is shown as loose pieces (an image, a sound, a smell, a pounding heart)
      with no date. A reminder sets off one piece and it feels like now. After processing, the pieces are filed in a folder
      labelled: it happened then, it is over, I survived; and the same reminder brings back a memory of then.</desc>
    ${arrows('_m' + L)}
    <text class="t-strong" x="${A.x}" y="${A.y - 16}" font-size="15">An ordinary memory</text>
    <rect class="box-tint" x="${A.x}" y="${A.y}" width="${A.w}" height="${A.h}" rx="14"/>
    <path class="box" d="${folder(fA.x, fA.y, fA.w, fA.h)}"/>
    ${tspans(['A day at the beach'], fA.x + 16, fA.y + 44, 16, 't-strong', 14)}
    ${tspans(['When: summer, 2019', 'Where: Torquay', 'Over: yes'], fA.x + 16, fA.y + 72, 19, 't-body', 12.5)}
    <g transform="rotate(-8 ${fA.x + 180} ${fA.y + 140})"><rect x="${fA.x + 136}" y="${fA.y + 122}" width="84" height="30" rx="5" fill="none" class="ln stroke-sec" stroke-width="2"/>
      <text class="t-strong" x="${fA.x + 178}" y="${fA.y + 142}" font-size="13" text-anchor="middle" style="fill:var(--sec)">PAST</text></g>
    ${tspans(['Filed with its time and place.', 'Remembering it feels like remembering.'], A.x + 16, A.y + A.h - 22, 15, 't-muted', 12)}
    <text class="t-strong" x="${B.x}" y="${B.y - 16}" font-size="15" data-mem-title>A trauma memory, not yet processed</text>
    <rect class="box-tint" x="${B.x}" y="${B.y}" width="${B.w}" height="${B.h}" rx="14"/>
    <path class="box folder-after" d="${folder(fB.x, fB.y, fB.w, fB.h)}"/>
    <g class="folder-after">${tspans(['What happened, then.', 'It is over. I survived.'], fB.x + 14, fB.y + 38, 16, 't-strong', 12.5)}</g>
    ${frags}
    <g><path class="fill-acc" d="M${rem.x},${rem.y} l14,-26 h-8 l10,-22 h14 l-10,18 h9 z"/>
      <text class="t-strong" x="${rem.x + 34}" y="${rem.y - 4}" font-size="12.5">A reminder: smoke</text>
      <path class="arrow-hot mem-arrow" d="M${rem.x + 60},${rem.y - 20} C${rem.x + 84},${rem.y - 46} ${sm.x - 20},${sm.y + 60} ${sm.x - 10},${sm.y + 28}" marker-end="url(#ahh_m${L})"/></g>
    <g class="mem-now"><rect class="box-hot" x="${pill.x}" y="${pill.y}" width="140" height="34" rx="17"/>
      <text class="t-warn" x="${pill.x + 70}" y="${pill.y + 22}" font-size="13" text-anchor="middle">Feels like now</text></g>
    <g class="mem-then"><rect class="box-ok" x="${pill.x}" y="${pill.y}" width="140" height="34" rx="17"/>
      <text class="t-ok" x="${pill.x + 70}" y="${pill.y + 22}" font-size="13" text-anchor="middle">A memory of then</text></g>
    <path class="arrow-hot mem-now" d="M${sm.x + 40},${sm.y + 18} C${sm.x + 80},${sm.y + 48} ${pill.x + 40},${pill.y - 30} ${pill.x + 60},${pill.y - 4}" marker-end="url(#ahh_m${L})"/>
    <path class="arrow-ok mem-then" d="M${after.smell[0] + 30},${after.smell[1] + 24} C${after.smell[0] + 70},${after.smell[1] + 40} ${pill.x + 40},${pill.y - 24} ${pill.x + 60},${pill.y - 4}" marker-end="url(#aho_m${L})"/>
  </svg>`;
}
export function memory() {
  return `<figure class="fig" data-fig="memory">
    ${both(memorySVG('w'), memorySVG('n'))}
    <div class="row" style="margin-top:.6rem">
      <button type="button" class="btn ghost sm" data-mem aria-pressed="false">Show the memory after processing</button>
    </div>
    <figcaption>A picture of an idea, not of the brain. Researchers describe trauma memories as vivid pieces poorly linked to their
      time and place; trauma-focused therapy helps link them to that context and to what you know now. ${ev('mod', 'INTRUSIONS BREWIN')}</figcaption>
  </figure>`;
}

// ============================================== 3. approaching vs leaving ===
// Illustrative curves, not measured data: a common pattern described in exposure therapy.
function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
function alarmSVG(L, which) {
  const wide = L === 'w';
  const W = wide ? 700 : 360, H = wide ? 300 : 280, fs = wide ? 12 : 11.5;
  const X0 = wide ? 60 : 44, X1 = wide ? 560 : 268, Y0 = H - 50, Y1 = 30;
  const px = m => X0 + (m / 40) * (X1 - X0), py = v => Y0 - (v / 10) * (Y0 - Y1);
  const P = arr => arr.map(([m, v]) => [px(m), py(v)]);
  const grid = [0, 5, 10].map(v => `<line class="grid" x1="${X0}" x2="${X1}" y1="${py(v)}" y2="${py(v)}"/>
      <text class="t-muted" x="${X0 - 8}" y="${py(v) + 4}" font-size="11" text-anchor="end">${v}</text>`).join('');
  const xt = (wide ? [0, 10, 20, 30, 40] : [0, 20, 40]).map(m => `<text class="t-muted" x="${px(m)}" y="${Y0 + 17}" font-size="11" text-anchor="middle">${m}</text>`).join('');
  const axes = `${grid}${xt}
    <text class="t-muted" x="${(X0 + X1) / 2}" y="${Y0 + 36}" font-size="11.5" text-anchor="middle">minutes</text>
    <text class="t-muted" x="12" y="${(Y0 + Y1) / 2}" font-size="11.5" text-anchor="middle" transform="rotate(-90 12 ${(Y0 + Y1) / 2})">distress, 0 to 10</text>`;
  const leave = P([[0, 3], [3, 5.2], [6, 7.6], [7.2, 3.6], [10, 2.6], [14, 2.4]]);
  const stay = P([[0, 3], [3, 5.6], [6, 7.6], [12, 6.6], [20, 5], [30, 3.7], [40, 3]]);
  const p2 = P([[0, 2.8], [3, 4.9], [6, 6.2], [12, 5.1], [20, 3.9], [30, 3], [40, 2.6]]);
  const p5 = P([[0, 2.2], [3, 3.4], [6, 4.1], [12, 3.4], [20, 2.7], [30, 2.3], [40, 2.1]]);
  const dot = (p, cls) => `<circle class="${cls}" cx="${p[0]}" cy="${p[1]}" r="4.5" stroke="var(--card)" stroke-width="2"/>`;
  const lab = (p, txt) => `<text class="t-body" x="${p[0] + 9}" y="${p[1] + 4}" font-size="${fs}">${esc(txt)}</text>`;
  if (which === 'a') return `<svg class="dg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="al-t-${L} al-d-${L}">
    <title id="al-t-${L}">What happens to distress when you leave or stay</title>
    <desc id="al-d-${L}">An illustration, not measured data. Distress rises when facing a safe reminder and peaks at about 7 out of 10.
      Leaving at the peak brings quick relief, so the alarm learns nothing new. Staying, distress peaks and then slowly eases to about 3 by 40 minutes.</desc>
    ${axes}<path class="ln-leave" d="${smooth(leave)}"/><path class="ln-stay" d="${smooth(stay)}"/>
    ${dot(leave.at(-1), 'mk-leave')}${lab(leave.at(-1), wide ? 'Leaving at the peak' : 'Leaving')}
    ${dot(stay.at(-1), 'mk-stay')}${lab(stay.at(-1), 'Staying')}
    <text class="t-muted" x="${px(7.5)}" y="${py(9.1)}" font-size="11">${wide ? 'relief, but nothing new is learned' : 'relief, nothing new learned'}</text></svg>`;
  return `<svg class="dg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="al2-t-${L} al2-d-${L}">
    <title id="al2-t-${L}">Distress across repeated practice</title>
    <desc id="al2-d-${L}">An illustration, not measured data. The first time someone stays with a safe reminder, distress peaks at about
      7.6 out of 10. The second time it peaks lower, about 6. By the fifth time it peaks at about 4 and settles sooner.</desc>
    ${axes}<path class="ln-p1" d="${smooth(stay)}"/><path class="ln-p2" d="${smooth(p2)}"/><path class="ln-p5" d="${smooth(p5)}"/>
    ${dot(stay.at(-1), 'mk-p1')}${dot(p2.at(-1), 'mk-p2')}${dot(p5.at(-1), 'mk-p5')}
    <text class="t-body" x="${px(7.5)}" y="${py(8.15)}" font-size="${fs}">First time</text>
    <text class="t-body" x="${px(7.5)}" y="${py(6.7)}" font-size="${fs}">Second time</text>
    <text class="t-body" x="${px(7.5)}" y="${py(4.6)}" font-size="${fs}">Fifth time</text></svg>`;
}
export function alarm() {
  return `<figure class="fig" data-fig="alarm">
    <div class="tabs" role="group" aria-label="Show">
      <button type="button" class="chip" data-alarm="a" aria-pressed="true">Leaving or staying</button>
      <button type="button" class="chip" data-alarm="b" aria-pressed="false">With practice</button>
    </div>
    <div class="alarm-a">${both(alarmSVG('w', 'a'), alarmSVG('n', 'a'))}
      <div class="legend" aria-hidden="true"><span><i class="lk lk-leave"></i>Leaving at the peak</span><span><i class="lk lk-stay"></i>Staying</span></div></div>
    <div class="alarm-b" hidden>${both(alarmSVG('w', 'b'), alarmSVG('n', 'b'))}
      <div class="legend" aria-hidden="true"><span><i class="lk lk-p1"></i>First time</span><span><i class="lk lk-p2"></i>Second time</span><span><i class="lk lk-p5"></i>Fifth time</span></div></div>
    <figcaption>An illustration of a common pattern, not measured data. Distress usually rises, peaks and then eases if you stay
      with a reminder that is safe now, and with repeated practice the peak tends to come down. What matters most is learning
      that what you fear does not happen, not reaching a particular number. Approaching feared but safe memories and situations
      is part of the best-tested treatments. ${ev('strong', 'PE CUSACK')}</figcaption>
  </figure>`;
}

// ============================================= 4. the brain under threat ===
const BRAIN = {
  pfc: { n: 1, t: 'Prefrontal cortex', s: 'The brakes and the context',
    e: 'The front of the brain helps judge whether a threat is real, and helps calm the alarm once you know you are safe. In a brain-imaging study of 31 trauma-exposed people, those with PTSD had more trouble recalling that a cue had become safe, with less activity in part of this area. A small study: treat it as a clue, not a fact.',
    g: 'weak', r: 'EXTINCTION' },
  amy: { n: 2, t: 'Amygdala', s: 'The alarm',
    e: 'Two almond-shaped clusters, one deep in each temporal lobe. They pick up signs of danger fast, before you have time to think, and set off the body\'s alarm. In laboratory studies, people with anxiety disorders, including PTSD, react more strongly to safety signals and unlearn fear more slowly.',
    g: 'mod', r: 'FEARCOND' },
  hip: { n: 3, t: 'Hippocampus', s: 'When and where',
    e: 'A curved structure next to the amygdala that helps file memories with their time and place, and recognise that a place or cue is safe now. Pooled scans of 1,868 people found a slightly smaller hippocampus on average in PTSD; the difference was small, and a twin study suggests it can be there before the trauma, as a risk factor.',
    g: 'mod', r: 'HIPPO TWINS' },
  body: { n: 4, t: 'The body\'s alarm', s: 'Heart, breath, muscles',
    e: 'Through the hypothalamus and brainstem, the alarm speeds the heart and breathing, tenses muscles and sharpens attention. Useful in real danger; exhausting when it fires at reminders.',
    g: '', r: '' }
};
const CTX = 'M22,150 C18,104 44,58 92,34 C140,10 204,2 262,6 C326,10 382,30 422,70 C452,100 466,138 462,172 C458,196 444,208 422,212 C404,215 386,214 370,216 C344,222 318,236 290,244 C258,252 226,252 202,242 C186,236 176,226 172,214 C164,204 150,198 132,196 C104,194 72,192 48,180 C32,172 24,162 22,150 Z';
function brainBody(L) {
  const hot = (k, inner) => `<g data-node="${k}" tabindex="0" role="button" aria-label="${esc(BRAIN[k].t)}: ${esc(BRAIN[k].s)}">${inner}</g>`;
  return `<defs><clipPath id="br-clip-${L}"><path d="${CTX}"/></clipPath></defs>
    <path class="brain-cbl" d="M338,214 C360,206 400,204 428,210 C452,216 462,236 454,256 C444,280 404,290 372,282 C346,276 330,260 330,242 C330,228 332,220 338,214 Z"/>
    <path class="brain-sulc" d="M344,232 C376,224 414,226 446,236 M338,250 C370,244 410,248 444,258 M350,268 C380,266 408,270 432,276"/>
    <path class="brain-stem" d="M262,246 C286,240 310,234 330,232 C334,262 338,300 346,340 L312,340 C304,306 286,276 262,246 Z"/>
    <path class="brain-ctx" d="${CTX}"/>
    <g clip-path="url(#br-clip-${L})">
      ${hot('pfc', `<path class="zone-pfc" d="M-10,-10 L176,-10 C160,40 146,96 146,140 C146,166 152,186 162,204 L-10,214 Z"/>`)}
      <path class="brain-sulc" d="M172,214 C204,200 238,182 270,168 C292,158 314,146 334,128"/>
      <path class="brain-sulc" d="M274,6 C266,44 252,86 238,124 C232,140 228,152 226,162"/>
      <path class="brain-sulc" d="M196,232 C232,222 270,210 306,198 C334,188 360,178 388,164"/>
      <path class="brain-sulc" d="M98,40 C116,66 112,98 92,118 M58,96 C88,108 118,112 140,104 M168,22 C176,56 178,94 172,134
        M306,16 C300,48 304,82 324,104 M362,40 C354,72 368,100 402,114 M420,82 C414,106 424,132 452,142 M204,30 C214,64 214,100 204,134"/>
    </g>
    ${hot('hip', `<path class="zone-hip" d="M214,226 C236,214 266,212 292,214 C314,216 330,206 338,190 C343,180 342,168 334,164 C330,170 330,180 324,190 C316,202 300,206 290,206 C264,204 238,206 216,216 Z"/>`)}
    ${hot('amy', `<ellipse class="zone-amy" cx="204" cy="222" rx="14" ry="9.5" transform="rotate(-14 204 222)"/>`)}
    ${hot('body', `<path class="zone-body" d="M296,244 C312,240 322,236 330,234 C334,264 338,300 346,340 L312,340 C306,310 300,276 296,244 Z"/>`)}`;
}
const DESC_BRAIN = `A side view of the left half of the brain, facing left. The prefrontal cortex is at the front. Deep inside the temporal
  lobe, drawn as if seen through the surface, are the almond-shaped amygdala (the alarm) and, just behind it, the curved
  hippocampus (which files memories with their time and place). Below, the brainstem connects to the body's alarm: heart, breathing and muscles.`;
function brainW() {
  const label = (k, x, y, lx, ly, anchor) => `
    <line class="ln stroke-muted" x1="${x}" y1="${y}" x2="${lx}" y2="${ly}" stroke-width="1"/>
    <circle cx="${x}" cy="${y}" r="2.5" class="fill-head"/>
    <text class="t-strong" x="${lx + (anchor === 'end' ? -6 : 6)}" y="${ly - 2}" font-size="13.5" text-anchor="${anchor}">${esc(BRAIN[k].t)}</text>
    <text class="t-muted" x="${lx + (anchor === 'end' ? -6 : 6)}" y="${ly + 14}" font-size="11.5" text-anchor="${anchor}">${esc(BRAIN[k].s)}</text>`;
  return `<svg class="dg brain" viewBox="0 0 760 400" role="group" aria-labelledby="br-t-w br-d-w">
    <title id="br-t-w">The brain's alarm system, seen from the left side</title><desc id="br-d-w">${DESC_BRAIN}</desc>
    ${arrows('_bw')}
    <g transform="translate(176,40)">${brainBody('w')}</g>
    ${label('pfc', 236, 136, 186, 96, 'end')}
    ${label('amy', 380, 262, 262, 352, 'end')}
    ${label('hip', 490, 240, 652, 300, 'start')}
    ${label('body', 506, 352, 590, 372, 'start')}
    <path class="arrow-hot" d="M396,270 C430,300 470,330 494,350" marker-end="url(#ahh_bw)"/></svg>`;
}
function brainN() {
  const num = (k, x, y) => `<g aria-hidden="true"><circle cx="${x}" cy="${y}" r="11" class="fill-head"/>
    <text x="${x}" y="${y + 4.5}" font-size="12.5" text-anchor="middle" style="fill:var(--card);font-weight:700">${BRAIN[k].n}</text></g>`;
  return `<svg class="dg brain" viewBox="10 0 470 350" role="group" aria-labelledby="br-t-n br-d-n">
    <title id="br-t-n">The brain's alarm system, seen from the left side</title><desc id="br-d-n">${DESC_BRAIN}</desc>
    ${arrows('_bn')}
    ${brainBody('n')}
    <path class="arrow-hot" d="M212,236 C240,262 270,280 296,292" marker-end="url(#ahh_bn)"/>
    ${num('pfc', 86, 120)}${num('amy', 186, 252)}${num('hip', 352, 186)}${num('body', 362, 318)}</svg>
    <ol class="br-legend">${Object.entries(BRAIN).map(([k, b]) => `<li><button type="button" class="chip" data-node="${k}"><b>${b.n}</b> ${esc(b.t)}: ${esc(b.s.toLowerCase())}</button></li>`).join('')}</ol>`;
}
export function brain() {
  return `<figure class="fig" data-fig="brain">
    ${both(brainW(), brainN())}
    <p class="tiny" style="margin:.3rem 0 0">Tap a labelled part to read more.</p>
    <div class="explain card" aria-live="polite" style="margin-top:.6rem">
      <p class="small" style="margin:0">A simplified picture. The differences found in PTSD are averages across groups of people:
        they are not damage, and they cannot be used to diagnose anyone.</p>
    </div>
  </figure>`;
}

// ============================================== 5. the window of tolerance ===
const WAVE = [[30,170],[70,150],[90,130],[120,140],[150,150],[160,120],[190,108],[208,100],[220,60],[240,46],[256,36],[268,58],[278,84],[290,116],[310,132],[340,140],[370,148],[380,170],[400,186],[416,198],[424,234],[440,250],[454,262],[470,252],[480,226],[490,200],[510,176],[540,160],[570,146],[600,150],[640,150],[660,150],[676,146],[690,144]];
function windowSVG(L) {
  const wide = L === 'w';
  const W = wide ? 700 : 360, H = wide ? 300 : 430;
  const b = wide ? [16, 92, 208, 284] : [12, 128, 290, 418];
  const X = x => wide ? (330 + (x - 30) * 0.53) : (142 + (x - 30) * (206 / 660));
  const lab0 = 0;
  const band = (y, y0, y1, t, u) => t + lab0 + (y - y0) / (y1 - y0) * (u - t - lab0 - 6);
  const Y = y => y < 92 ? band(y, 16, 92, b[0], b[1]) : y < 208 ? band(y, 92, 208, b[1], b[2]) : band(y, 208, 284, b[2], b[3]);
  const pts = WAVE.map(([x, y]) => [X(x), wide ? (y < 92 ? b[0] + (y - 16) / 76 * (b[1] - b[0]) : y < 208 ? b[1] + (y - 92) / 116 * (b[2] - b[1]) : b[2] + (y - 208) / 76 * (b[3] - b[2])) : Y(y)]);
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 3) {
    const a = pts[i], c = pts[i + 1] || pts[i], e = pts[i + 2] || c;
    d += ` C${a[0].toFixed(1)},${a[1].toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)} ${e[0].toFixed(1)},${e[1].toFixed(1)}`;
  }
  const pk = pts[9], lo = pts[21];
  const lab = (x, y, t1, t2, cls, style = '') => `<text class="${cls}" x="${x}" y="${y}" font-size="13.5"${style}>${t1}</text>
    ${t2.map((t, i) => `<text class="t-muted" x="${x}" y="${y + 18 + i * 15}" font-size="11.5">${t}</text>`).join('')}`;
  return `<svg class="dg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="wt-t-${L} wt-d-${L}">
    <title id="wt-t-${L}">The window of tolerance</title>
    <desc id="wt-d-${L}">Three bands. Above: too much, with panic, rage and a racing heart. In the middle, the window: able to think and
      feel at the same time. Below: too little, numb, foggy and far away. A line showing how stirred up someone is rises above the
      window after a reminder, is brought back by slow breathing and grounding, then drops below into numbness and is brought
      back by moving and grounding.</desc>
    ${arrows('_t' + L)}
    <rect x="10" y="${b[0]}" width="${W - 20}" height="${b[1] - b[0]}" rx="10" class="fill-warn" opacity=".1"/>
    <rect x="10" y="${b[1]}" width="${W - 20}" height="${b[2] - b[1]}" class="fill-ok" opacity=".12"/>
    <rect x="10" y="${b[2]}" width="${W - 20}" height="${b[3] - b[2]}" rx="10" class="fill-sec" opacity=".1"/>
    ${lab(24, b[0] + 26, 'Too much', wide ? ['panic, rage, racing, flooded'] : ['panic, rage,', 'racing, flooded'], 't-warn')}
    ${lab(24, b[1] + 26, 'Your window', wide ? ['able to think and feel', 'at the same time'] : ['able to think', 'and feel at once'], 't-ok')}
    ${lab(24, b[2] + 26, 'Too little', wide ? ['numb, foggy, far away, shut down'] : ['numb, foggy,', 'far away'], 't-strong', ' style="fill:var(--sec)"')}
    <path d="${d}" fill="none" class="stroke-head" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pk[0].toFixed(1)}" cy="${pk[1].toFixed(1)}" r="5" class="fill-warn" stroke="var(--card)" stroke-width="2"/>
    <text class="t-body" x="${(pk[0] - 9).toFixed(1)}" y="${(pk[1] + 4).toFixed(1)}" font-size="11.5" text-anchor="end">a reminder</text>
    <path class="arrow-ok" d="M${(pk[0] + 12).toFixed(1)},${(pk[1] - 4).toFixed(1)} C${(pk[0] + 40).toFixed(1)},${(pk[1] + 4).toFixed(1)} ${(pk[0] + 46).toFixed(1)},${(pk[1] + 34).toFixed(1)} ${(pk[0] + 44).toFixed(1)},${(pk[1] + 58).toFixed(1)}" marker-end="url(#aho_t${L})"/>
    <text class="t-ok" x="${(pk[0] + 22).toFixed(1)}" y="${(pk[1] - 10).toFixed(1)}" font-size="11.5">${wide ? 'slow breathing, grounding' : 'breathe, ground'}</text>
    <circle cx="${lo[0].toFixed(1)}" cy="${lo[1].toFixed(1)}" r="5" class="fill-sec" stroke="var(--card)" stroke-width="2"/>
    <path class="arrow-ok" d="M${(lo[0] + 30).toFixed(1)},${(lo[1] + 4).toFixed(1)} C${(lo[0] + 50).toFixed(1)},${(lo[1] - 14).toFixed(1)} ${(lo[0] + 58).toFixed(1)},${(lo[1] - 40).toFixed(1)} ${(lo[0] + 60).toFixed(1)},${(lo[1] - 64).toFixed(1)}" marker-end="url(#aho_t${L})"/>
    <text class="t-ok" x="${(lo[0] + 4).toFixed(1)}" y="${(lo[1] + 26).toFixed(1)}" font-size="11.5" text-anchor="end">${wide ? 'moving, grounding, a voice' : 'move, ground'}</text>
  </svg>`;
}
export function windowTol() {
  return `<figure class="fig" data-fig="window">
    ${both(windowSVG('w'), windowSVG('n'))}
    <figcaption>A widely used clinical idea rather than a tested model, but many people find it a helpful way to notice when they
      need to steady themselves. ${ev('weak', '')}</figcaption>
  </figure>`;
}

// ============================================== 6. PTSD and complex PTSD ===
function cptsdSVG(L) {
  const wide = L === 'w';
  const pill = (x, y, w, txt, cls) => `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="30" rx="15"/>
    <text class="t-body" x="${x + w / 2}" y="${y + 20}" font-size="12.5" text-anchor="middle">${esc(txt)}</text>`;
  const core = ['Reliving it as if it is happening now', 'Avoiding reminders', 'A sense of current threat'];
  const extra = ['Hard-to-manage emotions', 'Feeling worthless or ashamed', 'Hard to feel close'];
  const W = wide ? 700 : 360, H = wide ? 330 : 430;
  const inner = wide ? { x: 170, y: 62, w: 360, h: 170 } : { x: 30, y: 62, w: 300, h: 170 };
  return `<svg class="dg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="cp-t-${L} cp-d-${L}">
    <title id="cp-t-${L}">PTSD and complex PTSD</title>
    <desc id="cp-d-${L}">Complex PTSD, as defined by the World Health Organization's ICD-11, includes the three core parts of PTSD
      (reliving, avoiding, a sense of current threat) plus three more: strong emotions that are hard to manage, a deep sense of
      being worthless or ashamed, and difficulty feeling close to people.</desc>
    <rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="22" class="box-tint"/>
    <text class="t-strong" x="30" y="42" font-size="15">Complex PTSD</text>
    <rect x="${inner.x}" y="${inner.y}" width="${inner.w}" height="${inner.h}" rx="18" class="box"/>
    <text class="t-strong" x="${inner.x + inner.w / 2}" y="${inner.y + 28}" font-size="14.5" text-anchor="middle">PTSD</text>
    ${core.map((c, i) => pill(inner.x + 18, inner.y + 42 + i * 38, inner.w - 36, c, 'box-tint')).join('')}
    <text class="t-muted" x="30" y="${inner.y + inner.h + 24}" font-size="12">plus three more:</text>
    ${wide ? extra.map((c, i) => pill(30 + i * 216, inner.y + inner.h + 32, 204, c, 'box')).join('')
      : extra.map((c, i) => pill(30, inner.y + inner.h + 32 + i * 38, 300, c, 'box')).join('')}
  </svg>`;
}
export function cptsd() {
  return `<figure class="fig" data-fig="cptsd">
    ${both(cptsdSVG('w'), cptsdSVG('n'))}
    <figcaption>Complex PTSD is most common after prolonged or repeated trauma that is hard to escape, such as childhood abuse
      or domestic violence. ${ev('mod', 'ICD11 CPTSD_US')}</figcaption>
  </figure>`;
}

// ------------------------------------------------------------ wiring -----
function explainer(fig, DATA, title) {
  const box = fig.querySelector('.explain');
  const show = k => {
    const n = DATA[k];
    fig.querySelectorAll('[data-node]').forEach(g => g.classList.toggle('sel', g.dataset.node === k));
    box.innerHTML = `<h3 style="font-size:1rem">${esc(title(n))}</h3><p class="small" style="margin:.2rem 0 0">${esc(n.e)} ${n.g || n.r ? ev(n.g, n.r) : ''}</p>`;
  };
  fig.addEventListener('click', e => { const g = e.target.closest('[data-node]'); if (g) show(g.dataset.node); });
  fig.addEventListener('keydown', e => {
    const g = e.target.closest('g[data-node]');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(g.dataset.node); }
  });
  return box;
}
export function bindDiagrams(root) {
  root.querySelectorAll('[data-fig="cycle"]').forEach(fig => {
    const box = explainer(fig, CYCLE, n => n.t);
    const b = fig.querySelector('[data-tx]');
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on);
      fig.querySelectorAll('svg').forEach(s => s.classList.toggle('show-tx', on));
      b.textContent = on ? 'Hide treatment' : 'Show where treatment breaks the cycle';
      if (on) box.innerHTML = `<h3 style="font-size:1rem">Where treatment breaks the cycle</h3><p class="small" style="margin:.2rem 0 0">
        Trauma-focused therapies work at these points: updating the memory with what you know now, re-examining the meanings,
        dropping the ways of coping that keep it going, and learning to tell reminders of then from the reality of now.
        ${ev('strong', 'CTPTSD LEWIS2020')}</p>`;
    });
  });
  root.querySelectorAll('[data-fig="memory"]').forEach(fig => {
    const b = fig.querySelector('[data-mem]');
    b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on);
      fig.querySelectorAll('svg').forEach(s => s.classList.toggle('after', on));
      fig.querySelectorAll('[data-mem-title]').forEach(t => { t.textContent = on ? 'The same memory, after processing' : 'A trauma memory, not yet processed'; });
      b.textContent = on ? 'Show the memory before processing' : 'Show the memory after processing';
    });
  });
  root.querySelectorAll('[data-fig="alarm"]').forEach(fig => {
    fig.addEventListener('click', e => {
      const b = e.target.closest('[data-alarm]'); if (!b) return;
      fig.querySelectorAll('[data-alarm]').forEach(x => x.setAttribute('aria-pressed', x === b));
      fig.querySelector('.alarm-a').hidden = b.dataset.alarm !== 'a';
      fig.querySelector('.alarm-b').hidden = b.dataset.alarm !== 'b';
    });
  });
  root.querySelectorAll('[data-fig="brain"]').forEach(fig => explainer(fig, BRAIN, n => `${n.t}: ${n.s.toLowerCase()}`));
}
