# CRO d'Enertech 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inici clar amb recompensa al títol, dades amb «e-mail o telèfon», perfilació recuperada (saltable) abans del PDF i mesura de descàrregues a la pestanya `Clics`.

**Architecture:** Mateix site estàtic (`site/`, mòduls ES, React UMD, `window.TSF`). Flux `entry → step1 (dades) → step2 (perfilació) → done`. El lead es desa en acabar step1 (`stage: 'step1'`) i es completa en acabar o saltar step2 (`stage: 'complete'`). El codi de perfilació es recupera de git (`0debb6a^`, `2376db6^`) i s'adapta; la lògica pura va a `site/js/form/` amb tests; Apps Script es prova amb el llibre fals de `tests/apps-script.test.mjs`.

**Tech Stack:** JS ES modules, React 18 UMD, `node --test`, Google Apps Script. Cap dependència nova.

**Spec:** `docs/superpowers/specs/2026-11-12-cro-enertech-design.md` (llegir-lo sencer; també `2026-11-12-feria-portugal.md` per al que no es toca).

## Global Constraints

- Branca `feat/cro-enertech` creada des de `feat/feria-portugal`; commits petits en català amb prefix (`feat:`, `fix:`, `test:`, `docs:`), **mai cap línia `Co-Authored-By`**.
- TDD: test que falla → implementació mínima → test verd → commit. `npm test` ha de quedar verd a cada commit.
- Idiomes PT, EN, ES, CA (defecte `pt`); tots els literals nous als 4 idiomes (`tests/form-i18n.test.mjs` vigila que tinguin les mateixes claus). Tracte proper (tu), mai «seu/su».
- Mobile first: 360×740, inici amb el botó principal **dins la primera pantalla amb ≥40 px de marge** (avui toca el límit a y=740). Objectius tàctils ≥44 px.
- Cap cookie ni analítica de tercers (cap GA4). Sense canvis als PDF ni a la imatge.
- Nom obligatori; **almenys un de telèfon o e-mail**; prefix per defecte **+351**; el text de privacitat no s'adapta segons el camp omplert.
- Els ids de producte i les cadenes de l'script han de coincidir amb `site/js/form/model.js` (un test ho vigila).
- El servidor de Google s'ha de redesplegar a mà **abans** de fusionar (Task 8).

## Review Focus

1. **Només telèfon (o només e-mail):** el lead es desa, l'altre camp queda buit al full, l'e-mail no es posa en minúscula si és buit, el telèfon buit no arriba com a `"+351 "` (Task 1, 2).
2. **Número internacional enganxat amb el prefix amagat** (`+34 600 00 00 00`, `0034…`) continua repartint prefix i número (Task 6).
3. **Tornar enrere de step2 a step1 i avançar de nou, o prémer «Saltar» dues vegades:** el mateix `id`, una sola fila, mai un `step1` tardà que degradi un `complete` (Task 3, 4).
4. **Tauleta inactiva a step2:** `discardSession` esborra dades, perfil, `leadId` i confirmació; res d'un visitant arriba al següent (Task 3).
5. **Només «asesoramiento» o cap producte, i mala cobertura:** la confirmació no ofereix PDF ni genera files `download`; el PDF baixa encara que l'enviament falli; text amb `=1+1` a comentaris no s'executa com a fórmula (Task 2, 7).

---

### Task 1: Validació «e-mail o telèfon» i prefix +351

**Files:**
- Modify: `site/js/form/model.js`, `site/js/form/validate.js`, `site/js/form/lead.js` (només `buildContact`)
- Test: `tests/form-validate.test.mjs`, `tests/form-model.test.mjs`, `tests/form-lead.test.mjs`

**Interfaces:**
- Consumes: res d'altres tasks.
- Produces: `DEFAULT_PREFIX = '+351'`; `validateContact(values) → { name?, email?, phonePrefix?, phone?, privacy? }` amb codis `'required' | 'either' | 'email' | 'phone' | 'prefix' | 'privacy'`; `fullPhone(values) → string` (buit `''` si el número és buit); `FIELD_ORDER` (de moment `['name','email','phonePrefix','phone','privacy']`).

