import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';
import { isExtra1Enabled, legalQuery } from './form/context.js';
import { resolvePrivacyText } from './privacy-text.js';

const search = window.location.search;
const lang = resolveLang(search, CONFIG);
const extra1 = isExtra1Enabled(CONFIG, search);
const t = DICT[lang];
document.documentElement.lang = lang;
document.title = `${t.privacyTitle} · ${CONFIG.brand}`;
for (const el of document.querySelectorAll('[data-key]')) el.textContent = t[el.dataset.key];
document.querySelector('[data-key="privacyText"]').textContent = resolvePrivacyText(t, CONFIG, extra1);
document.getElementById('back').href = `index.html${legalQuery(lang, extra1)}`;
