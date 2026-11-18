import test from 'node:test';
import assert from 'node:assert/strict';
import { toSession } from '../site/js/form/session.js';

const products = [{ id: 'sifly', name: 'Sifly' }, { id: 'tko', name: 'TKO' }];
const dict = { form: { productAdvice: 'No lo sé aún' } };

test('dades de la sessió: producte, ciutat i nom', () => {
  assert.deepEqual(toSession({ products: ['sifly'], city: ' Lisboa ', name: '  Ana ' }, { products, dict }), { product: 'Sifly', city: 'Lisboa', name: 'Ana', adviceNote: '' });
});
test('diversos productes: els noms triats separats per comes, ignorant els ids desconeguts', () => {
  assert.equal(toSession({ products: ['sifly', 'tko'] }, { products, dict }).product, 'Sifly, TKO');
  assert.equal(toSession({ products: ['sifly', 'x'] }, { products, dict }).product, 'Sifly');
  assert.equal(toSession({ products: ['asesoramiento'] }, { products, dict }).product, 'No lo sé aún');
  assert.equal(toSession({ products: [] }, { products, dict }).product, '');
});
test('valors absents queden buits i el nom i la ciutat es retallen', () => {
  assert.deepEqual(toSession({}, { products, dict }), { product: '', city: '', name: '', adviceNote: '' });
  assert.equal(Array.from(toSession({ name: 'a'.repeat(300) }, { products, dict }).name).length, 100);
  assert.equal(Array.from(toSession({ city: 'b'.repeat(300) }, { products, dict }).city).length, 80);
});
test('adviceNote: només amb «asesoramiento», retallat a 500', () => {
  const session = (values) => toSession(values, { products, dict }).adviceNote;
  assert.equal(session({ products: ['asesoramiento'], adviceNote: '  Vull una barca per a 6  ' }), 'Vull una barca per a 6');
  assert.equal(session({ products: ['sifly'], adviceNote: 'x' }), '');
  assert.equal(Array.from(session({ products: ['asesoramiento'], adviceNote: 'c'.repeat(600) })).length, 500);
});
