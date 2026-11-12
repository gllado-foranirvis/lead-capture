import test from 'node:test';
import assert from 'node:assert/strict';
import { h, findAll, textOf } from './helpers/fake-react.mjs';
import { createFold } from '../site/js/ui/fold.js';

const Fold = createFold({ h });
const fold = (extra = {}) => Fold({ title: 'Producte', hint: 'Sifly', action: 'Alterar', open: false, children: [h('p', { id: 'inside' }, 'dins')], ...extra });

test('plegable: un <details> amb resum tàctil (títol, estat, acció i xurma decoratiu) i el cos dins', () => {
  const tree = fold();
  assert.equal(tree.type, 'details');
  const [summary] = findAll(tree, (n) => n.type === 'summary');
  assert.equal(summary.props.className, 'fold__summary');
  assert.deepEqual(['fold__title', 'fold__hint', 'fold__action'].map((c) => textOf(findAll(summary, (n) => n.props?.className?.split(' ').includes(c))[0])), ['Producte', 'Sifly', 'Alterar']);
  const svg = findAll(summary, (n) => n.type === 'svg')[0];
  assert.equal(svg.props['aria-hidden'], 'true');
  assert.equal(findAll(tree, (n) => n.props?.id === 'inside').length, 1);
});
test('plegable: tancat per defecte; open el deixa desplegat', () => {
  assert.notEqual(fold().props.open, true);
  assert.equal(fold({ open: true }).props.open, true);
});
test('plegable: sense acció o sense estat, no hi ha aquests elements buits', () => {
  const tree = fold({ action: undefined, hint: undefined });
  assert.equal(findAll(tree, (n) => n.props?.className?.includes('fold__action')).length, 0);
  assert.equal(findAll(tree, (n) => n.props?.className?.includes('fold__hint')).length, 0);
});
test('plegable: la classe extra s\'afegeix a la base', () => {
  assert.equal(fold({ className: 'form__products' }).props.className, 'fold form__products');
});
