# Enviament dels leads a Google Sheet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que els leads de l'Extra 1 (el parcial del pas 1 i el final del pas 2) arribin, sense servidor propi, a un Google Sheet amb una fila per lead.

**Architecture:** Un Google Apps Script (`apps-script/Code.gs`, fitxer únic que es copia a l'editor de Google) rep un `POST` JSON, el valida, i fa un *upsert* per `id` al full `Leads`. Al web, un petit client (`form/payload.js` i `form/sender.js`) escolta els esdeveniments `tsf:lead-partial` i `tsf:lead` que ja existeixen, els converteix en càrregues útils i els envia amb cua en memòria, reintents i un darrer intent en tancar la pàgina. Tot és opt-in per `CONFIG.leadEndpoint`.

**Tech Stack:** JS pla (mòduls ES al web; JS de V8 a Apps Script), `node:test` (l'script es prova a Node carregant-lo amb `vm` i uns globals de Google falsos), Google Sheets + Apps Script (web app).

**Spec:** `docs/superpowers/specs/2026-10-09-google-sheet.md`. Base: `docs/superpowers/specs/2026-10-09-extra1-reordenat.md` (esdeveniments i dades) i `PRODUCT.md`.

## Global Constraints

- Treballar a una branca nova `extra1-sheet` creada des de `main` (`git switch -c extra1-sheet`). Cap `git push`, `git merge` ni PR sense que l'Olga ho demani.
- Cada commit acaba amb la línia `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (segon `-m`).
- Línia de base: `npm test` = 195 tests verds abans de començar.
- Cost recurrent 0 €. Cap servidor propi, cap llibreria nova, cap `npm install`.
- **Res de personal al navegador:** cap `localStorage`, `sessionStorage`, IndexedDB ni cookie. La cua d'enviament és només en memòria.
- Els esdeveniments `tsf:lead-partial` i `tsf:lead` continuen sent l'API pública i no canvien de forma.
- Sense `leadEndpoint` (`''`, per defecte) no es fa cap petició de xarxa.
- El servidor mai no desa un lead amb `privacy !== true`, ni sense nom, correu vàlid i telèfon.
- El servidor mai no degrada una fila `complete` a `step1`.
- Les columnes del full tenen format de text pla (`@`).
- L'enviament no bloqueja ni canvia la interfície: el dossier s'obre i la confirmació surt igualment.
- `page.css` no es toca. Textos: sense `!` ni `¡`, sense emojis.

## Review Focus

- Un reintent del mateix lead (la resposta es perd però el servidor ja l'ha desat) no duplica la fila (Tasks 2 i 3).
- Un parcial que arriba tard, després del final, no sobreescriu la fila completa (Tasks 2 i 3).
- Un nom o comentari com `=HYPERLINK("http://…")` o `+34…` es desa com a text i no s'executa com a fórmula (Task 2 i prova manual de la Task 5).
- Sense xarxa o amb mala cobertura, la cua reintenta amb espera creixent, torna a provar en recuperar la xarxa i només conserva l'última càrrega útil de cada `id` (Task 3).
- La neteja per inactivitat de la tauleta o canviar de pantalla no perd leads encara sense enviar (Task 3: la cua viu al mòdul, no a l'estat de React).
- Dos visitants que envien alhora no es trepitgen les files (Task 2: bloqueig i cerca per `id`).
- Càrregues brossa o enormes (JSON invàlid, camps desconeguts, textos de milers de caràcters, `privacy: false`) són rebutjades o retallades (Task 2).

## File Structure

```
apps-script/Code.gs            (nou)      validació, upsert i doPost/doGet de l'script de Google
site/js/form/payload.js        (nou)      esdeveniment → càrrega útil de l'enviament
site/js/form/sender.js         (nou)      cua, reintents, beacon i connexió amb els esdeveniments
site/js/config.js              (modifica) leadEndpoint i leadToken
site/js/app.js                 (modifica) crea i connecta el sender
site/js/i18n-form.js           (modifica) «Google (Hojas de cálculo)» al text de privacitat
site/index.html                (modifica) modulepreload dels mòduls nous
scripts/smoke-sheet.mjs        (nou)      prova de fum contra una URL desplegada
docs/google-sheet.md           (nou)      guia de configuració
README.md                      (modifica)
tests/lead-payload.test.mjs    tests/lead-sender.test.mjs    tests/apps-script.test.mjs   (nous)
```

---

### Task 1: Càrregues útils de l'enviament

**Files:**
- Create: `site/js/form/payload.js`
- Test: `tests/lead-payload.test.mjs`

**Interfaces:**
- Consumes: la forma dels esdeveniments (`tsf:lead-partial` detail = `{ id, stage:'step1', name, email, phone, privacy, newsletter, lang, origin, profile? }`; `tsf:lead` detail = `{ contact:{ id, product, name, email, phone, privacy, newsletter, lang, profile, origin }, profiling:{ id, … }, hasProfiling }`).
- Produces: `partialPayload(detail) -> { id, stage:'step1', contact }` i `finalPayload(detail) -> { id, stage:'complete', contact, profiling }`; `contact` i `profiling` no porten `id`.

- [ ] **Step 1: Crear la branca**

```bash
cd "/Users/olgagarcia/vibe coding/lead capture"
git switch main && git switch -c extra1-sheet && npm test 2>&1 | grep -E "^# (pass|fail)"
```
Expected: `# pass 195`, `# fail 0`.

- [ ] **Step 2: Test que falla**

```js
// tests/lead-payload.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { finalPayload, partialPayload } from '../site/js/form/payload.js';

const partial = {
  id: 'id-1', stage: 'step1', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
  privacy: true, newsletter: false, lang: 'es', origin: 'mobil', profile: 'particular',
};
const final = {
  contact: { id: 'id-1', product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00', privacy: true, newsletter: false, lang: 'es', profile: 'particular', origin: 'mobil' },
  profiling: { id: 'id-1', hasBoat: 'si', enthusiasm: ['noise'] },
  hasProfiling: true,
};

test('el parcial: id i etapa a dalt, contacte sense id ni etapa', () => {
  const p = partialPayload(partial);
  assert.deepEqual([p.id, p.stage], ['id-1', 'step1']);
  assert.deepEqual(Object.keys(p.contact).sort(), ['email', 'lang', 'name', 'newsletter', 'origin', 'phone', 'privacy', 'profile']);
  assert.equal(p.contact.privacy, true);
});
test('el final: contacte i perfilació sense id repetit', () => {
  const p = finalPayload(final);
  assert.deepEqual([p.id, p.stage], ['id-1', 'complete']);
  assert.equal(Object.hasOwn(p.contact, 'id'), false);
  assert.deepEqual(p.profiling, { hasBoat: 'si', enthusiasm: ['noise'] });
  assert.equal(p.contact.product, 'model-a');
});
test('no es modifiquen els objectes originals', () => {
  partialPayload(partial);
  finalPayload(final);
  assert.equal(partial.id, 'id-1');
  assert.equal(final.contact.id, 'id-1');
  assert.equal(final.profiling.id, 'id-1');
});
```

- [ ] **Step 3: Veure'l fallar.** Run: `node --test tests/lead-payload.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 1`.

- [ ] **Step 4: Implementar**

```js
// site/js/form/payload.js
// De l'esdeveniment del flux a la càrrega útil que rep l'script de Google: l'id i l'etapa a dalt, la resta agrupada.
export function partialPayload(detail) {
  const { id, stage: _stage, ...contact } = detail;
  return { id, stage: 'step1', contact };
}

export function finalPayload({ contact, profiling }) {
  const { id, ...contactData } = contact;
  const { id: _profilingId, ...profilingData } = profiling;
  return { id, stage: 'complete', contact: contactData, profiling: profilingData };
}
```

- [ ] **Step 5: Veure'l passar.** Run: `node --test tests/lead-payload.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: `# fail 0`.

- [ ] **Step 6: Commit**

```bash
git add site/js/form/payload.js tests/lead-payload.test.mjs
git commit -m "feat: càrregues útils dels leads per a l'enviament al full" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 2: Script de Google (validació i upsert)

**Files:**
- Create: `apps-script/Code.gs`
- Test: `tests/apps-script.test.mjs`

**Interfaces:**
- Consumes: la càrrega útil de la Task 1 (+ `token` opcional) com a JSON al cos del `POST`.
- Produces (globals de l'script): `COLUMNS`, `sanitizeLead(payload) -> lead | null`, `ensureHeader(sheet)`, `upsertLead(sheet, lead, now) -> 'created' | 'updated' | 'ignored'`, `doPost(e)`, `doGet()`. Resposta: `{ ok: true, result }` o `{ ok: false, error: 'invalid' | 'error' }` (JSON, `application/json`).

- [ ] **Step 1: Test que falla**

```js
// tests/apps-script.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { ACTIVITIES, CONCERNS, ENTHUSIASM, FACTORS, PROFILES } from '../site/js/form/model.js';

const SOURCE = readFileSync('apps-script/Code.gs', 'utf8');

// Full de càlcul fals: una matriu de files, amb els formats que s'hi apliquen.
class FakeSheet {
  constructor() { this.rows = []; this.formats = []; this.frozen = 0; }
  getLastRow() { return this.rows.length; }
  getMaxRows() { return Math.max(this.rows.length, 1000); }
  setFrozenRows(n) { this.frozen = n; }
  getRange(row, col, nRows = 1, nCols = 1) {
    const sheet = this;
    return {
      getValues: () => Array.from({ length: nRows }, (_, i) => Array.from({ length: nCols }, (_, j) => (sheet.rows[row - 1 + i] ?? [])[col - 1 + j] ?? '')),
      setValues(values) { values.forEach((v, i) => { sheet.rows[row - 1 + i] = [...(sheet.rows[row - 1 + i] ?? [])]; v.forEach((x, j) => { sheet.rows[row - 1 + i][col - 1 + j] = x; }); }); },
      setNumberFormat(format) { sheet.formats.push(format); },
    };
  }
}

function load({ token, sheet = new FakeSheet() } = {}) {
  const lock = { waited: 0, released: 0, waitLock() { this.waited++; }, releaseLock() { this.released++; } };
  const book = { getSheetByName: () => sheet, insertSheet: () => sheet };
  const context = {
    SpreadsheetApp: { getActiveSpreadsheet: () => book },
    LockService: { getScriptLock: () => lock },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k === 'TOKEN' ? token : null) }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (text) => ({ text, setMimeType() { return this; } }) },
    Array, String, JSON, Date, Object, Math, RegExp, Number,
  };
  vm.createContext(context);
  const api = vm.runInContext(`${SOURCE}\n;({ COLUMNS, sanitizeLead, ensureHeader, upsertLead, doPost, doGet, OPTIONS: { ACTIVITIES, OPINION, PROFILES } })`, context);
  return { api, sheet, lock };
}

