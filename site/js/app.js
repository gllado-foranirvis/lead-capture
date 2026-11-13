import { CONFIG } from './config.js';
import { dictFor, resolveLang } from './i18n.js';
import { contactLinks } from './messages.js';
import { icon } from './icons.js';
import { isDossierEnabled, isDossierPreview, isExtra1Enabled, legalQuery, resolveOrigin, resolveProducts } from './form/context.js';
import { emptyForm, formReducer } from './form/model.js';
import { clearError } from './form/validate.js';
import { newLeadId } from './form/lead.js';
import { advanceStep1, discardSession, handleSkip, handleSubmit, leaveToEntry } from './form/flow.js';
import { ACTIVITY_EVENTS, IDLE_MS, watchIdle } from './form/idle.js';
import { toSession } from './form/session.js';
import { downloadAll } from './form/download-all.js';
import { focusFirstError, focusStepHeading } from './form/focus.js';
import { advanceOnEnter, applyFieldHints } from './form/hints.js';
import { clickInfo } from './form/click-info.js';
import { clickDetail, doneView, plannedDocs } from './form/views.js';
import { connectSender, createSender, notifySaved } from './form/sender.js';
import { onlyEnglishPdfs } from './form/dossier.js';
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
connectSender(window, createSender({ endpoint: CONFIG.leadEndpoint, token: CONFIG.leadToken, onSent: notifySaved(window) }), document);

