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

// La píndola és un pseudo-element de la barra: un toc a la píndola arriba com un toc a la barra mateixa (no a un botó de dins).
// Només compta la franja de la vora superior i prop del centre, on és la píndola; la resta de la barra no fa res.
const PILL_HALF_WIDTH = 130;
const PILL_ZONE = 20;
export function isHintTap(event, doc) {
  const bar = event.target;
  if (!bar?.matches?.('.form__actions, .page__bar') || doc.documentElement.dataset.more !== 'true') return false;
  const rect = bar.getBoundingClientRect();
  return event.clientY < rect.top + PILL_ZONE && Math.abs(event.clientX - (rect.left + rect.width / 2)) <= PILL_HALF_WIDTH;
}

// Baixa una pantalla (tres quarts de l'alçada visible), suau si el sistema ho permet.
export function scrollDown(win) {
  const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  win.scrollBy({ top: Math.round(win.innerHeight * 0.75), behavior: reduced ? 'auto' : 'smooth' });
}

// Es manté al dia amb el scroll, la mida de la finestra i qualsevol canvi d'alçada del contingut (plegables, errors). Retorna la neteja.
export function watchScrollHint(win, doc, { text = '', Observer = win.ResizeObserver } = {}) {
  const update = () => updateScrollHint(win, doc, text);
  update();
  win.addEventListener('scroll', update, { passive: true });
  win.addEventListener('resize', update);
  const onTap = (event) => { if (isHintTap(event, doc)) scrollDown(win); };
  doc.addEventListener('click', onTap);
  const observer = Observer ? new Observer(update) : null;
  observer?.observe(doc.body);
  return () => {
    win.removeEventListener('scroll', update);
    win.removeEventListener('resize', update);
    doc.removeEventListener('click', onTap);
    observer?.disconnect();
  };
}
