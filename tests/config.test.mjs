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
test('productes de config: ids únics i amb nom', () => {
  const ids = CONFIG.products.map((p) => p.id);
  assert.ok(CONFIG.products.length >= 2);
  assert.equal(new Set(ids).size, ids.length);
  for (const p of CONFIG.products) assert.ok(p.id.trim() && p.name.trim(), JSON.stringify(p));
});
test('legalName és present (de prova fins que Bruno el doni)', () => {
  assert.ok(CONFIG.legalName.trim().length > 0);
});

test('cada dossier configurat (general i per model) és una ruta relativa a un PDF que existeix a site/', async () => {
  const { existsSync, readFileSync } = await import('node:fs');
  assert.equal(CONFIG.emailDelivery, false);
  const urls = [CONFIG.dossierUrl, ...CONFIG.products.map((p) => p.dossierUrl).filter(Boolean)];
  assert.ok(CONFIG.dossierUrl, 'el document general és obligatori: és l\'alternativa de tots els models');
  for (const url of urls) {
    assert.doesNotMatch(url, /^[a-z]+:|^\/|\.\./i, `${url}: ha de ser una ruta relativa dins de site/`);
    assert.ok(existsSync(`site/${url}`), `${url} no existeix a site/`);
    const pdf = readFileSync(`site/${url}`, 'latin1');
    assert.ok(pdf.startsWith('%PDF-') && pdf.trimEnd().endsWith('%%EOF'), `${url} no és un PDF`);
  }
});
test('l\'enviament al full: buit (apagat) o una URL /exec de Google; el token és un text', () => {
  assert.match(CONFIG.leadEndpoint, /^(|https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec)$/);
  assert.equal(typeof CONFIG.leadToken, 'string');
  if (CONFIG.leadToken) assert.ok(CONFIG.leadEndpoint, 'un token sense URL no té sentit');
});
