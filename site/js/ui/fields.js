import { deselectProps } from '../chips.js';

// Camps comuns als dos passos: text amb error i xips amb error accessible.
export function makeFields({ h, T, f, values, errors, onChange }) {
  const set = (field) => (e) => onChange(field, e.target.value);
  const error = (field) => (errors[field] ? f.errors[errors[field]] : undefined);

  const text = (field, label, extra = {}) =>
    h(T.Field, { label, name: field, id: field, value: values[field], error: error(field), onChange: set(field), ...extra });

  const chips = (field, legend, options, { required = false, className } = {}) => {
    const group = h(T.ChoiceChips, { legend: required ? `${legend} *` : legend, name: field, value: values[field], options, onChange: set(field) });
    const message = error(field);
    const body = [group, message ? h('p', { className: 'caption form__error', role: 'alert' }, `! ${message}`) : null];
    const wrapper = required ? {} : deselectProps(values[field], () => onChange(field, ''));
    return h('div', className ? { ...wrapper, className } : wrapper, ...body);
  };

  const select = (field, label, options, extra = {}) =>
    h(T.Select, { label, name: field, id: field, value: values[field], error: error(field), onChange: set(field), options, ...extra });

  return { text, chips, select };
}