const contact = { name: 'Ana', email: 'Ana@Example.com', phone: '+34 600 00 00 00', privacy: true, newsletter: true, lang: 'es', origin: 'mobil', profile: 'profesional', product: 'model-a' };
const step1 = { id: 'abc-12345', stage: 'step1', contact };
const complete = { id: 'abc-12345', stage: 'complete', contact, profiling: { activity: 'vela', hasBoat: 'si', hasElectric: 'no', intent: 'no', demo: 'Girona', enthusiasm: ['costs', 'noise', 'other'], enthusiasmOther: 'Silenci', concerns: ['range'], factors: ['price'], comments: 'Hola' } };
const post = (api, payload) => JSON.parse(api.doPost({ postData: { contents: typeof payload === 'string' ? payload : JSON.stringify(payload) } }).text);

test('sanitizeLead accepta un parcial i un final vàlids i normalitza el correu', () => {
  const { api } = load();
  assert.equal(api.sanitizeLead(step1).email, 'ana@example.com');
  const lead = api.sanitizeLead(complete);
  assert.deepEqual([lead.stage, lead.activity, lead.hasBoat, lead.demo], ['complete', 'vela', 'si', 'Girona']);
});
test('les llistes d\'opinió es desen filtrades i en l\'ordre del formulari; el text «other» només si «other» és marcat', () => {
  const { api } = load();
  const lead = api.sanitizeLead(complete);
  assert.equal(lead.enthusiasm, 'noise, costs, other');
  assert.equal(lead.enthusiasmOther, 'Silenci');
  const noOther = api.sanitizeLead({ ...complete, profiling: { ...complete.profiling, concerns: ['range'], concernsOther: 'No ha de sortir', enthusiasm: ['inventada'] } });
  assert.equal(noOther.concernsOther, '');
  assert.equal(noOther.enthusiasm, '');
});
test('es rebutgen les càrregues invàlides: privacitat no acceptada, id, etapa, correu, nom, telèfon, idioma o origen', () => {
  const { api } = load();
  const bad = (patch) => api.sanitizeLead({ ...step1, contact: { ...contact, ...patch } });
  assert.equal(bad({ privacy: false }), null);
  assert.equal(bad({ privacy: 'true' }), null);
  assert.equal(bad({ email: 'no-es-un-correu' }), null);
  assert.equal(bad({ name: '   ' }), null);
  assert.equal(bad({ phone: '' }), null);
  assert.equal(bad({ lang: 'fr' }), null);
  assert.equal(bad({ origin: 'web' }), null);
  assert.equal(api.sanitizeLead({ ...step1, id: 'curt' }), null);
  assert.equal(api.sanitizeLead({ ...step1, id: 'un id amb espais i símbols!' }), null);
  assert.equal(api.sanitizeLead({ ...step1, stage: 'qualsevol' }), null);
  assert.equal(api.sanitizeLead({ ...complete, contact: { ...contact, profile: '' } }), null, 'el final exigeix perfil');
  assert.equal(api.sanitizeLead(null), null);
  assert.equal(api.sanitizeLead('text'), null);
});
test('els textos es retallen, els camps desconeguts s\'ignoren i els valors fora de llista queden buits', () => {
  const { api } = load();
  const lead = api.sanitizeLead({ ...complete, extra: 'x', contact: { ...contact, name: 'n'.repeat(500), hacker: 1 }, profiling: { ...complete.profiling, comments: 'c'.repeat(5000), activity: 'inventada', hasBoat: 'potser', factorsOther: 'x' } });
  assert.equal(Array.from(lead.name).length, 100);
  assert.equal(Array.from(lead.comments).length, 500);
  assert.deepEqual([lead.activity, lead.hasBoat], ['', '']);
  assert.equal(Object.hasOwn(lead, 'hacker'), false);
  assert.equal(Object.hasOwn(lead, 'extra'), false);
});
test('un parcial no porta perfilació encara que la càrrega n\'inclogui', () => {
  const { api } = load();
  assert.equal(api.sanitizeLead({ ...step1, profiling: { activity: 'vela' } }).activity, '');
});
test('ensureHeader escriu la capçalera una sola vegada, congela la fila i posa format de text a les columnes', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet);
  api.ensureHeader(sheet);
  assert.deepEqual(sheet.rows[0], [...api.COLUMNS]); // còpia: l'array de l'script viu en un altre context de vm
  assert.equal(sheet.rows.length, 1);
  assert.equal(sheet.frozen, 1);
  assert.deepEqual(sheet.formats, ['@']);
});
test('upsert: el parcial crea la fila, el mateix parcial reintentat no la duplica, i el final la completa conservant createdAt', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet);
  assert.equal(api.upsertLead(sheet, api.sanitizeLead(step1), '2026-10-14T10:00:00Z'), 'created');
  assert.equal(api.upsertLead(sheet, api.sanitizeLead(step1), '2026-10-14T10:00:05Z'), 'updated');
  assert.equal(sheet.rows.length, 2);
  assert.equal(api.upsertLead(sheet, api.sanitizeLead(complete), '2026-10-14T10:02:00Z'), 'updated');
  assert.equal(sheet.rows.length, 2);
  const col = (name) => sheet.rows[1][api.COLUMNS.indexOf(name)];
  assert.deepEqual([col('stage'), col('createdAt'), col('updatedAt'), col('activity'), col('enthusiasm')], ['complete', '2026-10-14T10:00:00Z', '2026-10-14T10:02:00Z', 'vela', 'noise, costs, other']);
  assert.deepEqual([col('privacy'), col('newsletter'), col('email')], ['si', 'si', 'ana@example.com']);
});
test('upsert: un parcial que arriba tard no degrada una fila completa', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet);
  api.upsertLead(sheet, api.sanitizeLead(complete), '2026-10-14T10:02:00Z');
  assert.equal(api.upsertLead(sheet, api.sanitizeLead(step1), '2026-10-14T10:03:00Z'), 'ignored');
  assert.equal(sheet.rows[1][api.COLUMNS.indexOf('stage')], 'complete');
  assert.equal(sheet.rows[1][api.COLUMNS.indexOf('activity')], 'vela');
});
test('upsert: dos leads diferents són dues files', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet);
  api.upsertLead(sheet, api.sanitizeLead(step1), 't1');
  api.upsertLead(sheet, api.sanitizeLead({ ...step1, id: 'altre-id-99' }), 't2');
  assert.equal(sheet.rows.length, 3);
});
test('doPost: crea, respon ok i allibera el bloqueig', () => {
  const { api, sheet, lock } = load();
  assert.deepEqual(post(api, step1), { ok: true, result: 'created' });
  assert.deepEqual([lock.waited, lock.released], [1, 1]);
  assert.equal(sheet.rows.length, 2);
});
test('doPost: JSON invàlid o càrrega invàlida → «invalid» sense tocar el full', () => {
  const { api, sheet } = load();
  assert.deepEqual(post(api, '{no és json'), { ok: false, error: 'invalid' });
  assert.deepEqual(post(api, { ...step1, contact: { ...contact, privacy: false } }), { ok: false, error: 'invalid' });
  assert.equal(sheet.rows.length, 0);
});
test('doPost: amb la propietat TOKEN cal enviar el token correcte', () => {
  const { api, sheet } = load({ token: 's3cret' });
  assert.deepEqual(post(api, step1), { ok: false, error: 'invalid' });
  assert.deepEqual(post(api, { ...step1, token: 'incorrecte' }), { ok: false, error: 'invalid' });
  assert.deepEqual(post(api, { ...step1, token: 's3cret' }), { ok: true, result: 'created' });
  assert.equal(sheet.rows.length, 2);
});
test('doPost: un error intern respon «error» (el client reintenta) i allibera el bloqueig', () => {
  const sheet = new FakeSheet();
  sheet.getLastRow = () => { throw new Error('boom'); };
  const { api, lock } = load({ sheet });
  assert.deepEqual(post(api, step1), { ok: false, error: 'error' });
  assert.equal(lock.released, 1);
});
test('doGet respon ok (per comprovar que l\'URL està desplegada)', () => {
  const { api } = load();
  assert.deepEqual(JSON.parse(api.doGet().text), { ok: true });
});
test('les llistes d\'opcions de l\'script coincideixen amb les del web (cap desfasament)', () => {
  const { api } = load();
  assert.deepEqual([...api.OPTIONS.ACTIVITIES], ACTIVITIES);
  assert.deepEqual([...api.OPTIONS.PROFILES], PROFILES);
  assert.deepEqual([...api.OPTIONS.OPINION.enthusiasm], ENTHUSIASM);
  assert.deepEqual([...api.OPTIONS.OPINION.concerns], CONCERNS);
  assert.deepEqual([...api.OPTIONS.OPINION.factors], FACTORS);
});
```

- [ ] **Step 2: Veure'l fallar.** Run: `node --test tests/apps-script.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen (no existeix `apps-script/Code.gs`).

