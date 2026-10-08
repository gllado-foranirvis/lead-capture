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
