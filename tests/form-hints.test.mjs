import test from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_HINTS, NEXT_FIELD, advanceOnEnter, applyFieldHints } from '../site/js/form/hints.js';

const fakeDoc = (names) => {
  const els = Object.fromEntries(names.map((n) => [n, { name: n, attrs: {}, focused: false, setAttribute(k, v) { this.attrs[k] = v; }, focus() { this.focused = true; } }]));
  return { els, querySelector: (sel) => els[sel.match(/name="(.+)"/)[1]] ?? null };
};
const enter = (name, extra = {}) => ({ key: 'Enter', target: { name, tagName: 'INPUT' }, preventDefault() { this.prevented = true; }, ...extra });

test('els camps de text porten autocompletat, teclat i tecla d\'Intro adequats', () => {
  assert.deepEqual(FIELD_HINTS.email, { autocomplete: 'email', inputmode: 'email', autocapitalize: 'none', spellcheck: 'false', enterkeyhint: 'go' });
  assert.deepEqual(FIELD_HINTS.name, { autocomplete: 'name', autocapitalize: 'words', enterkeyhint: 'next' });
  assert.deepEqual(FIELD_HINTS.phone, { autocomplete: 'tel', inputmode: 'tel', enterkeyhint: 'next' });
  assert.deepEqual(Object.keys(FIELD_HINTS).sort(), ['email', 'name', 'phone']);
});
test('applyFieldHints aplica els atributs als camps presents i compta els aplicats', () => {
  const doc = fakeDoc(['email']);
  assert.equal(applyFieldHints(doc), 1);
  assert.equal(doc.els.email.attrs.inputmode, 'email');
});
test('Intro avança: nom → perfil, telèfon → privacitat', () => {
  assert.deepEqual(NEXT_FIELD, { name: 'profile', phone: 'privacy' });
  const doc = fakeDoc(['profile', 'privacy']);
  const a = enter('name');
  assert.equal(advanceOnEnter(a, doc), true);
  assert.deepEqual([a.prevented, doc.els.profile.focused], [true, true]);
  assert.equal(advanceOnEnter(enter('phone'), doc), true);
  assert.equal(doc.els.privacy.focused, true);
});
test('Intro al correu no avança: envia el pas 1', () => {
  const e = enter('email');
  assert.equal(advanceOnEnter(e, fakeDoc([])), false);
  assert.equal(e.prevented, undefined);
});
test('altres tecles, altres elements o un destí que no existeix no fan res', () => {
  const doc = fakeDoc(['profile']);
  assert.equal(advanceOnEnter(enter('name', { key: 'a' }), doc), false);
  assert.equal(advanceOnEnter({ ...enter('name'), target: { name: 'name', tagName: 'SELECT' } }, doc), false);
  assert.equal(advanceOnEnter(enter('phone'), doc), false);
});
