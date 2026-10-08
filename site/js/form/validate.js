import { PROFILES } from './model.js';

export const FIELD_ORDER = ['product', 'name', 'email', 'phone', 'profile', 'privacy'];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^[+\d\s().-]+$/;
const PHONE_DIGITS = { min: 7, max: 15 };

const text = (values, field) => String(values[field] ?? '').trim();
const digitCount = (s) => s.replace(/\D/g, '').length;

function phoneError(phone) {
  if (!phone) return 'required';
  const n = digitCount(phone);
  return PHONE_CHARS.test(phone) && n >= PHONE_DIGITS.min && n <= PHONE_DIGITS.max ? undefined : 'phone';
}

export function validateContact(values, products) {
  const errors = {};
  if (!products.some((p) => p.id === values.product)) errors.product = 'productRequired';
  if (!text(values, 'name')) errors.name = 'required';
  const email = text(values, 'email');
  if (!email) errors.email = 'required';
  else if (!EMAIL.test(email)) errors.email = 'email';
  const phone = phoneError(text(values, 'phone'));
  if (phone) errors.phone = phone;
  if (!PROFILES.includes(values.profile)) errors.profile = 'profileRequired';
  if (values.privacy !== true) errors.privacy = 'privacy';
  return errors;
}

export const firstErrorField = (errors) => FIELD_ORDER.find((field) => errors[field]);

export function clearError(errors, field) {
  const { [field]: _removed, ...rest } = errors;
  return rest;
}
