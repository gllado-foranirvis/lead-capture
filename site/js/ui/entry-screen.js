import { deselectProps } from '../chips.js';

export function createEntryScreen({ h, T, icon }) {
  return function EntryScreen({ t, links, email, profile, profileLegend, profileOptions, onProfile, onClearProfile, legalQuery, onOpenForm }) {
    const withForm = typeof onOpenForm === 'function';
    const f = t.form;
    return h('div', { className: 'page__screen' },
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, {
          layout: 'mobile', align: 'start', level: 1, className: 'page__title',
          title: withForm ? f.entryTitle : t.title, subtitle: withForm ? f.entrySubtitle : t.subtitle,
        })),
      // La pregunta de perfil és sempre visible: el missatge de WhatsApp i correu i el pas 2 la fan servir.
      h('div', deselectProps(profile, onClearProfile),
        h(T.ChoiceChips, { legend: profileLegend, name: 'perfil', value: profile, options: profileOptions, onChange: (e) => onProfile(e.target.value) })),
      withForm ? h(T.Button, { full: true, onClick: onOpenForm }, f.entryCta) : null,
      h(T.SectionLabel, null, withForm ? f.entryContactLabel : t.contactLabel),
      h('div', { className: 'page__stack' },
        h(T.Button, { full: true, variant: withForm ? 'outline' : undefined, href: links.whatsapp }, icon(h, 'whatsapp'), withForm ? f.entryWhatsapp : t.whatsapp),
        h(T.Button, { full: true, variant: 'outline', href: links.email }, icon(h, 'mail'), withForm ? f.entryEmail : t.emailLabel),
        h('p', { className: 'body-sm page__note' }, t.contactHint),
        h('p', { className: 'body-sm page__note' }, `${t.contactFallback} `, h('span', { className: 'page__address' }, email))),
      h(T.LegalLinks, {
        label: t.legalNav,
        links: [{ label: t.privacy, href: `privacy.html${legalQuery}` }, { label: t.cookies, href: `privacy.html${legalQuery}#cookies` }],
      }));
  };
}
