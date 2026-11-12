// Camps comuns de l'inici i de la pàgina de dades: text amb error i caselles de marcatge múltiple.
export function makeFields({ h, T, f, values, errors, onChange, onToggle }) {
  const set = (field) => (e) => onChange(field, e.target.value);
  const error = (field) => (errors[field] ? f.errors[errors[field]] : undefined);

  const text = (field, label, extra = {}) =>
    h(T.Field, { label, name: field, id: field, value: values[field], error: error(field), onChange: set(field), ...extra });

  // El component del sistema avisa amb l'esdeveniment del canvi (valor de la casella).
  const checks = (field, legend, options) =>
    h(T.CheckboxGroup, { legend, name: field, values: values[field], options, onChange: (e) => onToggle(field, e.target.value) });

  return { text, checks };
}
