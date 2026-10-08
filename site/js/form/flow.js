import { buildPartialLead, submitForm } from './lead.js';
import { resolveOrigin, resolveProduct } from './context.js';
import { STEP_FIELDS, firstErrorField, validateStep1 } from './validate.js';

// Pas 1: els errors es veuen abans de seguir. El contacte (ja amb consentiment) es desa com a lead parcial amb un id que
// es conserva si el visitant torna enrere i avança de nou.
export function advanceStep1(values, { search, lang, leadId, newId, setLeadId, setErrors, bumpAttempt, emitPartial, goTo }) {
  const errors = validateStep1(values);
  if (Object.keys(errors).length) {
    setErrors(errors);
    bumpAttempt();
    return false;
  }
  const id = leadId || newId();
  setLeadId(id);
  setErrors({});
  emitPartial(buildPartialLead(values, { id, lang, origin: resolveOrigin(search) }));
  goTo('step2');
  return true;
}

// El document s'obre abans de qualsevol altra cosa: el navegador només ho permet dins del gest de l'usuari.
// Un enviament vàlid deixa el formulari net per al següent visitant de la tauleta; la confirmació conserva
// només el que necessita per al WhatsApp (receipt).
export function handleSubmit(values, {
  products, search, lang, leadId, newId, dispatch, setErrors, setLeadId, setReceipt, bumpAttempt, openDocument, emitLead, goTo,
}) {
  const result = submitForm(values, { id: leadId || newId(), lang, origin: resolveOrigin(search) });
  if (result.errors) {
    setErrors(result.errors);
    bumpAttempt();
    goTo(STEP_FIELDS[1].includes(firstErrorField(result.errors)) ? 'step1' : 'step2');
    return false;
  }
  openDocument();
  emitLead(result.lead);
  setReceipt({
    product: values.product, profile: values.profile, activity: values.activity, activityOther: values.activityOther,
    hasBoat: values.hasBoat, intent: values.intent, name: values.name,
  });
  dispatch({ type: 'reset', initial: { product: resolveProduct(search, products) } });
  setErrors({});
  setLeadId('');
  goTo('done');
  return true;
}

// A la tauleta de l'estand, un visitant que abandona el flux no ha de deixar les seves dades (ni el seu id de lead)
// al següent. Al mòbil propi es conserva la sessió: l'entrada la fa servir per als missatges.
export function leaveToEntry({ products, search, dispatch, setErrors, setLeadId, goTo }) {
  if (resolveOrigin(search) === 'tauleta') {
    dispatch({ type: 'reset', initial: { product: resolveProduct(search, products) } });
    setLeadId('');
  }
  setErrors({});
  goTo('entry');
}