const emit = (name) => (detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
const startedAt = Date.now();

function App() {
  const [lang, setLang] = R.useState(() => resolveLang(search, CONFIG));
  const [view, setView] = R.useState('entry'); // entry | step1 | step2 | done
  const [values, dispatch] = R.useReducer(formReducer, undefined, () => emptyForm({ products: resolveProducts(search, CONFIG.products) }));
  const [errors, setErrors] = R.useState({});
  const [attempt, setAttempt] = R.useState(0);
  const [leadId, setLeadId] = R.useState('');
  const [receipt, setReceipt] = R.useState(null);
  const [productsOpen, setProductsOpen] = R.useState(true); // el bloc de producte del pas de dades surt obert només si no s'ha triat res a l'inici
  const [saved, setSaved] = R.useState(false); // el servidor ha confirmat el lead parcial (mostra «dades guardades»)
  const leadIdRef = R.useRef('');
  leadIdRef.current = leadId;
  const mounted = R.useRef(false);
  // Identificador aleatori de la visita: només a la memòria (permet comptar visites, no persones); es renova a la tauleta en descartar la sessió.
  const visit = R.useRef(newLeadId());
  const t = dictFor(lang, dossier);
  const query = legalQuery(lang, extra1, dossier, isDossierPreview(CONFIG, search));
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
    if (view === 'step1') applyFieldHints(document);
    if (view === 'entry' || view === 'done') setSaved(false);
  }, [view]);
  R.useEffect(() => {
    const onSaved = (e) => { if (e.detail.stage === 'step1' && e.detail.id === leadIdRef.current) setSaved(true); };
    window.addEventListener('tsf:saved', onSaved);
    return () => window.removeEventListener('tsf:saved', onSaved);
  }, []);
  // Tauleta de l'estand: si el visitant s'allunya sense tocar res, la sessió es descarta.
  R.useEffect(() => {
    if (resolveOrigin(search) !== 'tauleta') return undefined;
    return watchIdle({
      target: document, events: ACTIVITY_EVENTS, ms: IDLE_MS,
      onIdle: () => { visit.current = newLeadId(); discardSession({ products: CONFIG.products, search, dispatch, setErrors, setLeadId, setReceipt, goTo: setView }); },
    });
  }, []);
  R.useEffect(() => {
    if (attempt > 0) focusFirstError(errors, document);
  }, [attempt]);

  const change = (field, value) => {
    dispatch({ type: 'set', field, value });
    setErrors((current) => clearError(current, field));
  };
  const common = { products: CONFIG.products, search, lang, visit: visit.current, leadId, newId: newLeadId, setLeadId, setErrors, bumpAttempt, goTo: setView };
  const next = () => advanceStep1(values, { ...common, emitPartial: emit('tsf:lead-partial') });
  const finishDeps = { ...common, dispatch, setReceipt, emitLead: emit('tsf:lead') };
  const submit = () => handleSubmit(values, finishDeps);
  const skip = () => handleSkip(values, finishDeps);
  const toggle = (field, value) => dispatch({ type: 'toggle', field, value });
  const goHome = () => { setReceipt(null); setView('entry'); };
  // La marca de la capçalera porta a l'inici des de qualsevol pantalla. A la tauleta es descarten les dades del visitant (com en «← Volver» del pas 1); al mòbil es conserva la sessió.
  const goToEntry = () => {
    if (view === 'done') goHome();
    else if (view !== 'entry') leaveToEntry({ ...common, dispatch });
    window.scrollTo(0, 0);
  };

  // Cada clic a WhatsApp o correu es notifica (l'enllaç segueix el seu camí); `from` diu de quina pantalla ve.
  const contactClick = (from) => (button) => emit('tsf:contact-click')(clickDetail({
    from, button, values, receipt, visit: visit.current, lang, origin: resolveOrigin(search), id: newLeadId(),
    info: clickInfo({ nav: navigator, win: window, doc: document, startedAt, now: Date.now() }),
  }));

  // Cada PDF descarregat és una fila a «Clics» (producte i ciutat del rebut); mai bloqueja la descàrrega.
  const onDownload = (doc) => emit('tsf:contact-click')(clickDetail({
    from: 'done', button: 'download', product: doc.id, values, receipt, visit: visit.current, lang, origin: resolveOrigin(search), id: newLeadId(),
    info: clickInfo({ nav: navigator, win: window, doc: document, startedAt, now: Date.now() }),
  }));

  const screens = {
    entry: () => h(EntryScreen, {
      t, fair: CONFIG.fair, links: contactLinks(CONFIG, t, sessionOf(values)), email: CONFIG.email, legalQuery: query,
      products: CONFIG.products, askProduct: dossier, pdfNote: onlyEnglishPdfs(CONFIG, lang), values, onChange: change, onToggle: toggle, onContactClick: contactClick('entry'),
      onOpenForm: extra1 ? () => { setProductsOpen(values.products.length === 0); setView('step1'); } : undefined,
    }),
    step1: () => h(StepContact, {
      t, lang, products: CONFIG.products, askProduct: dossier, downloads: plannedDocs({ products: values.products, lang, config: CONFIG, full: t }).map((d) => d.meta), saved, productsOpen, values, errors, onChange: change, onToggle: toggle, onSubmit: next,
      onKeyDown: (e) => advanceOnEnter(e, document), onBack: () => leaveToEntry({ ...common, dispatch }), privacyHref: `privacy.html${query}#privacy`,
    }),
    step2: () => h(StepProfile, {
      t, saved, values, errors, onChange: change, onToggle: toggle, onSubmit: submit, onSkip: skip,
      onKeyDown: (e) => advanceOnEnter(e, document), onBack: () => { setErrors({}); setView('step1'); },
    }),
    done: () => {
      const links = contactLinks(CONFIG, t, receipt ? sessionOf(receipt) : {});
      const view = doneView({ receipt, lang, dossier, config: CONFIG });
      return h(DoneScreen, {
        ...view, onHome: goHome, whatsappHref: links.whatsapp, emailHref: links.email,
        onDownload,
        onDownloadAll: () => { downloadAll(view.docs); view.docs.forEach(onDownload); }, onContactClick: contactClick('done'),
      });
    },
  };

  // La capçalera (landmark de banner) queda fora de <main>. Sobre la fotografia: a l'inici cobreix l'escena; a la resta és una franja.
  return h('div', { className: `site site--${view} tsf-compact` },
    h('div', { className: 'site__top tsf-on-dark' }, h(Header, { t, lang, onLang: setLang, onHome: goToEntry, homeHref: `${window.location.pathname}${search}` })),
    h('main', { className: 'page__main' }, screens[view]()));
}

window.ReactDOM.createRoot(document.getElementById('root')).render(h(App));
