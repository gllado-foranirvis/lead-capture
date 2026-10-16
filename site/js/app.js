import { CONFIG } from './config.js';
import { dictFor, resolveLang } from './i18n.js';
import { contactLinks } from './messages.js';
import { icon } from './icons.js';
import { isDossierEnabled, isExtra1Enabled, legalQuery, resolveOrigin, resolveProducts } from './form/context.js';
import { PROFILES, emptyForm, formReducer } from './form/model.js';
import { clearError } from './form/validate.js';
import { newLeadId } from './form/lead.js';
import { advanceStep1, discardSession, handleSubmit, leaveToEntry } from './form/flow.js';
import { ACTIVITY_EVENTS, IDLE_MS, watchIdle } from './form/idle.js';
import { toSession } from './form/session.js';
import { dossiersFor } from './form/dossier.js';
import { downloadAll } from './form/download-all.js';
import { focusFirstError, focusStepHeading } from './form/focus.js';
import { advanceOnEnter, applyFieldHints } from './form/hints.js';
import { connectSender, createSender } from './form/sender.js';
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
const dossier = isDossierEnabled(CONFIG, search);

const Header = createChrome({ h, T, brand: CONFIG.brand, languages: CONFIG.languages });
const EntryScreen = createEntryScreen({ h, T, icon });
const StepContact = createStepContact({ h, T });
const StepProfile = createStepProfile({ h, T });
const DoneScreen = createDoneScreen({ h, T, icon });

// Els leads s'envien al full de Google si hi ha URL configurada; la cua viu aquí (no a l'estat de React) perquè
// canviar de pantalla o la neteja per inactivitat de la tauleta no perdin res.
connectSender(window, createSender({ endpoint: CONFIG.leadEndpoint, token: CONFIG.leadToken }), document);

const emit = (name) => (detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

function App() {
  const [lang, setLang] = R.useState(() => resolveLang(search, CONFIG));
  const [view, setView] = R.useState('entry'); // entry | step1 | step2 | done
  const [values, dispatch] = R.useReducer(formReducer, undefined, () => emptyForm({ products: resolveProducts(search, CONFIG.products) }));
  const [errors, setErrors] = R.useState({});
  const [attempt, setAttempt] = R.useState(0);
  const [leadId, setLeadId] = R.useState('');
  const [receipt, setReceipt] = R.useState(null);
  const mounted = R.useRef(false);
  const t = dictFor(lang, dossier);
  const query = legalQuery(lang, extra1, dossier);
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
  const submit = () => handleSubmit(values, { ...common, dispatch, setReceipt, emitLead: emit('tsf:lead') });
  const toggle = (field, value) => dispatch({ type: 'toggle', field, value });
  const goHome = () => { setReceipt(null); setView('entry'); };
  // La marca de la capçalera porta a l'inici des de qualsevol pantalla. A la tauleta es descarten les dades del visitant (com en «← Volver» del pas 1); al mòbil es conserva la sessió.
  const goToEntry = () => {
    if (view === 'done') goHome();
    else if (view !== 'entry') leaveToEntry({ ...common, dispatch });
    window.scrollTo(0, 0);
  };
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
      t, lang, values, errors, onChange: change, onNext: next, onKeyDown: (e) => advanceOnEnter(e, document),
      onBack: () => leaveToEntry({ ...common, dispatch }), privacyHref: `privacy.html${query}#privacy`,
    }),
    step2: () => h(StepProfile, {
      t, products: CONFIG.products, askProduct: dossier, values, errors, onChange: change, onToggle: toggle, onSubmit: submit, onKeyDown: (e) => advanceOnEnter(e, document), onBack: goBack('step1'),
    }),
    done: () => {
      const links = contactLinks(CONFIG, t, receipt ? sessionOf(receipt) : {});
      const docs = dossier ? dossiersFor(receipt?.products ?? [], CONFIG, t.form.doneCardGeneral) : [];
      return h(DoneScreen, {
        t, emailDelivery: dossier && CONFIG.emailDelivery, onHome: goHome, whatsappHref: links.whatsapp, emailHref: links.email,
        docs, onDownloadAll: () => downloadAll(docs),
      });
    },
  };

  // La capçalera (landmark de banner) queda fora de <main>. Sobre la fotografia: a l'inici cobreix l'escena; a la resta és una franja.
  return h('div', { className: `site site--${view} tsf-compact` },
    h('div', { className: 'site__top tsf-on-dark' }, h(Header, { t, lang, onLang: setLang, onHome: goToEntry, homeHref: `${window.location.pathname}${search}` })),
    h('main', { className: 'page__main' }, screens[view]()));
}

window.ReactDOM.createRoot(document.getElementById('root')).render(h(App));
