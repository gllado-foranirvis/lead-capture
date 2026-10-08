import { firstErrorField } from './validate.js';

export function focusFirstError(errors, doc) {
  const field = firstErrorField(errors);
  const element = field && doc.querySelector(`[name="${field}"]`);
  if (!element) return false;
  element.focus();
  return true;
}