- [ ] **Step 3: Implementar**

```js
// apps-script/Code.gs
// Script de Google lligat al full de càlcul de leads. Es copia sencer a l'editor d'Apps Script (vegeu docs/google-sheet.md).
// Rep un POST JSON { id, stage, contact, profiling?, token? } i fa un upsert per id al full «Leads».

var SHEET_NAME = 'Leads';
var COLUMNS = [
  'id', 'stage', 'createdAt', 'updatedAt', 'name', 'email', 'phone', 'profile', 'lang', 'origin', 'privacy', 'newsletter', 'product',
  'activity', 'activityOther', 'hasBoat', 'hasElectric', 'enthusiasm', 'enthusiasmOther', 'concerns', 'concernsOther',
  'intent', 'factors', 'factorsOther', 'demo', 'comments'
];
var STAGES = ['step1', 'complete'];
var LANGS = ['es', 'ca', 'pt', 'en'];
var ORIGINS = ['mobil', 'tauleta'];
var PROFILES = ['particular', 'profesional'];
var YES_NO = ['si', 'no'];
// Aquestes llistes han de coincidir amb site/js/form/model.js (un test ho vigila).
var ACTIVITIES = ['ocio', 'charter', 'vela', 'buceo', 'skiwake', 'seguridad', 'pasajeros', 'pesca', 'marina', 'otra'];
var OPINION = {
  enthusiasm: ['sustainability', 'noise', 'maintenance', 'costs', 'regulation', 'other'],
  concerns: ['range', 'charging', 'price', 'infrastructure', 'depreciation', 'other'],
  factors: ['price', 'range', 'maker', 'design', 'warranty', 'support', 'other']
};
var MAX = { name: 100, email: 254, phone: 30, other: 120, demo: 80, comments: 500 };

function clip(value, max) {
  return Array.from(String(value == null ? '' : value).trim()).slice(0, max).join('');
}

function oneOf(list, value) {
  return list.indexOf(value) === -1 ? '' : value;
}

// Valida i normalitza la càrrega: retorna el lead net o null. Mai no accepta un lead sense consentiment.
function sanitizeLead(payload) {
  if (!payload || typeof payload !== 'object') return null;
  var id = String(payload.id || '');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) return null;
  if (STAGES.indexOf(payload.stage) === -1) return null;
  var c = payload.contact;
  if (!c || typeof c !== 'object') return null;
  var name = clip(c.name, MAX.name);
  var email = clip(c.email, MAX.email).toLowerCase();
  var phone = clip(c.phone, MAX.phone);
  if (!name || !phone || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  if (c.privacy !== true) return null;
  if (LANGS.indexOf(c.lang) === -1 || ORIGINS.indexOf(c.origin) === -1) return null;
  var lead = {
    id: id, stage: payload.stage, name: name, email: email, phone: phone,
    privacy: true, newsletter: c.newsletter === true, lang: c.lang, origin: c.origin,
    profile: oneOf(PROFILES, c.profile),
    product: /^[a-z0-9-]{1,40}$/.test(String(c.product || '')) ? String(c.product) : ''
  };
  if (payload.stage === 'complete' && !lead.profile) return null;
  var p = payload.stage === 'complete' && payload.profiling && typeof payload.profiling === 'object' ? payload.profiling : {};
  lead.activity = oneOf(ACTIVITIES, p.activity);
  lead.activityOther = lead.activity === 'otra' ? clip(p.activityOther, MAX.other) : '';
  lead.hasBoat = oneOf(YES_NO, p.hasBoat);
  lead.hasElectric = oneOf(YES_NO, p.hasElectric);
  lead.intent = oneOf(YES_NO, p.intent);
  lead.demo = clip(p.demo, MAX.demo);
  lead.comments = clip(p.comments, MAX.comments);
  Object.keys(OPINION).forEach(function (group) {
    var sent = Array.isArray(p[group]) ? p[group] : [];
    var chosen = OPINION[group].filter(function (option) { return sent.indexOf(option) > -1; });
    lead[group] = chosen.join(', ');
    lead[group + 'Other'] = chosen.indexOf('other') > -1 ? clip(p[group + 'Other'], MAX.other) : '';
  });
  return lead;
}

function ensureHeader(sheet) {
  var first = sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0];
  if (String(first[0]) === COLUMNS[0]) return;
  // Format de text pla: un valor que comenci per «=», «+» o «@» no s'executa com a fórmula.
  sheet.getRange(1, 1, sheet.getMaxRows(), COLUMNS.length).setNumberFormat('@');
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  sheet.setFrozenRows(1);
}

function rowFor(lead, current, now) {
  return COLUMNS.map(function (column, i) {
    if (column === 'createdAt') return current ? current[i] : now;
    if (column === 'updatedAt') return now;
    if (column === 'privacy' || column === 'newsletter') return lead[column] ? 'si' : 'no';
    return lead[column] === undefined ? '' : lead[column];
  });
}

// Una fila per lead: el final completa el parcial; un parcial tardà no degrada una fila completa.
function upsertLead(sheet, lead, now) {
  var last = sheet.getLastRow();
  var ids = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues() : [];
  var index = -1;
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === lead.id) { index = i; break; }
  }
  if (index === -1) {
    sheet.getRange(last + 1, 1, 1, COLUMNS.length).setValues([rowFor(lead, null, now)]);
    return 'created';
  }
  var rowNumber = index + 2;
  var current = sheet.getRange(rowNumber, 1, 1, COLUMNS.length).getValues()[0];
  if (current[COLUMNS.indexOf('stage')] === 'complete' && lead.stage === 'step1') return 'ignored';
  sheet.getRange(rowNumber, 1, 1, COLUMNS.length).setValues([rowFor(lead, current, now)]);
  return 'updated';
}

function reply(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return reply({ ok: true });
}

function doPost(e) {
  var payload;
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (parseError) {
    return reply({ ok: false, error: 'invalid' });
  }
  var token = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (token && (!payload || payload.token !== token)) return reply({ ok: false, error: 'invalid' });
  var lead = sanitizeLead(payload);
  if (!lead) return reply({ ok: false, error: 'invalid' });
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var book = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    ensureHeader(sheet);
    return reply({ ok: true, result: upsertLead(sheet, lead, new Date().toISOString()) });
  } catch (error) {
    return reply({ ok: false, error: 'error' });
  } finally {
    try { lock.releaseLock(); } catch (releaseError) { /* sense bloqueig adquirit */ }
  }
}
```