- [ ] **Step 1: Tests que fallen** a `form-validate.test.mjs`: (a) nom buit → `{ name: 'required' }`; (b) sense e-mail ni telèfon → `errors.email === 'either'` i **`errors.phone` undefined** (un sol error); (c) només telèfon vàlid (`phonePrefix '+351'`, `phone '912 345 678'`) → `{}` (amb nom i privacitat); (d) només e-mail vàlid → `{}` i el prefix invàlid **no** dona error; (e) e-mail mal format → `'email'`; (f) telèfon curt amb prefix → `'phone'`; (g) prefix invàlid amb telèfon omplert → `'prefix'`. A `form-model.test.mjs`: `emptyForm().phonePrefix === '+351'`. A `form-lead.test.mjs`: sense telèfon, `buildLead(...).contact.phone === ''`; sense e-mail, `contact.email === ''`.
- [ ] **Step 2: Executar** `node --test tests/form-validate.test.mjs tests/form-model.test.mjs tests/form-lead.test.mjs` i comprovar que fallen per les assercions noves.
- [ ] **Step 3: Implementar** a `validate.js` la regla (e-mail o telèfon), mantenint les regexps i el comptatge 7–15 xifres existents, i l'únic error `'either'` a `email`; a `model.js` canviar `DEFAULT_PREFIX` i fer que `fullPhone` torni `''` si el número és buit; a `lead.js` el correu buit queda `''`.
- [ ] **Step 4: Executar** `npm test` (arreglar només els tests antics que assumien telèfon i e-mail obligatoris) i comprovar que passa.
- [ ] **Step 5: Commit** `git commit -m "feat: contacte amb almenys e-mail o telèfon i prefix +351 per defecte"`.

### Task 2: Apps Script — contacte parcial, perfilació i clics de descàrrega

**Files:**
- Modify: `apps-script/Code.gs`
- Test: `tests/apps-script.test.mjs`

**Interfaces:**
- Consumes: payloads `{ id, stage: 'step1'|'complete', contact, profiling? }` i `{ id, stage: 'click', click }` (Task 4 els produeix).
- Produces: `sanitizeLead` accepta almenys un de telèfon/e-mail; torna a omplir les columnes heretades (`profile, activity, activityOther, hasBoat, hasElectric, enthusiasm(+Other), concerns(+Other), intent, factors(+Other), comments`) des de `payload.profiling` quan `stage === 'complete'`; **`complete` sense perfil és vàlid** (perfil buit); `BUTTONS = ['whatsapp','email','download']`; la columna `city` no canvia.

- [ ] **Step 1: Tests que fallen** (llibre fals existent): lead només amb telèfon → fila creada amb e-mail `''`; només amb e-mail → telèfon `''`; cap dels dos → `ok:false, error:'invalid'`; `step1` amb producte i ciutat, després `complete` amb `profiling { profile:'profesional', activity:'vela', enthusiasm:['noise','other'], enthusiasmOther:'x', comments:'=1+1' }` → **mateixa fila** actualitzada, `enthusiasm === 'noise, other'`, comentaris amb apòstrof inicial (`"'=1+1"`); `complete` sense `profiling` → fila `complete` amb `profile` buit; un `step1` posterior a un `complete` → `'ignored'`; clic `{ button:'download', from:'done', products:'sifly', ... }` → fila a `Clics`; `button:'altre'` → invàlid. Opcions desconegudes (`profile:'x'`) queden buides.
- [ ] **Step 2: Executar** `node --test tests/apps-script.test.mjs`; han de fallar.
- [ ] **Step 3: Implementar** a `Code.gs`: recuperar de `git show origin/main:apps-script/Code.gs` els llistats `PROFILES, YES_NO, ACTIVITIES, OPINION` i el bloc de `profiling` de `sanitizeLead` **sense** `demo` i **sense** el rebuig de `complete` sense perfil; relaxar la comprovació de contacte a «almenys un»; validar el format de l'e-mail només si n'hi ha; afegir `'download'` a `BUTTONS`.
- [ ] **Step 4: Executar** `npm test`; verd (inclou el test que compara les llistes amb `model.js`: Task 3 restaura `model.js`; si aquest test queda vermell fins aleshores, deixar-lo a la Task 3).
- [ ] **Step 5: Commit** `git commit -m "feat: l'script accepta contacte parcial, recupera la perfilació i registra descàrregues"`.

### Task 3: Perfilació a les dades i fluxos (entry → step1 → step2 → done)

**Files:**
- Modify: `site/js/form/model.js`, `validate.js`, `lead.js`, `payload.js`, `flow.js`
- Test: `tests/form-model.test.mjs`, `form-validate.test.mjs`, `form-lead.test.mjs`, `lead-payload.test.mjs`, `form-flow.test.mjs`

