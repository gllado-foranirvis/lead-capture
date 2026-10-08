import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';
import { contactLinks } from './messages.js';
import { icon } from './icons.js';
import { isExtra1Enabled, legalQuery, resolveProduct } from './form/context.js';
import { emptyForm, formReducer } from './form/model.js';
import { clearError } from './form/validate.js';
import { newLeadId } from './form/lead.js';
import { advanceStep1, handleSubmit } from './form/flow.js';
import { toSession } from './form/session.js';
import { focusFirstError, focusStepHeading } from './form/focus.js';
import { advanceOnEnter, applyFieldHints } from './form/hints.js';
import { createChrome } from './ui/chrome.js';
import { createEntryScreen } from './ui/entry-screen.js';
import { createStepProduct } from './ui/step-product.js';
import { createStepContact } from './ui/step-contact.js';
import { createDoneScreen } from './ui/done-screen.js';

const R = window.React;
const T = window.TSF;
const h = R.createElement;
const search = window.location.search;
const extra1 = isExtra1Enabled(CONFIG, search);

const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });
const StepProduct = createStepProduct({ h, T });
const StepContact = createStepContact({ h, T });
const DoneScreen = createDoneScreen({ h, T, icon });

const emit = (name) => (detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const openDocument = () => { if (CONFIG.dossierUrl) window.open(CONFIG.dossierUrl, '_blank', 'noopener'); };

function App() {
  const [lang, setLang] = R.useState(() => resolveLang(search, CONFIG));
  const [profile, setProfile] = R.useState(''); // només l'entrada de l'MVP
  const [view, setView] = R.useState('entry'); // entry | step1 | step2 | done
  const [values, dispatch] = R.useReducer(formReducer, undefined, () => emptyForm({ product: resolveProduct(search, CONFIG.products) }));
  const [errors, setErrors] = R.useState({});
  const [attempt, setAttempt] = R.useState(0);
  const [leadId, setLeadId] = R.useState('');
  const [receipt, setReceipt] = R.useState(null);
  const mounted = R.useRef(false);
  const t = DICT[lang];
  const query = legalQuery(lang, extra1);
  const sessionOf = (source) => toSession(source, { products: CONFIG.products, dict: t });
  const bumpAttempt = () => setAttempt((n) => n + 1);

  R.useEffect(() => {
    document.documentElement.lang = lang;
    document.title = CONFIG.brand;
  }, [lang]);
  // Primer el títol del pas nou i, després, el primer error: l'error guanya el focus.
  R.useEffect(() => {
    if (mounted.current) {
      focusStepHeading(document);
      window.scrollTo(0, 0);
    } else {
      mounted.current = true;
    }
    if (view === 'step1' || view === 'step2') applyFieldHints(document);
  }, [view]);
  R.useEffect(() => {
    if (attempt > 0) focusFirstError(errors, document);
  }, [attempt]);

  const change = (field, value) => {
    dispatch({ type: 'set', field, value });
    setErrors((current) => clearError(current, field));
  };
  const common = { products: CONFIG.products, search, lang, leadId, newId: newLeadId, setLeadId, setErrors, bumpAttempt, goTo: setView };
  const next = () => advanceStep1(values, { ...common, emitPartial: emit('tsf:lead-partial') });
  const submit = () => handleSubmit(values, { ...common, dispatch, setReceipt, openDocument, emitLead: emit('tsf:lead') });
  const goHome = () => { setReceipt(null); setView('entry'); };
  const goBack = (to) => () => { setErrors({}); setView(to); };

  const screens = {
    entry: () => h(EntryScreen, {
      t, links: contactLinks(CONFIG, t, extra1 ? sessionOf(values) : { profile }), email: CONFIG.email, profile, legalQuery: query,
      onProfile: setProfile, onClearProfile: () => setProfile(''), onOpenForm: extra1 ? () => setView('step1') : undefined,
    }),
    step1: () => h(StepProduct, {
      t, products: CONFIG.products, values, errors, onChange: change, onNext: next, onKeyDown: (e) => advanceOnEnter(e, document), onBack: goBack('entry'),
    }),
    step2: () => h(StepContact, {
      t, values, errors, onChange: change, onSubmit: submit, onKeyDown: (e) => advanceOnEnter(e, document), onBack: goBack('step1'),
      privacyHref: `privacy.html${query}#privacy`,
    }),
    done: () => h(DoneScreen, {
      t, emailDelivery: CONFIG.emailDelivery, onOpen: openDocument, onHome: goHome,
      whatsappHref: contactLinks(CONFIG, t, receipt ? sessionOf(receipt) : {}).whatsapp,
    }),
  };

  const isStep = view === 'step1' || view === 'step2';
  return h('main', { className: isStep ? 'page page--form tsf-compact' : 'page tsf-compact' },
    h(Header, { t, lang, onLang: setLang }),
    screens[view]());
}

window.ReactDOM.createRoot(document.getElementById('root')).render(h(App));
