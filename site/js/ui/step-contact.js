// site/js/ui/step-contact.js — pas 1: dades de contacte i consentiment
import { stepLabel } from '../form/steps.js';
import { makeFields } from './fields.js';
import { createStepIndicator } from './step-indicator.js';

export function createStepContact({ h, T }) {
  const StepIndicator = createStepIndicator({ h });
  return function StepContact({ t, values, errors, onChange, onNext, onBack, onKeyDown, privacyHref }) {
    const f = t.form;
    const { text } = makeFields({ h, T, f, values, errors, onChange });
    const error = (field) => (errors[field] ? f.errors[errors[field]] : undefined);

    return h('div', { className: 'page__screen page__screen--form' },
      StepIndicator({ step: 1, total: 2, label: stepLabel(f.stepOf, 1, 2) }),
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.step1Title, subtitle: f.step1Subtitle, className: 'page__title' })),
      h('p', { className: 'body-sm page__note' }, f.requiredNote),
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onNext(); } },
        h('div', { className: 'form__group' },
          text('name', f.name, { required: true }),
          text('email', f.email, { required: true, type: 'email' }),
          text('phone', f.phone, { required: true, type: 'tel' })),
        h('div', { className: 'form__group' },
          h(T.Checkbox, { name: 'privacy', id: 'privacy', required: true, checked: values.privacy, error: error('privacy'), onChange: (e) => onChange('privacy', e.target.checked) },
            // Un sol element: l'etiqueta del Checkbox és flex i, amb tres fills, es perdria l'espai abans de l'enllaç.
            h('span', null, f.consentBefore, h('a', { href: privacyHref, target: '_blank', rel: 'noopener' }, f.consentLink))),
          h(T.Checkbox, { name: 'newsletter', id: 'newsletter', checked: values.newsletter, onChange: (e) => onChange('newsletter', e.target.checked) }, f.newsletter)),
        h('div', { className: 'form__actions' },
          h(T.Button, { type: 'submit', full: true }, `${f.next} →`),
          h(T.Button, { variant: 'link', onClick: onBack }, `← ${t.back}`))));
  };
}
