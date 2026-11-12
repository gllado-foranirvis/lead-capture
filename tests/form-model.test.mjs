import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITIES, ADVICE, CONCERNS, ENTHUSIASM, FACTORS, OPINION_GROUPS, PROFILES, DEFAULT_PREFIX, MAX, fullPhone, clip, emptyForm, formReducer, showsActivity, showsActivityOther } from '../site/js/form/model.js';

test('formulari buit: productes, ciutat, contacte i consentiments nets', () => {
  assert.deepEqual(emptyForm(), {
    products: [], city: '', name: '', email: '', phonePrefix: '+351', phone: '', privacy: false, newsletter: false,
    profile: '', activity: '', activityOther: '', hasBoat: '', hasElectric: '', intent: '',
    enthusiasm: [], enthusiasmOther: '', concerns: [], concernsOther: '', factors: [], factorsOther: '', comments: '',
  });
});
test('emptyForm accepta els models inicials', () => {
  assert.deepEqual(emptyForm().products, []);
  assert.deepEqual(emptyForm({ products: ['model-a'] }).products, ['model-a']);
});
test('toggle products: els models se sumen i «asesoramiento» és excloent', () => {
  const toggle = (s, value) => formReducer(s, { type: 'toggle', field: 'products', value });
  let s = toggle(emptyForm(), 'model-a');
  assert.deepEqual(s.products, ['model-a']);
  s = toggle(s, 'model-b');
  assert.deepEqual(s.products, ['model-a', 'model-b']);
  s = toggle(s, 'model-a');
  assert.deepEqual(s.products, ['model-b']);
  s = toggle(s, 'asesoramiento');
  assert.deepEqual(s.products, ['asesoramiento']);
  s = toggle(s, 'model-a');
  assert.deepEqual(s.products, ['model-a']);
  s = toggle(toggle(s, 'asesoramiento'), 'asesoramiento');
  assert.deepEqual(s.products, []);
});
test('l\'assessorament és un valor reservat', () => {
  assert.equal(ADVICE, 'asesoramiento');
});
test('la ciutat es desa amb set', () => {
  assert.equal(formReducer(emptyForm(), { type: 'set', field: 'city', value: 'Lisboa' }).city, 'Lisboa');
});
test('set canvia un camp existent i ignora els desconeguts', () => {
  const s = emptyForm();
  assert.equal(formReducer(s, { type: 'set', field: 'name', value: 'Ana' }).name, 'Ana');
  assert.equal(formReducer(s, { type: 'set', field: 'camp-inexistent', value: 'x' }), s);
});
test('reset torna al formulari buit amb els models inicials', () => {
  const dirty = { ...emptyForm(), name: 'Ana', city: 'Lisboa', privacy: true };
  assert.deepEqual(formReducer(dirty, { type: 'reset', initial: { products: ['model-a'] } }), emptyForm({ products: ['model-a'] }));
});
test('clip retalla i no trenca un emoji', () => {
  assert.equal(clip('  hola  ', 10), 'hola');
  assert.equal(clip(undefined, 5), '');
  const cut = clip('😀'.repeat(150), 100);
  assert.equal(Array.from(cut).length, 100);
  assert.doesNotMatch(cut, /[\ud800-\udbff](?![\udc00-\udfff])/);
});

test('el prefix per defecte és +351 i es restableix en reiniciar', () => {
  assert.equal(DEFAULT_PREFIX, '+351');
  const dirty = formReducer(emptyForm(), { type: 'set', field: 'phonePrefix', value: '+34' });
  assert.equal(dirty.phonePrefix, '+34');
  assert.equal(formReducer(dirty, { type: 'reset', initial: {} }).phonePrefix, '+351');
});
test('fullPhone uneix prefix i número amb «+» i un espai, tant si el prefix porta «+» com si no', () => {
  assert.equal(fullPhone({ phonePrefix: '+34', phone: ' 600 00 00 00 ' }), '+34 600 00 00 00');
  assert.equal(fullPhone({ phonePrefix: ' 34 ', phone: '600 00 00 00' }), '+34 600 00 00 00');
  assert.equal(fullPhone({ phonePrefix: '+351', phone: '912 345 678' }), '+351 912 345 678');
  assert.ok(Array.from(fullPhone({ phonePrefix: '+34', phone: '6'.repeat(60) })).length <= 30);
});


test('fullPhone és buit si el número és buit', () => {
  assert.equal(fullPhone({ phonePrefix: '+351', phone: '  ' }), '');
});

test('constants de perfilació i límits', () => {
  assert.deepEqual(PROFILES, ['particular', 'profesional']);
  assert.equal(ACTIVITIES.at(-1), 'otra');
  assert.deepEqual(Object.keys(OPINION_GROUPS), ['enthusiasm', 'concerns', 'factors']);
  assert.deepEqual([ENTHUSIASM.at(-1), CONCERNS.at(-1), FACTORS.at(-1)], ['other', 'other', 'other']);
  assert.deepEqual(MAX, { name: 100, email: 254, phone: 30, city: 80, activityOther: 120, other: 120, comments: 500 });
});
test('l\'activitat només s\'aplica a Profesional; «altra» obre el camp d\'especificar', () => {
  assert.equal(showsActivity({ profile: 'profesional' }), true);
  assert.equal(showsActivity({ profile: 'particular' }), false);
  assert.equal(showsActivityOther({ profile: 'profesional', activity: 'otra' }), true);
  assert.equal(showsActivityOther({ profile: 'particular', activity: 'otra' }), false);
});
test('passar a Particular esborra l\'activitat; desmarcar «other» esborra el seu text', () => {
  let s = { ...emptyForm(), profile: 'profesional', activity: 'otra', activityOther: 'Remolcadors' };
  s = formReducer(s, { type: 'set', field: 'profile', value: 'particular' });
  assert.deepEqual([s.activity, s.activityOther], ['', '']);
  s = formReducer({ ...emptyForm(), enthusiasm: ['other'], enthusiasmOther: 'x' }, { type: 'toggle', field: 'enthusiasm', value: 'other' });
  assert.deepEqual([s.enthusiasm, s.enthusiasmOther], [[], '']);
});
test('toggle d\'una opinió se suma sense l\'exclusivitat de l\'assessorament', () => {
  const s = formReducer(formReducer(emptyForm(), { type: 'toggle', field: 'concerns', value: 'range' }), { type: 'toggle', field: 'concerns', value: 'price' });
  assert.deepEqual(s.concerns, ['range', 'price']);
});
