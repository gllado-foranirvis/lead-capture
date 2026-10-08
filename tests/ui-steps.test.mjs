import test from 'node:test';
import assert from 'node:assert/strict';
import { h, byType, findAll, textOf } from './helpers/fake-react.mjs';
import { createStepIndicator } from '../site/js/ui/step-indicator.js';

const StepIndicator = createStepIndicator({ h });
const segments = (tree) => findAll(tree, (n) => n.type === 'span');
const track = (tree) => findAll(tree, (n) => n.props?.role === 'progressbar')[0];

test('indicador: text visible, barra amb valors i un nom accessible igual al text', () => {
  const tree = StepIndicator({ step: 1, total: 2, label: 'Paso 1 de 2' });
  assert.ok(textOf(tree).includes('Paso 1 de 2'));
  const bar = track(tree);
  assert.deepEqual(
    [bar.props['aria-valuemin'], bar.props['aria-valuemax'], bar.props['aria-valuenow'], bar.props['aria-valuetext'], bar.props['aria-label']],
    [1, 2, 1, 'Paso 1 de 2', 'Paso 1 de 2'],
  );
});
test('indicador: pas 1 = un segment ple; pas 2 = els dos plens', () => {
  const on = (step) => segments(StepIndicator({ step, total: 2, label: 'x' })).filter((s) => s.props.className.includes('steps__seg--on')).length;
  assert.deepEqual([on(1), on(2)], [1, 2]);
});
test('indicador: els segments no porten text (el text és el de l\'etiqueta)', () => {
  for (const s of segments(StepIndicator({ step: 1, total: 2, label: 'x' }))) assert.equal(textOf(s), '');
});
