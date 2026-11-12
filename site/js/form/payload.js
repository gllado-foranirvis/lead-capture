// De l'esdeveniment del lead a la càrrega útil que rep l'script de Google: l'id i l'etapa a dalt, la resta agrupada.
export function finalPayload({ contact }) {
  const { id, ...contactData } = contact;
  return { id, stage: 'complete', contact: contactData };
}

// Un clic a WhatsApp o correu: l'id i l'etapa a dalt, la resta (visita, botó, lloc, idioma, origen, productes, ciutat i informació anònima) agrupada.
export function clickPayload({ id, info, ...click }) {
  return { id, stage: 'click', click: { ...click, ...info } };
}
