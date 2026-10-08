import test from 'node:test';
import assert from 'node:assert/strict';
import { toSession } from '../site/js/form/session.js';

const products = [{ id: 'model-a', name: 'Modelo A' }];
const dict = { form: { yes: 'Sí', no: 'No', productAdvice: 'No lo sé aún' } };
const full = { product: 'model-a', profile: 'profesional', hasBoat: 'si', name: '  Ana ' };

test('dades de la sessió traduïdes al diccionari actual; «profesional» usa el missatge «distribuidor»', () => {
  assert.deepEqual(toSession(full, { products, dict }), { profile: 'distribuidor', product: 'Modelo A', hasBoat: 'Sí', name: 'Ana' });
});
test('particular, «no» i l\'opció d\'assessorament', () => {
  assert.deepEqual(
    toSession({ product: 'asesoramiento', profile: 'particular', hasBoat: 'no', name: '' }, { products, dict }),
    { profile: 'particular', product: 'No lo sé aún', hasBoat: 'No', name: '' },
  );
});
test('valors absents o desconeguts queden buits', () => {
  const empty = { profile: '', product: '', hasBoat: '', name: '' };
  assert.deepEqual(toSession({}, { products, dict }), empty);
  assert.deepEqual(toSession({ product: 'x', profile: 'x', hasBoat: 'potser' }, { products, dict }), empty);
});
test('el nom es retalla a 100 caràcters', () => {
  assert.equal(Array.from(toSession({ name: 'a'.repeat(300) }, { products, dict }).name).length, 100);
});
