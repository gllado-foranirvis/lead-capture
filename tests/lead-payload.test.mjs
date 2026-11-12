import test from 'node:test';
import assert from 'node:assert/strict';
import { finalPayload } from '../site/js/form/payload.js';

const final = {
  contact: { id: 'id-1', product: 'sifly,tko', city: 'Lisboa', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00', privacy: true, newsletter: false, lang: 'pt', origin: 'mobil' },
};

test('el final: id i etapa a dalt, contacte sense id repetit', () => {
  const p = finalPayload(final);
  assert.deepEqual([p.id, p.stage], ['id-1', 'complete']);
  assert.equal(Object.hasOwn(p.contact, 'id'), false);
  assert.equal(p.contact.product, 'sifly,tko');
  assert.equal(p.contact.city, 'Lisboa');
  assert.equal(Object.hasOwn(p, 'profiling'), false);
});
test('no es modifica l\'objecte original', () => {
  finalPayload(final);
  assert.equal(final.contact.id, 'id-1');
});
