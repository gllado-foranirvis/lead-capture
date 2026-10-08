import test from 'node:test';
import assert from 'node:assert/strict';
import { stepLabel } from '../site/js/form/steps.js';

test('stepLabel omple {n} i {total}', () => {
  assert.equal(stepLabel('Paso {n} de {total}', 1, 2), 'Paso 1 de 2');
  assert.equal(stepLabel('Step {n} of {total}', 2, 2), 'Step 2 of 2');
});
