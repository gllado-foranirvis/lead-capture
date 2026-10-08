import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';

const ds = 'the-silent-fleet-ds';
test('tokens.css i bundle.js es copien idèntics', () => {
  for (const [from, to] of [['tokens.css', 'tokens.css'], ['components/bundle.js', 'bundle.js']])
    assert.equal(readFileSync(`site/ds/${to}`, 'utf8'), readFileSync(`${ds}/${from}`, 'utf8'), to);
});
test('bundle.css és el del DS sense l\'@import', () => {
  const src = readFileSync(`${ds}/components/bundle.css`, 'utf8');
  const out = readFileSync('site/ds/bundle.css', 'utf8');
  assert.doesNotMatch(out, /@import|googleapis/);
  assert.equal(out, src.replace(/^@import[^\n]*\n/m, ''));
});
test('React i Montserrat són locals', () => {
  for (const f of ['vendor/react.production.min.js', 'vendor/react-dom.production.min.js',
    ...[400, 500, 600, 700].map((w) => `fonts/montserrat-${w}.woff2`)])
    assert.ok(existsSync(`site/${f}`) && statSync(`site/${f}`).size > 1000, f);
});
test('fonts.css declara els 4 pesos locals', () => {
  const css = readFileSync('site/css/fonts.css', 'utf8');
  for (const w of [400, 500, 600, 700]) assert.match(css, new RegExp(`font-weight:\\s*${w}[^}]*montserrat-${w}\\.woff2`));
  assert.match(css, /font-display:\s*swap/);
  assert.doesNotMatch(css, /https?:/);
});