- [ ] **Step 4: Veure'l passar.** Run: `node --test tests/apps-script.test.mjs 2>&1 | grep -E "^# (pass|fail)|^not ok"` → Expected: `# fail 0`. Si el test de l'error intern falla perquè `getLastRow` no es crida abans de l'*upsert*, comprovar que `ensureHeader` i `upsertLead` es criden dins del `try`.

- [ ] **Step 5: Commit**

```bash
git add apps-script/Code.gs tests/apps-script.test.mjs
git commit -m "feat: script de Google que desa els leads al full (upsert per id, text pla i sense consentiment no es desa)" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 3: Client d'enviament (cua, reintents i connexió amb els esdeveniments)

**Files:**
- Create: `site/js/form/sender.js`
- Test: `tests/lead-sender.test.mjs`

**Interfaces:**
- Consumes: `partialPayload`, `finalPayload` (Task 1); contracte de resposta de l'script (Task 2).
- Produces: `RETRY_MS = [2000, 5000, 15000, 30000, 60000]`; `createSender({ endpoint, token = '', fetchFn, timers, beacon }) -> { send(payload) -> Promise, flush() -> Promise, beaconAll(), size() -> number }`; `connectSender(target, sender)` (escolta `tsf:lead-partial`, `tsf:lead`, `online` i `pagehide`). Sense `endpoint`, `send` no fa res.

- [ ] **Step 1: Test que falla**

```js
// tests/lead-sender.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { RETRY_MS, connectSender, createSender } from '../site/js/form/sender.js';

