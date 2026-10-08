import { firstErrorField } from './validate.js';

export function focusFirstError(errors, doc) {
  const field = firstErrorField(errors);
  const element = field && doc.querySelector(`[name="${field}"]`);
  if (!element) return false;
  element.focus();
  return true;
}

// En canviar de pantalla el focus va al títol, perquè el lector de pantalla anunciï el pas nou.
export function focusStepHeading(doc) {
  const element = doc.querySelector('[data-step-heading]');
  if (!element) return false;
  element.focus();
  return true;
}
