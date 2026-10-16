import { ADVICE } from './model.js';

const MOBILE = 'mobil';
const TABLET = 'tauleta';

const param = (search, name) => new URLSearchParams(search).get(name);

export const isExtra1Enabled = (config, search) => config.extra1 === true || param(search, 'extra1') === '1';

// Versió de contingència: sense pregunta de producte ni cap referència al dossier. Apagada amb `dossier: false` a config o amb ?dossier=0.
export const isDossierEnabled = (config, search) => (param(search, 'dossier') === '1' ? true : config.dossier !== false && param(search, 'dossier') !== '0');

// Previsualització del dossier amb `dossier: false` a config: ?dossier=1. Els enllaços legals han de conservar-ho.
export const isDossierPreview = (config, search) => config.dossier === false && param(search, 'dossier') === '1';

export const resolveOrigin = (search) => (param(search, 'o') === TABLET ? TABLET : MOBILE);

// ?producto= preselecciona un sol model (o «asesoramiento»); un valor desconegut s'ignora.
export function resolveProducts(search, products) {
  const wanted = param(search, 'producto');
  return wanted === ADVICE || products.some((p) => p.id === wanted) ? [wanted] : [];
}

export const legalQuery = (lang, extra1, dossier = true, preview = false) => `?lang=${lang}${extra1 ? '&extra1=1' : ''}${dossier ? (preview ? '&dossier=1' : '') : '&dossier=0'}`;
