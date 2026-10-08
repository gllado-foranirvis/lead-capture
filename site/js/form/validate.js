import { ADVICE, PROFILES } from './model.js';

export const STEP_FIELDS = { 1: ['product', 'email'], 2: ['name', 'profile', 'phone', 'privacy'] };
export const FIELD_ORDER = [...STEP_FIELDS[1], ...STEP_FIELDS[2]];

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;
const PHONE_CHARS = /^\+?[\d\s().-]+$/;
const PHONE_DIGITS = { min: 7, max: 15 };

const text = (values, field) => String(values[field] ?? '').trim();
const digitCount = (s) => s.replace(/\D/g, '').length;

function phoneError(phone) {
  if (!phone) return 'required';
  const n = digitCount(phone);
  return PHONE_CHARS.test(phone) && n >= PHONE_DIGITS.min && n <= PHONE_DIGITS.max ? undefined : 'phone';
}

export function validateStep1(values, products) {
  const errors = {};
  if (![...products.map((p) => p.id), ADVICE].includes(values.product)) errors.product = 'productRequired';
  const email = text(values, 'email');
  if (!email) errors.email = 'required';
  else if (!EMAIL.test(email)) errors.email = 'email';
  return errors;
}

export function validateStep2(values) {
  const errors = {};
  if (!text(values, 'name')) errors.name = 'required';
  if (!PROFILES.includes(values.profile)) errors.profile = 'profileRequired';
  const phone = phoneError(text(values, 'phone'));
  if (phone) errors.phone = phone;
  if (values.privacy !== true) errors.privacy = 'privacy';
  return errors;
}

export const validateContact = (values, products) => ({ ...validateStep1(values, products), ...validateStep2(values) });

export const firstErrorField = (errors) => FIELD_ORDER.find((field) => errors[field]);

export function clearError(errors, field) {
  const { [field]: _removed, ...rest } = errors;
  return rest;
}
