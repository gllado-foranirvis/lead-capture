import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { normalizeNumber } from '../site/js/messages.js';

test('el número de WhatsApp de config és un número internacional vàlid', () => {
  assert.match(normalizeNumber(CONFIG.whatsappNumber), /^\d{9,15}$/);
});
test('el correu de config té forma de correu', () => {
  assert.match(CONFIG.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
});
test('siteUrl és https i acaba en barra', () => {
  assert.match(CONFIG.siteUrl, /^https:\/\/.+\/$/);
});
test('idioma per defecte és un dels idiomes disponibles', () => {
  assert.ok(CONFIG.languages.includes(CONFIG.defaultLang));
});
test('productes de config: els 7 de la fira, amb ids únics i nom', () => {
  assert.deepEqual(CONFIG.products.map((p) => p.id), ['boatee', 'ez-raft', 'jetwave', 'momentum', 'seanxt', 'sifly', 'tko']);
  assert.deepEqual(CONFIG.products.map((p) => p.name), ['Boatee', 'EZ Raft', 'Jetwave', 'Momentum', 'SeaNXT', 'Sifly', 'TKO']);
});
test('legalName és present (de prova fins que Bruno el doni)', () => {
  assert.ok(CONFIG.legalName.trim().length > 0);
});

const pdfMaps = () => [...(CONFIG.brandPdf ? [['brandPdf', CONFIG.brandPdf]] : []), ...CONFIG.products.map((p) => [p.id, p.pdf])];
test('cada PDF configurat és una ruta relativa a un PDF que existeix a site/, i cada mapa té l\'anglès', async () => {
  const { existsSync, readFileSync } = await import('node:fs');
  assert.equal(CONFIG.emailDelivery, false);
  for (const [owner, map] of pdfMaps()) {
    assert.ok(map?.en, `${owner}: falta el PDF en anglès`);
    for (const [lang, url] of Object.entries(map)) {
      assert.ok(CONFIG.languages.includes(lang), `${owner}: idioma ${lang} desconegut`);
      assert.doesNotMatch(url, /^[a-z]+:|^\/|\.\./i, `${url}: ha de ser una ruta relativa dins de site/`);
      assert.match(url.split('/').pop(), /^[a-z0-9][a-z0-9._-]*\.pdf$/, url);
      assert.ok(existsSync(`site/${url}`), `${url} no existeix a site/`);
      const pdf = readFileSync(`site/${url}`, 'latin1');
      assert.ok(pdf.startsWith('%PDF-') && pdf.trimEnd().endsWith('%%EOF'), `${url} no és un PDF`);
    }
  }
});
test('ja no hi ha dossierUrl ni dossierFileName, ni al general ni als productes', () => {
  for (const owner of [CONFIG, ...CONFIG.products]) for (const key of ['dossierUrl', 'dossierFileName']) assert.equal(Object.hasOwn(owner, key), false, key);
});
test('Enertech 2026: nom de la fira, idiomes PT/EN/ES/CA amb el portuguès per defecte i dossier actiu', () => {
  assert.equal(CONFIG.fair, 'Enertech 2026');
  assert.deepEqual(CONFIG.languages, ['pt', 'en', 'es', 'ca']);
  assert.equal(CONFIG.defaultLang, 'pt');
  assert.equal(CONFIG.dossier, true);
});
test('l\'enviament al full: buit (apagat) o una URL /exec de Google; el token és un text', () => {
  assert.match(CONFIG.leadEndpoint, /^(|https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec)$/);
  assert.equal(typeof CONFIG.leadToken, 'string');
  if (CONFIG.leadToken) assert.ok(CONFIG.leadEndpoint, 'un token sense URL no té sentit');
});
