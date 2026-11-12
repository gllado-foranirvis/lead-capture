import test from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_ORDER, clearError, firstErrorField, validateContact, validateProfile } from '../site/js/form/validate.js';

const ok1 = { name: 'Ana', email: 'ana@example.com', phonePrefix: '+34', phone: '600 00 00 00', privacy: true };

test('nom i privacitat obligatoris; sense correu ni telèfon, un sol error «either» al correu', () => {
  assert.deepEqual(validateContact({}), { name: 'required', email: 'either', privacy: 'privacy' });
  assert.deepEqual(validateContact(ok1), {});
});
test('només telèfon vàlid: sense errors; el prefix invàlid no es valida sense telèfon', () => {
  const phoneOnly = { ...ok1, email: '', phonePrefix: '+351', phone: '912 345 678' };
  assert.deepEqual(validateContact(phoneOnly), {});
  assert.deepEqual(validateContact({ ...ok1, phone: '', phonePrefix: 'abc' }), {});
});
test('només correu vàlid: sense errors', () => {
  assert.deepEqual(validateContact({ ...ok1, phone: '' }), {});
});
test('telèfon omplert amb prefix invàlid: error de prefix', () => {
  assert.equal(validateContact({ ...ok1, phonePrefix: 'abc' }).phonePrefix, 'prefix');
});
test('correu: formes vàlides', () => {
  for (const email of ['ana@example.com', 'a@sub.example.co.uk', ' ana@example.com '])
    assert.equal(validateContact({ ...ok1, email }).email, undefined, email);
});
test('correu: formes invàlides (inclou «a@.b.co» i «a@b..co»)', () => {
  for (const email of ['ana', 'a@b', 'a@b.c', 'a@.b.co', 'a@b..co', 'a b@c.com'])
    assert.equal(validateContact({ ...ok1, email }).email, 'email', email);
});
test('prefix: amb o sense «+», d\'1 a 3 xifres; res més', () => {
  for (const phonePrefix of ['+34', '34', '+351', ' +1 ']) assert.equal(validateContact({ ...ok1, phonePrefix }).phonePrefix, undefined, phonePrefix);
  for (const phonePrefix of ['', '+', '+3456', 'abc', '+34a', undefined]) assert.equal(validateContact({ ...ok1, phonePrefix }).phonePrefix, 'prefix', String(phonePrefix));
});
test('telèfon (només el número): formes vàlides i invàlides; el «+» ja no hi cap', () => {
  for (const phone of ['600 00 00 00', '600123456', '(93) 123-45-67'])
    assert.equal(validateContact({ ...ok1, phone }).phone, undefined, phone);
  for (const phone of ['abc', '12', '600+123456', '+34 600 00 00 00', '1'.repeat(16)])
    assert.equal(validateContact({ ...ok1, phone }).phone, 'phone', phone);
});
test('la privacitat només val si és exactament true', () => {
  assert.equal(validateContact({ ...ok1, privacy: 'true' }).privacy, 'privacy');
});
test('FIELD_ORDER segueix el formulari i validateContact només en dona errors', () => {
  assert.deepEqual(FIELD_ORDER, ['name', 'email', 'phonePrefix', 'phone', 'privacy', 'profile']);
  assert.deepEqual(Object.keys(validateContact({})).sort(), ['email', 'name', 'privacy']);
  assert.equal(Object.hasOwn(validateContact({}), 'profile'), false);
});
test('firstErrorField segueix l\'ordre del flux; clearError treu un sol camp', () => {
  assert.equal(firstErrorField({ phone: 'phone', email: 'email' }), 'email');
  assert.equal(firstErrorField({}), undefined);
  assert.deepEqual(clearError({ email: 'x', name: 'y' }, 'email'), { name: 'y' });
});
test('perfilació: només el perfil és obligatori', () => {
  assert.deepEqual(validateProfile({}), { profile: 'profileRequired' });
  assert.deepEqual(validateProfile({ profile: 'x' }), { profile: 'profileRequired' });
  assert.deepEqual(validateProfile({ profile: 'particular' }), {});
  assert.deepEqual(validateProfile({ profile: 'profesional' }), {});
});
