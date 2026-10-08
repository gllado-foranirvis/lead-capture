import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLead, buildPartialLead, newLeadId, submitForm } from '../site/js/form/lead.js';
import { emptyForm } from '../site/js/form/model.js';

const values = {
  ...emptyForm({ product: 'model-a' }), email: ' Ana@Example.com ', name: '  Ana  ', profile: 'profesional',
  phonePrefix: '+34', phone: ' 600 00 00 00 ', activity: 'vela', hasBoat: 'si', intent: 'no', privacy: true, newsletter: true,
};
const ctx = { id: 'id-1', lang: 'es', origin: 'mobil' };

test('lead parcial: contacte normalitzat amb consentiment i el perfil si ja el coneixem', () => {
  assert.deepEqual(buildPartialLead(values, ctx), {
    id: 'id-1', stage: 'step1', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: true, lang: 'es', origin: 'mobil', profile: 'profesional',
  });
});
test('lead parcial sense perfil escollit no porta la clau «profile»', () => {
  assert.equal(Object.hasOwn(buildPartialLead({ ...values, profile: '' }, ctx), 'profile'), false);
});
test('lead final: contacte i producte', () => {
  assert.deepEqual(buildLead(values, ctx).contact, {
    id: 'id-1', product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: true, lang: 'es', profile: 'profesional', origin: 'mobil',
  });
});
test('perfilació completa d\'un Profesional', () => {
  const { profiling, hasProfiling } = buildLead(values, ctx);
  assert.deepEqual(profiling, { id: 'id-1', activity: 'vela', hasBoat: 'si', intent: 'no' });
  assert.equal(hasProfiling, true);
});
test('activitat «otra» porta el text escrit, retallat a 120 caràcters sense trencar un emoji', () => {
  const { profiling } = buildLead({ ...values, activity: 'otra', activityOther: ` ${'😀'.repeat(200)} ` }, ctx);
  assert.equal(profiling.activity, 'otra');
  assert.equal(Array.from(profiling.activityOther).length, 120);
});
test('un Particular no envia activitat encara que el camp tingui valor', () => {
  const { profiling } = buildLead({ ...values, profile: 'particular', activity: 'vela' }, ctx);
  assert.equal(Object.hasOwn(profiling, 'activity'), false);
});
test('«hasBoat» i «intent» només si són sí o no; sense res, no hi ha perfilació', () => {
  const none = buildLead({ ...values, activity: '', hasBoat: 'potser', intent: '' }, ctx);
  assert.deepEqual([none.profiling, none.hasProfiling], [{ id: 'id-1' }, false]);
});
test('el nom llarg es retalla sense trencar un emoji', () => {
  assert.equal(Array.from(buildLead({ ...values, name: '😀'.repeat(150) }, ctx).contact.name).length, 100);
});
test('submitForm: errors o lead, amb el mateix id al contacte i a la perfilació', () => {
  assert.ok(submitForm(emptyForm(), ctx).errors.name);
  const { lead } = submitForm(values, ctx);
  assert.deepEqual([lead.contact.id, lead.profiling.id], ['id-1', 'id-1']);
});
test('submitForm: sense perfil no hi ha lead', () => {
  assert.equal(submitForm({ ...values, profile: '' }, ctx).errors.profile, 'profileRequired');
});
test('newLeadId dona identificadors diferents', () => {
  assert.notEqual(newLeadId(), newLeadId());
});
