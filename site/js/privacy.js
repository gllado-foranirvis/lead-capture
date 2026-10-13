import { CONFIG } from './config.js';
import { dictFor, resolveLang } from './i18n.js';
import { isDossierEnabled, isExtra1Enabled, legalQuery } from './form/context.js';
import { paragraphs, resolvePrivacyText } from './privacy-text.js';

const search = window.location.search;
const lang = resolveLang(search, CONFIG);
const extra1 = isExtra1Enabled(CONFIG, search);
const dossier = isDossierEnabled(CONFIG, search);
const t = dictFor(lang, dossier);
document.documentElement.lang = lang;
document.title = `${t.privacyTitle} · ${CONFIG.brand}`;
for (const el of document.querySelectorAll('[data-key]')) el.textContent = t[el.dataset.key];
// El text de privacitat va en paràgrafs curts (un <p> per bloc).
const privacyBox = document.querySelector('[data-key="privacyText"]');
privacyBox.replaceChildren(...paragraphs(resolvePrivacyText(t, CONFIG, extra1)).map((text) => {
  const p = document.createElement('p');
  p.className = 'body';
  p.textContent = text;
  return p;
}));
const home = `index.html${legalQuery(lang, extra1, dossier)}`;
document.getElementById('back').href = home;
// La marca de la franja fotogràfica porta a l'inici, com a la resta de pàgines.
const brand = document.getElementById('home');
brand.textContent = CONFIG.brand;
brand.href = home;
