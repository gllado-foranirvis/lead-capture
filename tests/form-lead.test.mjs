import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLead, buildPartialLead, newLeadId, skipProfile, submitContact, submitProfile } from '../site/js/form/lead.js';
import { emptyForm } from '../site/js/form/model.js';

const values = {
  ...emptyForm({ products: ['sifly'] }), email: ' Ana@Example.com ', name: '  Ana  ', city: '  Lisboa  ',
  phonePrefix: '+34', phone: ' 600 00 00 00 ', privacy: true, newsletter: true,
};
const ctx = { id: 'id-1', lang: 'pt', origin: 'mobil', visit: 'visit-1' };

const contactOnly = {
  id: 'id-1', product: 'sifly', city: 'Lisboa', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
  privacy: true, newsletter: true, lang: 'pt', origin: 'mobil', visit: 'visit-1',
};
test('lead complet sense perfilació: contacte normalitzat i perfilació només amb l\'id', () => {
  assert.deepEqual(buildLead(values, ctx), { contact: contactOnly, profiling: { id: 'id-1' }, hasProfiling: false });
});
test('lead parcial: el mateix contacte (amb producte i ciutat) i l\'etapa step1', () => {
  assert.deepEqual(buildPartialLead(values, ctx), { ...contactOnly, stage: 'step1' });
});
test('perfilació: només opcions vàlides, activitat només per a Profesional i «altre» només si està marcat', () => {
  const full = { ...values, profile: 'profesional', activity: 'otra', activityOther: ' Remolcadors ', hasBoat: 'si', hasElectric: 'x', intent: 'no',
    enthusiasm: ['noise', 'other'], enthusiasmOther: ' silenci ', concerns: ['range'], concernsOther: 'ignorat', factors: [], comments: ' molt bé ' };
  assert.deepEqual(buildLead(full, ctx).profiling, {
    id: 'id-1', profile: 'profesional', activity: 'otra', activityOther: 'Remolcadors', hasBoat: 'si', intent: 'no',
    enthusiasm: ['noise', 'other'], enthusiasmOther: 'silenci', concerns: ['range'], comments: 'molt bé',
  });
  assert.equal(buildLead(full, ctx).hasProfiling, true);
});
test('skipProfile: desa les respostes a mig fer (sense exigir el perfil) i, sense cap resposta, només el contacte', () => {
  const partial = skipProfile({ ...values, comments: 'x' }, ctx).lead;
  assert.deepEqual(partial.profiling, { id: 'id-1', comments: 'x' });
  assert.equal(partial.hasProfiling, true);
  const empty = skipProfile({ ...values, profile: '', comments: '' }, ctx).lead;
  assert.deepEqual(empty.profiling, { id: 'id-1' });
  assert.equal(empty.hasProfiling, false);
});
test('diversos productes es desen com a ids separats per comes; cap producte, text buit', () => {
  assert.equal(buildLead({ ...values, products: ['sifly', 'tko'] }, ctx).contact.product, 'sifly,tko');
  assert.equal(buildLead({ ...values, products: [] }, ctx).contact.product, '');
});
test('la ciutat es retalla a 80 caràcters sense trencar un emoji; buida queda buida', () => {
  assert.equal(Array.from(buildLead({ ...values, city: '😀'.repeat(100) }, ctx).contact.city).length, 80);
  assert.equal(buildLead({ ...values, city: '   ' }, ctx).contact.city, '');
});
test('el nom llarg es retalla sense trencar un emoji', () => {
  assert.equal(Array.from(buildLead({ ...values, name: '😀'.repeat(150) }, ctx).contact.name).length, 100);
});
test('submitContact: errors o lead parcial', () => {
  assert.ok(submitContact(emptyForm(), ctx).errors.name);
  assert.equal(submitContact({ ...values, email: '', phone: '' }, ctx).errors.email, 'either');
  assert.equal(submitContact(values, ctx).lead.stage, 'step1');
});
test('submitProfile: el perfil és obligatori', () => {
  assert.equal(submitProfile(values, ctx).errors.profile, 'profileRequired');
  assert.equal(submitProfile({ ...values, profile: 'particular' }, ctx).lead.profiling.profile, 'particular');
});
test('newLeadId dona identificadors diferents', () => {
  assert.notEqual(newLeadId(), newLeadId());
});
test('sense telèfon, phone és buit; sense correu, email és buit', () => {
  assert.equal(buildLead({ ...values, phone: '' }, ctx).contact.phone, '');
  assert.equal(buildLead({ ...values, email: '' }, ctx).contact.email, '');
});
test('sense visita al context, el lead porta la visita buida (mai undefined)', () => {
  assert.equal(buildPartialLead(values, { id: 'id-1', lang: 'pt', origin: 'mobil' }).visit, '');
});

const advice = (extra) => ({ ...values, products: ['asesoramiento'], ...extra });
test('adviceNote: retallat i al contacte, i al lead parcial', () => {
  assert.equal(buildLead(advice({ adviceNote: '  Vull una barca per a 6 persones  ' }), ctx).contact.adviceNote, 'Vull una barca per a 6 persones');
  assert.equal(buildPartialLead(advice({ adviceNote: ' hola ' }), ctx).adviceNote, 'hola');
  assert.equal(Array.from(buildLead(advice({ adviceNote: '😀'.repeat(600) }), ctx).contact.adviceNote).length, 500);
});
test('adviceNote: sense text o sense «asesoramiento» no hi ha la clau', () => {
  assert.equal(Object.hasOwn(buildLead(advice({ adviceNote: '   ' }), ctx).contact, 'adviceNote'), false);
  assert.equal(Object.hasOwn(buildLead({ ...values, adviceNote: 'x' }, ctx).contact, 'adviceNote'), false);
  assert.equal(Object.hasOwn(buildPartialLead({ ...values, adviceNote: 'x' }, ctx), 'adviceNote'), false);
});
