// Script de Google lligat al full de càlcul de leads. Es copia sencer a l'editor d'Apps Script (vegeu docs/google-sheet.md).
// Rep un POST JSON { id, stage, contact?, click?, token? }: un lead fa un upsert per id al full «Leads» i un clic (stage «click») s'afegeix a «Clics».

var SHEET_NAME = 'Leads';
// Les columnes de perfilació (profile, activity… factorsOther, comments) s'omplen al pas 2 del formulari (o queden buides si el visitant el salta).
// «city» ocupa el lloc de l'antiga «demo» (la ciutat es demana a l'inici).
var COLUMNS = [
  'id', 'stage', 'createdAt', 'updatedAt', 'name', 'email', 'phone', 'profile', 'lang', 'origin', 'privacy', 'newsletter', 'product',
  'activity', 'activityOther', 'hasBoat', 'hasElectric', 'enthusiasm', 'enthusiasmOther', 'concerns', 'concernsOther',
  'intent', 'factors', 'factorsOther', 'city', 'comments'
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
var MAX = { name: 100, email: 254, phone: 30, city: 80, other: 120, comments: 500 };
// Pestanya dels clics a WhatsApp i correu: tot és anònim (cap nom, correu ni telèfon).
var CLICK_SHEET = 'Clics';
var CLICK_COLUMNS = [
  'id', 'day', 'time', 'at', 'button', 'from', 'lang', 'origin', 'visit', 'products', 'city',
  'device', 'os', 'browserLang', 'tz', 'screen', 'seconds', 'referrer'
];
var BUTTONS = ['whatsapp', 'email', 'download'];
var CLICK_FROM = ['entry', 'done'];
var DEVICES = ['mobile', 'tablet', 'desktop'];
var SYSTEMS = ['ios', 'android', 'other'];
var ID_FORMAT = /^[A-Za-z0-9-]{8,64}$/;
// Un o diversos ids de producte separats per comes (fins a 10); si el format no és vàlid, queda buit.
var PRODUCTS_FORMAT = /^[a-z0-9-]{1,40}(,[a-z0-9-]{1,40}){0,9}$/;

function clip(value, max) {
  return Array.from(String(value == null ? '' : value).trim()).slice(0, max).join('');
}

function oneOf(list, value) {
  return list.indexOf(value) === -1 ? '' : value;
}

function productsOf(value) {
  return PRODUCTS_FORMAT.test(String(value || '')) ? String(value) : '';
}

// Valida i normalitza la càrrega: retorna el lead net o null. Mai no accepta un lead sense consentiment.
function sanitizeLead(payload) {
  if (!payload || typeof payload !== 'object') return null;
  var id = String(payload.id || '');
  if (!ID_FORMAT.test(id)) return null;
  if (STAGES.indexOf(payload.stage) === -1) return null;
  var c = payload.contact;
  if (!c || typeof c !== 'object') return null;
  var name = clip(c.name, MAX.name);
  var email = clip(c.email, MAX.email).toLowerCase();
  var phone = clip(c.phone, MAX.phone);
  // Cal almenys un de telèfon o correu; el que hi sigui, ha de ser vàlid.
  if (!name || (!phone && !email) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) return null;
  if (c.privacy !== true) return null;
  if (LANGS.indexOf(c.lang) === -1 || ORIGINS.indexOf(c.origin) === -1) return null;
  var lead = {
    id: id, stage: payload.stage, name: name, email: email, phone: phone,
    privacy: true, newsletter: c.newsletter === true, lang: c.lang, origin: c.origin,
    product: productsOf(c.product), city: clip(c.city, MAX.city)
  };
  // La perfilació només arriba a l'etapa «complete»; saltar-la deixa aquests camps buits.
  var p = payload.stage === 'complete' && payload.profiling && typeof payload.profiling === 'object' ? payload.profiling : {};
  lead.profile = oneOf(PROFILES, p.profile);
  lead.activity = oneOf(ACTIVITIES, p.activity);
  lead.activityOther = lead.activity === 'otra' ? clip(p.activityOther, MAX.other) : '';
  lead.hasBoat = oneOf(YES_NO, p.hasBoat);
  lead.hasElectric = oneOf(YES_NO, p.hasElectric);
  lead.intent = oneOf(YES_NO, p.intent);
  lead.comments = clip(p.comments, MAX.comments);
  Object.keys(OPINION).forEach(function (group) {
    var sent = Array.isArray(p[group]) ? p[group] : [];
    var chosen = OPINION[group].filter(function (option) { return sent.indexOf(option) > -1; });
    lead[group] = chosen.join(', ');
    lead[group + 'Other'] = chosen.indexOf('other') > -1 ? clip(p[group + 'Other'], MAX.other) : '';
  });
  return lead;
}

// Valida i normalitza un clic: l'id, el botó, el lloc, l'idioma i l'origen són obligatoris; la resta, opcional (si no encaixa, queda buit).
function sanitizeClick(payload) {
  if (!payload || typeof payload !== 'object' || payload.stage !== 'click') return null;
  var id = String(payload.id || '');
  var c = payload.click;
  if (!ID_FORMAT.test(id) || !c || typeof c !== 'object') return null;
  var click = {
    id: id, button: oneOf(BUTTONS, c.button), from: oneOf(CLICK_FROM, c.from), lang: oneOf(LANGS, c.lang), origin: oneOf(ORIGINS, c.origin)
  };
  if (!click.button || !click.from || !click.lang || !click.origin) return null;
  var seconds = Number(c.seconds);
  click.visit = ID_FORMAT.test(String(c.visit || '')) ? String(c.visit) : '';
  click.products = productsOf(c.products);
  click.city = clip(c.city, MAX.city);
  click.device = oneOf(DEVICES, c.device);
  click.os = oneOf(SYSTEMS, c.os);
  click.browserLang = clip(c.browserLang, 15);
  click.tz = clip(c.tz, 40);
  click.screen = /^\d{2,5}x\d{2,5}$/.test(String(c.screen)) ? String(c.screen) : '';
  click.seconds = c.seconds !== '' && c.seconds != null && isFinite(seconds) && seconds >= 0 && seconds <= 86400 ? Math.round(seconds) : '';
  click.referrer = clip(c.referrer, 80);
  return click;
}

// Escriu la capçalera de la pestanya si falta o ha canviat (p. ex. «demo» → «city»); un full nou també es formata com a text pla.
function ensureHeader(sheet, columns) {
  var first = sheet.getRange(1, 1, 1, columns.length).getValues()[0];
  if (first.join('|') === columns.join('|')) return;
  if (String(first[0]) !== columns[0]) {
    // Format de text pla: un valor que comenci per «=», «+» o «@» no s'executa com a fórmula.
    sheet.getRange(1, 1, sheet.getMaxRows(), columns.length).setNumberFormat('@');
    sheet.setFrozenRows(1);
  }
  sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
}

// setValues executa com a fórmula qualsevol text que comenci per «=», encara que la cel·la tingui format de text, i en
// exportar a CSV o Excel el format de text es perd: l'apòstrof inicial ho evita per a «=», «+», «-», «@», tabulador i retorn.
// El telèfon comença per «+» per disseny (ja el valida el web i l'script) i queda tal qual.
var FORMULA_START = /^[=+\-@\t\r]/;
function asText(value, column) {
  return column !== 'phone' && typeof value === 'string' && FORMULA_START.test(value) ? "'" + value : value;
}

function rowFor(lead, current, now) {
  return COLUMNS.map(function (column, i) {
    if (column === 'createdAt') return current ? current[i] : now;
    if (column === 'updatedAt') return now;
    if (column === 'privacy' || column === 'newsletter') return lead[column] ? 'si' : 'no';
    return asText(lead[column] === undefined ? '' : lead[column], column);
  });
}

// Cada fila es formata com a text abans d'escriure-hi: així la protecció contra fórmules no depèn de quan es va crear el full.
function writeRow(sheet, rowNumber, values) {
  var range = sheet.getRange(rowNumber, 1, 1, values.length);
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

// Una fila per clic (identificada pel seu id: un reintent no la duplica). El dia i l'hora són els de la zona horària del full.
function recordClick(book, click, now) {
  var sheet = book.getSheetByName(CLICK_SHEET) || book.insertSheet(CLICK_SHEET);
  ensureHeader(sheet, CLICK_COLUMNS);
  var last = sheet.getLastRow();
  var ids = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues() : [];
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === click.id) return 'ignored';
  }
  var zone = book.getSpreadsheetTimeZone();
  var values = CLICK_COLUMNS.map(function (column) {
    if (column === 'day') return Utilities.formatDate(now, zone, 'yyyy-MM-dd');
    if (column === 'time') return Utilities.formatDate(now, zone, 'HH:mm:ss');
    if (column === 'at') return now.toISOString();
    return asText(click[column] === undefined ? '' : click[column], column);
  });
  if (last + 1 > sheet.getMaxRows()) sheet.insertRowsAfter(sheet.getMaxRows(), 500);
  writeRow(sheet, last + 1, values);
  return 'created';
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
  var isClick = !!payload && payload.stage === 'click';
  var record = isClick ? sanitizeClick(payload) : sanitizeLead(payload);
  if (!record) return reply({ ok: false, error: 'invalid' });
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var book = SpreadsheetApp.getActiveSpreadsheet();
    if (isClick) return reply({ ok: true, result: recordClick(book, record, new Date()) });
    var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
    ensureHeader(sheet, COLUMNS);
    return reply({ ok: true, result: upsertLead(sheet, record, new Date().toISOString()) });
  } catch (error) {
    return reply({ ok: false, error: 'error' });
  } finally {
    try { lock.releaseLock(); } catch (releaseError) { /* sense bloqueig adquirit */ }
  }
}
