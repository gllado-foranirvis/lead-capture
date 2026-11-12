// Informació anònima del dispositiu que acompanya cada clic a WhatsApp o correu. Cap dada personal: tot són valors
// grollers (tipus de dispositiu, sistema, mida de pantalla…). Els globals s'injecten perquè es pugui provar a Node;
// qualsevol cosa que el navegador no doni queda com a text buit.
const TABLET = /iPad|Tablet|PlayBook|Silk/i;
const MOBILE = /Mobi|iPhone|iPod/i;
const ANDROID = /Android/i;

function deviceOf(ua) {
  if (TABLET.test(ua) || (ANDROID.test(ua) && !MOBILE.test(ua))) return 'tablet';
  return MOBILE.test(ua) ? 'mobile' : 'desktop';
}

const systemOf = (ua) => (/iPhone|iPad|iPod/i.test(ua) ? 'ios' : ANDROID.test(ua) ? 'android' : 'other');

// Només el domini de procedència (p. ex. un cercador); mai la ruta ni els paràmetres.
function hostOf(referrer) {
  try {
    return referrer ? new URL(referrer).hostname : '';
  } catch {
    return '';
  }
}

export function clickInfo({ nav = {}, win = {}, doc = {}, startedAt = 0, now = 0 } = {}) {
  const ua = String(nav.userAgent ?? '');
  let tz = '';
  try {
    tz = win.Intl?.DateTimeFormat?.().resolvedOptions().timeZone ?? '';
  } catch {
    tz = '';
  }
  return {
    browserLang: nav.language ?? '',
    device: deviceOf(ua),
    os: systemOf(ua),
    tz,
    screen: win.innerWidth && win.innerHeight ? `${win.innerWidth}x${win.innerHeight}` : '',
    seconds: Math.max(0, Math.round((now - startedAt) / 1000)),
    referrer: hostOf(doc?.referrer),
  };
}
