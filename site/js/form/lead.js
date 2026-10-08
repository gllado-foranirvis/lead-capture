import { MAX, clip } from './model.js';
import { validateContact } from './validate.js';

export const newLeadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const BOAT_ANSWERS = ['si', 'no'];

// El pas 1 desa el correu abans del consentiment: queda registrat que la privacitat NO s'ha acceptat.
export function buildPartialLead(values, { id, lang, origin }) {
  return { id, stage: 'step1', product: values.product, email: clip(values.email, MAX.email).toLowerCase(), privacy: false, lang, origin };
}

function buildContact(values, { id, lang, origin }) {
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
  if (BOAT_ANSWERS.includes(values.hasBoat)) profiling.hasBoat = values.hasBoat;
  return profiling;
}

export function buildLead(values, context) {
  const profiling = buildProfiling(values, context.id);
  return { contact: buildContact(values, context), profiling, hasProfiling: Object.keys(profiling).length > 1 };
}

export function submitForm(values, { products, ...context }) {
  const errors = validateContact(values, products);
  return Object.keys(errors).length ? { errors } : { lead: buildLead(values, context) };
}
