// Local-only persistence. Nothing in this file talks to a network.
// Everything written in Then and Now lives in this browser, on this device.
// Adapted from The Journey's store: same encryption, new record types for
// PTSD work (check-ins, symptom checks, safety plan, approach ladder,
// responsibility pies, nightmare rescripting and opt-in memory work).

const KEY = 'thenandnow.v1';
const UIKEY = 'thenandnow.ui';     // display settings, never encrypted
const SCHEMA = 1;

const blank = () => ({
  v: SCHEMA,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  settings: { name: '', started: null, lastStage: 1 },
  steps: {},       // stepId -> { entries:{i:text}, status, updatedAt, history:[] }
  items: {},       // panel item id -> { text, updatedAt }
  journal: [],     // { id, at, text, mood, tags[], stage, step }
  records: [],     // then-and-now records
  map: { reminders: [], intrusions: [], meanings: [], body: [], behaviours: [],
         helps: [], links: [] },
  practices: {},   // 'YYYY-MM-DD' -> [stepId or tool id]
  checkins: [],    // { id, at, distress, sleep, nightmare, intrusions, avoid, tools[], note }
  pcl: [],         // { id, at, items:[20], total }
  safety: { warning: '', coping: '', places: '', people: '', pros: '',
            safer: '', reasons: '', updatedAt: null },
  ladder: [],      // { id, text, suds, at, tries:[{at, before, peak, after}] }
  pies: [],        // { id, at, event, slices:[{label, pct}] }
  nightmare: { consent: false, title: '', changed: '', rehearsals: [] },
  memory: { consent: false, title: '', text: '', sessions: [] },
  card: { then: '', now: '', because: '', can: '', updatedAt: null },
  values: []       // { id, name, note }
});

let state = blank();
let passphrase = null;      // held in memory only, never persisted
let locked = false;
const subs = new Set();

// ------------------------------------------------------------- crypto ------
const enc = new TextEncoder();
const dec = new TextDecoder();
const b64 = {
  to: b => btoa(String.fromCharCode(...new Uint8Array(b))),
  from: s => Uint8Array.from(atob(s), c => c.charCodeAt(0))
};

async function keyFrom(pass, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(pass),
    'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function encryptPayload(obj, pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await keyFrom(pass, salt);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key,
    enc.encode(JSON.stringify(obj)));
  return { enc: true, v: SCHEMA, salt: b64.to(salt), iv: b64.to(iv),
           data: b64.to(data) };
}

async function decryptPayload(wrapper, pass) {
  const key = await keyFrom(pass, b64.from(wrapper.salt));
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64.from(wrapper.iv) }, key, b64.from(wrapper.data));
  return JSON.parse(dec.decode(plain));
}

function canCrypt() {
  try { return !!(window.crypto && crypto.subtle); } catch { return false; }
}

// ------------------------------------------------------------- storage -----
let memoryOnly = false;          // true when the browser blocks localStorage
const mem = {};
function lsGet(k) {
  if (memoryOnly) return mem[k] ?? null;
  try { return localStorage.getItem(k); } catch { memoryOnly = true; return mem[k] ?? null; }
}
function lsSet(k, v) {
  if (memoryOnly) { mem[k] = v; return; }
  try { localStorage.setItem(k, v); } catch (err) {
    if (err && /quota/i.test(String(err.name || err))) {
      window.dispatchEvent(new CustomEvent('tn:storage-full'));
    } else { memoryOnly = true; mem[k] = v; }
  }
}
function lsDel(k) {
  delete mem[k];
  try { localStorage.removeItem(k); } catch { /* ignore */ }
}
export function storageWorks() {
  try { const t = '__tn'; localStorage.setItem(t, '1'); localStorage.removeItem(t); return true; }
  catch { return false; }
}

// ------------------------------------------------------- display settings --
// Only settings someone has chosen are saved. Defaults are filled in when read,
// so a change of default reaches everyone who never chose.
const uiDefaults = { palette: 'harbour', theme: '', size: 'm', motion: 'flow',
                     region: '', seenWelcome: false };
function storedUI() {
  let s;
  try { s = JSON.parse(lsGet(UIKEY) || '{}'); } catch { s = null; }
  if (!s || typeof s !== 'object') s = {};
  // Version 1 saved every setting, defaults included, so a saved "journey" there may be
  // only the old default. From version 2, a palette someone picks carries palPicked.
  if (s.palette === 'journey' && !s.palPicked) delete s.palette;
  delete s.quickHide;                       // quick hide was removed in version 2
  return s;
}
export function ui() { return { ...uiDefaults, ...storedUI() }; }
export function setUI(patch) {
  const next = { ...storedUI(), ...patch };
  lsSet(UIKEY, JSON.stringify(next));
  return { ...uiDefaults, ...next };
}

// ------------------------------------------------------------- lifecycle ---
export function isLocked() { return locked; }
export function isEncrypted() {
  try { const raw = lsGet(KEY); return !!raw && JSON.parse(raw).enc === true; }
  catch { return false; }
}
export function hasPassphrase() { return !!passphrase; }
export const cryptoAvailable = canCrypt;

