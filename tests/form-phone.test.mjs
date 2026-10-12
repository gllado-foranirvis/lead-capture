import test from 'node:test';
import assert from 'node:assert/strict';
import { caretFor, formatPhone } from '../site/js/form/phone.js';

test('+34: el número s\'agrupa com el marcador de posició («600 00 00 00»)', () => {
  assert.equal(formatPhone('+34', '666666666'), '666 66 66 66');
  assert.equal(formatPhone('+34', '6'), '6');
  assert.equal(formatPhone('+34', '666'), '666');
  assert.equal(formatPhone('+34', '6666'), '666 6');
  assert.equal(formatPhone('+34', '66666'), '666 66');
  assert.equal(formatPhone('+34', '6666666'), '666 66 66');
});
test('el prefix es reconeix amb o sense «+» i amb espais', () => {
  for (const p of ['+34', '34', ' +34 ']) assert.equal(formatPhone(p, '666666666'), '666 66 66 66', p);
});
test('els espais que ja hi són (o es posen a mà) es tornen a repartir', () => {
  assert.equal(formatPhone('+34', '666 666 666'), '666 66 66 66');
  assert.equal(formatPhone('+34', '66 66 66 66 6'), '666 66 66 66');
  assert.equal(formatPhone('+34', '666 66 66 66'), '666 66 66 66', 'idempotent');
});
test('esborrar amb retrocés passa pel separador: un espai al final no es queda', () => {
  assert.equal(formatPhone('+34', '666 '), '666');
  assert.equal(formatPhone('+34', ''), '');
  assert.equal(formatPhone('+34', '   '), '');
});
test('xifres de més: no es perden (la validació ja acota a 15) i van al darrer grup', () => {
  assert.equal(formatPhone('+34', '6666666666'), '666 66 66 666');
});
test('+351 s\'agrupa 3-3-3 («912 345 678»)', () => {
  assert.equal(formatPhone('+351', '912345678'), '912 345 678');
});
test('prefix sense patró conegut o absent: es deixa tal com s\'escriu', () => {
  for (const p of ['+1', '+33', '', undefined]) assert.equal(formatPhone(p, '123456789'), '123456789', String(p));
});
test('amb caràcters que no són xifres ni espais no es toca res: la validació ha de poder avisar', () => {
  for (const raw of ['abc', '(93) 123-45-67', '600+123456', '+34 600 00 00 00', '666a666']) assert.equal(formatPhone('+34', raw), raw, raw);
});
test('caretFor: el cursor es queda darrere de la mateixa xifra després de reagrupar', () => {
  assert.equal(caretFor('666 66 66 66', 0), 0);
  assert.equal(caretFor('666 66 66 66', 3), 3);
  assert.equal(caretFor('666 66 66 66', 4), 5, 'darrere de la 4a xifra, saltant l\'espai');
  assert.equal(caretFor('666 66 66 66', 9), 12);
  assert.equal(caretFor('666 66 66 66', 99), 12, 'mai més enllà del final');
});
