import test from 'node:test';
import assert from 'node:assert/strict';
import { discardSession, handleSubmit, leaveToEntry } from '../site/js/form/flow.js';
import { emptyForm } from '../site/js/form/model.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const contact = { ...emptyForm({ products: ['model-a'] }), name: 'Ana', email: 'Ana@Example.com', phone: '600 00 00 00', privacy: true, newsletter: true };
const full = { ...contact, city: ' Lisboa ' };

const harness = (extra = {}, search = '?producto=model-a&o=tauleta') => {
  const calls = [];
  const rec = (name) => (...args) => calls.push([name, ...args]);
  return {
    calls,
    deps: {
      products: PRODUCTS, search, lang: 'es', leadId: '', newId: () => 'id-1',
      setLeadId: rec('setLeadId'), setErrors: rec('setErrors'), bumpAttempt: rec('bumpAttempt'), dispatch: rec('dispatch'),
      setReceipt: rec('setReceipt'), emitLead: rec('emitLead'), goTo: rec('goTo'),
      ...extra,
    },
  };
};
const names = (calls) => calls.map((c) => c[0]);
const call = (calls, name) => calls.find((c) => c[0] === name);

test('enviament final: emet el lead i neteja per al següent visitant', () => {
  const { calls, deps } = harness({ leadId: 'id-0' });
  assert.equal(handleSubmit(full, deps), true);
  assert.equal(names(calls).filter((n) => n === 'emitLead').length, 1);
  const lead = call(calls, 'emitLead')[1];
  assert.deepEqual([lead.contact.id, lead.contact.city, lead.contact.product], ['id-0', 'Lisboa', 'model-a']);
  assert.deepEqual(call(calls, 'setReceipt')[1], { products: ['model-a'], name: 'Ana', city: ' Lisboa ' });
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { products: ['model-a'] } });
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', '']);
  assert.deepEqual(call(calls, 'setErrors'), ['setErrors', {}]);
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'done']);
});
test('enviament final sense id previ en crea un', () => {
  const { calls, deps } = harness();
  handleSubmit(full, deps);
  assert.equal(call(calls, 'emitLead')[1].contact.id, 'id-1');
});
test('enviament final amb errors: es queda al pas 1 sense emetre cap lead', () => {
  const { calls, deps } = harness();
  assert.equal(handleSubmit({ ...contact, email: '' }, deps), false);
  assert.deepEqual(call(calls, 'setErrors')[1], { email: 'required' });
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step1']);
  assert.deepEqual(names(calls).filter((n) => n === 'emitLead' || n === 'bumpAttempt'), ['bumpAttempt']);
});
test('el reinici torna a preseleccionar el producte de la URL, o cap', () => {
  const withProduct = harness({}, '?producto=model-a');
  handleSubmit(full, withProduct.deps);
  assert.deepEqual(call(withProduct.calls, 'dispatch')[1].initial, { products: ['model-a'] });
  const without = harness({}, '');
  handleSubmit(full, without.deps);
  assert.deepEqual(call(without.calls, 'dispatch')[1].initial, { products: [] });
});

const leaveHarness = (search) => {
  const calls = [];
  const rec = (name) => (...args) => calls.push([name, ...args]);
  return { calls, deps: { products: PRODUCTS, search, dispatch: rec('dispatch'), setErrors: rec('setErrors'), setLeadId: rec('setLeadId'), goTo: rec('goTo') } };
};
test('tauleta: en tornar a l\'inici es descarta el que ha escrit el visitant (dades, perfil, errors i id de lead)', () => {
  const { calls, deps } = leaveHarness('?o=tauleta&producto=model-a');
  leaveToEntry(deps);
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { products: ['model-a'] } });
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', '']);
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'entry']);
});
test('mòbil: en tornar a l\'inici es conserva la sessió (només es netegen els errors)', () => {
  const { calls, deps } = leaveHarness('');
  leaveToEntry(deps);
  assert.deepEqual(names(calls), ['setErrors', 'goTo']);
});

test('discardSession (inactivitat a la tauleta): esborra dades, perfil, errors, id i confirmació i torna a l\'inici', () => {
  const calls = [];
  const rec = (name) => (...args) => calls.push([name, ...args]);
  discardSession({ products: PRODUCTS, search: '?o=tauleta&producto=model-a', dispatch: rec('dispatch'), setErrors: rec('setErrors'), setLeadId: rec('setLeadId'), setReceipt: rec('setReceipt'), goTo: rec('goTo') });
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { products: ['model-a'] } });
  assert.deepEqual([call(calls, 'setErrors')[1], call(calls, 'setLeadId')[1], call(calls, 'setReceipt')[1], call(calls, 'goTo')[1]], [{}, '', null, 'entry']);
});
