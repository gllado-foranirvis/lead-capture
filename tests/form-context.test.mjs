import test from 'node:test';
import assert from 'node:assert/strict';
import { isExtra1Enabled, legalQuery, resolveOrigin, resolveProduct } from '../site/js/form/context.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];

test('l\'interruptor: config o ?extra1=1', () => {
  assert.equal(isExtra1Enabled({ extra1: false }, ''), false);
  assert.equal(isExtra1Enabled({ extra1: false }, '?extra1=1'), true);
  assert.equal(isExtra1Enabled({ extra1: true }, ''), true);
});
test('origen: mòbil per defecte, tauleta amb ?o=tauleta', () => {
  assert.equal(resolveOrigin(''), 'mobil');
  assert.equal(resolveOrigin('?o=tauleta'), 'tauleta');
  assert.equal(resolveOrigin('?o=altre'), 'mobil');
});
test('?producto= vàlid, «asesoramiento» vàlid i desconegut ignorat', () => {
  assert.equal(resolveProduct('?producto=model-a', PRODUCTS), 'model-a');
  assert.equal(resolveProduct('?producto=asesoramiento', PRODUCTS), 'asesoramiento');
  assert.equal(resolveProduct('?producto=inventat', PRODUCTS), '');
  assert.equal(resolveProduct('', PRODUCTS), '');
});
test('la query legal conserva l\'idioma i, amb Extra 1, el paràmetre', () => {
  assert.equal(legalQuery('ca', false), '?lang=ca');
  assert.equal(legalQuery('ca', true), '?lang=ca&extra1=1');
});
