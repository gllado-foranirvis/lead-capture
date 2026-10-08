import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVICE, MAX, PROFILES, clip, emptyForm, formReducer } from '../site/js/form/model.js';

test('formulari buit: només els camps del flux de 2 passos, tot net', () => {
  assert.deepEqual(emptyForm(), {
    product: '', email: '', name: '', profile: '', phone: '', hasBoat: '', privacy: false, newsletter: false,
  });
});
test('emptyForm accepta el producte inicial', () => {
  assert.equal(emptyForm({ product: 'model-a' }).product, 'model-a');
});
test('constants del flux', () => {
  assert.deepEqual(PROFILES, ['particular', 'profesional']);
  assert.equal(ADVICE, 'asesoramiento');
  assert.deepEqual(MAX, { name: 100, email: 254, phone: 30 });
});
test('set canvia un camp existent i ignora els desconeguts (com la perfilació antiga)', () => {
  const s = emptyForm();
  assert.equal(formReducer(s, { type: 'set', field: 'name', value: 'Ana' }).name, 'Ana');
  assert.equal(formReducer(s, { type: 'set', field: 'activity', value: 'ocio' }), s);
});
test('reset torna al formulari buit amb el producte inicial', () => {
  const dirty = { ...emptyForm(), name: 'Ana', privacy: true };
  assert.deepEqual(formReducer(dirty, { type: 'reset', initial: { product: 'model-a' } }), emptyForm({ product: 'model-a' }));
});
test('clip retalla i no trenca un emoji', () => {
  assert.equal(clip('  hola  ', 10), 'hola');
  assert.equal(clip(undefined, 5), '');
  const cut = clip('😀'.repeat(150), 100);
  assert.equal(Array.from(cut).length, 100);
  assert.doesNotMatch(cut, /[\ud800-\udbff](?![\udc00-\udfff])/);
});
