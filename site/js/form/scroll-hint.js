// Avís de «hi ha més contingut a sota»: la barra d'accions fixa tapa la fi de la pàgina i, sense pista, el visitant creu que ja ho ha vist tot.
export const SCROLL_SLACK = 24;

// Queda contingut per sota de la vora inferior de la pantalla (amb una petita tolerància).
export const hasMoreBelow = ({ scrollY = 0, innerHeight = 0, scrollHeight = 0 } = {}, slack = SCROLL_SLACK) => scrollY + innerHeight < scrollHeight - slack;

// Escriu a <html> `data-more` (true/false) i, a la barra d'accions, el text de l'avís (`data-hint`): el CSS el dibuixa just a sobre.
export function updateScrollHint(win, doc, text = '') {
  const root = doc.documentElement;
  const bar = doc.querySelector('.form__actions, .page__bar');
  if (bar) bar.dataset.hint = text;
  root.dataset.more = String(hasMoreBelow({ scrollY: win.scrollY, innerHeight: win.innerHeight, scrollHeight: root.scrollHeight }));
}

// Es manté al dia amb el scroll, la mida de la finestra i qualsevol canvi d'alçada del contingut (plegables, errors). Retorna la neteja.
export function watchScrollHint(win, doc, { text = '', Observer = win.ResizeObserver } = {}) {
  const update = () => updateScrollHint(win, doc, text);
  update();
  win.addEventListener('scroll', update, { passive: true });
  win.addEventListener('resize', update);
  const observer = Observer ? new Observer(update) : null;
  observer?.observe(doc.body);
  return () => {
    win.removeEventListener('scroll', update);
    win.removeEventListener('resize', update);
    observer?.disconnect();
  };
}
