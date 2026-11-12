import { chevronIcon } from '../icons.js';

// Secció plegable amb un resum que es veu tocable: fila-control amb títol, estat (què hi ha dins), acció opcional i xurma.
// <details> natiu: teclat i lectors de pantalla ja funcionen. `open` només fixa l'estat inicial.
export function createFold({ h }) {
  return function Fold({ title, hint, action, open = false, className, children }) {
    return h('details', { className: className ? `fold ${className}` : 'fold', ...(open ? { open: true } : {}) },
      h('summary', { className: 'fold__summary' },
        h('span', { className: 'fold__text' },
          h('span', { className: 'label fold__title' }, title),
          hint ? h('span', { className: 'body-sm fold__hint' }, hint) : null),
        action ? h('span', { className: 'body-sm fold__action' }, action) : null,
        chevronIcon(h)),
      h('div', { className: 'fold__body' }, children));
  };
}
