import test from 'node:test';
import assert from 'node:assert/strict';
import { hasMoreBelow, isHintTap, scrollDown, updateScrollHint, watchScrollHint } from '../site/js/form/scroll-hint.js';

test('hasMoreBelow: queda contingut només si la vora inferior és per sobre del final (amb tolerància)', () => {
  assert.equal(hasMoreBelow({ scrollY: 0, innerHeight: 740, scrollHeight: 855 }), true);
  assert.equal(hasMoreBelow({ scrollY: 100, innerHeight: 740, scrollHeight: 855 }), false);
  assert.equal(hasMoreBelow({ scrollY: 0, innerHeight: 740, scrollHeight: 760 }), false, 'dins la tolerància');
  assert.equal(hasMoreBelow(), false);
});
const fakeDoc = (bar) => ({ documentElement: { dataset: {}, scrollHeight: 1000 }, body: {}, querySelector: () => bar, addEventListener() {}, removeEventListener() {} });
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

const tapOn = (matches, x, y) => ({ target: { matches: () => matches, getBoundingClientRect: () => ({ top: 637, left: 0, width: 360 }) }, clientX: x, clientY: y });
test('isHintTap: només un toc a la píndola (vora superior, prop del centre, amb l\'avís actiu) compta', () => {
  const on = { documentElement: { dataset: { more: 'true' } } };
  assert.equal(isHintTap(tapOn(true, 180, 630), on), true, 'a sobre de la vora');
  assert.equal(isHintTap(tapOn(true, 180, 650), on), true, 'a sota de la vora, encara dins la píndola');
  assert.equal(isHintTap(tapOn(true, 180, 690), on), false, 'més avall a la barra');
  assert.equal(isHintTap(tapOn(true, 20, 630), on), false, 'lluny del centre');
  assert.equal(isHintTap(tapOn(false, 180, 630), on), false, 'no és la barra (un botó de dins)');
  assert.equal(isHintTap(tapOn(true, 180, 630), { documentElement: { dataset: { more: 'false' } } }), false, 'sense avís actiu');
});
test('scrollDown: baixa tres quarts de pantalla, suau; sense animació si l\'usuari la redueix', () => {
  const calls = [];
  const win = (reduce) => ({ innerHeight: 740, matchMedia: () => ({ matches: reduce }), scrollBy: (o) => calls.push(o) });
  scrollDown(win(false));
  scrollDown(win(true));
  assert.deepEqual(calls, [{ top: 555, behavior: 'smooth' }, { top: 555, behavior: 'auto' }]);
});
test('watchScrollHint: també escolta el clic al document i el desfà en netejar', () => {
  const log = [];
  const doc = { ...fakeDoc({ dataset: {} }), addEventListener: (e) => log.push(`+${e}`), removeEventListener: (e) => log.push(`-${e}`) };
  const win = { scrollY: 0, innerHeight: 700, addEventListener() {}, removeEventListener() {} };
  watchScrollHint(win, doc, { Observer: null })();
  assert.deepEqual(log, ['+click', '-click']);
});
