// site/js/ui/step-profile.js — pas 2: perfilació («Quem és» obligatori només si s'envia; es pot saltar)
import { ACTIVITIES, CONCERNS, ENTHUSIASM, FACTORS, PROFILES, showsActivity, showsActivityOther } from '../form/model.js';
import { stepText } from '../form/steps.js';
import { makeFields } from './fields.js';
import { createStepIndicator } from './step-indicator.js';

export function createStepProfile({ h, T }) {
  const StepIndicator = createStepIndicator({ h });
  return function StepProfile({ t, values, errors, saved = false, onChange, onToggle, onSubmit, onSkip, onBack, onKeyDown }) {
    const f = t.form;
    const { text, chips, select, checks } = makeFields({ h, T, f, values, errors, onChange, onToggle });
    const options = (list, labels) => list.map((value) => ({ value, label: labels[value] }));
    // Pregunta de marcatge múltiple amb, si es marca «Otro», el seu camp per especificar.
    const opinion = (group, list) => [
      checks(group, f[`${group}Legend`], options(list, f[`${group}Options`])),
      values[group].includes('other') ? text(`${group}Other`, f.otherLabel, { placeholder: f.otherPlaceholder }) : null,
    ];
    const yesNo = [{ value: 'si', label: f.yes }, { value: 'no', label: f.no }];

    return h('div', { className: 'page__screen page__screen--form' },
      StepIndicator({ step: 3, total: f.stepNames.length, label: stepText(f.stepOf, f.stepNames, 3, f.stepNames.length) }),
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: f.step2Title, subtitle: f.step2Subtitle, className: 'page__title' })),
      saved ? h('p', { className: 'body-sm page__note form__saved', 'aria-live': 'polite' }, f.saved) : null,
      h('form', { className: 'form', noValidate: true, onKeyDown, onSubmit: (e) => { e.preventDefault(); onSubmit(); } },
        h('div', { className: 'form__group' },
          chips('profile', f.profileLegend, PROFILES.map((p) => ({ value: p, label: f.profiles[p] })), { required: true }),
          showsActivity(values) ? select('activity', f.activity, [{ value: '', label: f.activityNone }, ...ACTIVITIES.map((a) => ({ value: a, label: f.activities[a] }))], { placeholder: f.activityPlaceholder }) : null,
          showsActivityOther(values) ? text('activityOther', f.activityOther, { placeholder: f.activityOtherPlaceholder }) : null),
        // La resta de preguntes són opcionals: plegades, perquè el visitant vegi el camí curt (enviar o saltar) sense desplaçar-se.
        h('details', { className: 'form__more' },
          h('summary', { className: 'form__more-summary' }, f.moreGroup),
          h('div', { className: 'form__group' },
            chips('hasBoat', f.hasBoat, yesNo),
            chips('hasElectric', f.hasElectric, yesNo),
            ...opinion('enthusiasm', ENTHUSIASM),
            ...opinion('concerns', CONCERNS),
            chips('intent', f.intent, yesNo),
            ...opinion('factors', FACTORS),
            text('comments', f.comments, { multiline: true, placeholder: f.commentsPlaceholder }))),
        h('div', { className: 'form__actions' },
          h(T.Button, { type: 'submit', full: true }, f.submit),
          h(T.Button, { full: true, variant: 'outline', onClick: onSkip }, f.skipLabel),
          h(T.Button, { variant: 'link', onClick: onBack }, `← ${t.back}`))));
  };
}
