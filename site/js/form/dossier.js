// Quin dossier s'ofereix: el del model triat si en té, i si no el general.
export function dossierFor(productId, config) {
  const own = config.products?.find((p) => p.id === productId)?.dossierUrl;
  return own || config.dossierUrl || '';
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
