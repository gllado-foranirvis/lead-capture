// Del lead parcial (pas 1) a la càrrega útil de l'script de Google: l'id i l'etapa a dalt, el contacte agrupat.
export function partialPayload(detail) {
  const { id, stage: _stage, ...contact } = detail;
  return { id, stage: 'step1', contact };
}

// Del lead final (pas 2 enviat o saltat): contacte i perfilació sense l'id repetit.
export function finalPayload({ contact, profiling }) {
  const { id, ...contactData } = contact;
  const { id: _profilingId, ...profilingData } = profiling;
  return { id, stage: 'complete', contact: contactData, profiling: profilingData };
}

// Un clic a WhatsApp, correu o descàrrega: l'id i l'etapa a dalt, la resta (visita, botó, lloc, idioma, origen, productes, ciutat i informació anònima) agrupada.
export function clickPayload({ id, info, ...click }) {
  return { id, stage: 'click', click: { ...click, ...info } };
}