const partial = { id: 'id-0001', stage: 'step1', contact: { name: 'Ana' } };
const complete = { id: 'id-0001', stage: 'complete', contact: { name: 'Ana' }, profiling: { hasBoat: 'si' } };

const reply = (body, ok = true) => ({ ok, json: async () => body });
const harness = (responses) => {
  const calls = [];
  const queue = [...responses];
  const timers = { scheduled: [], set(fn, ms) { this.scheduled.push({ fn, ms }); return this.scheduled.length; }, clear() {} };
  const beacons = [];
  return {
    calls, timers, beacons,
    fetchFn: async (url, options) => {
      calls.push({ url, options, body: JSON.parse(options.body) });
      const next = queue.length > 1 ? queue.shift() : queue[0];
      if (next instanceof Error) throw next;
      return next;
    },
    beacon: (url, blob) => { beacons.push({ url, blob }); return true; },
  };
};
const make = (h, extra = {}) => createSender({ endpoint: 'https://script.example/exec', fetchFn: h.fetchFn, timers: h.timers, beacon: h.beacon, ...extra });
const OK = reply({ ok: true, result: 'created' });

test('amb èxit envia un POST de text pla (sense preflight) i buida la cua', async () => {
  const h = harness([OK]);
  const sender = make(h);
  await sender.send(partial);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].url, 'https://script.example/exec');
  assert.deepEqual([h.calls[0].options.method, h.calls[0].options.headers['Content-Type']], ['POST', 'text/plain;charset=utf-8']);
  assert.deepEqual(h.calls[0].body, partial);
  assert.equal(sender.size(), 0);
});
test('sense endpoint no es fa cap petició ni es guarda res', async () => {
  const h = harness([OK]);
  const sender = createSender({ endpoint: '', fetchFn: h.fetchFn, timers: h.timers, beacon: h.beacon });
  await sender.send(partial);
  assert.deepEqual([h.calls.length, sender.size()], [0, 0]);
});
test('el token, si n\'hi ha, viatja dins del cos', async () => {
  const h = harness([OK]);
  await make(h, { token: 's3cret' }).send(partial);
  assert.equal(h.calls[0].body.token, 's3cret');
});
test('error de xarxa: es conserva a la cua i es reintenta amb l\'espera creixent', async () => {
  const h = harness([new TypeError('offline')]);
  const sender = make(h);
  await sender.send(partial);
  assert.equal(sender.size(), 1);
  assert.equal(h.timers.scheduled.at(-1).ms, RETRY_MS[0]);
  await h.timers.scheduled.at(-1).fn();
  assert.equal(h.timers.scheduled.at(-1).ms, RETRY_MS[1]);
  for (let i = 0; i < 10; i++) await h.timers.scheduled.at(-1).fn();
  assert.equal(h.timers.scheduled.at(-1).ms, RETRY_MS.at(-1), 'l\'espera no passa de l\'últim valor');
});
test('en recuperar-se la xarxa s\'envia i es buida; el comptador d\'espera es reinicia', async () => {
  const h = harness([new TypeError('offline'), OK]);
  const sender = make(h);
  await sender.send(partial);
  await h.timers.scheduled.at(-1).fn();
  assert.equal(sender.size(), 0);
  await sender.send({ ...partial, id: 'id-0002' });
  assert.equal(h.calls.length, 3);
});
test('una resposta «error» del servidor (transitori) es reintenta; «invalid» es descarta per no insistir', async () => {
  const retry = harness([reply({ ok: false, error: 'error' })]);
  const a = make(retry);
  await a.send(partial);
  assert.equal(a.size(), 1);
  const drop = harness([reply({ ok: false, error: 'invalid' })]);
  const b = make(drop);
  await b.send(partial);
  assert.equal(b.size(), 0);
  const http = harness([reply({}, false)]);
  const c = make(http);
  await c.send(partial);
  assert.equal(c.size(), 1, 'una resposta HTTP no correcta es reintenta');
});
test('de cada id només es conserva l\'última càrrega: el final substitueix el parcial pendent', async () => {
  const h = harness([new TypeError('offline')]);
  const sender = make(h);
  await sender.send(partial);
  await sender.send(complete);
  assert.equal(sender.size(), 1);
  await sender.flush();
  assert.equal(h.calls.at(-1).body.stage, 'complete');
});
test('un parcial mai no substitueix un final pendent', async () => {
  const h = harness([new TypeError('offline')]);
  const sender = make(h);
  await sender.send(complete);
  const before = h.calls.length;
  await sender.send(partial);
  assert.equal(h.calls.length, before, 'ni tan sols s\'intenta');
  assert.equal(sender.size(), 1);
  await sender.flush();
  assert.equal(h.calls.at(-1).body.stage, 'complete');
});
test('beaconAll fa un darrer intent amb sendBeacon de tot el que queda, com a text pla', async () => {
  const h = harness([new TypeError('offline')]);
  const sender = make(h, { token: 't' });
  await sender.send(complete);
  sender.beaconAll();
  assert.equal(h.beacons.length, 1);
  assert.equal(h.beacons[0].url, 'https://script.example/exec');
  assert.match(h.beacons[0].blob.type, /^text\/plain/);
  assert.deepEqual(JSON.parse(await h.beacons[0].blob.text()), { ...complete, token: 't' });
});
test('connectSender: els esdeveniments del flux s\'envien amb la forma correcta; online reintenta; pagehide fa beacon', async () => {
  const listeners = {};
  const target = { addEventListener: (name, fn) => { listeners[name] = fn; } };
  const sent = [];
  const sender = { send: (p) => sent.push(p), flush: () => sent.push('flush'), beaconAll: () => sent.push('beacon') };
  connectSender(target, sender);
  listeners['tsf:lead-partial']({ detail: { id: 'id-0001', stage: 'step1', name: 'Ana' } });
  listeners['tsf:lead']({ detail: { contact: { id: 'id-0001', name: 'Ana' }, profiling: { id: 'id-0001', hasBoat: 'si' }, hasProfiling: true } });
  listeners.online();
  listeners.pagehide();
  assert.deepEqual(sent, [
    { id: 'id-0001', stage: 'step1', contact: { name: 'Ana' } },
    { id: 'id-0001', stage: 'complete', contact: { name: 'Ana' }, profiling: { hasBoat: 'si' } },
    'flush', 'beacon',
  ]);
});
```

- [ ] **Step 2: Veure'l fallar.** Run: `node --test tests/lead-sender.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen (no existeix `sender.js`).

