import test from 'node:test';
import assert from 'node:assert/strict';
import { dossiersFor, pdfFor } from '../site/js/form/dossier.js';

const config = {
  brandPdf: { en: 'g.en.pdf' },
  products: [
    { id: 'a', name: 'A', pdf: { en: 'a.en.pdf', pt: 'a.pt.pdf' } },
    { id: 'b', name: 'B', pdf: { en: 'b.en.pdf' } },
    { id: 'c', name: 'C' },
  ],
};
const docs = (ids, lang, cfg = config) => dossiersFor(ids, lang, cfg, 'G');
const withoutBrand = { products: config.products };

test('pdfFor: l\'idioma demanat, si no l\'anglès, si no res', () => {
  assert.equal(pdfFor({ en: 'x.en.pdf', pt: 'x.pt.pdf' }, 'pt'), 'x.pt.pdf');
  assert.equal(pdfFor({ en: 'x.en.pdf' }, 'pt'), 'x.en.pdf');
  assert.equal(pdfFor({ pt: 'x.pt.pdf' }, 'es'), undefined);
  assert.equal(pdfFor(undefined, 'pt'), undefined);
});
test('un producte ofereix el seu PDF en l\'idioma del formulari', () => {
  assert.deepEqual(docs(['a'], 'pt'), [{ href: 'a.pt.pdf', meta: 'A' }]);
});
test('un idioma sense PDF propi cau a l\'anglès', () => {
  assert.deepEqual(docs(['b'], 'pt'), [{ href: 'b.en.pdf', meta: 'B' }]);
});
test('un producte amb PDF i un sense: el seu i el general', () => {
  assert.deepEqual(docs(['a', 'c'], 'es'), [{ href: 'a.en.pdf', meta: 'A' }, { href: 'g.en.pdf', meta: 'G' }]);
});
test('«asesoramiento» o cap producte ofereix el general', () => {
  assert.deepEqual(docs(['asesoramiento'], 'pt'), [{ href: 'g.en.pdf', meta: 'G' }]);
  assert.deepEqual(docs([], 'pt'), [{ href: 'g.en.pdf', meta: 'G' }]);
});
test('el general surt una sola vegada i en l\'ordre de la config, no el de la tria', () => {
  assert.deepEqual(docs(['c', 'asesoramiento'], 'en'), [{ href: 'g.en.pdf', meta: 'G' }]);
  assert.deepEqual(docs(['b', 'a'], 'en').map((d) => d.meta), ['A', 'B']);
  assert.equal(docs(['a', 'a'], 'en').length, 1);
});
test('sense PDF general no s\'ofereix res que no sigui d\'un producte', () => {
  for (const ids of [['c'], ['asesoramiento'], []]) assert.deepEqual(docs(ids, 'pt', withoutBrand), [], JSON.stringify(ids));
  assert.deepEqual(docs(['a', 'c'], 'en', withoutBrand), [{ href: 'a.en.pdf', meta: 'A' }]);
});
