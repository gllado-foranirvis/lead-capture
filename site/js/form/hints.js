// Ajustos de teclat i autocompletat dels <input> del formulari. Tokens d'autocomplete de l'estàndard HTML.
export const FIELD_HINTS = {
  name: { autocomplete: 'name', autocapitalize: 'words', enterkeyhint: 'next' },
  email: { autocomplete: 'email', inputmode: 'email', autocapitalize: 'none', spellcheck: 'false', enterkeyhint: 'next' },
  phone: { autocomplete: 'tel', inputmode: 'tel', enterkeyhint: 'next' },
  demo: { autocomplete: 'address-level2', enterkeyhint: 'done' },
};

export function applyFieldHints(doc, hints = FIELD_HINTS) {
  let applied = 0;
  for (const [field, attributes] of Object.entries(hints)) {
    const element = doc.querySelector(`[name="${field}"]`);
    if (!element) continue;
    for (const [attribute, value] of Object.entries(attributes)) element.setAttribute(attribute, value);
    applied += 1;
  }
  return applied;
}

// «enterkeyhint="next"» només canvia l'etiqueta de la tecla: Intro enviaria el formulari sencer
// (és el comportament estàndard dels formularis amb botó d'enviar; a iOS no s'ha verificat en un mòbil real).
// Aquí Intro avança al camp següent; a l'últim camp, envia.
export const NEXT_FIELD = { name: 'email', email: 'phone', phone: 'profile' };

export function advanceOnEnter(event, doc) {
  const next = NEXT_FIELD[event.target.name];
  if (event.key !== 'Enter' || event.target.tagName !== 'INPUT' || !next) return false;
  const element = doc.querySelector(`[name="${next}"]`);
  if (!element) return false;
  event.preventDefault();
  element.focus();
  return true;
}
