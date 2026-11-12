import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG } from '../site/js/config.js';
import { DICT, dictFor } from '../site/js/i18n.js';
import { clickDetail, doneView, plannedDocs } from '../site/js/form/views.js';

const config = { ...CONFIG, emailDelivery: true };
const view = (products, extra = {}) => doneView({ receipt: { products }, lang: 'pt', dossier: true, config, ...extra });

test('doneView: amb PDF aplicables, els textos amb dossier, una targeta per PDF i el correu si l\'enviament existeix', () => {
  const v = view(['sifly', 'tko']);
  assert.equal(v.t, DICT.pt);
  assert.deepEqual(v.docs.map((d) => d.href), ['dossiers/sifly.en.pdf', 'dossiers/tko.en.pdf']);
  assert.equal(v.emailDelivery, true);
});
test('doneView: sense cap PDF aplicable («asesoramiento», res triat) → textos sense dossier i mai «te l\'hem enviat per correu», encara que emailDelivery sigui true', () => {
  for (const products of [['asesoramiento'], []]) {
    const v = view(products);
    assert.deepEqual(v.docs, []);
    assert.equal(v.t, dictFor('pt', false));
    assert.equal(v.emailDelivery, false);
  }
});
test('doneView: amb dossier apagat o sense rebut no hi ha descàrregues ni correu', () => {
  assert.deepEqual(view(['sifly'], { dossier: false }).docs, []);
  const v = doneView({ receipt: null, lang: 'en', dossier: true, config });
  assert.deepEqual([v.docs, v.emailDelivery], [[], false]);
});
test('doneView: el PDF segueix l\'idioma del formulari', () => {
  const cfg = { ...config, products: [{ id: 'a', name: 'A', pdf: { en: 'a.en.pdf', pt: 'a.pt.pdf' } }] };
  assert.equal(doneView({ receipt: { products: ['a'] }, lang: 'pt', dossier: true, config: cfg }).docs[0].href, 'a.pt.pdf');
  assert.equal(doneView({ receipt: { products: ['a'] }, lang: 'es', dossier: true, config: cfg }).docs[0].href, 'a.en.pdf');
});

const base = { button: 'whatsapp', visit: 'visit-1', lang: 'pt', origin: 'tauleta', id: 'c-1', info: { device: 'mobile' } };
test('clickDetail: a l\'inici usa els valors del formulari; a la confirmació, els del rebut (el formulari ja és buit)', () => {
  const values = { products: ['boatee'], city: ' Porto ' };
  const receipt = { products: ['sifly', 'tko'], city: 'Lisboa' };
  assert.deepEqual(clickDetail({ ...base, from: 'entry', values, receipt }), { id: 'c-1', visit: 'visit-1', button: 'whatsapp', from: 'entry', lang: 'pt', origin: 'tauleta', products: 'boatee', city: 'Porto', info: { device: 'mobile' } });
  const done = clickDetail({ ...base, from: 'done', values: { products: [], city: '' }, receipt });
  assert.deepEqual([done.products, done.city, done.from], ['sifly,tko', 'Lisboa', 'done']);
});
test('clickDetail: sense rebut a la confirmació cau als valors; la ciutat es retalla a 80', () => {
  assert.equal(clickDetail({ ...base, from: 'done', values: { products: ['tko'], city: '' }, receipt: null }).products, 'tko');
  assert.equal(Array.from(clickDetail({ ...base, from: 'entry', values: { products: [], city: '😀'.repeat(100) } }).city).length, 80);
});

test('clickDetail: amb «product» (una descàrrega) els productes són només aquell id', () => {
  const detail = clickDetail({ ...base, from: 'done', button: 'download', product: 'sifly', values: { products: [], city: '' }, receipt: { products: ['sifly', 'tko'], city: 'Lisboa' } });
  assert.deepEqual([detail.products, detail.button, detail.city], ['sifly', 'download', 'Lisboa']);
});

test('plannedDocs: el que es descarregarà amb la tria actual (el mateix que després ofereix la confirmació)', () => {
  const names = (products, lang = 'pt') => plannedDocs({ products, lang, config, full: DICT[lang] }).map((d) => d.meta);
  assert.deepEqual(names(['tko', 'sifly']), ['Sifly', 'TKO']);
  assert.deepEqual(names(['asesoramiento']), []);
  assert.deepEqual(names([]), []);
  assert.deepEqual(plannedDocs({ products: ['sifly'], lang: 'pt', config, full: DICT.pt }), doneView({ receipt: { products: ['sifly'] }, lang: 'pt', dossier: true, config }).docs);
});
