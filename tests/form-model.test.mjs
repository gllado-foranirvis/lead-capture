import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITIES, ADVICE, MAX, PROFILES, clip, emptyForm, formReducer, showsActivity, showsActivityOther } from '../site/js/form/model.js';

test('formulari buit: contacte, perfilació i consentiments nets', () => {
  assert.deepEqual(emptyForm(), {
    product: '', email: '', name: '', profile: '', phone: '', activity: '', activityOther: '', hasBoat: '', intent: '', privacy: false, newsletter: false,
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
  assert.deepEqual(MAX, { name: 100, email: 254, phone: 30, activityOther: 120 });
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
  assert.equal(formReducer(s, { type: 'set', field: 'demo', value: 'x' }), s);
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
