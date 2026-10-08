export function createDoneScreen({ h, T, icon }) {
  return function DoneScreen({ t, emailDelivery, onOpen, whatsappHref, onHome }) {
    const f = t.form;
    return h('div', { className: 'page__screen' },
      h('div', { className: 'page__heading', tabIndex: -1, 'data-step-heading': '' },
        h(T.SectionHeading, {
          layout: 'mobile', align: 'start', level: 1, title: f.doneTitle,
          subtitle: emailDelivery ? f.doneTextMail : f.doneText, className: 'page__title',
        })),
      // Pla B: si el navegador ha bloquejat l'obertura automàtica, aquest botó obre la ficha.
      h(T.Button, { full: true, onClick: onOpen }, f.doneOpen),
      h('p', { className: 'body-sm page__note' }, f.doneHelp),
      h(T.Button, { full: true, variant: 'outline', href: whatsappHref }, icon(h, 'whatsapp'), f.entryWhatsapp),
      h(T.Button, { variant: 'link', onClick: onHome }, f.doneHome));
  };
}
