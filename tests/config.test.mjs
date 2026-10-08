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
