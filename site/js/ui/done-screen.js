import { fileTextIcon } from '../icons.js';

export function createDoneScreen({ h, T, icon }) {
  const mark = h('svg', { className: 'page__done-mark', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { d: 'M7 12.5l3.2 3.2L17 8.8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  // Targeta amb les classes del sistema (tsf-pdf) però amb la icona de document en lloc de la insígnia «PDF» de T.PdfCard.
  const card = (f, { href, file, meta }, tabbable) =>
    h('a', { key: href, className: 'page__doc', href, download: file || '', ...(tabbable ? {} : { tabIndex: -1 }) },
      h('div', { className: 'tsf-pdf tsf-pdf--link' },
        h('span', { className: 'page__doc-icon', 'aria-hidden': 'true' }, fileTextIcon(h)),
        h('span', { className: 'tsf-pdf__text' },
          h('span', { className: 'label tsf-pdf__title' }, f.doneCardTitle),
          h('span', { className: 'body-sm tsf-pdf__meta' }, meta))));
  return function DoneScreen({ t, emailDelivery, docs, onDownloadAll, whatsappHref, emailHref, onHome }) {
    const f = t.form;
    return h('div', { className: 'page__screen page__screen--done' },
      mark,
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, {
          layout: 'mobile', level: 1, title: f.doneTitle,
          subtitle: emailDelivery ? f.doneTextMail : f.doneText, className: 'page__title',
        })),
      docs.length ? h('div', { className: 'page__stack' },
        // Una targeta clicable per PDF (decidit al brief): mateix fitxer i nom que el botó. `T.PdfCard` amb href no deixa posar el nom de descàrrega, d'aquí l'<a> que l'embolcalla.
        // Amb un sol PDF el botó ja és la parada de tabulador i la targeta no ho és; amb diversos, cada targeta és l'única via al seu fitxer.
        ...docs.map((doc) => card(f, doc, docs.length > 1)),
        docs.length > 1
          ? h(T.Button, { full: true, onClick: onDownloadAll }, f.doneDownloadAll)
          // Button no reenvia `download`, d'aquí l'<a> amb les classes del sistema.
          : h('a', { className: 'tsf-btn button tsf-btn--solid tsf-btn--full', href: docs[0].href, download: docs[0].file || '' }, f.doneDownload)) : null,
      h('div', { className: 'page__done-actions' },
        h(T.Button, { full: true, variant: 'outline', href: whatsappHref }, icon(h, 'whatsapp'), f.entryWhatsapp),
        h(T.Button, { full: true, variant: 'outline', href: emailHref }, icon(h, 'mail'), f.entryEmail),
        h(T.Button, { variant: 'link', onClick: onHome }, f.doneHome)));
  };
}
