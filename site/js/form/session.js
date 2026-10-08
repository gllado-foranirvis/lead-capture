import { ADVICE, MAX, clip } from './model.js';

// «Profesional» del formulari fa servir el missatge «distribuidor» (decisió oberta amb Bruno).
const MESSAGE_PROFILE = { profesional: 'distribuidor', particular: 'particular' };
const BOAT_ANSWER = { si: 'yes', no: 'no' };

// Dades de la sessió en l'idioma actual, preparades per als missatges de WhatsApp i correu.
export function toSession(values, { products, dict }) {
  const product = values.product === ADVICE ? dict.form.productAdvice : products.find((p) => p.id === values.product)?.name;
  const boat = BOAT_ANSWER[values.hasBoat];
  return {
    profile: MESSAGE_PROFILE[values.profile] ?? '',
    product: product ?? '',
    hasBoat: boat ? dict.form[boat] : '',
    name: clip(values.name, MAX.name),
  };
}
