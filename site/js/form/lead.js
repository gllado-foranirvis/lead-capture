import { MAX, clip, fullPhone } from './model.js';
import { validateContact } from './validate.js';

export const newLeadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function buildContact(values, { id, lang, origin }) {
  return {
    id, product: (values.products ?? []).join(','),
    city: clip(values.city, MAX.city),
    name: clip(values.name, MAX.name),
    email: clip(values.email, MAX.email).toLowerCase(),
    phone: fullPhone(values),
    privacy: true,
    newsletter: values.newsletter === true,
    lang, origin,
  };
}

export const buildLead = (values, context) => ({ contact: buildContact(values, context) });

export function submitForm(values, context) {
  const errors = validateContact(values);
  return Object.keys(errors).length ? { errors } : { lead: buildLead(values, context) };
}
