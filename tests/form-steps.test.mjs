import test from 'node:test';
import assert from 'node:assert/strict';
import { stepLabel, stepText } from '../site/js/form/steps.js';

test('stepLabel omple {n} i {total}', () => {
  assert.equal(stepLabel('Passo {n} de {total}', 2, 4), 'Passo 2 de 4');
});
test('stepText afegeix el nom del pas', () => {
  assert.equal(stepText('Passo {n} de {total}', ['A', 'B', 'C', 'D'], 2, 4), 'Passo 2 de 4 · B');
});
