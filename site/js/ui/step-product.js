import { ADVICE } from '../form/model.js';
import { stepLabel } from '../form/steps.js';
import { makeFields } from './fields.js';
import { createStepIndicator } from './step-indicator.js';

export function createStepProduct({ h, T }) {
  const StepIndicator = createStepIndicator({ h });
  return function StepProduct({ t, products, values, errors, onChange, onNext, onBack, onKeyDown }) {
    const f = t.form;
    const { text, chips } = makeFields({ h, T, f, values, errors, onChange });
    const options = [...products.map((p) => ({ value: p.id, label: p.name })), { value: ADVICE, label: f.productAdvice }];

    return h('div', { className: 'page__screen page__screen--form' },
      StepIndicator({ step: 1, total: 2, label: stepLabel(f.stepOf, 1, 2) }),
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.step1Title, subtitle: f.step1Subtitle, className: 'page__title' })),
      h('p', { className: 'body-sm page__note' }, f.requiredNote),
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onNext(); } },
        h('div', { className: 'form__group' },
          chips('product', f.productLegend, options, { required: true }),
          text('email', f.email, { required: true, type: 'email' })),
        h('div', { className: 'form__actions' },
          h(T.Button, { type: 'submit', full: true }, `${f.next} →`),
          h(T.Button, { variant: 'link', onClick: onBack }, `← ${t.back}`))));
  };
}
