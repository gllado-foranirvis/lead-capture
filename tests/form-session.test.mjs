import test from 'node:test';
import assert from 'node:assert/strict';
import { toSession } from '../site/js/form/session.js';

const products = [{ id: 'model-a', name: 'Modelo A' }];
const dict = { form: { yes: 'Sí', no: 'No', productAdvice: 'No lo sé aún', activities: { vela: 'Deporte: vela', otra: 'Otra' },
  enthusiasmOptions: { noise: 'Reducción de ruido', other: 'Otro' }, concernsOptions: { range: 'Autonomía limitada', other: 'Otro' }, factorsOptions: { price: 'Precio', other: 'Otro' } } };
const full = { product: 'model-a', profile: 'profesional', activity: 'vela', hasBoat: 'si', hasElectric: 'no', intent: 'no', demo: ' Girona ', enthusiasm: ['noise', 'other'], enthusiasmOther: ' Silencio ', concerns: ['range'], factors: ['price'], comments: ' Todo bien ', name: '  Ana ' };

test('dades de la sessió traduïdes al diccionari actual; «profesional» usa el missatge «distribuidor»', () => {
  assert.deepEqual(toSession(full, { products, dict }), {
    profile: 'distribuidor', product: 'Modelo A', activity: 'Deporte: vela', hasBoat: 'Sí', hasElectric: 'No', intent: 'No', demo: 'Girona', name: 'Ana',
    enthusiasm: 'Reducción de ruido, Silencio', concerns: 'Autonomía limitada', factors: 'Precio', comments: 'Todo bien',
  });
});
test('particular, l\'opció d\'assessorament i cap activitat', () => {
  assert.deepEqual(
    toSession({ product: 'asesoramiento', profile: 'particular', activity: 'vela', hasBoat: 'no', intent: 'si', name: '' }, { products, dict }),
    { profile: 'particular', product: 'No lo sé aún', activity: '', hasBoat: 'No', hasElectric: '', intent: 'Sí', demo: '', name: '', enthusiasm: '', concerns: '', factors: '', comments: '' },
  );
});
test('activitat «otra» usa el text escrit si n\'hi ha', () => {
  assert.equal(toSession({ profile: 'profesional', activity: 'otra', activityOther: ' Remolcadors ' }, { products, dict }).activity, 'Remolcadors');
  assert.equal(toSession({ profile: 'profesional', activity: 'otra', activityOther: '' }, { products, dict }).activity, 'Otra');
});
test('valors absents o desconeguts queden buits', () => {
  const empty = { profile: '', product: '', activity: '', hasBoat: '', hasElectric: '', intent: '', demo: '', name: '', enthusiasm: '', concerns: '', factors: '', comments: '' };
  assert.deepEqual(toSession({}, { products, dict }), empty);
  assert.deepEqual(toSession({ product: 'x', profile: 'x', activity: 'x', hasBoat: 'potser', hasElectric: 'potser', intent: 'potser' }, { products, dict }), empty);
});
test('el nom i l\'activitat escrita es retallen', () => {
  assert.equal(Array.from(toSession({ name: 'a'.repeat(300) }, { products, dict }).name).length, 100);
  assert.equal(Array.from(toSession({ profile: 'profesional', activity: 'otra', activityOther: 'b'.repeat(300) }, { products, dict }).activity).length, 120);
});

test('«other» sense text escrit fa servir l\'etiqueta «Otro»; les opcions inventades s\'ignoren', () => {
  const s = toSession({ enthusiasm: ['inventada', 'other'], factors: ['other'] }, { products, dict });
  assert.deepEqual([s.enthusiasm, s.factors], ['Otro', 'Otro']);
});
test('els comentaris que van als missatges es retallen a 200 caràcters', () => {
  assert.equal(Array.from(toSession({ comments: 'c'.repeat(600) }, { products, dict }).comments).length, 200);
});
