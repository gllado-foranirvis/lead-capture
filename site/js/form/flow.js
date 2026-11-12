import { submitForm } from './lead.js';
import { resolveOrigin, resolveProducts } from './context.js';

// Un enviament vàlid deixa el formulari net per al següent visitant de la tauleta; la confirmació conserva
// només el que necessita (receipt): el WhatsApp, el correu i els dossiers dels productes triats.
export function handleSubmit(values, {
  products, search, lang, leadId, newId, dispatch, setErrors, setLeadId, setReceipt, bumpAttempt, emitLead, goTo,
}) {
  const result = submitForm(values, { id: leadId || newId(), lang, origin: resolveOrigin(search) });
  if (result.errors) {
    setErrors(result.errors);
    bumpAttempt();
    goTo('step1');
    return false;
  }
  emitLead(result.lead);
  setReceipt({ products: values.products, name: values.name, city: values.city });
  dispatch({ type: 'reset', initial: { products: resolveProducts(search, products) } });
  setErrors({});
  setLeadId('');
  goTo('done');
  return true;
}

// A la tauleta de l'estand, un visitant que abandona el flux no ha de deixar les seves dades (ni el seu id de lead)
// al següent. Al mòbil propi es conserva la sessió: l'entrada la fa servir per als missatges.
export function leaveToEntry({ products, search, dispatch, setErrors, setLeadId, goTo }) {
  if (resolveOrigin(search) === 'tauleta') {
    dispatch({ type: 'reset', initial: { products: resolveProducts(search, products) } });
    setLeadId('');
  }
  setErrors({});
  goTo('entry');
}

// Inactivitat a la tauleta: el visitant que s'allunya no ha de deixar res (dades, perfil, id de lead ni confirmació) al següent.
export function discardSession({ products, search, dispatch, setErrors, setLeadId, setReceipt, goTo }) {
  dispatch({ type: 'reset', initial: { products: resolveProducts(search, products) } });
  setErrors({});
  setLeadId('');
  setReceipt(null);
  goTo('entry');
}
