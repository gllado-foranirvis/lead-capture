import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderTexts } from '../scripts/export-texts.mjs';
import { DICT } from '../site/js/i18n.js';
import { CONFIG } from '../site/js/config.js';

const doc = readFileSync('docs/textos-contacte.md', 'utf8');

test('docs/textos-contacte.md és fresc respecte a i18n.js', () => {
  assert.equal(doc, renderTexts(DICT, CONFIG), 'els textos han canviat: executa node scripts/export-texts.mjs');
});
test('el document té una fila per idioma × perfil × via (24)', () => {
  const rows = doc.split('\n').filter((l) => /^\| (Cap|Distribuïdor|Particular) \| (WhatsApp|Correu) \|/.test(l));
  assert.equal(rows.length, 24);
});
