import { deselectProps } from '../chips.js';

export function createEntryScreen({ h, T, icon }) {
  return function EntryScreen({ t, links, email, profile, onProfile, onClearProfile, legalQuery, onOpenForm }) {
    const withForm = typeof onOpenForm === 'function';
    return h('div', { className: 'page__screen' },
      h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: t.title, subtitle: t.subtitle, className: 'page__title' }),
      h('div', deselectProps(profile, onClearProfile),
        h(T.ChoiceChips, {
          legend: t.profileLegend, name: 'perfil', value: profile,
          options: [{ value: 'distribuidor', label: t.profileDistribuidor }, { value: 'particular', label: t.profileParticular }],
          onChange: (e) => onProfile(e.target.value),
        })),
      withForm ? h(T.Button, { full: true, onClick: onOpenForm }, t.form.entryCta) : null,
      h(T.SectionLabel, null, withForm ? t.form.entryContactLabel : t.contactLabel),
      h('div', { className: 'page__stack' },
        h(T.Button, { full: true, variant: withForm ? 'outline' : undefined, href: links.whatsapp }, icon(h, 'whatsapp'), t.whatsapp),
        h(T.Button, { full: true, variant: 'outline', href: links.email }, icon(h, 'mail'), t.emailLabel),
        h('p', { className: 'body-sm page__note' }, t.contactHint),
        h('p', { className: 'body-sm page__note' }, `${t.contactFallback} `, h('span', { className: 'page__address' }, email))),
      h(T.LegalLinks, {
        label: t.legalNav,
        links: [{ label: t.privacy, href: `privacy.html${legalQuery}` }, { label: t.cookies, href: `privacy.html${legalQuery}#cookies` }],
      }));
  };
}
