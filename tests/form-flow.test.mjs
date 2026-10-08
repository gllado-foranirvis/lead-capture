import test from 'node:test';
import assert from 'node:assert/strict';
import { handleSubmit } from '../site/js/form/flow.js';
import { emptyForm } from '../site/js/form/model.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const valid = { ...emptyForm({ product: 'model-a', profile: 'particular' }), name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00', privacy: true };

const harness = (search = '?producto=model-a&o=tauleta') => {
  const calls = [];
  const rec = (name) => (...args) => calls.push([name, ...args]);
  return {
    calls,
    deps: {
      products: PRODUCTS, search, lang: 'es', newId: () => 'id-1',
      dispatch: rec('dispatch'), setErrors: rec('setErrors'), bumpAttempt: rec('bumpAttempt'),
      clearEntryProfile: rec('clearEntryProfile'), emitLead: rec('emitLead'), goTo: rec('goTo'),
    },
  };
};
const names = (calls) => calls.map((c) => c[0]);

test('un enviament vàlid emet el lead i deixa el formulari net per al següent visitant', () => {
  const { calls, deps } = harness();
  assert.equal(handleSubmit(valid, deps), true);
  const emit = calls.find((c) => c[0] === 'emitLead')[1];
  assert.deepEqual([emit.contact.id, emit.contact.origin, emit.contact.lang], ['id-1', 'tauleta', 'es']);
  assert.deepEqual(calls.find((c) => c[0] === 'dispatch')[1], { type: 'reset', initial: { product: 'model-a' } });
  assert.deepEqual(calls.find((c) => c[0] === 'setErrors')[1], {});
  assert.ok(names(calls).includes('clearEntryProfile'), 'també s\'esborra el perfil triat a l\'entrada');
  assert.deepEqual(calls.find((c) => c[0] === 'goTo')[1], 'pending');
});
test('un enviament vàlid només emet un lead', () => {
  const { calls, deps } = harness();
  handleSubmit(valid, deps);
  assert.equal(names(calls).filter((n) => n === 'emitLead').length, 1);
});
test('el reinici torna a preseleccionar el producte de la URL, o cap si no n\'hi ha', () => {
  const withProduct = harness('?producto=model-a');
  handleSubmit(valid, withProduct.deps);
  assert.equal(withProduct.calls.find((c) => c[0] === 'dispatch')[1].initial.product, 'model-a');
  const without = harness('');
  handleSubmit(valid, without.deps);
  assert.equal(without.calls.find((c) => c[0] === 'dispatch')[1].initial.product, '');
});
test('amb errors no emet res, no esborra el formulari i demana el focus', () => {
  const { calls, deps } = harness();
  assert.equal(handleSubmit(emptyForm(), deps), false);
  assert.deepEqual(names(calls), ['setErrors', 'bumpAttempt']);
  assert.ok(calls[0][1].name);
});
