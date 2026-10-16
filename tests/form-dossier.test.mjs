import test from 'node:test';
import assert from 'node:assert/strict';
import { dossiersFor } from '../site/js/form/dossier.js';

const config = {
  dossierUrl: 'dossier-general.pdf', dossierFileName: 'tsf-dossier.pdf',
  products: [
    { id: 'a', name: 'Model a', dossierUrl: 'dossiers/a.pdf', dossierFileName: 'tsf-a.pdf' },
    { id: 'b', name: 'Model b' },
    { id: 'c', name: 'Model c', dossierUrl: '' },
    { id: 'd', name: 'Model d', dossierUrl: 'dossiers/d.pdf', dossierFileName: 'tsf-d.pdf' },
    { id: 'e', name: 'Model e', dossierUrl: 'dossiers/e.pdf' },
  ],
};
const GENERAL = { href: 'dossier-general.pdf', file: 'tsf-dossier.pdf', meta: 'General' };
const A = { href: 'dossiers/a.pdf', file: 'tsf-a.pdf', meta: 'Model a' };
const D = { href: 'dossiers/d.pdf', file: 'tsf-d.pdf', meta: 'Model d' };
const docs = (ids, cfg = config) => dossiersFor(ids, cfg, 'General');

test('un model amb dossier propi ofereix només el seu', () => {
  assert.deepEqual(docs(['a']), [A]);
});
test('dos models amb dossier propi: un PDF per model, en l\'ordre de la config i no de la tria', () => {
  assert.deepEqual(docs(['d', 'a']), [A, D]);
});
test('un model amb dossier propi i un altre sense: el seu i el general', () => {
  assert.deepEqual(docs(['a', 'b']), [A, GENERAL]);
});
test('diversos models sense dossier propi (o amb cadena buida): el general una sola vegada', () => {
  assert.deepEqual(docs(['b', 'c']), [GENERAL]);
});
test('sense model, amb «asesoramiento» o amb un id desconegut s\'ofereix el general', () => {
  for (const ids of [[], ['asesoramiento'], ['model-antic']]) assert.deepEqual(docs(ids), [GENERAL], JSON.stringify(ids));
});
test('un model amb dossier propi més «asesoramiento» o un id desconegut: el seu i el general', () => {
  assert.deepEqual(docs(['a', 'asesoramiento']), [A, GENERAL]);
  assert.deepEqual(docs(['a', 'inventat']), [A, GENERAL]);
});
test('un model amb dossier propi sense nom de fitxer no hereta el nom del general', () => {
  assert.deepEqual(docs(['e']), [{ href: 'dossiers/e.pdf', file: '', meta: 'Model e' }]);
});
test('el general sense nom configurat es desa amb nom buit', () => {
  assert.deepEqual(docs(['b'], { ...config, dossierFileName: undefined }), [{ href: 'dossier-general.pdf', file: '', meta: 'General' }]);
});
test('sense dossier general configurat, un model sense dossier propi no ofereix res', () => {
  assert.deepEqual(docs(['b'], { ...config, dossierUrl: '' }), []);
  assert.deepEqual(docs(['a', 'b'], { ...config, dossierUrl: '' }), [A]);
});
