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

// Segona línia de la targeta: el nom del model si el dossier és el seu; si és el general, el text alternatiu.
export function dossierMeta(productId, config, fallback) {
  const product = config.products?.find((p) => p.id === productId);
  return product?.dossierUrl ? product.name : fallback;
}

// Nom amb què es desa la descàrrega (atribut download). '' = el navegador fa servir el nom del fitxer.
export function dossierFileFor(productId, config) {
  const product = config.products?.find((p) => p.id === productId);
  return (product?.dossierUrl ? product.dossierFileName : config.dossierFileName) || '';
}
