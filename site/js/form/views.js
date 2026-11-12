import { MAX, clip } from './model.js';
import { dossiersFor } from './dossier.js';
import { dictFor } from '../i18n.js';

// PDF que corresponen a una tria de productes: els mateixos que s'avançaran al formulari i que després ofereix la confirmació.
export const plannedDocs = ({ products, lang, config, full }) => dossiersFor(products, lang, config, full.form.doneCardGeneral);

// Què mostra la confirmació. Sense cap PDF aplicable (p. ex. només «asesoramiento»), usa els textos sense dossier i
// no promet cap correu ni descàrrega: només el que realment s'ofereix.
export function doneView({ receipt, lang, dossier, config }) {
  const full = dictFor(lang, dossier);
  const docs = dossier ? plannedDocs({ products: receipt?.products ?? [], lang, config, full }) : [];
  return { t: docs.length ? full : dictFor(lang, false), docs, emailDelivery: docs.length > 0 && config.emailDelivery };
}

// Detall de l'esdeveniment d'un clic a WhatsApp, correu o descàrrega (amb `product`, el producte d'aquell PDF). A la confirmació el formulari ja s'ha buidat: els productes i la ciutat són els del rebut.
export function clickDetail({ from, button, values, receipt, visit, lang, origin, id, info, product }) {
  const source = from === 'done' && receipt ? receipt : values;
  return { id, visit, button, from, lang, origin, products: product ?? source.products.join(','), city: clip(source.city, MAX.city), info };
}
