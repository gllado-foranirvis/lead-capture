import test from 'node:test';
import assert from 'node:assert/strict';
import { focusFirstError } from '../site/js/form/focus.js';

const fakeDoc = (present) => ({ querySelector: (sel) => (present.includes(sel) ? { focus() { this.focused = true; }, sel } : null) });

test('enfoca el primer camp amb error segons l\'ordre de la pantalla', () => {
  const found = {};
  const doc = { querySelector: (sel) => (found[sel] = { focus() { this.focused = true; } }) };
  assert.equal(focusFirstError({ phone: 'required', name: 'required' }, doc), true);
  assert.equal(found['[name="name"]'].focused, true);
  assert.equal(found['[name="phone"]'], undefined);
});
test('sense errors, o amb un camp que no existeix al DOM, no fa res', () => {
  assert.equal(focusFirstError({}, fakeDoc([])), false);
  assert.equal(focusFirstError({ email: 'email' }, fakeDoc([])), false);
});

import { focusStepHeading } from '../site/js/form/focus.js';

test('focusStepHeading dona el focus al contenidor del títol i diu si l\'ha trobat', () => {
  let focused = 0;
  const doc = { querySelector: (s) => (s === '[data-step-heading]' ? { focus: () => focused++ } : null) };
  assert.equal(focusStepHeading(doc), true);
  assert.equal(focused, 1);
  assert.equal(focusStepHeading({ querySelector: () => null }), false);
});
