import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyForm, formReducer, showsActivity, showsActivityOther, PROFILES, ACTIVITIES } from '../site/js/form/model.js';

const set = (state, field, value) => formReducer(state, { type: 'set', field, value });

test('estat inicial: res marcat, privacitat sense marcar', () => {
  const s = emptyForm();
  assert.equal(s.privacy, false);
  assert.equal(s.newsletter, false);
  assert.equal(s.profile, '');
  assert.deepEqual([s.name, s.email, s.phone, s.activity, s.demo], ['', '', '', '', '']);
});
test('estat inicial amb producte i perfil', () => {
  const s = emptyForm({ product: 'model-a', profile: 'particular' });
  assert.deepEqual([s.product, s.profile], ['model-a', 'particular']);
});
test('set canvia un camp i ignora els camps desconeguts', () => {
  assert.equal(set(emptyForm(), 'name', 'Ana').name, 'Ana');
  const s = emptyForm();
  assert.equal(set(s, 'isAdmin', true), s);
  assert.equal(set(s, '__proto__', {}), s);
});
test('l\'activitat només existeix per a Profesional', () => {
  let s = set(emptyForm(), 'profile', 'profesional');
  assert.equal(showsActivity(s), true);
  s = set(s, 'activity', 'pesca');
  s = set(s, 'profile', 'particular');
  assert.equal(showsActivity(s), false);
  assert.equal(s.activity, '', 'canviar a Particular esborra l\'activitat');
});
test('«Otra» mostra el camp d\'especificar, i triar una altra activitat l\'esborra', () => {
  let s = set(set(emptyForm(), 'profile', 'profesional'), 'activity', 'otra');
  assert.equal(showsActivityOther(s), true);
  s = set(s, 'activityOther', 'Rescat de fauna');
  s = set(s, 'activity', 'pesca');
  assert.equal(showsActivityOther(s), false);
  assert.equal(s.activityOther, '');
});
test('prefill només omple camps buits (el perfil de l\'entrada no trepitja el triat)', () => {
  const empty = formReducer(emptyForm(), { type: 'prefill', field: 'profile', value: 'profesional' });
  assert.equal(empty.profile, 'profesional');
  const chosen = formReducer(emptyForm({ profile: 'particular' }), { type: 'prefill', field: 'profile', value: 'profesional' });
  assert.equal(chosen.profile, 'particular');
});
test('reset torna a l\'estat inicial', () => {
  const dirty = set(set(emptyForm(), 'name', 'Ana'), 'privacy', true);
  assert.deepEqual(formReducer(dirty, { type: 'reset', initial: { product: 'model-b' } }), emptyForm({ product: 'model-b' }));
});
test('constants: perfils i activitats', () => {
  assert.deepEqual(PROFILES, ['particular', 'profesional']);
  assert.equal(ACTIVITIES.at(-1), 'otra');
  assert.ok(ACTIVITIES.includes('skiwake'));
});
test('accions desconegudes no canvien l\'estat', () => {
  const s = emptyForm();
  assert.equal(formReducer(s, { type: 'nope' }), s);
});
