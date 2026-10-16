import test from 'node:test';
import assert from 'node:assert/strict';
import { downloadAll } from '../site/js/form/download-all.js';

function fakeEnv() {
  const log = [];
  const scheduled = [];
  const doc = {
    body: { appendChild: (a) => log.push(['append', a.href]) },
    createElement: (tag) => ({ tag, click() { log.push(['click', this.href, this.download]); }, remove() { log.push(['remove', this.href]); } }),
  };
  return { log, scheduled, opts: { doc, delayMs: 400, schedule: (fn, ms) => scheduled.push([fn, ms]) } };
}
const clicks = (log) => log.filter((e) => e[0] === 'click');
const docs = [{ href: 'a.pdf', file: 'a-nom.pdf' }, { href: 'b.pdf', file: '' }, { href: 'c.pdf', file: 'c-nom.pdf' }];

test('el primer clic és síncron (dins del gest del visitant) i la resta es programa', () => {
  const { log, scheduled, opts } = fakeEnv();
  downloadAll(docs, opts);
  assert.deepEqual(clicks(log), [['click', 'a.pdf', 'a-nom.pdf']]);
  assert.deepEqual(scheduled.map((s) => s[1]), [400, 800]);
});
test('en executar els programats surten tots els fitxers en ordre, cadascun amb el seu nom, i els enllaços temporals es treuen', () => {
  const { log, scheduled, opts } = fakeEnv();
  downloadAll(docs, opts);
  scheduled.forEach(([fn]) => fn());
  assert.deepEqual(clicks(log), [['click', 'a.pdf', 'a-nom.pdf'], ['click', 'b.pdf', ''], ['click', 'c.pdf', 'c-nom.pdf']]);
  assert.equal(log.filter((e) => e[0] === 'remove').length, 3);
});
test('sense fitxers no fa res', () => {
  const { log, scheduled, opts } = fakeEnv();
  downloadAll([], opts);
  assert.deepEqual([log, scheduled], [[], []]);
});
