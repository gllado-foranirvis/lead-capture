// site/js/ui/step-contact.js — pàgina 1: dades de contacte, producte i consentiment
import { ADVICE } from '../form/model.js';
import { formatPhone, keepCaret, phoneExample, prefixSuggestions, splitInternational } from '../form/phone.js';
import { stepLabel } from '../form/steps.js';
import { makeFields } from './fields.js';
import { createStepIndicator } from './step-indicator.js';

export function createStepContact({ h, T }) {
  const StepIndicator = createStepIndicator({ h });
  return function StepContact({ t, lang = 'es', products, askProduct = true, downloads = [], values, errors, onChange, onToggle, onSubmit, onBack, onKeyDown, privacyHref }) {
    const f = t.form;
    const { text, checks } = makeFields({ h, T, f, values, errors, onChange, onToggle });
    const productOptions = [...products.map((p) => ({ value: p.id, label: p.name })), { value: ADVICE, label: f.productAdvice }];
    const error = (field) => (errors[field] ? f.errors[errors[field]] : undefined);
    // El número es reagrupa mentre s'escriu (segons el prefix) i també quan es canvia de prefix.
    const onPhone = (e) => {
      // Un número internacional («+351 912…», «0034…») passa el prefix al seu camp.
      const international = splitInternational(e.target.value);
      if (international) {
        onChange('phonePrefix', international.prefix);
        onChange('phone', formatPhone(international.prefix, international.number));
        return;
      }
      const formatted = formatPhone(values.phonePrefix, e.target.value);
      onChange('phone', formatted);
      keepCaret(e.target, formatted);
    };
    const onPrefix = (e) => {
      onChange('phonePrefix', e.target.value);
      const formatted = formatPhone(e.target.value, values.phone);
      if (formatted !== values.phone) onChange('phone', formatted);
    };

    return h('div', { className: 'page__screen page__screen--form' },
      StepIndicator({ step: 1, total: 2, label: stepLabel(f.stepOf, 1, 2) }),
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.step1Title, subtitle: f.step1Subtitle, className: 'page__title' })),
      h('p', { className: 'body-sm page__note' }, f.requiredNote),
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onSubmit(); } },
        h('div', { className: 'form__group' },
          text('name', f.name, { required: true, placeholder: f.namePlaceholder }),
          text('email', f.email, { required: true, type: 'email', placeholder: f.emailPlaceholder }),
          // Prefix i número en camps separats: el prefix surt amb +34 i es pot canviar (amb suggeriments).
          h('div', { className: 'form__phone' },
            text('phonePrefix', f.phonePrefix, { required: true, type: 'tel', onChange: onPrefix }),
            h('datalist', { id: 'phone-prefixes' }, prefixSuggestions(lang).map((o) => h('option', { key: o.value, value: o.value, label: o.label }))),
            text('phone', f.phone, { required: true, type: 'tel', placeholder: phoneExample(values.phonePrefix, f.phonePlaceholder), onChange: onPhone })),
          // El producte ja triat a l'inici surt marcat i es pot canviar.
          askProduct ? h('div', { className: 'form__products' },
            checks('products', f.productLegend, productOptions),
            // Què es descarregarà amb la tria actual: la promesa es veu al lloc on es decideix.
            h('p', { className: 'body-sm page__note form__download', 'aria-live': 'polite' }, downloads.length ? f.downloadList.replace('{list}', downloads.join(', ')) : f.downloadNone)) : null),
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