**Interfaces:**
- Consumes: `validateContact`, `fullPhone` (Task 1).
- Produces (noms exactes):
  - `model.js`: `PROFILES, ACTIVITIES, ENTHUSIASM, CONCERNS, FACTORS, OPINION_GROUPS, showsActivity(values), showsActivityOther(values)` (copiats de `git show 0debb6a^:site/js/form/model.js`); `emptyForm({products})` afegeix els camps de perfil **sense `demo`** (i manté `city`); `MAX` afegeix `activityOther: 120, other: 120, comments: 500`; el reducer reintrodueix `withDependencies`.
  - `validate.js`: `validateProfile(values) → {} | { profile: 'profileRequired' }`; `FIELD_ORDER = [...contacte, 'profile']`.
  - `lead.js`: `buildPartialLead(values, ctx) → { id, stage:'step1', name, email, phone, product, city, privacy, newsletter, lang, origin }`; `buildLead(values, ctx) → { contact, profiling, hasProfiling }`; `submitContact(values, ctx) → { errors } | { lead }` (lead parcial); `submitProfile(values, ctx) → { errors } | { lead }` (valida el perfil); `skipProfile(values, ctx) → { lead }` (`profiling: { id }`, `hasProfiling: false`).
  - `payload.js`: `partialPayload(detail) → { id, stage:'step1', contact }`; `finalPayload({ contact, profiling }) → { id, stage:'complete', contact, profiling }` (el perfil sense `id`).
  - `flow.js`: `advanceStep1(values, deps)` (valida contacte; emet `emitPartial(lead)`; `setLeadId(id)`; `goTo('step2')`; error → `goTo('step1')`), `handleSubmit(values, deps)` (valida perfil; error → `goTo('step2')`; emet `emitLead`), `handleSkip(values, deps)` (emet `emitLead` amb `skipProfile`); tots dos van a `'done'` amb `receipt = { products, name, city }` i netegen el formulari com ara; `leaveToEntry` i `discardSession` no canvien.

- [ ] **Step 1: Tests que fallen**, adaptant els recuperats de `git show 2376db6^:tests/form-model.test.mjs` (i el seu `form-lead`, `form-flow`, `lead-payload`): `emptyForm` conté `profile:''` i no `demo`; l'opció `other` d'un grup conserva/neteja `…Other`; `validateProfile({profile:''})` → `profileRequired`, `{profile:'particular'}` → `{}`; `buildPartialLead` porta `product` i `city`; `skipProfile(...).lead.hasProfiling === false`; `advanceStep1` amb errors no emet res i amb èxit emet **un** lead parcial i reutilitza `leadId` si ja existeix; `handleSkip` emet `stage complete` amb perfil buit i va a `done`; `handleSubmit` sense perfil → `goTo('step2')` i res emès; `discardSession` neteja tot (Review Focus 4).
- [ ] **Step 2: Executar** `node --test tests/form-*.test.mjs tests/lead-payload.test.mjs tests/apps-script.test.mjs`; han de fallar.
- [ ] **Step 3: Implementar** recuperant de git (`git show 0debb6a^:site/js/form/<fitxer>`) el que correspon i adaptant a les signatures de dalt.
- [ ] **Step 4: Executar** `npm test` verd.
- [ ] **Step 5: Commit** `git commit -m "feat: perfilació recuperada al model i al flux, amb opció de saltar-la"`.

### Task 4: Sender — lead parcial, confirmació de desat i descàrregues

**Files:**
- Modify: `site/js/form/sender.js`, `site/js/form/views.js`, `site/js/form/dossier.js`
- Test: `tests/lead-sender.test.mjs`, `tests/form-views.test.mjs`, `tests/form-dossier.test.mjs`

**Interfaces:**
- Consumes: `partialPayload`, `finalPayload` (Task 3).
- Produces:
  - `connectSender(target, sender, doc)` escolta també `tsf:lead-partial` → `sender.send(partialPayload(detail))`; el sender crida `onSent({ id, stage })` (opció nova de `createSender`) i `connectSender` fa `target.dispatchEvent(new CustomEvent('tsf:saved', { detail: { id, stage } }))`.
  - `dossiersFor(...)` torna `{ id, href, meta }` (afegeix `id`; el general de la marca, `id: 'brand'`).
  - `clickDetail({ ..., product })`: si es dona `product`, `products` és aquell id (una fila per PDF).
  - `onlyEnglishPdfs(config, lang) → boolean`: `lang !== 'en'` i cap producte té `pdf[lang]`.

