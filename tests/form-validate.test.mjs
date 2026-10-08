import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FIELD_ORDER, STEP_FIELDS, clearError, firstErrorField, validateContact, validateStep1, validateStep2,
} from '../site/js/form/validate.js';

const ok1 = { name: 'Ana', email: 'ana@example.com', phonePrefix: '+34', phone: '600 00 00 00', privacy: true };
const ok2 = { profile: 'particular' };

test('pas 1: nom, correu, telèfon i privacitat són obligatoris', () => {
  assert.deepEqual(validateStep1({}), { name: 'required', email: 'required', phonePrefix: 'prefix', phone: 'required', privacy: 'privacy' });
  assert.deepEqual(validateStep1(ok1), {});
});
test('correu: formes vàlides', () => {
  for (const email of ['ana@example.com', 'a@sub.example.co.uk', ' ana@example.com '])
    assert.equal(validateStep1({ ...ok1, email }).email, undefined, email);
});
test('correu: formes invàlides (inclou «a@.b.co» i «a@b..co»)', () => {
  for (const email of ['ana', 'a@b', 'a@b.c', 'a@.b.co', 'a@b..co', 'a b@c.com'])
    assert.equal(validateStep1({ ...ok1, email }).email, 'email', email);
});
test('prefix: amb o sense «+», d\'1 a 3 xifres; res més', () => {
  for (const phonePrefix of ['+34', '34', '+351', ' +1 ']) assert.equal(validateStep1({ ...ok1, phonePrefix }).phonePrefix, undefined, phonePrefix);
  for (const phonePrefix of ['', '+', '+3456', 'abc', '+34a', undefined]) assert.equal(validateStep1({ ...ok1, phonePrefix }).phonePrefix, 'prefix', String(phonePrefix));
});
test('telèfon (només el número): formes vàlides i invàlides; el «+» ja no hi cap', () => {
  for (const phone of ['600 00 00 00', '600123456', '(93) 123-45-67'])
    assert.equal(validateStep1({ ...ok1, phone }).phone, undefined, phone);
  for (const phone of ['abc', '12', '600+123456', '+34 600 00 00 00', '1'.repeat(16)])
    assert.equal(validateStep1({ ...ok1, phone }).phone, 'phone', phone);
});
test('la privacitat només val si és exactament true', () => {
  assert.equal(validateStep1({ ...ok1, privacy: 'true' }).privacy, 'privacy');
});
test('pas 2: només el perfil és obligatori', () => {
  assert.deepEqual(validateStep2({}), { profile: 'profileRequired' });
  assert.deepEqual(validateStep2({ profile: 'inventat' }), { profile: 'profileRequired' });
  assert.deepEqual(validateStep2(ok2), {});
  assert.deepEqual(validateStep2({ ...ok2, activity: '', hasBoat: '', intent: '', product: '' }), {});
});
test('validateContact uneix els dos passos i FIELD_ORDER segueix el flux', () => {
  assert.deepEqual(validateContact({ ...ok1, ...ok2 }), {});
  assert.deepEqual(Object.keys(validateContact({})).sort(), [...FIELD_ORDER].sort());
  assert.deepEqual(FIELD_ORDER, [...STEP_FIELDS[1], ...STEP_FIELDS[2]]);
  assert.deepEqual(FIELD_ORDER, ['name', 'email', 'phonePrefix', 'phone', 'privacy', 'profile']);
});
test('firstErrorField segueix l\'ordre del flux; clearError treu un sol camp', () => {
  assert.equal(firstErrorField({ profile: 'profileRequired', email: 'email' }), 'email');
  assert.equal(firstErrorField({}), undefined);
  assert.deepEqual(clearError({ email: 'x', name: 'y' }, 'email'), { name: 'y' });
});