export async function boot() {
  const raw = lsGet(KEY);
  if (!raw) { state = blank(); return { ok: true, fresh: true }; }
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { return { ok: false, error: 'Saved data could not be read.' }; }
  if (parsed.enc) { locked = true; return { ok: true, needsPass: true }; }
  state = migrate(parsed);
  return { ok: true };
}

export async function unlock(pass) {
  const wrapper = JSON.parse(lsGet(KEY));
  try {
    state = migrate(await decryptPayload(wrapper, pass));
    passphrase = pass; locked = false;
    emit();
    return { ok: true };
  } catch {
    return { ok: false, error: 'That passphrase did not work.' };
  }
}

/** Lock again (used by Lock now in Your data). */
export function relock() {
  if (!passphrase) return false;
  clearTimeout(writeTimer);
  return persist().then(() => { state = blank(); passphrase = null; locked = true; emit(); return true; });
}

function migrate(data) {
  const base = blank();
  const merged = { ...base, ...data,
    settings: { ...base.settings, ...(data.settings || {}) },
    map: { ...base.map, ...(data.map || {}) },
    safety: { ...base.safety, ...(data.safety || {}) },
    nightmare: { ...base.nightmare, ...(data.nightmare || {}) },
    memory: { ...base.memory, ...(data.memory || {}) },
    card: { ...base.card, ...(data.card || {}) } };
  for (const k of ['journal', 'records', 'checkins', 'pcl', 'ladder', 'pies', 'values'])
    if (!Array.isArray(merged[k])) merged[k] = [];
  merged.v = SCHEMA;
  return merged;
}

let writeTimer = null;
let dirty = false;
async function persist() {
  if (locked) return;
  dirty = false;
  state.updatedAt = Date.now();
  const payload = passphrase ? await encryptPayload(state, passphrase) : state;
  lsSet(KEY, JSON.stringify(payload));
}
function schedule() { clearTimeout(writeTimer); writeTimer = setTimeout(persist, 300); }
function emit() { subs.forEach(fn => fn(state)); }

export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
export function get() { return state; }
export function update(fn) { fn(state); dirty = true; schedule(); emit(); }
export async function flush() { clearTimeout(writeTimer); if (dirty) await persist(); }

/** Another tab changed the saved data: take it up, unless this tab has unsaved changes. */
export async function reload() {
  if (dirty || locked) return false;
  const raw = lsGet(KEY);
  if (!raw) { state = blank(); emit(); return true; }
  try {
    const parsed = JSON.parse(raw);
    if (parsed.enc) {
      if (!passphrase) { state = blank(); locked = true; return true; }
      state = migrate(await decryptPayload(parsed, passphrase));
    } else state = migrate(parsed);
    emit(); return true;
  } catch { return false; }
}

// ------------------------------------------------------------- encryption --
export async function enableEncryption(pass) { passphrase = pass; await persist(); return { ok: true }; }
export async function disableEncryption() { passphrase = null; await persist(); return { ok: true }; }
// (persist() writes regardless of the dirty flag; flush() only writes when something changed.)

// ------------------------------------------------------------- helpers -----
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ------------------------------------------------------------- writers -----
export function saveStep(stepId, index, text) {
  update(s => {
    const rec = s.steps[stepId] || { entries: {}, status: 'working', history: [] };
    const prev = rec.entries[index] || '';
    if (prev && prev !== text && (!rec.history.length ||
        Date.now() - (rec.history.at(-1).at || 0) > 6 * 3600 * 1000)) {
      rec.history.push({ at: Date.now(), index, text: prev });
      if (rec.history.length > 40) rec.history.shift();
    }
    rec.entries[index] = text;
    rec.updatedAt = Date.now();
    if (rec.status === 'settled' && prev !== text) rec.status = 'working';
    s.steps[stepId] = rec;
  });
}
export function setStepStatus(stepId, status) {
  update(s => {
    const rec = s.steps[stepId] || { entries: {}, history: [] };
    rec.status = status; rec.updatedAt = Date.now(); s.steps[stepId] = rec;
  });
}
export function saveItem(id, text) { update(s => { s.items[id] = { text, updatedAt: Date.now() }; }); }

export function logPractice(id, date = today()) {
  update(s => {
    const list = s.practices[date] || [];
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1); else list.push(id);
    if (list.length) s.practices[date] = list; else delete s.practices[date];
  });
}
export function markPractice(id, date = today()) {
  update(s => {
    const list = s.practices[date] || [];
    if (!list.includes(id)) list.push(id);
    s.practices[date] = list;
  });
}

export function addJournal(entry) {
  const rec = { id: uid(), at: Date.now(), text: '', mood: null, tags: [], stage: null, ...entry };
  update(s => { s.journal.unshift(rec); });
  return rec;
}
export function updateJournal(id, patch) {
  update(s => { const i = s.journal.findIndex(e => e.id === id);
    if (i >= 0) s.journal[i] = { ...s.journal[i], ...patch, editedAt: Date.now() }; });
}
export function removeJournal(id) { update(s => { s.journal = s.journal.filter(e => e.id !== id); }); }