- [ ] **Step 1: Tests que fallen:** `tsf:lead-partial` genera un POST `stage:'step1'`; un `step1` tardà no substitueix un `complete` pendent (ja hi ha test; mantenir); un POST amb èxit dispara `onSent` i `tsf:saved` amb `{id, stage}`; un fracàs **no**; `dossiersFor` conserva `id`; `clickDetail({from:'done', button:'download', product:'sifly', receipt})` → `products === 'sifly'`; `onlyEnglishPdfs(CONFIG,'pt') === true`, `(CONFIG,'en') === false`, i `true→false` si s'afegeix `pdf.pt` a tots.
- [ ] **Step 2: Executar** els tres fitxers; han de fallar.
- [ ] **Step 3: Implementar** les signatures de dalt a `sender.js`, `dossier.js` i `views.js` (una crida a `onSent` només si el resultat és `'sent'`).
- [ ] **Step 4: Executar** `npm test` verd.
- [ ] **Step 5: Commit** `git commit -m "feat: lead parcial, confirmació de desat i detall de descàrrega al sender"`.

### Task 5: Pas 2 (perfilació) a la interfície

**Files:**
- Create: `site/js/ui/step-profile.js`, `site/js/chips.js` (recuperats de `git show 2376db6^:…`)
- Modify: `site/js/ui/fields.js` (tornar `chips` i `select`), `site/js/i18n-form.js`, `site/css/page.css`
- Test: `tests/ui-steps.test.mjs`, `tests/chips.test.mjs` (recuperat), `tests/form-i18n.test.mjs`

**Interfaces:**
- Consumes: constants i `validateProfile` (Task 3); `createStepIndicator` ja existent.
- Produces: `createStepProfile({ h, T }) → StepProfile({ t, values, errors, saved, onChange, onToggle, onSubmit, onSkip, onBack, onKeyDown })`; claus `FORM[lang]`: les de perfilació recuperades de `2376db6^` (`step2Title, step2Subtitle, profileLegend, profiles, activity*, hasBoat, hasElectric, enthusiasm*, concerns*, intent, factors*, otherLabel, otherPlaceholder, comments*, yes, no, errors.profileRequired`) **sense `demo*`**, més `skipLabel`, `moreGroup` (títol del grup plegable), `optionalTag`.

- [ ] **Step 1: Tests que fallen** (a `ui-steps`, amb `fake-react`): «Quem és» surt **primer** i és l'únic amb `required`; la resta de preguntes són dins d'un únic `details` (plegat per defecte) amb l'etiqueta `moreGroup`; hi ha **dos** botons de ample complet: `type:'submit'` (`f.submit`) i el de saltar (`f.skipLabel`, `onClick: onSkip`), més l'enllaç de tornar; amb `saved` cert surt `.form__saved` (`aria-live="polite"`); no hi ha camp `demo` ni bloc de productes. `form-i18n`: els 4 idiomes tenen les mateixes claus noves.
- [ ] **Step 2: Executar** `node --test tests/ui-steps.test.mjs tests/chips.test.mjs tests/form-i18n.test.mjs`; han de fallar.
- [ ] **Step 3: Implementar** `step-profile.js` a partir de `git show 2376db6^:site/js/ui/step-profile.js` amb l'estructura dels tests; restaurar `chips.js` i les funcions `chips/select` de `fields.js`; restaurar els literals dels 4 idiomes i afegir els nous (portuguès informal, to de «estande», sense «seu»); estil de `details` i botons amb les variables del sistema (cap color nou).
- [ ] **Step 4: Executar** `npm test` verd.
- [ ] **Step 5: Commit** `git commit -m "feat: pas 2 de perfilació amb «Quem és» primer, opcionals plegades i botó de saltar"`.

### Task 6: Tira de 4 passos i pas 1 (dades) més clar

**Files:**
- Modify: `site/js/form/steps.js`, `site/js/ui/step-contact.js`, `site/js/i18n-form.js`, `site/css/page.css`
- Test: `tests/ui-steps.test.mjs`, `tests/css.test.mjs`, `tests/form-i18n.test.mjs`

