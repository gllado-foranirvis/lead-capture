import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLead, buildPartialLead, newLeadId, submitForm } from '../site/js/form/lead.js';
import { emptyForm } from '../site/js/form/model.js';

const PRODUCTS = [{ id: 'model-a', name: 'Modelo A' }];
const values = {
  ...emptyForm({ product: 'model-a' }), email: ' Ana@Example.com ', name: '  Ana  ', profile: 'profesional',
  phone: ' +34 600 00 00 00 ', hasBoat: 'si', privacy: true, newsletter: true,
};
const ctx = { id: 'id-1', lang: 'es', origin: 'mobil' };

test('lead parcial: privacitat NO acceptada encara que la casella estigui marcada, correu normalitzat', () => {
  assert.deepEqual(buildPartialLead(values, ctx), {
    id: 'id-1', stage: 'step1', product: 'model-a', email: 'ana@example.com', privacy: false, lang: 'es', origin: 'mobil',
  });
});
test('lead final: contacte normalitzat i privacitat acceptada', () => {
  const { contact } = buildLead(values, ctx);
  assert.deepEqual(contact, {
    id: 'id-1', product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
    privacy: true, newsletter: true, lang: 'es', profile: 'profesional', origin: 'mobil',
  });
});
test('perfilació: només «hasBoat» i només si és sí o no', () => {
  assert.deepEqual(buildLead(values, ctx).profiling, { id: 'id-1', hasBoat: 'si' });
  assert.equal(buildLead(values, ctx).hasProfiling, true);
  const none = buildLead({ ...values, hasBoat: '' }, ctx);
  assert.deepEqual([none.profiling, none.hasProfiling], [{ id: 'id-1' }, false]);
  assert.equal(buildLead({ ...values, hasBoat: 'potser' }, ctx).hasProfiling, false);
});
test('el nom llarg es retalla sense trencar un emoji', () => {
  const { contact } = buildLead({ ...values, name: '😀'.repeat(150) }, ctx);
  assert.equal(Array.from(contact.name).length, 100);
});
test('submitForm: errors o lead, amb el mateix id al contacte i a la perfilació', () => {
  assert.ok(submitForm(emptyForm(), { products: PRODUCTS, ...ctx }).errors.product);
  const { lead } = submitForm(values, { products: PRODUCTS, ...ctx });
  assert.deepEqual([lead.contact.id, lead.profiling.id], ['id-1', 'id-1']);
});
test('newLeadId dona identificadors diferents', () => {
  assert.notEqual(newLeadId(), newLeadId());
});
