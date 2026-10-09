// De l'esdeveniment del flux a la càrrega útil que rep l'script de Google: l'id i l'etapa a dalt, la resta agrupada.
export function partialPayload(detail) {
  const { id, stage: _stage, ...contact } = detail;
  return { id, stage: 'step1', contact };
}

export function finalPayload({ contact, profiling }) {
  const { id, ...contactData } = contact;
  const { id: _profilingId, ...profilingData } = profiling;
  return { id, stage: 'complete', contact: contactData, profiling: profilingData };
}
