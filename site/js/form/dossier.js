// PDF que s'ofereixen al visitant segons els models triats, sense repetits. Cada element: { href, file, meta }.
//   href  ruta del PDF; file  nom de la descàrrega ('' = el del fitxer); meta  segona línia de la targeta.
// Primer, en l'ordre de config, el dossier propi de cada model triat; després el general si algun dels triats no en té
// (cap model, «asesoramiento», un id desconegut o un model sense dossier propi) o si no hi ha cap dossier propi.
export function dossiersFor(productIds, config, generalMeta) {
  const chosen = config.products?.filter((p) => productIds.includes(p.id) && p.dossierUrl) ?? [];
  const docs = chosen.map((p) => ({ href: p.dossierUrl, file: p.dossierFileName || '', meta: p.name }));
  const hasOwn = (id) => chosen.some((p) => p.id === id);
  const needsGeneral = !docs.length || productIds.some((id) => !hasOwn(id));
  if (needsGeneral && config.dossierUrl) docs.push({ href: config.dossierUrl, file: config.dossierFileName || '', meta: generalMeta });
  return docs.filter((doc, i) => docs.findIndex((other) => other.href === doc.href) === i);
}
