import { MAX, OPINION_GROUPS, clip, showsActivity } from './model.js';

// «Profesional» del formulari fa servir el missatge «distribuidor» (decisió oberta amb Bruno).
const MESSAGE_PROFILE = { profesional: 'distribuidor', particular: 'particular' };
// Els comentaris llargs no caben bé a un enllaç de correu o WhatsApp: al missatge només en van els primers.
const MAX_MESSAGE_COMMENTS = 200;
const ANSWER = { si: 'yes', no: 'no' };

const answer = (value, dict) => (ANSWER[value] ? dict.form[ANSWER[value]] : '');

function activityLabel(values, dict) {
  if (!showsActivity(values)) return '';
  const written = clip(values.activityOther, MAX.activityOther);
  if (values.activity === 'otra' && written) return written;
  return dict.form.activities[values.activity] ?? '';
}

// Opcions marcades d'una pregunta d'opinió en l'idioma actual, separades per comes; «other» usa el text escrit.
function opinionLabel(values, group, dict) {
  const labels = dict.form[`${group}Options`] ?? {};
  return OPINION_GROUPS[group]
    .filter((option) => (values[group] ?? []).includes(option))
    .map((option) => (option === 'other' ? clip(values[`${group}Other`], MAX.other) || labels.other : labels[option]))
    .filter(Boolean)
    .join(', ');
}

// Dades de la sessió en l'idioma actual, preparades per als missatges de WhatsApp i correu.
export function toSession(values, { products, dict }) {
  const product = values.product === 'asesoramiento' ? dict.form.productAdvice : products.find((p) => p.id === values.product)?.name;
  return {
    profile: MESSAGE_PROFILE[values.profile] ?? '',
    product: product ?? '',
    activity: activityLabel(values, dict),
    hasBoat: answer(values.hasBoat, dict),
    hasElectric: answer(values.hasElectric, dict),
    intent: answer(values.intent, dict),
    demo: clip(values.demo, MAX.demo),
    enthusiasm: opinionLabel(values, 'enthusiasm', dict),
    concerns: opinionLabel(values, 'concerns', dict),
    factors: opinionLabel(values, 'factors', dict),
    comments: clip(values.comments, MAX_MESSAGE_COMMENTS),
    name: clip(values.name, MAX.name),
  };
}
