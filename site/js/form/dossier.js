// PDF d'un producte o de la marca en l'idioma demanat; si no existeix, en anglès (l'únic garantit).
export const pdfFor = (pdfs, lang) => pdfs?.[lang] ?? pdfs?.en;

// PDF que s'ofereixen al visitant segons els productes triats, sense repetits. Cada element: { href, meta }.
//   href  ruta del PDF en l'idioma del formulari (o anglès); meta  segona línia de la targeta.
// Primer, en l'ordre de config, el PDF de cada producte triat; després el general de la marca (si n'hi ha) si algun dels
// triats no en té (cap producte, «asesoramiento», un id desconegut o un producte sense PDF) o si no hi ha cap PDF de producte.
export function dossiersFor(productIds, lang, config, generalMeta) {
  const docs = (config.products ?? [])
    .filter((p) => productIds.includes(p.id))
    .map((p) => ({ id: p.id, href: pdfFor(p.pdf, lang), meta: p.name }))
    .filter((doc) => doc.href);
  const needsGeneral = !docs.length || productIds.some((id) => !docs.some((doc) => doc.id === id));
  const general = pdfFor(config.brandPdf, lang);
  const offered = docs.map(({ href, meta }) => ({ href, meta }));
  if (needsGeneral && general) offered.push({ href: general, meta: generalMeta });
  return offered.filter((doc, i) => offered.findIndex((other) => other.href === doc.href) === i);
}
