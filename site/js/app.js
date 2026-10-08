import { CONFIG } from './config.js';
import { DICT, resolveLang } from './i18n.js';
import { contactLinks } from './messages.js';
import { icon } from './icons.js';
import { isExtra1Enabled, legalQuery, resolveOrigin, resolveProduct } from './form/context.js';
import { PROFILES, emptyForm, formReducer } from './form/model.js';
import { clearError } from './form/validate.js';
import { newLeadId } from './form/lead.js';
import { advanceStep1, discardSession, handleSubmit, leaveToEntry } from './form/flow.js';
import { ACTIVITY_EVENTS, IDLE_MS, watchIdle } from './form/idle.js';
import { toSession } from './form/session.js';
import { focusFirstError, focusStepHeading } from './form/focus.js';
import { advanceOnEnter, applyFieldHints } from './form/hints.js';
import { createChrome } from './ui/chrome.js';
import { createEntryScreen } from './ui/entry-screen.js';
import { createStepContact } from './ui/step-contact.js';
import { createStepProfile } from './ui/step-profile.js';
import { createDoneScreen } from './ui/done-screen.js';

const R = window.React;
const T = window.TSF;
const h = R.createElement;
const search = window.location.search;
const extra1 = isExtra1Enabled(CONFIG, search);

const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });
const StepContact = createStepContact({ h, T });
const StepProfile = createStepProfile({ h, T });
const DoneScreen = createDoneScreen({ h, T, icon });

const emit = (name) => (detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const openDocument = () => { if (CONFIG.dossierUrl) window.open(CONFIG.dossierUrl, '_blank', 'noopener'); };

function App() {
  const [lang, setLang] = R.useState(() => resolveLang(search, CONFIG));
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
  // Tauleta de l'estand: si el visitant s'allunya sense tocar res, la sessió es descarta.
  R.useEffect(() => {
    if (resolveOrigin(search) !== 'tauleta') return undefined;
    return watchIdle({
      target: document, events: ACTIVITY_EVENTS, ms: IDLE_MS,
      onIdle: () => discardSession({ products: CONFIG.products, search, dispatch, setErrors, setLeadId, setReceipt, goTo: setView }),
    });
  }, []);
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
  const toggle = (field, value) => dispatch({ type: 'toggle', field, value });
  const goHome = () => { setReceipt(null); setView('entry'); };
  const goBack = (to) => () => { setErrors({}); setView(to); };

  // El mateix xip de perfil a l'inici, al pas 2 i als missatges: una sola dada (values.profile).
  const profileOptions = extra1
    ? PROFILES.map((p) => ({ value: p, label: t.form.profiles[p] }))
    : [{ value: 'profesional', label: t.profileDistribuidor }, { value: 'particular', label: t.profileParticular }];

  const screens = {
    entry: () => h(EntryScreen, {
      t, links: contactLinks(CONFIG, t, sessionOf(values)), email: CONFIG.email, legalQuery: query,
      profile: values.profile, profileLegend: extra1 ? t.form.entryProfileLegend : t.profileLegend, profileOptions,
      onProfile: (v) => change('profile', v), onClearProfile: () => change('profile', ''),
      onOpenForm: extra1 ? () => setView('step1') : undefined,
    }),
    step1: () => h(StepContact, {
      t, values, errors, onChange: change, onNext: next, onKeyDown: (e) => advanceOnEnter(e, document),
      onBack: () => leaveToEntry({ ...common, dispatch }), privacyHref: `privacy.html${query}#privacy`,
    }),
    step2: () => h(StepProfile, {
      t, products: CONFIG.products, values, errors, onChange: change, onToggle: toggle, onSubmit: submit, onKeyDown: (e) => advanceOnEnter(e, document), onBack: goBack('step1'),
    }),
    done: () => h(DoneScreen, {
      t, emailDelivery: CONFIG.emailDelivery, onOpen: openDocument, onHome: goHome,
      whatsappHref: contactLinks(CONFIG, t, receipt ? sessionOf(receipt) : {}).whatsapp,
    }),
  };

  const isStep = view === 'step1' || view === 'step2';
  // El <header> queda fora de <main>: així és el landmark de banner i el contingut és el principal.
  return h('div', { className: isStep ? 'page page--form tsf-compact' : 'page tsf-compact' },
    h(Header, { t, lang, onLang: setLang }),
    h('main', { className: 'page__main' }, screens[view]()));
}

window.ReactDOM.createRoot(document.getElementById('root')).render(h(App));
