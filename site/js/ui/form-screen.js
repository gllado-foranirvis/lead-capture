import { ACTIVITIES, PROFILES, showsActivity, showsActivityOther } from '../form/model.js';
import { deselectProps } from '../chips.js';

export function createFormScreen({ h, T }) {
  return function FormScreen({ t, products, values, errors, onChange, onSubmit, onBack, onKeyDown, privacyHref }) {
    const f = t.form;
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

    const yesNo = [{ value: 'si', label: f.yes }, { value: 'no', label: f.no }];

    return h('div', { className: 'page__screen page__screen--form' },
      h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.title, subtitle: f.subtitle, className: 'page__title' }),
      h('p', { className: 'body-sm page__note' }, f.requiredNote),
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onSubmit(); } },
        h('div', { className: 'form__group' },
          h(T.Select, {
            label: f.product, name: 'product', id: 'product', required: true, placeholder: f.productPlaceholder,
            options: products.map((p) => ({ value: p.id, label: p.name })),
            value: values.product, error: error('product'), onChange: set('product'),
          }),
          text('name', f.name, { required: true }),
          text('email', f.email, { required: true, type: 'email' }),
          text('phone', f.phone, { required: true, type: 'tel' }),
          chips('profile', f.profileLegend, PROFILES.map((p) => ({ value: p, label: f.profiles[p] })), { required: true })),
        h('section', { className: 'form__group' },
          h(T.SectionLabel, { as: 'h2' }, f.profilingTitle),
          showsActivity(values) ? h(T.Select, {
            label: f.activity, name: 'activity', id: 'activity', placeholder: f.activityPlaceholder,
            options: ACTIVITIES.map((a) => ({ value: a, label: f.activities[a] })),
            value: values.activity, onChange: set('activity'),
          }) : null,
          showsActivityOther(values) ? text('activityOther', f.activityOther) : null,
          chips('hasElectric', f.hasElectric, yesNo),
          chips('investing', f.investing, yesNo),
          text('demo', f.demo, { placeholder: f.demoPlaceholder })),
        h('div', { className: 'form__group' },
          h(T.Checkbox, { name: 'privacy', id: 'privacy', required: true, checked: values.privacy, error: error('privacy'), onChange: (e) => onChange('privacy', e.target.checked) },
            // Un sol element: l'etiqueta del Checkbox és flex i, amb tres fills, es perdria l'espai abans de l'enllaç.
            h('span', null, f.consentBefore, h('a', { href: privacyHref, target: '_blank', rel: 'noopener' }, f.consentLink))),
          h(T.Checkbox, { name: 'newsletter', id: 'newsletter', checked: values.newsletter, onChange: (e) => onChange('newsletter', e.target.checked) }, f.newsletter)),
        h('div', { className: 'form__actions' },
          h(T.Button, { type: 'submit', full: true }, f.submit),
          h(T.Button, { variant: 'link', onClick: onBack }, `← ${t.back}`))));
  };
}
