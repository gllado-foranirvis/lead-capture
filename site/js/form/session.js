import { MAX, clip, showsActivity } from './model.js';

// «Profesional» del formulari fa servir el missatge «distribuidor» (decisió oberta amb Bruno).
const MESSAGE_PROFILE = { profesional: 'distribuidor', particular: 'particular' };
const ANSWER = { si: 'yes', no: 'no' };

const answer = (value, dict) => (ANSWER[value] ? dict.form[ANSWER[value]] : '');

function activityLabel(values, dict) {
  if (!showsActivity(values)) return '';
  const written = clip(values.activityOther, MAX.activityOther);
  if (values.activity === 'otra' && written) return written;
  return dict.form.activities[values.activity] ?? '';
}

// Dades de la sessió en l'idioma actual, preparades per als missatges de WhatsApp i correu.
export function toSession(values, { products, dict }) {
  const product = values.product === 'asesoramiento' ? dict.form.productAdvice : products.find((p) => p.id === values.product)?.name;
  return {
    profile: MESSAGE_PROFILE[values.profile] ?? '',
    product: product ?? '',
    activity: activityLabel(values, dict),
    hasBoat: answer(values.hasBoat, dict),
    intent: answer(values.intent, dict),
    name: clip(values.name, MAX.name),
  };
}
