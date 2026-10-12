import { fileTextIcon } from '../icons.js';

export function createDoneScreen({ h, T, icon }) {
  const mark = h('svg', { className: 'page__done-mark', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { d: 'M7 12.5l3.2 3.2L17 8.8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  return function DoneScreen({ t, emailDelivery, dossierHref, dossierFile, docMeta, whatsappHref, emailHref, onHome }) {
    const f = t.form;
    return h('div', { className: 'page__screen page__screen--done' },
      mark,
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, {
          layout: 'mobile', level: 1, title: f.doneTitle,
          subtitle: emailDelivery ? f.doneTextMail : f.doneText, className: 'page__title',
        })),
      // Descàrrega real per gest del visitant: el dossier ja no s'obre sol. Button no reenvia `download`, d'aquí l'<a> amb les classes del sistema.
      dossierHref ? h('div', { className: 'page__stack' },
        // Targeta clicable (decidit al brief): mateix fitxer i nom que el botó; no és una segona parada de tabulador. `T.PdfCard` amb href no deixa posar el nom de descàrrega, d'aquí l'<a> que l'embolcalla.
        h('a', { className: 'page__doc', href: dossierHref, download: dossierFile || '', tabIndex: -1 },
          // Targeta amb les classes del sistema (tsf-pdf) però amb la icona de document en lloc de la insígnia «PDF» de T.PdfCard.
          h('div', { className: 'tsf-pdf tsf-pdf--link' },
            h('span', { className: 'page__doc-icon', 'aria-hidden': 'true' }, fileTextIcon(h)),
            h('span', { className: 'tsf-pdf__text' },
              h('span', { className: 'label tsf-pdf__title' }, f.doneCardTitle),
              h('span', { className: 'body-sm tsf-pdf__meta' }, docMeta)))),
        h('a', { className: 'tsf-btn button tsf-btn--solid tsf-btn--full', href: dossierHref, download: dossierFile || '' }, f.doneDownload)) : null,
      h('div', { className: 'page__done-actions' },
        h(T.Button, { full: true, variant: 'outline', href: whatsappHref }, icon(h, 'whatsapp'), f.entryWhatsapp),
        h(T.Button, { full: true, variant: 'outline', href: emailHref }, icon(h, 'mail'), f.entryEmail),
        h(T.Button, { variant: 'link', onClick: onHome }, f.doneHome)));
  };
}
