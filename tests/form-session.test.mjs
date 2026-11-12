import test from 'node:test';
import assert from 'node:assert/strict';
import { toSession } from '../site/js/form/session.js';

const products = [{ id: 'sifly', name: 'Sifly' }, { id: 'tko', name: 'TKO' }];
const dict = { form: { productAdvice: 'No lo sé aún' } };

test('dades de la sessió: producte, ciutat i nom', () => {
  assert.deepEqual(toSession({ products: ['sifly'], city: ' Lisboa ', name: '  Ana ' }, { products, dict }), { product: 'Sifly', city: 'Lisboa', name: 'Ana' });
});
test('diversos productes: els noms triats separats per comes, ignorant els ids desconeguts', () => {
  assert.equal(toSession({ products: ['sifly', 'tko'] }, { products, dict }).product, 'Sifly, TKO');
  assert.equal(toSession({ products: ['sifly', 'x'] }, { products, dict }).product, 'Sifly');
  assert.equal(toSession({ products: ['asesoramiento'] }, { products, dict }).product, 'No lo sé aún');
  assert.equal(toSession({ products: [] }, { products, dict }).product, '');
});
test('valors absents queden buits i el nom i la ciutat es retallen', () => {
  assert.deepEqual(toSession({}, { products, dict }), { product: '', city: '', name: '' });
  assert.equal(Array.from(toSession({ name: 'a'.repeat(300) }, { products, dict }).name).length, 100);
  assert.equal(Array.from(toSession({ city: 'b'.repeat(300) }, { products, dict }).city).length, 80);
});