- [ ] **Step 3: Implementar**

```js
// site/js/form/sender.js
import { finalPayload, partialPayload } from './payload.js';

// Espera entre reintents (ms); després de l'últim valor es manté.
export const RETRY_MS = [2000, 5000, 15000, 30000, 60000];

const defaultTimers = { set: (fn, ms) => setTimeout(fn, ms), clear: (id) => clearTimeout(id) };

// Cua d'enviament només en memòria (tauleta compartida: res de personal al navegador). De cada id només es guarda
// l'última càrrega; el servidor fa un upsert per id, així un reintent mai duplica una fila.
export function createSender({
  endpoint, token = '', fetchFn = (...args) => fetch(...args), timers = defaultTimers,
  beacon = (url, body) => navigator.sendBeacon(url, body),
}) {
  const pending = new Map();
  let failures = 0;
  let timer = null;
  let flushing = false;

  const body = (payload) => JSON.stringify(token ? { ...payload, token } : payload);

  async function post(payload) {
    try {
      const response = await fetchFn(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body(payload) });
      const result = await response.json();
      if (response.ok && result.ok === true) return 'sent';
      return result?.error === 'invalid' ? 'drop' : 'retry';
    } catch {
      return 'retry';
    }
  }

  async function flush() {
    if (!endpoint || flushing) return;
    timers.clear(timer);
    timer = null;
    flushing = true;
    let retry = false;
    for (const [id, entry] of [...pending]) {
      const outcome = await post(entry.payload);
      if (outcome === 'retry') retry = true;
      else if (pending.get(id) === entry) pending.delete(id);
    }
    flushing = false;
    if (!pending.size) {
      failures = 0;
    } else if (retry) {
      timer = timers.set(flush, RETRY_MS[Math.min(failures++, RETRY_MS.length - 1)]);
    } else {
      await flush();
    }
  }

  function send(payload) {
    if (!endpoint) return Promise.resolve();
    const previous = pending.get(payload.id);
    // Un parcial que arriba tard no substitueix el final pendent.
    if (previous && previous.payload.stage === 'complete' && payload.stage === 'step1') return Promise.resolve();
    pending.set(payload.id, { payload });
    return flush();
  }

  // Darrer intent en tancar la pàgina: sendBeacon no espera resposta.
  function beaconAll() {
    if (!endpoint) return;
    for (const { payload } of pending.values()) beacon(endpoint, new Blob([body(payload)], { type: 'text/plain;charset=UTF-8' }));
  }

  return { send, flush, beaconAll, size: () => pending.size };
}

// Connecta el sender amb els esdeveniments públics del flux i amb l'estat de la xarxa i de la pàgina.
export function connectSender(target, sender) {
  target.addEventListener('tsf:lead-partial', (e) => sender.send(partialPayload(e.detail)));
  target.addEventListener('tsf:lead', (e) => sender.send(finalPayload(e.detail)));
  target.addEventListener('online', () => sender.flush());
  target.addEventListener('pagehide', () => sender.beaconAll());
}
```