**Interfaces:**
- Consumes: `StepIndicator` (sense canvis d'API), `stepLabel`.
- Produces: `stepText(template, names, n, total) → string` (p. ex. `«Passo 2 de 4 · Dados»`); `FORM[lang].stepNames = ['Produto','Dados','Interesse','PDF']` (traduïts); `step1Hint` («Basta o e-mail ou o telemóvel» en els 4 idiomes), `errors.either` («Deixa o e-mail ou o telemóvel»), `eitherTag` («um dos dois»). `StepContact` rep `saved` i usa `step: 2, total: 4`; `StepProfile`, `step: 3, total: 4`. La confirmació **no** porta tira.

- [ ] **Step 1: Tests que fallen:** `stepText('Passo {n} de {total}', ['A','B'], 2, 4)`; a `StepContact` el `progressbar` té `aria-valuenow 2`, `aria-valuemax 4` i `aria-valuetext` amb el nom del pas; hi ha una línia `step1Hint` sobre els camps; els camps e-mail i telèfon **no** porten `required` i mostren `eitherTag` a l'etiqueta; amb `errors = { email: 'either' }` surt **un sol** missatge; el camp del prefix té una classe de col·lapse (`form__phone--collapsed`) i `css.test` comprova que la regla existeix i que el prefix no es treu amb `display:none` (ha de seguir sent accessible amb teclat i lectors; cap salt vertical en enfocar); amb `saved` surt `.form__saved`. `StepProfile` mostra la tira 3 de 4.
- [ ] **Step 2: Executar** els tres fitxers; han de fallar.
- [ ] **Step 3: Implementar** `stepText`; adaptar `step-contact.js` (hint, etiquetes, un sol error, prefix col·lapsat via CSS amb `:focus-within`, `saved`); canviar la tira a `step-profile.js`; `step1Subtitle` diu que després venen unes preguntes opcionals abans del PDF.
- [ ] **Step 4: Executar** `npm test` verd.
- [ ] **Step 5: Commit** `git commit -m "feat: tira de 4 passos i pas de dades amb «um dos dois»"`.

### Task 7: Inici amb recompensa, dreçera sota el botó i confirmació amb mesura

**Files:**
- Modify: `site/js/ui/entry-screen.js`, `site/js/ui/done-screen.js`, `site/js/i18n-form.js`, `site/js/i18n.js` (si cal), `site/css/page.css`
- Test: `tests/ui-steps.test.mjs`, `tests/ui.test.mjs`, `tests/css.test.mjs`, `tests/no-dossier.test.mjs`

**Interfaces:**
- Consumes: `onlyEnglishPdfs` i `dossiersFor` (Task 4).
- Produces: `EntryScreen` rep `pdfNote` (boolean) i mostra `f.entryPdfNote` al costat del botó; ordre de l'inici: títol/subtítol → productes → ciutat → **botó principal** (`f.entryCta`, text «Descarregar dossier →») → dreçera (`f.entryContactLabel` = «Prefiro falar já», WhatsApp i e-mail **en una fila de dos**) → adreça de recuperació → enllaços legals. `DoneScreen` rep `onDownload(doc)`: cada targeta, el botó d'un sol PDF i «descarregar tots» (que crida `onDownload` per a cada doc) disparen la mesura. Textos nous (4 idiomes): `entryTitle` (proposta PT «Descobre o mar em silêncio»), `entrySubtitle` («Escolhe o teu produto e descarrega já o dossier»), `entryCta`, `entryPdfNote` («PDF em inglês»). Genèrics, sense «barco elétrico».

- [ ] **Step 1: Tests que fallen:** l'ordre dels elements a l'inici (el botó principal abans de les dreçeres); `entryPdfNote` visible només amb `pdfNote`; el botó principal no té text de «The Silent Fleet»; a la confirmació, `onDownload` es crida amb el doc en clicar la targeta i **una vegada per doc** amb «descarregar tots»; sense docs (només «asesoramiento») no hi ha cap botó de descàrrega; `no-dossier` (`?dossier=0`) no mostra nota de PDF ni productes. `css.test`: la regla de la franja d'imatge i la fila de dreçeres existeixen.
- [ ] **Step 2: Executar** els fitxers; han de fallar.
- [ ] **Step 3: Implementar** les pantalles i el CSS: imatge d'inici reduïda a una franja (títol més curt a l'esquerra del vel), botons de contacte en fila de dos, enllaços legals sota.
- [ ] **Step 4: Mesurar a 360×740** (`npm run serve`, pestanya nova del navegador amb iframe de 360×740 si la finestra no es pot reduir): botó principal amb **bottom ≤ 700**, sense scroll horitzontal; anotar-ho al missatge del commit. Si no hi cap, reduir la imatge/espais, no treure contingut.
- [ ] **Step 5: Executar** `npm test` verd i **commit** `git commit -m "feat: inici amb recompensa, dreçera sota el botó i descàrregues a la confirmació"`.

