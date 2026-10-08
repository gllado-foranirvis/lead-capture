import { ADVICE } from './model.js';

const MOBILE = 'mobil';
const TABLET = 'tauleta';

const param = (search, name) => new URLSearchParams(search).get(name);

export const isExtra1Enabled = (config, search) => config.extra1 === true || param(search, 'extra1') === '1';

export const resolveOrigin = (search) => (param(search, 'o') === TABLET ? TABLET : MOBILE);

export function resolveProduct(search, products) {
  const wanted = param(search, 'producto');
  return wanted === ADVICE || products.some((p) => p.id === wanted) ? wanted : '';
}

export const legalQuery = (lang, extra1) => `?lang=${lang}${extra1 ? '&extra1=1' : ''}`;
