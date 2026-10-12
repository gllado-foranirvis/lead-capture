import { deselectProps } from '../chips.js';

export function createEntryScreen({ h, T, icon }) {
  return function EntryScreen({ t, links, email, profile, profileLegend, profileOptions, onProfile, onClearProfile, legalQuery, onOpenForm }) {
    const withForm = typeof onOpenForm === 'function';
    const f = t.form;
    // Escena fotogràfica a tot sang (títol i subtítol sobre el vel) i, sota, el cos de la pàgina amb el contacte.
    return h('div', { className: 'page__screen page__screen--entry' },
      h('section', { className: 'stage tsf-on-dark' },
        h('div', { className: 'page__heading stage__copy', tabIndex: -1, 'data-step-heading': '' },
          h('h1', { className: 'h2 stage__title' }, withForm ? f.entryTitle : t.title),
          h('p', { className: 'body-sm stage__sub' }, withForm ? f.entrySubtitle : t.subtitle))),
      h('div', { className: 'page__body' },
      // La pregunta de perfil és sempre visible: el missatge de WhatsApp i correu i el pas 2 la fan servir.
      h('div', deselectProps(profile, onClearProfile),
        h(T.ChoiceChips, { legend: profileLegend, name: 'perfil', value: profile, options: profileOptions, onChange: (e) => onProfile(e.target.value) })),
      // L'etiqueta i els botons de contacte són un sol grup (8px entre ells; 16px entre grups).
      h('div', { className: 'page__group' },
      h(T.SectionLabel, null, withForm ? f.entryContactLabel : t.contactLabel),
      h('div', { className: 'page__stack' },
        h(T.Button, { full: true, variant: withForm ? 'outline' : undefined, href: links.whatsapp }, icon(h, 'whatsapp'), withForm ? f.entryWhatsapp : t.whatsapp),
        h(T.Button, { full: true, variant: 'outline', href: links.email }, icon(h, 'mail'), withForm ? f.entryEmail : t.emailLabel),
        h('p', { className: 'body-sm page__note' }, t.contactHint))),
      // El CTA principal va després dels contactes; la línia de recuperació (l'adreça), just darrere, abans dels enllaços legals.
      withForm ? h(T.Button, { full: true, className: 'page__cta', onClick: onOpenForm }, f.entryCta) : null,
      h('p', { className: 'body-sm page__note' }, `${t.contactFallback} `, h('span', { className: 'page__address' }, email)),
      h(T.LegalLinks, {
        label: t.legalNav,
        links: [{ label: t.privacy, href: `privacy.html${legalQuery}` }, { label: t.cookies, href: `privacy.html${legalQuery}#cookies` }],
      })));
  };
}
