import { PROFILES } from './model.js';

// Camps validats, en l'ordre del formulari.
export const FIELD_ORDER = ['name', 'email', 'phonePrefix', 'phone', 'privacy', 'profile'];

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

// Contacte i consentiment: nom obligatori; cal almenys un de correu o telèfon (un sol error «either», al correu).
export function validateContact(values) {
  const errors = {};
  if (!text(values, 'name')) errors.name = 'required';
  const email = text(values, 'email');
  const number = text(values, 'phone');
  if (!email && !number) errors.email = 'either';
  else if (email && !EMAIL.test(email)) errors.email = 'email';
  if (number) {
    const prefix = text(values, 'phonePrefix').replace(/\s/g, '');
    if (!PREFIX.test(prefix)) errors.phonePrefix = 'prefix';
    const phone = phoneError(prefix, number);
    if (phone) errors.phone = phone;
  }
  if (values.privacy !== true) errors.privacy = 'privacy';
  return errors;
}

// Perfilació: només el perfil és obligatori (i només si el visitant envia el pas 2; saltar-lo no el valida).
export const validateProfile = (values) => (PROFILES.includes(values.profile) ? {} : { profile: 'profileRequired' });

export const firstErrorField = (errors) => FIELD_ORDER.find((field) => errors[field]);

export function clearError(errors, field) {
  const { [field]: _removed, ...rest } = errors;
  return rest;
}
