import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page = readFileSync('site/css/page.css', 'utf8');
const tokens = readFileSync('site/ds/tokens.css', 'utf8');
const defined = new Set([...tokens.matchAll(/(--[a-z0-9-]+):/g)].map((m) => m[1]));

test('page.css: sense colors literals ni xarxa', () => {
  assert.doesNotMatch(page, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(page, /@import|https?:/);
});
test('page.css: només variables que existeixen als tokens', () => {
  const used = [...page.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(used.filter((v) => !defined.has(v)))], []);
});
test('page.css: el select (idioma) té l\'anell de focus del sistema', () => {
  assert.match(page, /select:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--focus\)/);
});
test('page.css: controls natius segons el tema i selecció de text amb la paleta', () => {
  assert.match(page, /\[data-theme="light"\]\s*\{[^}]*color-scheme:\s*light/);
  assert.match(page, /\[data-theme="dark"\]\s*\{[^}]*color-scheme:\s*dark/);
  assert.match(page, /::selection\s*\{[^}]*background:\s*var\(--/);
});
test('page.css: els xips de dues línies tenen aire vertical i tots dos xips fan la mateixa alçada', () => {
  assert.match(page, /\.tsf-chip__label\s*\{[^}]*padding-block:\s*var\(--space-2\)/);
  assert.match(page, /\.tsf-chip\s*\{[^}]*display:\s*flex/);
  assert.match(page, /\.tsf-chip__label\s*\{[^}]*flex:\s*1/);
});
test('page.css: mobile first, sense alçades fixes ni nowrap', () => {
  assert.doesNotMatch(page, /@media[^{]*max-width/);
  assert.doesNotMatch(page, /white-space:\s*nowrap/);
  assert.doesNotMatch(page, /(^|[^-])height:\s*\d+px/m);
});