- [ ] **Step 4: Veure'l passar.** Run: `node --test tests/lead-sender.test.mjs 2>&1 | grep -E "^# (pass|fail)|^not ok"` → Expected: `# fail 0`. Si el test d'espera creixent es queda penjat, comprovar que cada `timers.scheduled.at(-1).fn()` reentra a `flush` amb `flushing = false`.

- [ ] **Step 5: Commit**

```bash
git add site/js/form/sender.js tests/lead-sender.test.mjs
git commit -m "feat: client d'enviament amb cua en memòria, reintents, sendBeacon i connexió amb els esdeveniments" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 4: Connexió a l'app, configuració, privacitat i documentació

**Files:**
- Modify: `site/js/config.js`, `site/js/app.js`, `site/js/i18n-form.js`, `site/index.html`, `README.md`
- Create: `docs/google-sheet.md`, `scripts/smoke-sheet.mjs`
- Test: `tests/config.test.mjs` (afegir), `tests/form-i18n.test.mjs` (afegir), `tests/html.test.mjs` (si cal)

**Interfaces:**
- Consumes: `createSender`, `connectSender` (Task 3).
- Produces: `CONFIG.leadEndpoint` (`''`) i `CONFIG.leadToken` (`''`); text de privacitat amb «Google (Hojas de cálculo)» als 4 idiomes; `node scripts/smoke-sheet.mjs <url> [token]`.

- [ ] **Step 1: Tests que fallen**

Afegir a `tests/config.test.mjs`:

```js
test('l\'enviament al full és apagat per defecte: sense URL ni token', () => {
  assert.equal(CONFIG.leadEndpoint, '');
  assert.equal(CONFIG.leadToken, '');
});
```

Afegir a `tests/form-i18n.test.mjs`:

```js
test('el text de privacitat diu que les dades es desen a Google Sheets (no a Forms)', () => {
  const expect = { es: /Google \(Hojas de cálculo\)/, ca: /Google \(Fulls de càlcul\)/, pt: /Google \(Folhas de cálculo\)/, en: /Google \(Sheets\)/ };
  for (const l of CONFIG.languages) {
    assert.match(DICT[l].form.privacyText, expect[l], l);
    assert.doesNotMatch(DICT[l].form.privacyText, /Formularios|Formularis|Formulários|Forms/, l);
  }
});
```

- [ ] **Step 2: Veure'ls fallar.** Run: `node --test tests/config.test.mjs tests/form-i18n.test.mjs 2>&1 | grep -E "^# (pass|fail)"` → Expected: fallen.

- [ ] **Step 3: Implementar**

A `site/js/config.js`, després d'`emailDelivery`:

```js
  leadEndpoint: '', // URL /exec de l'script de Google (docs/google-sheet.md). Buit = no s'envia res; només els esdeveniments tsf:lead*
  leadToken: '', // opcional: el mateix valor que la propietat TOKEN de l'script. És visible al codi del web: talla el correu brossa casual, no és un secret
```

A `site/js/i18n-form.js` (substitucions exactes dins de cada `privacyText`):
- `Google (Formularios y Hojas de cálculo)` → `Google (Hojas de cálculo)`
- `Google (Formularis i Fulls de càlcul)` → `Google (Fulls de càlcul)`
- `Google (Formulários e Folhas de cálculo)` → `Google (Folhas de cálculo)`
- `Google (Forms and Sheets)` → `Google (Sheets)`

(Comprovar amb `grep -c` que cada cadena existeix una sola vegada abans de substituir-la.)

A `site/js/app.js`, imports i, després de crear `DoneScreen`:

```js
import { connectSender, createSender } from './form/sender.js';
```
```js
// Els leads s'envien al full de Google si hi ha URL configurada; la cua viu aquí (no a l'estat de React) perquè
// canviar de pantalla o la neteja per inactivitat de la tauleta no perdin res.
connectSender(window, createSender({ endpoint: CONFIG.leadEndpoint, token: CONFIG.leadToken }));
```

`site/index.html`: afegir `<link rel="modulepreload" href="js/form/payload.js">` i `<link rel="modulepreload" href="js/form/sender.js">` (el test `html` diu quins en falten si cal).

```js
// scripts/smoke-sheet.mjs — prova de fum: node scripts/smoke-sheet.mjs <url /exec> [token]
const [url, token = ''] = process.argv.slice(2);
if (!url) { console.error('Ús: node scripts/smoke-sheet.mjs <url /exec> [token]'); process.exit(1); }

const id = `smoke-${Date.now()}`;
const contact = { name: '=HYPERLINK("http://example.com","prova")', email: 'prova@example.com', phone: '+34 600 00 00 00', privacy: true, newsletter: false, lang: 'es', origin: 'mobil', profile: 'profesional' };
const send = async (label, payload) => {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(token ? { ...payload, token } : payload) });
  console.log(label, response.status, await response.text());
};

