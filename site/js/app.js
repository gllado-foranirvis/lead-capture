import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';
import { contactLinks } from './messages.js';
import { icon } from './icons.js';
import { isExtra1Enabled, legalQuery, profileFromEntry, resolveProduct } from './form/context.js';
import { emptyForm, formReducer } from './form/model.js';
import { clearError } from './form/validate.js';
import { newLeadId } from './form/lead.js';
import { handleSubmit } from './form/flow.js';
import { focusFirstError } from './form/focus.js';
import { advanceOnEnter, applyFieldHints } from './form/hints.js';
import { createChrome } from './ui/chrome.js';
import { createEntryScreen } from './ui/entry-screen.js';
import { createFormScreen } from './ui/form-screen.js';

const R = window.React;
const T = window.TSF;
const h = R.createElement;
const search = window.location.search;
const extra1 = isExtra1Enabled(CONFIG, search);

const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });
const FormScreen = createFormScreen({ h, T });

function App() {
  const [lang, setLang] = R.useState(() => resolveLang(search, CONFIG));
  const [profile, setProfile] = R.useState('');
  const [view, setView] = R.useState('entry');
  const [values, dispatch] = R.useReducer(formReducer, undefined, () => emptyForm({ product: resolveProduct(search, CONFIG.products) }));
  const [errors, setErrors] = R.useState({});
  const [attempt, setAttempt] = R.useState(0);
  const t = DICT[lang];
  const query = legalQuery(lang, extra1);

  R.useEffect(() => {
    document.documentElement.lang = lang;
    document.title = CONFIG.brand;
  }, [lang]);
  R.useEffect(() => {
    if (attempt > 0) focusFirstError(errors, document);
  }, [attempt]);
  R.useEffect(() => {
    if (view === 'form') applyFieldHints(document);
  }, [view]);

  const change = (field, value) => {
    dispatch({ type: 'set', field, value });
    setErrors((current) => clearError(current, field));
  };
  const openForm = () => {
    dispatch({ type: 'prefill', field: 'profile', value: profileFromEntry(profile) });
    setView('form');
  };
  const submit = () => handleSubmit(values, {
    products: CONFIG.products, search, lang, newId: newLeadId,
    dispatch, setErrors, bumpAttempt: () => setAttempt((n) => n + 1), clearEntryProfile: () => setProfile(''),
    emitLead: (lead) => window.dispatchEvent(new CustomEvent('tsf:lead', { detail: lead })),
    goTo: setView,
  });

  const screens = {
    entry: () => h(EntryScreen, {
      t, links: contactLinks(CONFIG, t, profile), email: CONFIG.email, profile, legalQuery: query,
      onProfile: setProfile, onClearProfile: () => setProfile(''), onOpenForm: extra1 ? openForm : undefined,
    }),
    form: () => h(FormScreen, {
      t, products: CONFIG.products, values, errors, onChange: change, onSubmit: submit, onKeyDown: (e) => advanceOnEnter(e, document),
      onBack: () => setView('entry'), privacyHref: `privacy.html${query}#privacy`,
    }),
    // Provisional: es retira quan arribi el pla d'enviament i de la pantalla de gràcies.
    pending: () => h('div', { className: 'page__screen' },
      h(T.Notice, { variant: 'info', title: t.form.pendingTitle }, t.form.pendingText),
      h(T.Button, { variant: 'outline', full: true, onClick: () => setView('entry') }, t.back)),
  };

  return h('main', { className: view === 'form' ? 'page page--form tsf-compact' : 'page tsf-compact' },
    h(Header, { t, lang, onLang: setLang }),
    screens[view]());
}

window.ReactDOM.createRoot(document.getElementById('root')).render(h(App));