### Task 8: Cablejat de `app.js`, textos legals, documentació i prova real

**Files:**
- Modify: `site/js/app.js`, `site/js/i18n.js`, `site/js/i18n-form.js` (`cookiesText`), `docs/google-sheet.md`, `README.md`, `scripts/smoke-sheet.mjs`, `docs/textos-contacte.md` (via `npm run texts`), `site/index.html` (fallback sense JS)
- Test: `tests/privacy-text.test.mjs`, `tests/texts-doc.test.mjs`, `tests/html.test.mjs`

**Interfaces:**
- Consumes: tot l'anterior.
- Produces: `app.js` amb `view` `entry | step1 | step2 | done`; `advanceStep1` des de step1 (`emitPartial: emit('tsf:lead-partial')`), `handleSubmit` i `handleSkip` des de step2; estat `saved` (de `tsf:saved` amb l'`id` del lead actual); `onDownload = (doc) => emit('tsf:contact-click')(clickDetail({ from:'done', button:'download', product: doc.id, … }))`; `pdfNote = onlyEnglishPdfs(CONFIG, lang)`; el botó enrere de step2 torna a step1 conservant les dades; la capçalera `goToEntry` segueix igual.

- [ ] **Step 1: Tests que fallen:** `cookiesText` als 4 idiomes diu que també es registra la **descàrrega d'un PDF** (producte, ciutat, dispositiu, mateixa llista de camps, sense afegir cookies); `privacyText` ja cobreix la perfilació (recuperar la frase antiga de `git show 2376db6^`); el fallback de `index.html` i `privacy.html` no menciona «Barcelona»; `tests/texts-doc` verd després de `npm run texts`.
- [ ] **Step 2: Executar** `node --test tests/privacy-text.test.mjs tests/texts-doc.test.mjs tests/html.test.mjs`; han de fallar.
- [ ] **Step 3: Implementar** el cablejat i els textos; `docs/google-sheet.md`: columnes (perfilació heretada tornen a omplir-se), nou valor `download` de `Clics`, instruccions de **redesplegar l'script com a nova versió**; `scripts/smoke-sheet.mjs`: payload `step1` només amb telèfon, `complete` saltat i clic `download`; README: recorregut nou.
- [ ] **Step 4: Prova real al navegador** (`npm run serve`, pestanya nova): (a) inici → botó principal sense scroll; (b) triar un producte → pas 1 amb només telèfon → pas 2 → **Saltar** → confirmació amb el PDF, clic al PDF; (c) repetir enviant el perfil; (d) pas 1 sense res → un sol error. Captura de cada pantalla a 360×740 i confirmació que res no desborda; **no** deixar l'script de Google real escrivint proves: usar `leadEndpoint` buit i esdeveniments al `console`.
- [ ] **Step 5: Executar** `npm test` verd; **commit** `git commit -m "feat: flux complet entry → dades → perfilació → descàrrega i documentació"`.
- [ ] **Step 6: Abans de fusionar (no executar sense el vistiplau d'Olga):** redesplegar l'script de Google com a nova versió, actualitzar la data a `docs/google-sheet.md`, `node scripts/smoke-sheet.mjs <url> <token>`, etiqueta `pre-cro-enertech` a la branca base i PR (sense atribució).

---

## Self-review

- **Cobertura de l'spec:** inici B amb títol genèric i botó + nota de PDF (T7), tira fora de l'inici i de 4 passos (T6), regla contacte i +351 (T1, T2), perfilació recuperada i saltable (T3, T5), lead a step1/complete (T3, T4), mesura només de descàrregues, una fila per PDF (T2, T4, T7, T8), camí de fallada i «dados guardados» (T4, T5, T6), accessibilitat de la tira (T6), cookies/privacitat (T8), redeploy (T8).
- **Coherència de tipus:** `partialPayload`/`finalPayload` (T3) → `connectSender` (T4) → `app.js` (T8); `dossiersFor` amb `id` (T4) → `onDownload(doc)` (T7) → `clickDetail({ product })` (T4/T8); `StepProfile` props (T5) coincideixen amb l'ús a T8.
- **Risc conegut:** el pas 2 és llarg; per això el botó de saltar és un botó complet i les preguntes opcionals van plegades. La conversió es mesura creuant la pestanya de leads amb les files `download` de `Clics`.
