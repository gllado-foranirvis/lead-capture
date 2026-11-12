import test from 'node:test';
import assert from 'node:assert/strict';
import { createStaticServer } from '../scripts/serve.mjs';

const get = async (server, path) => {
  const { port } = server.address();
  return fetch(`http://127.0.0.1:${port}${path}`);
};

test('el servidor local no deixa que el navegador guardi res en memòria cau (si no, barreja mòduls vells i nous)', async (t) => {
  const server = createStaticServer('site').listen(0);
  t.after(() => server.close());
  for (const [path, type] of [['/', /text\/html/], ['/js/app.js', /javascript/], ['/css/page.css', /text\/css/], ['/dossiers/sifly.en.pdf', /pdf/]]) {
    const res = await get(server, path);
    assert.equal(res.status, 200, path);
    assert.equal(res.headers.get('cache-control'), 'no-store', path);
    assert.match(res.headers.get('content-type'), type, path);
    await res.arrayBuffer();
  }
});
test('el servidor local dona 404 per a un fitxer que no hi és i no surt de site/', async (t) => {
  const server = createStaticServer('site').listen(0);
  t.after(() => server.close());
  assert.equal((await get(server, '/no-hi-es.js')).status, 404);
  assert.equal((await get(server, '/..%2fpackage.json')).status, 404);
});
