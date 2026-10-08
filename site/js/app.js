import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';
import { contactLinks, toggleProfile } from './messages.js';
import { icon } from './icons.js';

const R = window.React;
const T = window.TSF;
const h = R.createElement;

function App() {
  const [lang, setLang] = R.useState(() => resolveLang(window.location.search, CONFIG));
  const [profile, setProfile] = R.useState('');
  const t = DICT[lang];
  const links = contactLinks(CONFIG, t, profile);
  const query = `?lang=${lang}`;

  R.useEffect(() => {
    document.documentElement.lang = lang;
    document.title = CONFIG.brand;
  }, [lang]);

  return h('main', { className: 'page tsf-compact' },
    h('div', { className: 'page__top' },
      h('span', { className: 'wordmark' }, CONFIG.brand),
      h(T.LangSwitch, {
        languages: CONFIG.languages.map((code) => ({ code: code.toUpperCase() })),
        value: lang.toUpperCase(), label: t.langLabel,
        onChange: (e) => setLang(e.target.value.toLowerCase()),
      })),
    h(T.SectionHeading, { layout: 'mobile', align: 'start', level: 1, title: t.title, subtitle: t.subtitle, className: 'page__title' }),
    // Un radio ja marcat no dispara onChange: tornar-lo a tocar (o prémer l'espai) desmarca el perfil.
    h('div', {
      onClick: (e) => { if (e.target.tagName === 'INPUT' && e.target.value === profile) setProfile(toggleProfile(profile, e.target.value)); },
      onKeyDown: (e) => { if (e.key === ' ' && e.target.tagName === 'INPUT' && e.target.value === profile) { e.preventDefault(); setProfile(''); } },
    },
      h(T.ChoiceChips, {
        legend: t.profileLegend, name: 'perfil', value: profile,
        options: [{ value: 'distribuidor', label: t.profileDistribuidor }, { value: 'particular', label: t.profileParticular }],
        onChange: (e) => setProfile(e.target.value),
      })),
    h(T.SectionLabel, null, t.contactLabel),
    h('div', { className: 'page__stack' },
      h(T.Button, { full: true, href: links.whatsapp }, icon(h, 'whatsapp'), t.whatsapp),
      h(T.Button, { full: true, variant: 'outline', href: links.email }, icon(h, 'mail'), t.emailLabel),
      h('p', { className: 'body-sm page__note' }, t.contactHint),
      h('p', { className: 'body-sm page__note' }, `${t.contactFallback} `, h('span', { className: 'page__address' }, CONFIG.email))),
    h(T.LegalLinks, {
      label: t.legalNav,
      links: [{ label: t.privacy, href: `privacy.html${query}` }, { label: t.cookies, href: `privacy.html${query}#cookies` }],
    }));
}

window.ReactDOM.createRoot(document.getElementById('root')).render(h(App));
