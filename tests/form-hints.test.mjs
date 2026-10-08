import test from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_HINTS, NEXT_FIELD, advanceOnEnter, applyFieldHints } from '../site/js/form/hints.js';

const fakeDoc = (names) => {
  const els = Object.fromEntries(names.map((n) => [n, { name: n, attrs: {}, focused: false, setAttribute(k, v) { this.attrs[k] = v; }, focus() { this.focused = true; } }]));
  return { els, querySelector: (sel) => els[sel.match(/name="(.+)"/)[1]] ?? null };
};
const enter = (name, extra = {}) => ({ key: 'Enter', target: { name, tagName: 'INPUT' }, preventDefault() { this.prevented = true; }, ...extra });

test('els camps de text porten autocompletat, teclat i tecla d\'Intro adequats', () => {
  assert.deepEqual(FIELD_HINTS.email, { autocomplete: 'email', inputmode: 'email', autocapitalize: 'none', spellcheck: 'false', enterkeyhint: 'next' });
  assert.deepEqual(FIELD_HINTS.name, { autocomplete: 'name', autocapitalize: 'words', enterkeyhint: 'next' });
  assert.deepEqual(FIELD_HINTS.phone, { autocomplete: 'tel-national', inputmode: 'tel', enterkeyhint: 'next' });
  assert.deepEqual(FIELD_HINTS.phonePrefix, { autocomplete: 'tel-country-code', inputmode: 'tel', enterkeyhint: 'next' });
  assert.deepEqual(Object.keys(FIELD_HINTS).sort(), ['activityOther', 'demo', 'email', 'name', 'phone', 'phonePrefix']);
  assert.equal(FIELD_HINTS.activityOther.enterkeyhint, 'next');
  assert.deepEqual(FIELD_HINTS.demo, { autocomplete: 'address-level2', enterkeyhint: 'done' });
});
test('applyFieldHints aplica els atributs als camps presents i compta els aplicats', () => {
  const doc = fakeDoc(['email']);
  assert.equal(applyFieldHints(doc), 1);
  assert.equal(doc.els.email.attrs.inputmode, 'email');
});
test('Intro avança: nom → correu → telèfon → privacitat', () => {
  assert.deepEqual(NEXT_FIELD, { name: 'email', email: 'phonePrefix', phonePrefix: 'phone', phone: 'privacy', activityOther: 'hasBoat' });
  const doc = fakeDoc(['email', 'phonePrefix', 'phone', 'privacy']);
  const a = enter('name');
  assert.equal(advanceOnEnter(a, doc), true);
  assert.deepEqual([a.prevented, doc.els.email.focused], [true, true]);
  assert.equal(advanceOnEnter(enter('email'), doc), true);
  assert.equal(doc.els.phonePrefix.focused, true);
  assert.equal(advanceOnEnter(enter('phonePrefix'), doc), true);
  assert.equal(doc.els.phone.focused, true);
  assert.equal(advanceOnEnter(enter('phone'), doc), true);
  assert.equal(doc.els.privacy.focused, true);
});
test('altres tecles, altres elements o un destí que no existeix no fan res', () => {
  const doc = fakeDoc(['email']);
  assert.equal(advanceOnEnter(enter('name', { key: 'a' }), doc), false);
  assert.equal(advanceOnEnter({ ...enter('name'), target: { name: 'name', tagName: 'SELECT' } }, doc), false);
  assert.equal(advanceOnEnter(enter('phone'), doc), false);
  assert.equal(advanceOnEnter(enter('altre'), doc), false);
});
test('Intro a «Otra actividad» passa a la pregunta de l\'embarcació en lloc d\'enviar el pas 2', () => {
  const doc = fakeDoc(['hasBoat']);
  const e = enter('activityOther');
  assert.equal(advanceOnEnter(e, doc), true);
  assert.deepEqual([e.prevented, doc.els.hasBoat.focused], [true, true]);
});
