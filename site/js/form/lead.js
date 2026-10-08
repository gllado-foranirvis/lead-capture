import { MAX } from './model.js';
import { validateContact } from './validate.js';

// Array.from evita partir un emoji (parell subrogat) pel mig.
const clip = (value, max) => Array.from(String(value ?? '').trim()).slice(0, max).join('');
const answered = (value) => clip(value, 1) !== '';

export const newLeadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function buildContact(values, id, { lang, origin }) {
  return {
    id, product: values.product,
    name: clip(values.name, MAX.name),
    email: clip(values.email, MAX.email).toLowerCase(),
    phone: clip(values.phone, MAX.phone),
    privacy: true,
    newsletter: values.newsletter === true,
    lang, profile: values.profile, origin,
  };
}

function buildProfiling(values, id) {
  const profiling = { id };
  if (values.profile === 'profesional' && values.activity) {
    profiling.activity = values.activity;
    if (values.activity === 'otra' && answered(values.activityOther)) profiling.activityOther = clip(values.activityOther, MAX.activityOther);
  }
  if (values.hasElectric) profiling.hasElectric = values.hasElectric;
  if (values.investing) profiling.investing = values.investing;
  if (answered(values.demo)) profiling.demo = clip(values.demo, MAX.demo);
  return profiling;
}

export function buildLead(values, { lang, origin, newId }) {
  const id = newId();
  const profiling = buildProfiling(values, id);
  return { contact: buildContact(values, id, { lang, origin }), profiling, hasProfiling: Object.keys(profiling).length > 1 };
}

export function submitForm(values, { products, lang, origin, newId }) {
  const errors = validateContact(values, products);
  return Object.keys(errors).length ? { errors } : { lead: buildLead(values, { lang, origin, newId }) };
}
