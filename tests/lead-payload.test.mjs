import test from 'node:test';
import assert from 'node:assert/strict';
import { finalPayload, partialPayload } from '../site/js/form/payload.js';

const partial = {
  id: 'id-1', stage: 'step1', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00',
  privacy: true, newsletter: false, lang: 'es', origin: 'mobil', profile: 'particular',
};
const final = {
  contact: { id: 'id-1', product: 'model-a', name: 'Ana', email: 'ana@example.com', phone: '+34 600 00 00 00', privacy: true, newsletter: false, lang: 'es', profile: 'particular', origin: 'mobil' },
  profiling: { id: 'id-1', hasBoat: 'si', enthusiasm: ['noise'] },
  hasProfiling: true,
};

test('el parcial: id i etapa a dalt, contacte sense id ni etapa', () => {
  const p = partialPayload(partial);
  assert.deepEqual([p.id, p.stage], ['id-1', 'step1']);
  assert.deepEqual(Object.keys(p.contact).sort(), ['email', 'lang', 'name', 'newsletter', 'origin', 'phone', 'privacy', 'profile']);
  assert.equal(p.contact.privacy, true);
});
test('el final: contacte i perfilació sense id repetit', () => {
  const p = finalPayload(final);
  assert.deepEqual([p.id, p.stage], ['id-1', 'complete']);
  assert.equal(Object.hasOwn(p.contact, 'id'), false);
  assert.deepEqual(p.profiling, { hasBoat: 'si', enthusiasm: ['noise'] });
  assert.equal(p.contact.product, 'model-a');
});
test('no es modifiquen els objectes originals', () => {
  partialPayload(partial);
  finalPayload(final);
  assert.equal(partial.id, 'id-1');
  assert.equal(final.contact.id, 'id-1');
  assert.equal(final.profiling.id, 'id-1');
});
