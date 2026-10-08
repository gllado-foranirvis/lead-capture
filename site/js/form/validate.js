import { PROFILES } from './model.js';

export const STEP_FIELDS = { 1: ['name', 'email', 'phonePrefix', 'phone', 'privacy'], 2: ['profile'] };
export const FIELD_ORDER = [...STEP_FIELDS[1], ...STEP_FIELDS[2]];

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;
const PREFIX = /^\+?\d{1,3}$/;
const NUMBER_CHARS = /^[\d\s().-]+$/;
const PHONE_DIGITS = { min: 7, max: 15 };

const text = (values, field) => String(values[field] ?? '').trim();
const digitCount = (s) => s.replace(/\D/g, '').length;

// El prefix i el número són camps separats; les 7–15 xifres es compten sobre el telèfon sencer.
function phoneError(prefix, number) {
  if (!number) return 'required';
  const n = digitCount(prefix) + digitCount(number);
  return NUMBER_CHARS.test(number) && n >= PHONE_DIGITS.min && n <= PHONE_DIGITS.max ? undefined : 'phone';
}

// Pas 1: contacte i consentiment.
export function validateStep1(values) {
  const errors = {};
  if (!text(values, 'name')) errors.name = 'required';
  const email = text(values, 'email');
  if (!email) errors.email = 'required';
  else if (!EMAIL.test(email)) errors.email = 'email';
  const prefix = text(values, 'phonePrefix').replace(/\s/g, '');
  if (!PREFIX.test(prefix)) errors.phonePrefix = 'prefix';
  const phone = phoneError(prefix, text(values, 'phone'));
  if (phone) errors.phone = phone;
  if (values.privacy !== true) errors.privacy = 'privacy';
  return errors;
}

// Pas 2: només el perfil és obligatori; la resta de la perfilació és opcional.
export function validateStep2(values) {
  return PROFILES.includes(values.profile) ? {} : { profile: 'profileRequired' };
}

export const validateContact = (values) => ({ ...validateStep1(values), ...validateStep2(values) });

export const firstErrorField = (errors) => FIELD_ORDER.find((field) => errors[field]);

export function clearError(errors, field) {
  const { [field]: _removed, ...rest } = errors;
  return rest;
}
