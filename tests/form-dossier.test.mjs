import test from 'node:test';
import assert from 'node:assert/strict';
import { dossierFor, dossierFileFor, dossierMeta } from '../site/js/form/dossier.js';

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
test('dossierMeta: el nom del model si té dossier propi; si no, el text alternatiu', () => {
  const named = { ...config, products: config.products.map((p) => ({ ...p, name: `Model ${p.id}` })) };
  assert.equal(dossierMeta('a', named, 'General'), 'Model a');
  for (const id of ['b', 'c', '', 'asesoramiento', 'desconegut', undefined]) assert.equal(dossierMeta(id, named, 'General'), 'General', String(id));
});
test('dossierFileFor: nom propi del model, si no el del general, si no buit', () => {
  const cfg = {
    dossierUrl: 'g.pdf', dossierFileName: 'tsf-dossier.pdf',
    products: [{ id: 'a', dossierUrl: 'a.pdf', dossierFileName: 'tsf-a.pdf' }, { id: 'b', dossierUrl: 'b.pdf' }, { id: 'c' }],
  };
  assert.equal(dossierFileFor('a', cfg), 'tsf-a.pdf');
  assert.equal(dossierFileFor('b', cfg), '', 'dossier propi sense nom: no es dona al model el nom del general');
  for (const id of ['c', '', 'asesoramiento', undefined]) assert.equal(dossierFileFor(id, cfg), 'tsf-dossier.pdf', String(id));
  assert.equal(dossierFileFor('c', { dossierUrl: 'g.pdf', products: [{ id: 'c' }] }), '');
});
