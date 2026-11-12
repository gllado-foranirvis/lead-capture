import test from 'node:test';
import assert from 'node:assert/strict';
import { clickPayload, finalPayload } from '../site/js/form/payload.js';

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
test('el clic: id i etapa a dalt, la resta (visita, botó, lloc, idioma, origen, productes, ciutat i informació anònima) agrupada', () => {
  const info = { device: 'mobile', os: 'ios', seconds: 12 };
  assert.deepEqual(clickPayload({ id: 'c1', visit: 'v1', button: 'whatsapp', from: 'entry', lang: 'pt', origin: 'mobil', products: 'sifly,tko', city: 'Lisboa', info }), {
    id: 'c1', stage: 'click',
    click: { visit: 'v1', button: 'whatsapp', from: 'entry', lang: 'pt', origin: 'mobil', products: 'sifly,tko', city: 'Lisboa', device: 'mobile', os: 'ios', seconds: 12 },
  });
});
