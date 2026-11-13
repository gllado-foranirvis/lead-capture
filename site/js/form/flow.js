import { skipProfile, submitContact, submitProfile } from './lead.js';
import { resolveOrigin, resolveProducts } from './context.js';

// Pas 1: els errors es veuen abans de seguir. El contacte (ja amb consentiment) es desa com a lead parcial amb un id que
// es conserva si el visitant torna enrere i avança de nou.
export function advanceStep1(values, { search, lang, visit, leadId, newId, setLeadId, setErrors, bumpAttempt, emitPartial, goTo }) {
  const id = leadId || newId();
  const result = submitContact(values, { id, lang, visit, origin: resolveOrigin(search) });
  if (result.errors) {
    setErrors(result.errors);
    bumpAttempt();
    return false;
  }
  setLeadId(id);
  setErrors({});
  emitPartial(result.lead);
  goTo('step2');
  return true;
}

// Un enviament final deixa el formulari net per al següent visitant de la tauleta; la confirmació conserva
// només el que necessita (receipt): el WhatsApp, el correu i els dossiers dels productes triats.
function finish(result, values, { products, search, dispatch, setErrors, setLeadId, setReceipt, emitLead, goTo }) {
  emitLead(result.lead);
  setReceipt({ products: values.products, name: values.name, city: values.city });
  dispatch({ type: 'reset', initial: { products: resolveProducts(search, products) } });
  setErrors({});
  setLeadId('');
  goTo('done');
  return true;
}

export function handleSubmit(values, deps) {
  const result = submitProfile(values, { id: deps.leadId || deps.newId(), lang: deps.lang, visit: deps.visit, origin: resolveOrigin(deps.search) });
  if (result.errors) {
    deps.setErrors(result.errors);
    deps.bumpAttempt();
    deps.goTo('step2');
    return false;
  }
  return finish(result, values, deps);
}

// Saltar la perfilació: el contacte ja és vàlid (s'ha validat al pas 1) i el lead es completa sense perfil.
export function handleSkip(values, deps) {
  return finish(skipProfile(values, { id: deps.leadId || deps.newId(), lang: deps.lang, visit: deps.visit, origin: resolveOrigin(deps.search) }), values, deps);
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
