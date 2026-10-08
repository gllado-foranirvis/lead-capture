import { deselectProps } from '../chips.js';

// Camps comuns als dos passos: text amb error i xips amb error accessible.
export function makeFields({ h, T, f, values, errors, onChange }) {
  const set = (field) => (e) => onChange(field, e.target.value);
  const error = (field) => (errors[field] ? f.errors[errors[field]] : undefined);

  const text = (field, label, extra = {}) =>
    h(T.Field, { label, name: field, id: field, value: values[field], error: error(field), onChange: set(field), ...extra });

  const chips = (field, legend, options, { required = false } = {}) => {
    const group = h(T.ChoiceChips, { legend: required ? `${legend} *` : legend, name: field, value: values[field], options, onChange: set(field) });
    const message = error(field);
    const body = [group, message ? h('p', { className: 'caption form__error', role: 'alert' }, `! ${message}`) : null];
    return h('div', required ? {} : deselectProps(values[field], () => onChange(field, '')), ...body);
  };

  return { text, chips };
}
