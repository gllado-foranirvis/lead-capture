import { ADVICE } from '../form/model.js';
import { makeFields } from './fields.js';

export function createEntryScreen({ h, T, icon }) {
  return function EntryScreen({ t, fair, links, email, products, askProduct, pdfNote = false, values, onChange, onToggle, onContactClick, legalQuery, onOpenForm }) {
    const withForm = typeof onOpenForm === 'function';
    const f = t.form;
    const { text, checks } = makeFields({ h, T, f, values, errors: {}, onChange, onToggle });
    const productOptions = [...products.map((p) => ({ value: p.id, label: p.name })), { value: ADVICE, label: f.productAdvice }];
    // Escena fotogràfica a tot sang (fira, títol i subtítol sobre el vel) i, sota, el cos de la pàgina amb les preguntes i el contacte.
    return h('div', { className: 'page__screen page__screen--entry' },
      h('section', { className: 'stage tsf-on-dark' },
        h('div', { className: 'page__heading stage__copy', tabIndex: -1, 'data-step-heading': '' },
          h('p', { className: 'label stage__fair' }, fair),
          h('h1', { className: 'h2 stage__title' }, withForm ? f.entryTitle : t.title),
          h('p', { className: 'body-sm stage__sub' }, withForm ? f.entrySubtitle : t.subtitle))),
      h('div', { className: 'page__body' },
        // Els productes i la ciutat només es pregunten amb el flux de captació; viatgen al formulari i als missatges.
        withForm && askProduct ? h('div', { className: 'form__products' }, checks('products', f.productLegend, productOptions)) : null,
        withForm ? text('city', f.cityLabel, { placeholder: f.cityPlaceholder }) : null,
        // El botó principal (descarregar el dossier) va abans de la dreçera de contacte: qui no vol perdre temps la té just a sota.
        withForm ? h(T.Button, { full: true, className: 'page__cta', onClick: onOpenForm }, f.entryCta) : null,
        withForm && askProduct && pdfNote ? h('p', { className: 'body-sm page__note page__pdfnote' }, f.entryPdfNote) : null,
        // L'etiqueta i els botons de contacte són un sol grup (8px entre ells; 16px entre grups). Amb el flux de captació, en una fila de dos.
        h('div', { className: 'page__group' },
          h(T.SectionLabel, null, withForm ? f.entryContactLabel : t.contactLabel),
          h('div', { className: withForm ? 'page__row' : 'page__stack' },
            h(T.Button, { full: true, variant: withForm ? 'outline' : undefined, href: links.whatsapp, onClick: () => onContactClick('whatsapp') }, icon(h, 'whatsapp'), withForm ? f.shortWhatsapp : t.whatsapp),
            h(T.Button, { full: true, variant: 'outline', href: links.email, onClick: () => onContactClick('email') }, icon(h, 'mail'), withForm ? f.shortEmail : t.emailLabel)),
          h('p', { className: 'body-sm page__note' }, t.contactHint)),
        h('p', { className: 'body-sm page__note' }, `${t.contactFallback} `, h('span', { className: 'page__address' }, email)),
        h(T.LegalLinks, {
          label: t.legalNav,
          links: [{ label: t.privacy, href: `privacy.html${legalQuery}` }, { label: t.cookies, href: `privacy.html${legalQuery}#cookies` }],
        })));
  };
}
