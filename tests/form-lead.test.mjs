import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLead, buildPartialLead, newLeadId, submitForm } from '../site/js/form/lead.js';
import { emptyForm } from '../site/js/form/model.js';

const values = {
  ...emptyForm({ product: 'model-a' }), email: ' Ana@Example.com ', name: '  Ana  ', profile: 'profesional',
  phonePrefix: '+34', phone: ' 600 00 00 00 ', activity: 'vela', hasBoat: 'si', hasElectric: 'no', intent: 'no', demo: ' Barcelona ', enthusiasm: ['noise', 'other'], enthusiasmOther: ' Silenci ', concerns: ['range'], factors: ['price', 'warranty'], comments: ' Molt bé ', privacy: true, newsletter: true,
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
  assert.deepEqual(profiling, {
    id: 'id-1', activity: 'vela', hasBoat: 'si', hasElectric: 'no', intent: 'no', demo: 'Barcelona',
    enthusiasm: ['noise', 'other'], enthusiasmOther: 'Silenci', concerns: ['range'], factors: ['price', 'warranty'], comments: 'Molt bé',
  });
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
test('la localitat de la demostració es retalla a 80 caràcters sense trencar un emoji i no surt si és buida', () => {
  assert.equal(Array.from(buildLead({ ...values, demo: '😀'.repeat(200) }, ctx).profiling.demo).length, 80);
  assert.equal(Object.hasOwn(buildLead({ ...values, demo: '   ' }, ctx).profiling, 'demo'), false);
});
test('«hasBoat», «hasElectric» i «intent» només si són sí o no; sense res, no hi ha perfilació', () => {
  const none = buildLead({ ...values, activity: '', hasBoat: 'potser', hasElectric: 'quizá', intent: '', demo: '', enthusiasm: [], concerns: [], factors: [], comments: '' }, ctx);
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

test('opinió: només opcions vàlides, en l\'ordre de la llista; el text «altre» només si «other» és marcat', () => {
  const { profiling } = buildLead({ ...values, enthusiasm: ['inventada', 'costs', 'noise'], enthusiasmOther: 'No ha de sortir', concerns: [], factors: ['other'], factorsOther: ` ${'😀'.repeat(200)} ` }, ctx);
  assert.deepEqual(profiling.enthusiasm, ['noise', 'costs']);
  assert.equal(Object.hasOwn(profiling, 'enthusiasmOther'), false);
  assert.equal(Object.hasOwn(profiling, 'concerns'), false);
  assert.equal(Array.from(profiling.factorsOther).length, 120);
});
test('comentaris: retallats a 500 caràcters i absents si són buits', () => {
  assert.equal(Array.from(buildLead({ ...values, comments: 'x'.repeat(900) }, ctx).profiling.comments).length, 500);
  assert.equal(Object.hasOwn(buildLead({ ...values, comments: '  ' }, ctx).profiling, 'comments'), false);
});
