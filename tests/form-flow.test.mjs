import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceStep1, discardSession, handleSkip, handleSubmit, leaveToEntry } from '../site/js/form/flow.js';
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

const profiled = { ...full, profile: 'particular' };
test('pas 1: amb errors no emet res i es queda al pas 1; amb èxit emet el lead parcial i va al pas 2', () => {
  const bad = harness({ emitPartial: undefined });
  const emits = [];
  assert.equal(advanceStep1({ ...contact, name: '' }, { ...bad.deps, emitPartial: (l) => emits.push(l) }), false);
  assert.deepEqual([emits.length, call(bad.calls, 'goTo')], [0, undefined]);
  assert.deepEqual(call(bad.calls, 'setErrors')[1], { name: 'required' });
  const ok = harness({ leadId: 'id-0' });
  assert.equal(advanceStep1(full, { ...ok.deps, emitPartial: (l) => emits.push(l) }), true);
  assert.deepEqual([emits[0].id, emits[0].stage, emits[0].city], ['id-0', 'step1', 'Lisboa']);
  assert.deepEqual(call(ok.calls, 'setLeadId'), ['setLeadId', 'id-0']);
  assert.deepEqual(call(ok.calls, 'goTo'), ['goTo', 'step2']);
});
test('pas 1 sense id previ en crea un i el desa', () => {
  const { calls, deps } = harness();
  advanceStep1(full, { ...deps, emitPartial: () => {} });
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', 'id-1']);
});
test('enviament final: emet el lead i neteja per al següent visitant', () => {
  const { calls, deps } = harness({ leadId: 'id-0' });
  assert.equal(handleSubmit(profiled, deps), true);
  assert.equal(names(calls).filter((n) => n === 'emitLead').length, 1);
  const lead = call(calls, 'emitLead')[1];
  assert.deepEqual([lead.contact.id, lead.contact.city, lead.profiling.profile], ['id-0', 'Lisboa', 'particular']);
  assert.deepEqual(call(calls, 'setReceipt')[1], { products: ['model-a'], name: 'Ana', city: ' Lisboa ' });
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { products: ['model-a'] } });
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', '']);
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'done']);
});
test('enviament final sense perfil: es queda al pas 2 sense emetre res', () => {
  const { calls, deps } = harness();
  assert.equal(handleSubmit(full, deps), false);
  assert.deepEqual(call(calls, 'setErrors')[1], { profile: 'profileRequired' });
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step2']);
  assert.deepEqual(names(calls).filter((n) => n === 'emitLead' || n === 'bumpAttempt'), ['bumpAttempt']);
});
test('saltar la perfilació: emet el lead complet sense perfilació, neteja i va a la confirmació', () => {
  const { calls, deps } = harness({ leadId: 'id-0' });
  assert.equal(handleSkip({ ...full, profile: 'particular', comments: 'x' }, deps), true);
  const lead = call(calls, 'emitLead')[1];
  assert.deepEqual([lead.contact.id, lead.hasProfiling, lead.profiling], ['id-0', false, { id: 'id-0' }]);
  assert.deepEqual(call(calls, 'setReceipt')[1], { products: ['model-a'], name: 'Ana', city: ' Lisboa ' });
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'done']);
});
test('el reinici torna a preseleccionar el producte de la URL, o cap', () => {
  const withProduct = harness({}, '?producto=model-a');
  handleSubmit(profiled, withProduct.deps);
  assert.deepEqual(call(withProduct.calls, 'dispatch')[1].initial, { products: ['model-a'] });
  const without = harness({}, '');
  handleSubmit(profiled, without.deps);
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