export function addRecord(rec) {
  const full = { id: uid(), at: Date.now(), situation: '', reminder: '', thenWas: '',
                 nowIs: '', thought: '', body: '', traps: [], evidenceFor: '',
                 evidenceAgainst: '', reframe: '', action: '', distressBefore: 6,
                 distressAfter: null, beliefBefore: 60, beliefAfter: null, ...rec };
  update(s => { s.records.unshift(full); });
  return full;
}
export function updateRecord(id, patch) {
  update(s => { const i = s.records.findIndex(r => r.id === id);
    if (i >= 0) s.records[i] = { ...s.records[i], ...patch, editedAt: Date.now() }; });
}
export function removeRecord(id) { update(s => { s.records = s.records.filter(r => r.id !== id); }); }

export function addMapNode(field, text) {
  const node = { id: uid(), text, at: Date.now() };
  update(s => { s.map[field] = [...(s.map[field] || []), node]; });
  return node;
}
export function removeMapNode(field, id) {
  update(s => {
    s.map[field] = (s.map[field] || []).filter(n => n.id !== id);
    s.map.links = (s.map.links || []).filter(l => l.a !== id && l.b !== id);
  });
}
export function toggleLink(a, b) {
  update(s => {
    const links = s.map.links || (s.map.links = []);
    const i = links.findIndex(l => (l.a === a && l.b === b) || (l.a === b && l.b === a));
    if (i >= 0) links.splice(i, 1); else links.push({ a, b });
  });
}

export function addCheckin(entry) {
  const rec = { id: uid(), at: Date.now(), distress: 5, sleep: null, nightmare: null,
                intrusions: null, avoid: null, tools: [], note: '', ...entry };
  update(s => { s.checkins.unshift(rec); });
  return rec;
}
export function removeCheckin(id) { update(s => { s.checkins = s.checkins.filter(c => c.id !== id); }); }

export function addPCL(items) {
  const total = items.reduce((a, b) => a + (+b || 0), 0);
  const rec = { id: uid(), at: Date.now(), items, total };
  update(s => { s.pcl.unshift(rec); });
  return rec;
}
export function removePCL(id) { update(s => { s.pcl = s.pcl.filter(p => p.id !== id); }); }

export function saveSafety(field, text) {
  update(s => { s.safety[field] = text; s.safety.updatedAt = Date.now(); });
}

export function addRung(text, suds) {
  const r = { id: uid(), text, suds: +suds || 0, at: Date.now(), tries: [] };
  update(s => { s.ladder.push(r); });
  return r;
}
export function updateRung(id, patch) {
  update(s => { const i = s.ladder.findIndex(r => r.id === id); if (i >= 0) s.ladder[i] = { ...s.ladder[i], ...patch }; });
}
export function addTry(id, t) {
  update(s => { const r = s.ladder.find(x => x.id === id); if (r) r.tries.push({ at: Date.now(), ...t }); });
}
export function removeRung(id) { update(s => { s.ladder = s.ladder.filter(r => r.id !== id); }); }

export function savePie(pie) {
  update(s => {
    const i = s.pies.findIndex(p => p.id === pie.id);
    if (i >= 0) s.pies[i] = { ...pie, at: Date.now() }; else s.pies.unshift({ ...pie, id: pie.id || uid(), at: Date.now() });
  });
}
export function removePie(id) { update(s => { s.pies = s.pies.filter(p => p.id !== id); }); }

export function patch(section, obj) { update(s => { s[section] = { ...s[section], ...obj }; }); }

export function setValues(list) { update(s => { s.values = list; }); }

// ------------------------------------------------------------- transfer ----
export function exportBlob() {
  const payload = { format: 'then-and-now', v: SCHEMA, exportedAt: new Date().toISOString(), state };
  return new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
}
export async function importJSON(text) {
  let parsed;
  try { parsed = JSON.parse(text); } catch { return { ok: false, error: 'That file is not valid JSON.' }; }
  const incoming = parsed.state || parsed;
  if (!incoming || typeof incoming !== 'object' || !('journal' in incoming))
    return { ok: false, error: 'That does not look like a Then and Now export.' };
  state = migrate(incoming);
  await persist();
  emit();
  return { ok: true };
}
export async function eraseAll() {
  lsDel(KEY);
  state = blank();
  passphrase = null; locked = false;
  emit();
}

// ------------------------------------------------------------- derived -----
export function stageProgress(stepIds) {
  const done = stepIds.filter(id => state.steps[id]?.status === 'settled').length;
  const started = stepIds.filter(id => {
    const r = state.steps[id];
    return r && Object.values(r.entries || {}).some(t => (t || '').trim());
  }).length;
  return { done, started, total: stepIds.length };
}
export function practiceStreak() {
  let n = 0; const d = new Date();
  for (;;) {
    const k = today(d);
    if (state.practices[k]?.length) { n++; d.setDate(d.getDate() - 1); }
    else if (n === 0 && k === today()) { d.setDate(d.getDate() - 1); }
    else break;
    if (n > 3650) break;
  }
  return n;
}
