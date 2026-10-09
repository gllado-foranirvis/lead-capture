import test from 'node:test';
import assert from 'node:assert/strict';
import { dossierFor, openDossier } from '../site/js/form/dossier.js';

const config = {
  dossierUrl: 'dossier-general.pdf',
  products: [
    { id: 'a', name: 'A', dossierUrl: 'dossiers/a.pdf' },
    { id: 'b', name: 'B' },
    { id: 'c', name: 'C', dossierUrl: '' },
  ],
};

test('un producte amb dossier propi obre el seu', () => {
  assert.equal(dossierFor('a', config), 'dossiers/a.pdf');
});
test('un producte sense dossier propi, o amb cadena buida, obre el general', () => {
  assert.equal(dossierFor('b', config), 'dossier-general.pdf');
  assert.equal(dossierFor('c', config), 'dossier-general.pdf');
});
test('sense model, amb «asesoramiento» o amb un id desconegut s\'obre el general', () => {
  for (const id of ['', 'asesoramiento', 'model-antic', undefined]) assert.equal(dossierFor(id, config), 'dossier-general.pdf', String(id));
});
test('sense cap dossier configurat no hi ha URL', () => {
  assert.equal(dossierFor('a', { products: [{ id: 'a' }] }), '');
});
test('openDossier obre en una pestanya nova, sense opener, i retorna la URL', () => {
  const calls = [];
  const url = openDossier('a', config, (...args) => calls.push(args));
  assert.equal(url, 'dossiers/a.pdf');
  assert.deepEqual(calls, [['dossiers/a.pdf', '_blank', 'noopener']]);
});
test('openDossier no fa res si no hi ha URL', () => {
  const calls = [];
  assert.equal(openDossier('a', { products: [] }, (...args) => calls.push(args)), '');
  assert.deepEqual(calls, []);
});
