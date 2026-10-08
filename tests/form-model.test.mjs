import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITIES, ADVICE, CONCERNS, ENTHUSIASM, FACTORS, DEFAULT_PREFIX, MAX, fullPhone, PROFILES, clip, emptyForm, formReducer, showsActivity, showsActivityOther } from '../site/js/form/model.js';

test('formulari buit: contacte, perfilació i consentiments nets', () => {
  assert.deepEqual(emptyForm(), {
    product: '', email: '', name: '', profile: '', phonePrefix: '+34', phone: '', activity: '', activityOther: '', hasBoat: '', hasElectric: '', intent: '', demo: '', enthusiasm: [], enthusiasmOther: '', concerns: [], concernsOther: '', factors: [], factorsOther: '', comments: '', privacy: false, newsletter: false,
  });
});
test('emptyForm accepta el producte inicial', () => {
  assert.equal(emptyForm({ product: 'model-a' }).product, 'model-a');
});
test('constants', () => {
  assert.deepEqual(PROFILES, ['particular', 'profesional']);
  assert.equal(ACTIVITIES.length, 10);
  assert.equal(ACTIVITIES.at(-1), 'otra');
  assert.equal(ADVICE, 'asesoramiento');
  assert.deepEqual(MAX, { name: 100, email: 254, phone: 30, activityOther: 120, demo: 80, other: 120, comments: 500 });
});
test('l\'activitat només s\'aplica a Profesional; «altra» mostra el camp d\'especificar', () => {
  assert.equal(showsActivity({ profile: 'profesional' }), true);
  assert.equal(showsActivity({ profile: 'particular' }), false);
  assert.equal(showsActivityOther({ profile: 'profesional', activity: 'otra' }), true);
  assert.equal(showsActivityOther({ profile: 'profesional', activity: 'vela' }), false);
  assert.equal(showsActivityOther({ profile: 'particular', activity: 'otra' }), false);
});
test('set canvia un camp existent i ignora els desconeguts', () => {
  const s = emptyForm();
  assert.equal(formReducer(s, { type: 'set', field: 'name', value: 'Ana' }).name, 'Ana');
  assert.equal(formReducer(s, { type: 'set', field: 'camp-inexistent', value: 'x' }), s);
});
test('passar de Profesional a Particular (o desmarcar el perfil) esborra l\'activitat i l\'activitat «altra»', () => {
  let s = formReducer(emptyForm(), { type: 'set', field: 'profile', value: 'profesional' });
  s = formReducer(s, { type: 'set', field: 'activity', value: 'otra' });
  s = formReducer(s, { type: 'set', field: 'activityOther', value: 'Remolcadors' });
  assert.deepEqual([s.activity, s.activityOther], ['otra', 'Remolcadors']);
  assert.deepEqual(['particular', ''].map((p) => {
    const n = formReducer(s, { type: 'set', field: 'profile', value: p });
    return [n.activity, n.activityOther];
  }), [['', ''], ['', '']]);
});
test('canviar l\'activitat a una altra que no és «otra» esborra l\'especificació', () => {
  let s = formReducer({ ...emptyForm(), profile: 'profesional', activity: 'otra', activityOther: 'x' }, { type: 'set', field: 'activity', value: 'vela' });
  assert.equal(s.activityOther, '');
});
test('reset torna al formulari buit amb el producte inicial', () => {
  const dirty = { ...emptyForm(), name: 'Ana', privacy: true, profile: 'profesional', activity: 'vela' };
  assert.deepEqual(formReducer(dirty, { type: 'reset', initial: { product: 'model-a' } }), emptyForm({ product: 'model-a' }));
});
test('clip retalla i no trenca un emoji', () => {
  assert.equal(clip('  hola  ', 10), 'hola');
  assert.equal(clip(undefined, 5), '');
  const cut = clip('😀'.repeat(150), 100);
  assert.equal(Array.from(cut).length, 100);
  assert.doesNotMatch(cut, /[\ud800-\udbff](?![\udc00-\udfff])/);
});

test('el prefix per defecte és +34 i es restableix en reiniciar', () => {
  assert.equal(DEFAULT_PREFIX, '+34');
  const dirty = formReducer(emptyForm(), { type: 'set', field: 'phonePrefix', value: '+351' });
  assert.equal(dirty.phonePrefix, '+351');
  assert.equal(formReducer(dirty, { type: 'reset', initial: {} }).phonePrefix, '+34');
});
test('fullPhone uneix prefix i número amb «+» i un espai, tant si el prefix porta «+» com si no', () => {
  assert.equal(fullPhone({ phonePrefix: '+34', phone: ' 600 00 00 00 ' }), '+34 600 00 00 00');
  assert.equal(fullPhone({ phonePrefix: ' 34 ', phone: '600 00 00 00' }), '+34 600 00 00 00');
  assert.equal(fullPhone({ phonePrefix: '+351', phone: '912 345 678' }), '+351 912 345 678');
  assert.ok(Array.from(fullPhone({ phonePrefix: '+34', phone: '6'.repeat(60) })).length <= 30);
});

test('llistes de les preguntes d\'opinió: l\'última opció és «other»', () => {
  assert.deepEqual(ENTHUSIASM, ['sustainability', 'noise', 'maintenance', 'costs', 'regulation', 'other']);
  assert.deepEqual(CONCERNS, ['range', 'charging', 'price', 'infrastructure', 'depreciation', 'other']);
  assert.deepEqual(FACTORS, ['price', 'range', 'maker', 'design', 'warranty', 'support', 'other']);
});
test('toggle marca i desmarca una opció d\'una llista, en l\'ordre en què es marquen, sense duplicats', () => {
  let s = emptyForm();
  s = formReducer(s, { type: 'toggle', field: 'concerns', value: 'price' });
  s = formReducer(s, { type: 'toggle', field: 'concerns', value: 'range' });
  assert.deepEqual(s.concerns, ['price', 'range']);
  s = formReducer(s, { type: 'toggle', field: 'concerns', value: 'price' });
  assert.deepEqual(s.concerns, ['range']);
  assert.equal(formReducer(s, { type: 'toggle', field: 'name', value: 'x' }), s, 'només s\'aplica a camps de llista');
});
test('desmarcar «other» esborra el text escrit d\'aquell grup (i només d\'aquell)', () => {
  let s = { ...emptyForm(), enthusiasm: ['other'], enthusiasmOther: 'Silenci', concerns: ['other'], concernsOther: 'Soroll' };
  s = formReducer(s, { type: 'toggle', field: 'enthusiasm', value: 'other' });
  assert.deepEqual([s.enthusiasmOther, s.concernsOther], ['', 'Soroll']);
});
