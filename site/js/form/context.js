const MOBILE = 'mobil';
const TABLET = 'tauleta';
const PROFILE_FROM_ENTRY = { particular: 'particular', distribuidor: 'profesional' };

const param = (search, name) => new URLSearchParams(search).get(name);

export const isExtra1Enabled = (config, search) => config.extra1 === true || param(search, 'extra1') === '1';

export const resolveOrigin = (search) => (param(search, 'o') === TABLET ? TABLET : MOBILE);

export function resolveProduct(search, products) {
  const wanted = param(search, 'producto');
  return products.some((p) => p.id === wanted) ? wanted : '';
}

export const profileFromEntry = (entryProfile) =>
  (Object.hasOwn(PROFILE_FROM_ENTRY, entryProfile) ? PROFILE_FROM_ENTRY[entryProfile] : '');

export const legalQuery = (lang, extra1) => `?lang=${lang}${extra1 ? '&extra1=1' : ''}`;
