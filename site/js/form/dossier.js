// Quin dossier s'obre: el del model triat si en té, i si no el general. Síncron: s'ha d'obrir dins del gest del clic.
export function dossierFor(productId, config) {
  const own = config.products?.find((p) => p.id === productId)?.dossierUrl;
  return own || config.dossierUrl || '';
}

export function openDossier(productId, config, open = (...args) => window.open(...args)) {
  const url = dossierFor(productId, config);
  if (url) open(url, '_blank', 'noopener');
  return url;
}
