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
