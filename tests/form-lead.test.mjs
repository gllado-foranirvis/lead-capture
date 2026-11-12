import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLead, newLeadId, submitForm } from '../site/js/form/lead.js';
import { emptyForm } from '../site/js/form/model.js';

const values = {
  ...emptyForm({ products: ['sifly'] }), email: ' Ana@Example.com ', name: '  Ana  ', city: '  Lisboa  ',
  phonePrefix: '+34', phone: ' 600 00 00 00 ', privacy: true, newsletter: true,
};
const ctx = { id: 'id-1', lang: 'pt', origin: 'mobil' };

test('lead: contacte normalitzat amb producte, ciutat i consentiment, sense perfil ni perfilació', () => {
  assert.deepEqual(buildLead(values, ctx), {
    contact: {
      id: 'id-1', product: 'sifly', city: 'Lisboa', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
      privacy: true, newsletter: true, lang: 'pt', origin: 'mobil',
    },
  });
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
test('submitForm: errors o lead', () => {
  assert.ok(submitForm(emptyForm(), ctx).errors.name);
  assert.equal(submitForm({ ...values, email: '' }, ctx).errors.email, 'required');
  assert.equal(submitForm(values, ctx).lead.contact.id, 'id-1');
});
test('newLeadId dona identificadors diferents', () => {
  assert.notEqual(newLeadId(), newLeadId());
});
