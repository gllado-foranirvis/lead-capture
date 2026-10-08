import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLead, submitForm, newLeadId } from '../site/js/form/lead.js';
import { emptyForm } from '../site/js/form/model.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const base = { ...emptyForm({ product: 'model-a', profile: 'particular' }), name: ' Ana ', email: ' ANA@Example.com ', phone: ' +34 600 00 00 00 ', privacy: true };
const ctx = { lang: 'ca', origin: 'tauleta', newId: () => 'id-1' };

test('el contacte surt normalitzat i amb idioma, perfil i origen', () => {
  assert.deepEqual(buildLead(base, ctx).contact, {
    id: 'id-1', product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: false, lang: 'ca', profile: 'particular', origin: 'tauleta',
  });
});
test('novetats és un booleà estricte', () => {
  assert.equal(buildLead({ ...base, newsletter: true }, ctx).contact.newsletter, true);
  assert.equal(buildLead({ ...base, newsletter: 'yes' }, ctx).contact.newsletter, false);
});
test('un Particular no porta activitat encara que n\'hi hagi a l\'estat', () => {
  const lead = buildLead({ ...base, activity: 'pesca', activityOther: 'x' }, ctx);
  assert.equal(lead.profiling.activity, undefined);
  assert.equal(lead.hasProfiling, false);
});
test('un Profesional porta l\'activitat; «Otra» només amb text', () => {
  const pro = { ...base, profile: 'profesional' };
  assert.equal(buildLead({ ...pro, activity: 'pesca' }, ctx).profiling.activity, 'pesca');
  assert.equal(buildLead({ ...pro, activity: 'pesca', activityOther: 'ignorat' }, ctx).profiling.activityOther, undefined);
  assert.equal(buildLead({ ...pro, activity: 'otra', activityOther: '  Rescat  ' }, ctx).profiling.activityOther, 'Rescat');
  assert.equal(buildLead({ ...pro, activity: 'otra', activityOther: '   ' }, ctx).profiling.activityOther, undefined);
});
test('la perfilació només inclou el que s\'ha contestat', () => {
  const lead = buildLead({ ...base, hasElectric: 'si', investing: '', demo: ' Girona ' }, ctx);
  assert.deepEqual(lead.profiling, { id: 'id-1', hasElectric: 'si', demo: 'Girona' });
  assert.equal(lead.hasProfiling, true);
});
test('el contacte i la perfilació comparteixen l\'identificador (un sol newId per lead)', () => {
  let calls = 0;
  const lead = buildLead(base, { ...ctx, newId: () => `id-${++calls}` });
  assert.equal(calls, 1);
  assert.equal(lead.contact.id, lead.profiling.id);
});
test('els textos massa llargs es retallen sense trencar emojis', () => {
  const lead = buildLead({ ...base, name: 'a'.repeat(300), demo: '🌊'.repeat(200) }, ctx);
  assert.equal(lead.contact.name.length, 100);
  assert.equal(Array.from(lead.profiling.demo).length, 80);
  assert.doesNotMatch(lead.profiling.demo, /�/);
});
test('newLeadId dona identificadors no buits i diferents', () => {
  const ids = new Set(Array.from({ length: 50 }, newLeadId));
  assert.equal(ids.size, 50);
  for (const id of ids) assert.ok(typeof id === 'string' && id.length >= 8);
});
test('submitForm: amb errors no genera lead ni consumeix identificador', () => {
  let calls = 0;
  const result = submitForm(emptyForm(), { products: PRODUCTS, lang: 'es', origin: 'mobil', newId: () => { calls++; return 'x'; } });
  assert.ok(result.errors.name);
  assert.equal(result.lead, undefined);
  assert.equal(calls, 0);
});
test('submitForm: amb dades vàlides dona el lead', () => {
  const result = submitForm(base, { products: PRODUCTS, ...ctx });
  assert.equal(result.errors, undefined);
  assert.equal(result.lead.contact.id, 'id-1');
});
