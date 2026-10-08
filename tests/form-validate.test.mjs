import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FIELD_ORDER, STEP_FIELDS, clearError, firstErrorField, validateContact, validateStep1, validateStep2,
} from '../site/js/form/validate.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const ok1 = { product: 'model-a', email: 'ana@example.com' };
const ok2 = { name: 'Ana', profile: 'particular', phone: '+34 600 00 00 00', privacy: true };

test('pas 1: producte i correu són obligatoris', () => {
  assert.deepEqual(validateStep1({}, PRODUCTS), { product: 'productRequired', email: 'required' });
  assert.deepEqual(validateStep1(ok1, PRODUCTS), {});
});
test('pas 1: «asesoramiento» és una opció vàlida; un producte inventat no', () => {
  assert.deepEqual(validateStep1({ ...ok1, product: 'asesoramiento' }, PRODUCTS), {});
  assert.equal(validateStep1({ ...ok1, product: 'inventat' }, PRODUCTS).product, 'productRequired');
});
test('correu: formes vàlides', () => {
  for (const email of ['ana@example.com', 'a@sub.example.co.uk', ' ana@example.com '])
    assert.equal(validateStep1({ ...ok1, email }, PRODUCTS).email, undefined, email);
});
test('correu: formes invàlides (inclou «a@.b.co» i «a@b..co»)', () => {
  for (const email of ['ana', 'a@b', 'a@b.c', 'a@.b.co', 'a@b..co', 'a b@c.com'])
    assert.equal(validateStep1({ ...ok1, email }, PRODUCTS).email, 'email', email);
});
test('pas 2: nom, perfil, telèfon i privacitat són obligatoris', () => {
  assert.deepEqual(validateStep2({}), { name: 'required', profile: 'profileRequired', phone: 'required', privacy: 'privacy' });
  assert.deepEqual(validateStep2(ok2), {});
});
test('telèfon: formes vàlides i invàlides (el «+» només al principi)', () => {
  for (const phone of ['+34 600 00 00 00', '600123456', '(93) 123-45-67'])
    assert.equal(validateStep2({ ...ok2, phone }).phone, undefined, phone);
  for (const phone of ['abc', '12345', '600+123456', '1'.repeat(16)])
    assert.equal(validateStep2({ ...ok2, phone }).phone, 'phone', phone);
});
test('la privacitat només val si és exactament true', () => {
  assert.equal(validateStep2({ ...ok2, privacy: 'true' }).privacy, 'privacy');
});
test('validateContact uneix els dos passos', () => {
  assert.deepEqual(validateContact({ ...ok1, ...ok2 }, PRODUCTS), {});
  assert.deepEqual(Object.keys(validateContact({}, PRODUCTS)).sort(), [...FIELD_ORDER].sort());
  assert.deepEqual(FIELD_ORDER, [...STEP_FIELDS[1], ...STEP_FIELDS[2]]);
});
test('firstErrorField segueix l\'ordre del flux; clearError treu un sol camp', () => {
  assert.equal(firstErrorField({ privacy: 'privacy', email: 'email' }), 'email');
  assert.equal(firstErrorField({}), undefined);
  assert.deepEqual(clearError({ email: 'x', name: 'y' }, 'email'), { name: 'y' });
});