console.log('GET', (await (await fetch(url)).text()));
await send('parcial ', { id, stage: 'step1', contact });
await send('reintent', { id, stage: 'step1', contact });
await send('final   ', { id, stage: 'complete', contact, profiling: { hasBoat: 'si', enthusiasm: ['noise', 'other'], enthusiasmOther: '+34 prova' } });
await send('tardà   ', { id, stage: 'step1', contact });
await send('invàlid ', { id, stage: 'step1', contact: { ...contact, privacy: false } });
console.log(`Mira el full: ha d'haver-hi UNA fila amb id ${id}, stage complete, i el nom ha de ser text («=HYPERLINK…»), no un enllaç.`);
```

`docs/google-sheet.md` (guia, en català), amb aquests passos exactes:
1. **Propietari:** Bruno decideix el compte de Google que serà el propietari del full (dades personals; compartir-lo només amb l'equip).
2. **Full:** crear un Google Sheet buit (el nom és igual); l'script crea la pestanya `Leads` i la capçalera sol.
3. **Script:** al full, *Extensions → Apps Script*; esborrar el que hi ha i enganxar sencer el contingut d'`apps-script/Code.gs`; desar.
4. **Token (opcional):** *Project Settings → Script properties → Add*: `TOKEN` = un valor llarg i aleatori.
5. **Desplegar:** *Deploy → New deployment → Web app*; *Execute as: Me*; *Who has access: Anyone*; autoritzar els permisos (accés al full); copiar la URL que acaba en `/exec`.
6. **Configurar el web:** a `site/js/config.js`, `leadEndpoint` = la URL i `leadToken` = el token (si n'has posat).
7. **Prova de fum:** `node scripts/smoke-sheet.mjs <url> [token]`; comprovar al full una sola fila, `stage` `complete`, i el nom com a text i no com a fórmula.
8. **Prova real:** `npm run serve`, fer el flux a `?extra1=1` i veure la fila al full; tallar la xarxa (DevTools → Offline) abans d'enviar el pas 1 i comprovar que arriba en tornar-la.
9. **Actualitzar l'script més endavant:** *Deploy → Manage deployments → editar → Version: New version* (la URL no canvia).
10. **Operació:** esborrar una fila a mà si un visitant ho demana; el full no té caducitat automàtica (retenció: a decidir amb Bruno).

A `README.md`, a la secció de l'Extra 1, afegir un punt «Enviament al full de Google» que enllaci `docs/google-sheet.md` i digui que sense `leadEndpoint` no s'envia res.

- [ ] **Step 4: Veure'ls passar la suite sencera**

Run: `npm run texts && npm test 2>&1 | grep -E "^# (pass|fail)|^not ok"` → Expected: `# fail 0`. Si `html` es queixa d'un `modulepreload`, afegir-lo.

- [ ] **Step 5: Comprovar que l'app carrega**

Run: `npm run serve` (en segon pla) i obrir `http://localhost:8080/?lang=es&extra1=1`; la consola no ha de mostrar errors, i a `Network` no ha d'haver-hi cap petició a fora (no hi ha `leadEndpoint`). Fer el flux sencer i confirmar que continua funcionant igual.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: connecta l'enviament al full de Google (apagat per defecte), privacitat i guia de configuració" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

### Task 5: Posada en marxa i prova real (manual, amb l'Olga o Bruno)

**Files:** cap de codi (només `site/js/config.js` amb la URL real quan hi sigui).

Aquesta tasca no la pot fer un agent sol: necessita un compte de Google i autoritzar permisos.

- [ ] **Step 1:** Seguir `docs/google-sheet.md` fins al pas 6. Es recomana fer-ho primer amb un full de prova de l'Olga; el full definitiu és de Bruno.
- [ ] **Step 2:** `node scripts/smoke-sheet.mjs <url> [token]`.
Expected: `GET {"ok":true}`; `parcial` → `{"ok":true,"result":"created"}`; `reintent` → `updated`; `final` → `updated`; `tardà` → `ignored`; `invàlid` → `{"ok":false,"error":"invalid"}`. Al full, **una** fila amb `stage = complete`, el nom com a text literal (`=HYPERLINK(…)` visible, sense enllaç) i `+34 prova` com a text. **Si la resposta del `POST` no es pot llegir des del navegador (error de CORS a la consola), el client la tractarà com a reintent i enviarà dades repetides (inofensiu: l'upsert per id ho absorbeix) però mai en marcarà cap com a enviada; en aquest cas cal canviar el `fetch` de `sender.js` a `mode: 'no-cors'` i donar per enviat qualsevol `fetch` que no llanci** (documentar-ho com a ruling).
- [ ] **Step 3:** Prova real al navegador (pas 8 de la guia), amb i sense xarxa.
- [ ] **Step 4:** Prova en un mòbil real a la xarxa local o amb la pàgina publicada: fer el flux i veure la fila. Provar també amb dades mòbils fluixes o en mode avió: omplir el pas 1, desconnectar, continuar, reconnectar.
- [ ] **Step 5:** Commit de `config.js` amb la URL (el token no es puja si Bruno prefereix no exposar-lo al repositori públic; recordar que igualment és visible al web publicat).

```bash
git add site/js/config.js
git commit -m "chore: URL de l'script de Google a la configuració" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

## Decisions i dades pendents

| Tema | Estat | Qui |
|---|---|---|
| Compte de Google propietari del full i qui hi té accés | Pendent | Bruno |
| Retenció de dades i procediment d'esborrat | Pendent | Bruno |
| Text de privacitat («Google (Hojas de cálculo)») | Esborrany | Bruno |
| URL `/exec` i token | Es generen a la Task 5 | Olga / Bruno |
| Correu automàtic amb el dossier | Fora d'abast (altre pla) | — |

## Self-review

- **Cobertura de l'especificació:** script de Google amb upsert per id, sense consentiment no es desa, no es degrada, text pla (Task 2) · càrregues útils (Task 1) · cua en memòria, reintents, recuperació de xarxa i beacon (Task 3) · interruptor `leadEndpoint`, privacitat, guia i prova de fum (Task 4) · posada en marxa i prova real (Task 5).
- **Placeholders:** cap; els valors pendents són dades a obtenir llistades a la taula.
- **Coherència de noms:** `partialPayload`, `finalPayload`, `createSender`, `connectSender`, `RETRY_MS`, `sanitizeLead`, `upsertLead`, `ensureHeader`, `leadEndpoint`, `leadToken` coincideixen entre tasques i tests.
- **Risc declarat:** el CORS de la resposta de l'Apps Script es verifica a la Task 5; hi ha el pla B (`no-cors`) documentat.
