import test from 'node:test';
import assert from 'node:assert/strict';
import { hasMoreBelow, updateScrollHint, watchScrollHint } from '../site/js/form/scroll-hint.js';

test('hasMoreBelow: queda contingut només si la vora inferior és per sobre del final (amb tolerància)', () => {
  assert.equal(hasMoreBelow({ scrollY: 0, innerHeight: 740, scrollHeight: 855 }), true);
  assert.equal(hasMoreBelow({ scrollY: 100, innerHeight: 740, scrollHeight: 855 }), false);
  assert.equal(hasMoreBelow({ scrollY: 0, innerHeight: 740, scrollHeight: 760 }), false, 'dins la tolerància');
  assert.equal(hasMoreBelow(), false);
});
const fakeDoc = (bar) => ({ documentElement: { dataset: {}, scrollHeight: 1000 }, body: {}, querySelector: () => bar });
test('updateScrollHint: marca data-more a <html> i el text a la barra', () => {
  const bar = { dataset: {} };
  const doc = fakeDoc(bar);
  updateScrollHint({ scrollY: 0, innerHeight: 700 }, doc, 'Més avall');
  assert.deepEqual([doc.documentElement.dataset.more, bar.dataset.hint], ['true', 'Més avall']);
  updateScrollHint({ scrollY: 300, innerHeight: 700 }, doc, 'Més avall');
  assert.equal(doc.documentElement.dataset.more, 'false');
  assert.doesNotThrow(() => updateScrollHint({ scrollY: 0, innerHeight: 700 }, fakeDoc(null)));
});
test('watchScrollHint: escolta scroll i resize, observa el cos i ho desfà tot en netejar', () => {
  const events = [];
  const win = { scrollY: 0, innerHeight: 700, addEventListener: (e) => events.push(`+${e}`), removeEventListener: (e) => events.push(`-${e}`) };
  let observed = null; let disconnected = false;
  class Observer { constructor(cb) { this.cb = cb; } observe(el) { observed = el; } disconnect() { disconnected = true; } }
  const doc = fakeDoc({ dataset: {} });
  const stop = watchScrollHint(win, doc, { text: 'x', Observer });
  assert.deepEqual(events, ['+scroll', '+resize']);
  assert.equal(observed, doc.body);
  stop();
  assert.deepEqual(events, ['+scroll', '+resize', '-scroll', '-resize']);
  assert.equal(disconnected, true);
});
