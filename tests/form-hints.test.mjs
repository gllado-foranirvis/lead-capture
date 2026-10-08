import test from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_HINTS, applyFieldHints } from '../site/js/form/hints.js';

const AUTOCOMPLETE_TOKENS = ['name', 'email', 'tel', 'address-level2']; // tokens vàlids de l'estàndard HTML

const fakeDoc = (present) => {
  const elements = {};
  return {
    elements,
    querySelector: (selector) => {
      const field = selector.match(/\[name="(.+)"\]/)[1];
      if (!present.includes(field)) return null;
      return (elements[field] ??= { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } });
    },
  };
};

test('telèfon: teclat de telèfon (inclou el +) i el telèfon guardat', () => {
  assert.equal(FIELD_HINTS.phone.inputmode, 'tel');
  assert.equal(FIELD_HINTS.phone.autocomplete, 'tel');
});
test('correu: teclat de correu, sense majúscula inicial ni correcció, i el correu guardat', () => {
  assert.deepEqual(
    [FIELD_HINTS.email.inputmode, FIELD_HINTS.email.autocapitalize, FIELD_HINTS.email.spellcheck, FIELD_HINTS.email.autocomplete],
    ['email', 'none', 'false', 'email'],
  );
});
test('nom: el nom guardat i majúscula a cada paraula; localitat: la ciutat guardada', () => {
  assert.deepEqual([FIELD_HINTS.name.autocomplete, FIELD_HINTS.name.autocapitalize], ['name', 'words']);
  assert.equal(FIELD_HINTS.demo.autocomplete, 'address-level2');
});
test('cap pista desactiva l\'autocompletat i tots els tokens són vàlids', () => {
  for (const [field, hint] of Object.entries(FIELD_HINTS)) {
    assert.ok(AUTOCOMPLETE_TOKENS.includes(hint.autocomplete), `${field}: ${hint.autocomplete}`);
  }
});
test('la tecla d\'enviar del teclat diu «següent» als camps intermedis i «fet» a l\'últim', () => {
  for (const field of ['name', 'email', 'phone']) assert.equal(FIELD_HINTS[field].enterkeyhint, 'next', field);
  assert.equal(FIELD_HINTS.demo.enterkeyhint, 'done');
});
test('applyFieldHints posa els atributs als camps presents, salta els absents i diu quants ha tocat', () => {
  const doc = fakeDoc(['name', 'email', 'phone']);
  assert.equal(applyFieldHints(doc), 3);
  assert.equal(doc.elements.phone.attrs.inputmode, 'tel');
  assert.equal(doc.elements.email.attrs.autocomplete, 'email');
  assert.equal(doc.elements.demo, undefined);
});
test('applyFieldHints sense cap camp al DOM no fa res', () => {
  assert.equal(applyFieldHints(fakeDoc([])), 0);
});
