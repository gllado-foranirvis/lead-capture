import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';

const lang = resolveLang(window.location.search, CONFIG);
const t = DICT[lang];
document.documentElement.lang = lang;
document.title = `${t.privacyTitle} · ${CONFIG.brand}`;
for (const el of document.querySelectorAll('[data-key]')) el.textContent = t[el.dataset.key];
document.getElementById('back').href = `index.html?lang=${lang}`;
