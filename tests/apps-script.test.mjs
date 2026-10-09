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
