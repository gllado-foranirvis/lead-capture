import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { isExtra1Enabled, resolveOrigin, resolveProduct, profileFromEntry, legalQuery } from '../site/js/form/context.js';

test('Extra 1: apagat per defecte; es veu amb ?extra1=1 o amb la configuració', () => {
  assert.equal(CONFIG.extra1, false);
  assert.equal(isExtra1Enabled(CONFIG, ''), false);
  assert.equal(isExtra1Enabled(CONFIG, '?extra1=0'), false);
  assert.equal(isExtra1Enabled(CONFIG, '?extra1=1'), true);
  assert.equal(isExtra1Enabled({ ...CONFIG, extra1: true }, ''), true);
});
test('origen: només «tauleta» exacte canvia el valor per defecte', () => {
  assert.equal(resolveOrigin('?o=tauleta'), 'tauleta');
  for (const s of ['', '?o=', '?o=xx', '?o=TAULETA', '?o=__proto__']) assert.equal(resolveOrigin(s), 'mobil', s);
});
test('producte preseleccionat: només ids de la llista', () => {
  assert.equal(resolveProduct('?producto=model-b', CONFIG.products), 'model-b');
  for (const s of ['', '?producto=', '?producto=nope', '?producto=__proto__']) assert.equal(resolveProduct(s, CONFIG.products), '', s);
});
test('perfil de l\'entrada → perfil del formulari', () => {
  assert.equal(profileFromEntry('particular'), 'particular');
  assert.equal(profileFromEntry('distribuidor'), 'profesional');
  for (const v of ['', undefined, null, 'xx', '__proto__']) assert.equal(profileFromEntry(v), '', String(v));
});
test('legalQuery conserva l\'idioma i l\'interruptor', () => {
  assert.equal(legalQuery('ca', false), '?lang=ca');
  assert.equal(legalQuery('ca', true), '?lang=ca&extra1=1');
});
