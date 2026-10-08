import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceStep1, discardSession, handleSubmit, leaveToEntry } from '../site/js/form/flow.js';
import { emptyForm } from '../site/js/form/model.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const contact = { ...emptyForm({ product: 'model-a' }), name: 'Ana', email: 'Ana@Example.com', phone: '600 00 00 00', privacy: true, newsletter: true };
const full = { ...contact, profile: 'profesional', activity: 'vela', hasBoat: 'si', hasElectric: 'no', intent: 'no', demo: 'Girona' };

const harness = (extra = {}, search = '?producto=model-a&o=tauleta') => {
  const calls = [];
  const rec = (name) => (...args) => calls.push([name, ...args]);
  return {
    calls,
    deps: {
      products: PRODUCTS, search, lang: 'es', leadId: '', newId: () => 'id-1',
      setLeadId: rec('setLeadId'), setErrors: rec('setErrors'), bumpAttempt: rec('bumpAttempt'), dispatch: rec('dispatch'),
      setReceipt: rec('setReceipt'), openDocument: rec('openDocument'), emitPartial: rec('emitPartial'), emitLead: rec('emitLead'), goTo: rec('goTo'),
      ...extra,
    },
  };
};
const names = (calls) => calls.map((c) => c[0]);
const call = (calls, name) => calls.find((c) => c[0] === name);

test('pas 1 vàlid: desa un id, emet el lead parcial amb consentiment i passa al pas 2', () => {
  const { calls, deps } = harness();
  assert.equal(advanceStep1(contact, deps), true);
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', 'id-1']);
  assert.deepEqual(call(calls, 'emitPartial')[1], {
    id: 'id-1', stage: 'step1', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: true, lang: 'es', origin: 'tauleta',
  });
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step2']);
});
test('pas 1: el perfil triat a l\'inici viatja al lead parcial', () => {
  const { calls, deps } = harness();
  advanceStep1({ ...contact, profile: 'particular' }, deps);
  assert.equal(call(calls, 'emitPartial')[1].profile, 'particular');
});
test('pas 1 invàlid (sense privacitat): errors abans de seguir, no emet ni avança', () => {
  const { calls, deps } = harness();
  assert.equal(advanceStep1({ ...contact, privacy: false }, deps), false);
  assert.deepEqual(call(calls, 'setErrors')[1], { privacy: 'privacy' });
  assert.deepEqual(names(calls), ['setErrors', 'bumpAttempt']);
});
test('tornar al pas 1 i continuar de nou reutilitza l\'id i emet el lead parcial actualitzat', () => {
  const { calls, deps } = harness({ leadId: 'id-0', newId: () => { throw new Error('no ha de crear un id nou'); } });
  advanceStep1({ ...contact, phone: '600 11 22 33' }, deps);
  assert.equal(call(calls, 'emitPartial')[1].id, 'id-0');
  assert.equal(call(calls, 'emitPartial')[1].phone, '+34 600 11 22 33');
});
test('enviament final: obre el document PRIMER, després emet el lead i neteja per al següent visitant', () => {
  const { calls, deps } = harness({ leadId: 'id-0' });
  assert.equal(handleSubmit(full, deps), true);
  assert.equal(names(calls)[0], 'openDocument');
  const lead = call(calls, 'emitLead')[1];
  assert.deepEqual([lead.contact.id, lead.profiling.id, lead.contact.profile, lead.profiling.activity, lead.profiling.hasBoat, lead.profiling.intent], ['id-0', 'id-0', 'profesional', 'vela', 'si', 'no']);
  assert.deepEqual(call(calls, 'setReceipt')[1], { product: 'model-a', profile: 'profesional', activity: 'vela', activityOther: '', hasBoat: 'si', hasElectric: 'no', intent: 'no', demo: 'Girona', name: 'Ana' });
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { product: 'model-a' } });
  assert.deepEqual(call(calls, 'setLeadId'), ['setLeadId', '']);
  assert.deepEqual(call(calls, 'setErrors'), ['setErrors', {}]);
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'done']);
});
test('enviament final sense id previ en crea un', () => {
  const { calls, deps } = harness();
  handleSubmit(full, deps);
  assert.equal(call(calls, 'emitLead')[1].contact.id, 'id-1');
});
test('enviament final sense perfil: error al pas 2, cap document, cap lead', () => {
  const { calls, deps } = harness();
  assert.equal(handleSubmit({ ...contact, profile: '' }, deps), false);
  assert.deepEqual(call(calls, 'setErrors')[1], { profile: 'profileRequired' });
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step2']);
  assert.equal(names(calls).includes('openDocument') || names(calls).includes('emitLead'), false);
});
test('enviament final amb un error de contacte torna al pas 1', () => {
  const { calls, deps } = harness();
  handleSubmit({ ...full, email: '' }, deps);
  assert.deepEqual(call(calls, 'goTo'), ['goTo', 'step1']);
});
test('el reinici torna a preseleccionar el producte de la URL, o cap', () => {
  const withProduct = harness({}, '?producto=model-a');
  handleSubmit(full, withProduct.deps);
  assert.deepEqual(call(withProduct.calls, 'dispatch')[1].initial, { product: 'model-a' });
  const without = harness({}, '');
  handleSubmit(full, without.deps);
  assert.deepEqual(call(without.calls, 'dispatch')[1].initial, { product: '' });
});

const leaveHarness = (search) => {
  const calls = [];
  const rec = (name) => (...args) => calls.push([name, ...args]);
  return { calls, deps: { products: PRODUCTS, search, dispatch: rec('dispatch'), setErrors: rec('setErrors'), setLeadId: rec('setLeadId'), goTo: rec('goTo') } };
};
test('tauleta: en tornar a l\'inici es descarta el que ha escrit el visitant (dades, perfil, errors i id de lead)', () => {
  const { calls, deps } = leaveHarness('?o=tauleta&producto=model-a');
  leaveToEntry(deps);
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { product: 'model-a' } });
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
  assert.deepEqual(call(calls, 'dispatch')[1], { type: 'reset', initial: { product: 'model-a' } });
  assert.deepEqual([call(calls, 'setErrors')[1], call(calls, 'setLeadId')[1], call(calls, 'setReceipt')[1], call(calls, 'goTo')[1]], [{}, '', null, 'entry']);
});
