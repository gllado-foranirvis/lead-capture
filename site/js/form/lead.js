import { ACTIVITIES, MAX, OPINION_GROUPS, PROFILES, clip, fullPhone, showsActivity } from './model.js';
import { validateContact, validateProfile } from './validate.js';

export const newLeadId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const YES_NO = ['si', 'no'];
const answered = (value) => clip(value, 1) !== '';

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

// El pas 1 ja té el consentiment: el lead parcial és un contacte real.
export const buildPartialLead = (values, context) => ({ ...buildContact(values, context), stage: 'step1' });

// Només opcions vàlides, en l'ordre de la llista; el text «altre» només si «other» és marcat.
function addOpinion(values, profiling) {
  for (const [group, options] of Object.entries(OPINION_GROUPS)) {
    const chosen = options.filter((option) => (values[group] ?? []).includes(option));
    if (!chosen.length) continue;
    profiling[group] = chosen;
    const other = `${group}Other`;
    if (chosen.includes('other') && answered(values[other])) profiling[other] = clip(values[other], MAX.other);
  }
}

function buildProfiling(values, id) {
  const profiling = { id };
  if (PROFILES.includes(values.profile)) profiling.profile = values.profile;
  if (showsActivity(values) && ACTIVITIES.includes(values.activity)) {
    profiling.activity = values.activity;
    if (values.activity === 'otra' && answered(values.activityOther)) profiling.activityOther = clip(values.activityOther, MAX.activityOther);
  }
  if (YES_NO.includes(values.hasBoat)) profiling.hasBoat = values.hasBoat;
  if (YES_NO.includes(values.hasElectric)) profiling.hasElectric = values.hasElectric;
  if (YES_NO.includes(values.intent)) profiling.intent = values.intent;
  addOpinion(values, profiling);
  if (answered(values.comments)) profiling.comments = clip(values.comments, MAX.comments);
  return profiling;
}

const withProfiling = (contact, profiling) => ({ contact, profiling, hasProfiling: Object.keys(profiling).length > 1 });

export const buildLead = (values, context) => withProfiling(buildContact(values, context), buildProfiling(values, context.id));

export function submitContact(values, context) {
  const errors = validateContact(values);
  return Object.keys(errors).length ? { errors } : { lead: buildPartialLead(values, context) };
}

export function submitProfile(values, context) {
  const errors = validateProfile(values);
  return Object.keys(errors).length ? { errors } : { lead: buildLead(values, context) };
}

// Saltar el pas 2: el lead es completa només amb el contacte, encara que hi hagi respostes a mig fer.
export const skipProfile = (values, context) => ({ lead: withProfiling(buildContact(values, context), { id: context.id }) });
