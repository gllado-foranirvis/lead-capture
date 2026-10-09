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

// setValues executa com a fórmula qualsevol text que comenci per «=», encara que la cel·la tingui format de text:
// l'apòstrof inicial el converteix en text. («+» i «@» ja queden com a text gràcies al format de la columna.)
function asText(value) {
  return typeof value === 'string' && value.charAt(0) === '=' ? "'" + value : value;
}

function rowFor(lead, current, now) {
  return COLUMNS.map(function (column, i) {
    if (column === 'createdAt') return current ? current[i] : now;
    if (column === 'updatedAt') return now;
    if (column === 'privacy' || column === 'newsletter') return lead[column] ? 'si' : 'no';
    return asText(lead[column] === undefined ? '' : lead[column]);
  });
}

// Cada fila es formata com a text abans d'escriure-hi: així la protecció contra fórmules no depèn de quan es va crear el full.
function writeRow(sheet, rowNumber, values) {
  var range = sheet.getRange(rowNumber, 1, 1, COLUMNS.length);
  range.setNumberFormat('@');
  range.setValues([values]);
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
    // Un full nou té 1000 files: quan s'omple, l'ampliem (getRange fora de la quadrícula falla).
    if (last + 1 > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 500);
    writeRow(sheet, last + 1, rowFor(lead, null, now));
    return 'created';
  }
  var rowNumber = index + 2;
  var current = sheet.getRange(rowNumber, 1, 1, COLUMNS.length).getValues()[0];
  if (current[COLUMNS.indexOf('stage')] === 'complete' && lead.stage === 'step1') return 'ignored';
  writeRow(sheet, rowNumber, rowFor(lead, current, now));
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
  // «token» (no «invalid»): el client el reintenta, perquè un token mal configurat no ha de fer perdre leads en silenci.
  if (token && (!payload || payload.token !== token)) return reply({ ok: false, error: 'token' });
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
