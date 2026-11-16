import { fileTextIcon } from '../icons.js';

export function createDoneScreen({ h, T, icon }) {
  const mark = h('svg', { className: 'page__done-mark', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { d: 'M7 12.5l3.2 3.2L17 8.8', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }));
  // Targeta amb les classes del sistema (tsf-pdf) però amb la icona de document en lloc de la insígnia «PDF» de T.PdfCard.
  const card = (f, doc, tabbable, onDownload, downloaded) =>
    h('a', { key: doc.href, className: 'page__doc', href: doc.href, download: '', onClick: () => onDownload(doc), ...(tabbable ? {} : { tabIndex: -1 }) },
      h('div', { className: 'tsf-pdf tsf-pdf--link' },
        h('span', { className: 'page__doc-icon', 'aria-hidden': 'true' }, fileTextIcon(h)),
        h('span', { className: 'tsf-pdf__text' },
          // El nom del producte és el títol (distingeix les targetes); «Dossier The Silent Fleet» queda com a detall.
          h('span', { className: 'label tsf-pdf__title' }, doc.meta),
          // Estat de la descàrrega: es veu i s'anuncia (el toc a una targeta no mostrava cap resposta).
          h('span', { className: 'body-sm tsf-pdf__meta', 'aria-live': 'polite' }, downloaded ? `✓ ${f.doneDownloaded}` : f.doneCardTitle))));
  return function DoneScreen({ t, emailDelivery, docs, pdfNote = false, downloaded = [], ios = false, onDownloadAll, onDownload = () => {}, onContactClick, whatsappHref, emailHref, onHome }) {
    const f = t.form;
    return h('div', { className: 'page__screen page__screen--done' },
      mark,
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, {
          layout: 'mobile', level: 1, title: f.doneTitle,
          subtitle: emailDelivery ? f.doneTextMail : f.doneText, className: 'page__title',
        })),
      docs.length ? h('div', { className: 'page__stack' },
        // Un sol PDF: només el botó sòlid, amb el nom del producte dins (la targeta i el botó eren el mateix fitxer dues vegades).
        // Diversos: una targeta per fitxer (cada una és l'única via al seu PDF) i, sota, «descarregar tots» (no a iOS, que bloqueja les descàrregues encadenades sense gest).
        ...(docs.length > 1 ? docs.map((doc) => card(f, doc, true, onDownload, downloaded.includes(doc.id))) : []),
        docs.length > 1
          ? (ios ? null : h(T.Button, { full: true, onClick: onDownloadAll }, f.doneDownloadAll))
          // Button no reenvia `download`, d'aquí l'<a> amb les classes del sistema.
          : h('a', { className: 'tsf-btn button tsf-btn--solid tsf-btn--full', href: docs[0].href, download: '', 'aria-live': 'polite', onClick: () => onDownload(docs[0]) },
            downloaded.includes(docs[0].id) ? `✓ ${f.doneDownloaded}` : docs[0].id === 'brand' ? f.doneDownload : f.doneDownloadOf.replace('{name}', docs[0].meta))) : null,
      docs.length && ios ? h('p', { className: 'body-sm page__note' }, f.doneIosNote) : null,
      docs.length && pdfNote ? h('p', { className: 'body-sm page__note page__pdfnote' }, f.entryPdfNote) : null,
      h('div', { className: 'page__done-actions' },
        h(T.Button, { full: true, variant: 'outline', href: whatsappHref, onClick: () => onContactClick('whatsapp') }, icon(h, 'whatsapp'), f.entryWhatsapp),
        h(T.Button, { full: true, variant: 'outline', href: emailHref, onClick: () => onContactClick('email') }, icon(h, 'mail'), f.entryEmail),
        h(T.Button, { variant: 'link', onClick: onHome }, f.doneHome)));
  };
}
