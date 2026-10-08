import { PROFILES } from '../form/model.js';
import { stepLabel } from '../form/steps.js';
import { makeFields } from './fields.js';
import { createStepIndicator } from './step-indicator.js';

export function createStepContact({ h, T }) {
  const StepIndicator = createStepIndicator({ h });
  return function StepContact({ t, values, errors, onChange, onSubmit, onBack, onKeyDown, privacyHref }) {
    const f = t.form;
    const { text, chips } = makeFields({ h, T, f, values, errors, onChange });
    const error = (field) => (errors[field] ? f.errors[errors[field]] : undefined);
    const yesNo = [{ value: 'si', label: f.yes }, { value: 'no', label: f.no }];

    return h('div', { className: 'page__screen page__screen--form' },
      StepIndicator({ step: 2, total: 2, label: stepLabel(f.stepOf, 2, 2) }),
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.step2Title, subtitle: f.step2Subtitle, className: 'page__title' })),
      h('p', { className: 'body-sm page__note' }, f.requiredNote),
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onSubmit(); } },
        h('div', { className: 'form__group' },
          text('name', f.name, { required: true }),
          chips('profile', f.profileLegend, PROFILES.map((p) => ({ value: p, label: f.profiles[p] })), { required: true }),
          text('phone', f.phone, { required: true, type: 'tel' }),
          chips('hasBoat', f.hasBoat, yesNo)),
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
