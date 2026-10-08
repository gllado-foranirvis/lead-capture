import { ACTIVITIES, MAX, PROFILES, clip, fullPhone, showsActivity } from './model.js';
import { validateContact } from './validate.js';

export const newLeadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const YES_NO = ['si', 'no'];
const answered = (value) => clip(value, 1) !== '';

function buildContact(values, { id, lang, origin }) {
  return {
    id, product: values.product,
    name: clip(values.name, MAX.name),
    email: clip(values.email, MAX.email).toLowerCase(),
    phone: fullPhone(values),
    privacy: true,
    newsletter: values.newsletter === true,
    lang, profile: values.profile, origin,
  };
}

// El pas 1 ja té el consentiment: el lead parcial és un contacte real i porta el perfil si el visitant ja l'ha triat.
export function buildPartialLead(values, { id, lang, origin }) {
  const { product: _product, ...contact } = buildContact(values, { id, lang, origin });
  const lead = { ...contact, stage: 'step1' };
  if (!PROFILES.includes(values.profile)) delete lead.profile;
  return lead;
}

function buildProfiling(values, id) {
  const profiling = { id };
  if (showsActivity(values) && ACTIVITIES.includes(values.activity)) {
    profiling.activity = values.activity;
    if (values.activity === 'otra' && answered(values.activityOther)) profiling.activityOther = clip(values.activityOther, MAX.activityOther);
  }
  if (YES_NO.includes(values.hasBoat)) profiling.hasBoat = values.hasBoat;
  if (YES_NO.includes(values.intent)) profiling.intent = values.intent;
  return profiling;
}

export function buildLead(values, context) {
  const profiling = buildProfiling(values, context.id);
  return { contact: buildContact(values, context), profiling, hasProfiling: Object.keys(profiling).length > 1 };
}

export function submitForm(values, context) {
  const errors = validateContact(values);
  return Object.keys(errors).length ? { errors } : { lead: buildLead(values, context) };
}
