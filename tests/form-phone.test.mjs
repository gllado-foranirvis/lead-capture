import test from 'node:test';
import assert from 'node:assert/strict';
import { caretFor, formatPhone, phoneExample, prefixSuggestions, splitInternational } from '../site/js/form/phone.js';

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

test('número internacional enganxat o escrit al camp del número: se\'n separa el prefix', () => {
  assert.deepEqual(splitInternational('+351912345678'), { prefix: '+351', number: '912345678' });
  assert.deepEqual(splitInternational('+34 666 66 66 66'), { prefix: '+34', number: '666666666' });
  assert.deepEqual(splitInternational('0034666666666'), { prefix: '+34', number: '666666666' });
  assert.deepEqual(splitInternational('+1 202 555 0100'), { prefix: '+1', number: '2025550100' });
  assert.deepEqual(splitInternational('+7 912 345 67 89'), { prefix: '+7', number: '9123456789' });
  assert.deepEqual(splitInternational('+44 7911 123456'), { prefix: '+44', number: '7911123456' });
  assert.deepEqual(splitInternational('+49 (151) 234-5678'), { prefix: '+49', number: '1512345678' });
  assert.deepEqual(splitInternational('+212 612345678'), { prefix: '+212', number: '612345678' }, 'codis de tres xifres');
  assert.deepEqual(splitInternational('+376 345 678'), { prefix: '+376', number: '345678' });
});
test('mentre s\'escriu, no es decideix res fins que hi ha prefix complet i alguna xifra del número', () => {
  for (const raw of ['', '+', '+3', '+34', '+35', '+351', '00', '0034', '+34 ']) assert.equal(splitInternational(raw), null, JSON.stringify(raw));
  assert.deepEqual(splitInternational('+351 9'), { prefix: '+351', number: '9' });
  assert.deepEqual(splitInternational('+34 6'), { prefix: '+34', number: '6' });
});
test('sense «+» o «00» al davant, o amb altres caràcters, no es toca: la validació avisa', () => {
  for (const raw of ['666666666', '0666', 'abc', '+34 abc', '+0123456', '600+123456', '34+666']) assert.equal(splitInternational(raw), null, raw);
});
test('marcador de posició segons el prefix: el mateix exemple amb què s\'agrupa; la resta, el de l\'idioma', () => {
  assert.equal(phoneExample('+34', 'X'), '600 00 00 00');
  assert.equal(phoneExample('34', 'X'), '600 00 00 00');
  assert.equal(phoneExample(' +351 ', 'X'), '912 345 678');
  for (const p of ['+44', '', undefined]) assert.equal(phoneExample(p, 'X'), 'X', String(p));
  for (const p of ['+34', '+351']) { const ex = phoneExample(p, ''); assert.equal(formatPhone(p, ex), ex, `${p}: l'exemple ja està agrupat`); }
});
test('suggeriments de prefix: sense repetits, en l\'idioma de la pàgina i amb Espanya al capdavant', () => {
  const es = prefixSuggestions('es');
  assert.equal(new Set(es.map((o) => o.value)).size, es.length);
  assert.deepEqual(es[0], { value: '+34', label: 'España (+34)' });
  assert.ok(es.every((o) => /^\+\d{1,3}$/.test(o.value)));
  assert.deepEqual(prefixSuggestions('en').find((o) => o.value === '+49'), { value: '+49', label: 'Germany (+49)' });
  assert.deepEqual(prefixSuggestions('pt').find((o) => o.value === '+351'), { value: '+351', label: 'Portugal (+351)' });
  assert.equal(prefixSuggestions('ca').find((o) => o.value === '+33').label, 'França (+33)');
});
