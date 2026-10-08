import { submitForm } from './lead.js';
import { resolveOrigin, resolveProduct } from './context.js';

// Un enviament vàlid emet el lead i deixa el formulari (i el perfil de l'entrada) nets: a la tauleta
// de l'estand el següent visitant no ha de veure les dades de l'anterior ni poder reenviar-les.
export function handleSubmit(values, { products, search, lang, newId, dispatch, setErrors, bumpAttempt, clearEntryProfile, emitLead, goTo }) {
  const result = submitForm(values, { products, lang, origin: resolveOrigin(search), newId });
  if (result.errors) {
    setErrors(result.errors);
    bumpAttempt();
    return false;
  }
  emitLead(result.lead);
  dispatch({ type: 'reset', initial: { product: resolveProduct(search, products) } });
  setErrors({});
  clearEntryProfile();
  goTo('pending');
  return true;
}
