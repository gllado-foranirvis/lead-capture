import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, firstErrorField, clearError, FIELD_ORDER } from '../site/js/form/validate.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const valid = { product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00', profile: 'particular', privacy: true };
const errorsFor = (patch) => validateContact({ ...valid, ...patch }, PRODUCTS);

test('un formulari complet no té errors', () => {
  assert.deepEqual(errorsFor({}), {});
});
test('buit: cada camp obligatori dona el seu codi', () => {
  const errors = validateContact({ product: '', name: '', email: '', phone: '', profile: '', privacy: false }, PRODUCTS);
  assert.deepEqual(errors, { product: 'productRequired', name: 'required', email: 'required', phone: 'required', profile: 'profileRequired', privacy: 'privacy' });
});
test('espais sols compten com a buit', () => {
  assert.equal(errorsFor({ name: '   ' }).name, 'required');
});
test('correu: formes vàlides i invàlides', () => {
  for (const ok of ['ana@example.com', 'a.b+c@sub.example.org']) assert.equal(errorsFor({ email: ok }).email, undefined, ok);
  for (const bad of ['ana@', 'ana@x', 'a b@c.com', 'ana.example.com', '@example.com']) assert.equal(errorsFor({ email: bad }).email, 'email', bad);
});
test('telèfon: formats reals valen; lletres, massa curt o massa llarg no', () => {
  for (const ok of ['+34 600 00 00 00', '600-000-000', '(+351) 934 065 356', '0034 600000000']) assert.equal(errorsFor({ phone: ok }).phone, undefined, ok);
  for (const bad of ['abc', '12345', '1234567890123456', '+34 600 00 00 00 ext 5']) assert.equal(errorsFor({ phone: bad }).phone, 'phone', bad);
});
test('producte: ha de ser de la llista', () => {
  assert.equal(errorsFor({ product: 'altre' }).product, 'productRequired');
  assert.equal(errorsFor({ product: '__proto__' }).product, 'productRequired');
});
test('perfil: només Particular o Profesional', () => {
  assert.equal(errorsFor({ profile: 'distribuidor' }).profile, 'profileRequired');
  assert.equal(errorsFor({ profile: 'profesional' }).profile, undefined);
});
test('privacitat: només el booleà true compta', () => {
  for (const bad of [false, 'true', 1, undefined]) assert.equal(errorsFor({ privacy: bad }).privacy, 'privacy', String(bad));
});
test('el primer error segueix l\'ordre visual de la pantalla', () => {
  assert.deepEqual(FIELD_ORDER, ['product', 'name', 'email', 'phone', 'profile', 'privacy']);
  assert.equal(firstErrorField({ phone: 'required', email: 'email' }), 'email');
  assert.equal(firstErrorField({}), undefined);
});
test('clearError treu només aquell camp i no muta l\'original', () => {
  const errors = { name: 'required', email: 'email' };
  assert.deepEqual(clearError(errors, 'name'), { email: 'email' });
  assert.deepEqual(errors, { name: 'required', email: 'email' });
});
