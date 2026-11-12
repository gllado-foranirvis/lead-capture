# Feria de Portugal (Enertech 2026) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adaptar el formulari a la fira Enertech 2026 (Portugal): inici amb nom de la fira, productes (multi-tria) i ciutat; recompte anònim i detallat de clics a WhatsApp/correu al full; productes també a la pàgina de dades; descàrrega del PDF de cada producte en l'idioma del formulari (anglès si no n'hi ha).

**Architecture:** El flux passa de 3 pantalles amb perfilació a `entry → step1 → done`; el lead s'envia un sol cop en acabar `step1`. Els PDF són un mapa idioma→ruta a `config.js` i una funció pura (`pdfFor`) tria l'idioma i hi cau a l'anglès. Els clics viatgen per la mateixa cua d'enviament que els leads (`stage: 'click'`, amb la informació anònima que calcula una funció pura) i l'script de Google els desa a la pestanya `Clics`.

**Tech Stack:** JS ES modules sense compilació, React 18 (UMD) + `window.TSF`, `node --test` (`npm test`), Google Apps Script.

**Spec:** `docs/superpowers/specs/2026-11-12-feria-portugal.md`

## Global Constraints

- Literals d'usuari en 4 idiomes (`pt`, `en`, `es`, `ca`) a `site/js/i18n-form.js`; portuguès amb «tu» i «e-mail» (un test ho vigila); cap literal visible diu «PDF» ni «ficha» (diu «dossier»).
- Sense dependències noves ni pas de compilació; `npm test` en verd i `npm run sync` sense canvis abans de cada commit.
- Codi net: KISS i DRY, una responsabilitat per fitxer, esborrar el codi mort (no deixar-lo «per si de cas»); comentaris en català com la resta del repositori; el projecte continua en desenvolupament, així que res de dades de prova ni noms inventats.
- **TDD a cada tasca** (skill `superpowers:test-driven-development`): test que falla → implementació mínima → test verd → commit.
- **Mobile first sense scroll:** a 360×740 cada pantalla (inici i pàgina de dades) ha de cabre sencera (`document.documentElement.scrollHeight <= window.innerHeight`); a la confirmació, el títol i la primera descàrrega han de ser visibles sense scroll.
- Versió de contingència (`dossier: false` o `?dossier=0`): no pregunta el producte ni parla de cap descàrrega.
- Als clics, cap nom, correu ni telèfon (sí la ciutat, decidit per Olga); res a `localStorage`/cookies; l'identificador de visita només viu a la memòria.
- Treballar a la branca `feat/feria-portugal` des d'`origin/main`; res no entra a `main` sense PR i CI verd (vegeu README). Data límit: 19/11/2026.

## Skills per fase

- **Dins de cada tasca:** `superpowers:test-driven-development`. En qualsevol fallada inesperada: `superpowers:systematic-debugging`.
- **Tasques 3, 4 i 5 (pantalles):** abans d'escriure la UI, `impeccable` (shape/layout) per decidir com cap tot a 360×740 sense scroll i on va el nom de la fira; en acabar cada pantalla, `impeccable critique` i la mesura de scroll del Global Constraints.
- **Final (Task 7):** `impeccable audit` + `polish`, `superpowers:requesting-code-review` sobre tota la branca, `superpowers:verification-before-completion` abans de dir que està acabat i `superpowers:finishing-a-development-branch` per al PR.

## Control de versions (git)

Continuen les regles del README («Flux de treball (git)»); aquí, el que s'aplica a aquest treball:

- **Punt de partida net.** Avui `main` local té canvis sense commit que no són d'aquest treball: `scripts/smoke-sheet.mjs` (un telèfon de prova canviat) i `site/dossiers/model-a.pdf`/`model-b.pdf` esborrats, a més dels 7 PDF nous sense seguiment i dels dos documents (spec i pla). Abans de res: `git fetch origin`, crear la branca amb `git switch -c feat/feria-portugal origin/main` (els canvis sense commit viatgen amb la branca) i fer **un primer commit només de documentació** (`docs: spec i pla d'Enertech 2026`) i **un de PDF** (`feat: PDF dels 7 productes en anglès`, amb l'esborrat de `model-a/b.pdf`). El canvi de `smoke-sheet.mjs` (telèfon de prova) és d'Olga i **es conserva**: va en el seu propi commit (`chore: telèfon de prova de smoke-sheet`) abans de la Task 6, que el toca després i hi treballa a sobre.
- **Punt de retorn.** Abans de fusionar, etiquetar l'`origin/main` actual (`git tag pre-enertech-2026 origin/main && git push origin pre-enertech-2026`): `main` publica sol a Pages i, si la fira va malament, es redesplega aquesta etiqueta.
- **Commits.** Un per tasca com a mínim (els del pla), petits i atòmics, en català, amb prefix (`feat:`, `fix:`, `docs:`, `chore:`, `test:`) i **mai amb línies `Co-Authored-By`** (ni als PR; regla d'Olga). Mai un commit amb `npm test` en vermell ni amb `npm run sync` amb canvis. Cap secret ni dada personal als commits (el `leadToken` ja és públic per disseny; res més). Un error d'una tasca anterior es corregeix amb un commit nou `fix:`, no reescrivint l'historial publicat.
- **Branca i remot.** Empènyer la branca a cada tasca acabada (còpia de seguretat, i la CI hi corre); mai `push --force` ni a `main`, ni amb `--no-verify`; no tocar `feat/dossier-multiseleccio` ni les branques `claude/*`.
- **PDF.** Són binaris grans (43 MB en total, el major de 17 MB): es versionen igualment (sota el límit de 100 MB de GitHub per fitxer; no s'usa Git LFS perquè Pages no serveix els fitxers LFS) però **només es fan servir els que són a `config.js`**, i substituir un PDF és un commit propi (`chore: PDF de <producte> actualitzat`) perquè l'historial no creixi amb canvis barrejats.
- **PR.** Un sol PR cap a `main` amb descripció (què canvia, decisions d'Olga, risc de l'script de Google), enllaç a spec i pla, i la llista de comprovacions manuals; CI en verd, vistiplau d'Olga i **squash o merge sense reescriure** segons el que fa servir el repositori (fins ara, «Merge pull request»). Després de fusionar: esperar Pages (~30 s), Cmd+Shift+R, prova real, i esborrar la branca local i remota.
- **Script de Google.** `apps-script/Code.gs` es desplega a mà a l'editor d'Apps Script (no passa per git): després de fusionar, anotar al PR o a `docs/google-sheet.md` la data de la versió desplegada perquè codi i script no es desincronitzin.

## Review Focus

- Idioma sense PDF propi (avui tots menys `en`): la targeta surt amb el PDF anglès, mai buida ni trencada.
- Cap PDF aplicable (només «asesoramiento» o cap producte marcat): no hi ha targetes ni botó i el text és el de «gràcies, ja tenim les teves dades», no el que parla del dossier.
- Producte triat a l'inici i canviat a la pàgina 1 (i a la inversa): és el mateix `values.products`; «asesoramiento» continua excloent els models.
- Clic a WhatsApp/correu amb la xarxa caiguda o la pàgina que es tanca en obrir l'aplicació: el clic no es perd (cua + `sendBeacon`) i un reintent no el duplica (upsert per `id`).
- Ciutat (al lead i al clic) o domini de procedència amb `=`, `+`, `@` al començament, o camps molt llargs: van al full com a text i retallats.
- Navegador sense `navigator.userAgentData`, sense `Intl` o amb `document.referrer` buit: el clic es desa igualment, amb el camp buit.

---

### Task 1: Formulari i lead sense perfilació; `demo` passa a `city`

**Files:**

- Modify: `site/js/form/model.js`, `site/js/form/validate.js`, `site/js/form/lead.js`, `site/js/form/payload.js`, `site/js/form/session.js`, `site/js/form/flow.js`, `site/js/form/sender.js`, `site/js/form/hints.js`, `site/js/messages.js`, `site/js/i18n.js` (`messageContext`: la clau `demo` passa a `city`: «Ciudad: {value}» / «Ciutat: {value}» / «Cidade: {value}» / «City: {value}»)
- Test: `tests/form-model.test.mjs`, `tests/form-validate.test.mjs`, `tests/form-lead.test.mjs`, `tests/lead-payload.test.mjs`, `tests/form-session.test.mjs`, `tests/form-flow.test.mjs`, `tests/form-hints.test.mjs`, `tests/lead-sender.test.mjs`, `tests/messages.test.mjs`

**Interfaces:**

- Produces:
  - `emptyForm({ products = [] } = {}) -> { products: string[], city: '', name: '', email: '', phonePrefix: '+34', phone: '', privacy: false, newsletter: false }`; `MAX.city = 80` (substitueix `MAX.demo`). S'esborren `profile`, `activity*`, `hasBoat`, `hasElectric`, `intent`, `demo`, opinions i `comments`, juntament amb `PROFILES`, `ACTIVITIES`, `OPINION_GROUPS`, `showsActivity*` i `withDependencies`. `toggle` de `products` i `ADVICE` no canvien.
  - `validateContact(values) -> errors` = l'antic `validateStep1`; `STEP_FIELDS = { 1: [...] }`; desapareix l'error `profileRequired`.
  - `buildLead(values, { id, lang, origin }) -> { contact: { id, product, city, name, email, phone, privacy: true, newsletter, lang, origin } }`; `submitForm(values, context) -> { errors } | { lead }`. Desapareixen `buildPartialLead`, `profiling` i `hasProfiling`.
  - `finalPayload({ contact }) -> { id, stage: 'complete', contact }`; desapareix `partialPayload` i `connectSender` deixa d'escoltar `tsf:lead-partial`.
  - `toSession(values, { products, dict }) -> { product, city, name }`; `FIELD_HINTS.city = { autocomplete: 'address-level2', enterkeyhint: 'done' }` (substitueix `demo`).
  - `handleSubmit(values, ctx)` valida i emet `tsf:lead`; el `receipt` és `{ products, name, city }`; amb errors es queda a `step1`. Desapareix `advanceStep1`.
  - `contextLines` de `messages.js`: `city && fill(c.city, city)` després del producte; surt `demo`.

- [ ] **Step 1: Escriure els tests que fallen**
  - `form-model`: `emptyForm()` és exactament l'objecte de dalt; `formReducer({type:'set', field:'city', value:'Lisboa'})` desa la ciutat; `MAX` és `{ name: 100, email: 254, phone: 30, city: 80 }` més els camps que encara facin falta; el `toggle` de `products` manté l'exclusió d'`asesoramiento`.
  - `form-validate`: `validateContact(emptyForm())` dona errors de `name`, `email`, `phone`, `privacy` (cap de `profile`); amb tot vàlid → `{}`.
  - `form-lead`: `buildLead({...vàlid, products:['a','b'], city:'  Lisboa  '}, { id:'x', lang:'pt', origin:'mobil' }).contact` és `{ id:'x', product:'a,b', city:'Lisboa', name, email, phone, privacy:true, newsletter:false, lang:'pt', origin:'mobil' }`; una ciutat de 100 caràcters (amb un emoji a la frontera) queda a 80 sense trencar-lo; `submitForm` sense correu → `{ errors: { email: 'required' } }`.
  - `lead-payload`: `finalPayload({ contact: { id:'x', name:'A' } })` = `{ id:'x', stage:'complete', contact:{ name:'A' } }`.
  - `lead-sender`: el `target` fals ja no té escolta de `tsf:lead-partial`; un `tsf:lead` acaba en un `fetch` amb `stage: 'complete'`.
  - `form-session`/`messages`: `toSession` dona `city` i `product`; `whatsappText(dict, { city:'Lisboa' })` conté «Ciudad: Lisboa»; `form-hints`: claus `['city', 'email', 'name', 'phone', 'phonePrefix']`.
  - `form-flow`: `handleSubmit` vàlid crida `emitLead` un sol cop, `setReceipt` amb `{ products, name, city }` i `goTo('done')`; amb errors, `goTo('step1')` i `bumpAttempt`.
- [ ] **Step 2: Executar** `node --test tests/form-model.test.mjs tests/form-validate.test.mjs tests/form-lead.test.mjs tests/lead-payload.test.mjs tests/form-session.test.mjs tests/form-flow.test.mjs tests/form-hints.test.mjs tests/lead-sender.test.mjs tests/messages.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implementar** els canvis de dalt i esborrar la perfilació morta. La UI i `app.js` queden trencats fins a les tasques 3-5 (esperat: aquí només han de passar els tests d'aquesta tasca).
- [ ] **Step 4: Executar** la mateixa ordre — Expected: PASS.
- [ ] **Step 5: Commit** `git add site/js tests && git commit -m "feat: formulari sense perfilació; el camp demo passa a city i el lead s'envia d'un sol cop"`

### Task 2: Configuració de la fira, idiomes i PDF per idioma

**Files:**

- Modify: `site/js/config.js`, `site/js/form/dossier.js`, `site/js/form/download-all.js`, `site/js/ui/done-screen.js` (només la forma de `docs`: `{ href, meta }`)
- Delete: `site/dossier-prova.pdf`, `site/dossiers/.DS_Store` (ja és al `.gitignore`; només fora del disc)
- Test: `tests/config.test.mjs`, `tests/form-dossier.test.mjs`, `tests/form-download-all.test.mjs`, `tests/i18n.test.mjs`

**Interfaces:**

- Produces:
  - Config: `fair: 'Enertech 2026'`; `languages: ['pt', 'en', 'es', 'ca']` (és l'ordre del selector); `defaultLang: 'pt'`; `dossier: true`; `products` són exactament `[{ id: 'boatee', name: 'Boatee' }, { id: 'ez-raft', name: 'EZ Raft' }, { id: 'jetwave', name: 'Jetwave' }, { id: 'momentum', name: 'Momentum' }, { id: 'seanxt', name: 'SeaNXT' }, { id: 'sifly', name: 'Sifly' }, { id: 'tko', name: 'TKO' }]`, cadascun amb `pdf: { en: 'dossiers/<id>.en.pdf' }`; `brandPdf` és **opcional** i avui no existeix (mateix format `{ en: '…' }`). S'esborren `dossierUrl` i `dossierFileName`. Afegir un idioma a un PDF = afegir la clau al mapa. El comentari de capçalera de `config.js` es posa al dia.
  - `pdfFor(pdfs: Record<string,string> | undefined, lang: string) -> string | undefined` = `pdfs?.[lang] ?? pdfs?.en`.
  - `dossiersFor(productIds: string[], lang: string, config, generalMeta: string) -> { href: string, meta: string }[]`: la regla de selecció i de duplicats d'avui (el general, només si `config.brandPdf` existeix, s'afegeix quan algun triat no té PDF propi o no n'hi ha cap); cada `href` és `pdfFor(…, lang)`; un producte sense cap PDF compta com «sense PDF propi».
  - `downloadAll(docs: { href }[], opts?)`: el nom de descàrrega és el del fitxer (`link.download = ''`).

- [ ] **Step 1: Escriure els tests que fallen**
  - `form-dossier` (config fals `{ brandPdf:{en:'g.en.pdf'}, products:[{id:'a',name:'A',pdf:{en:'a.en.pdf',pt:'a.pt.pdf'}},{id:'b',name:'B',pdf:{en:'b.en.pdf'}},{id:'c',name:'C'}] }`): `dossiersFor(['a'],'pt',cfg,'G')` = `[{href:'a.pt.pdf',meta:'A'}]`; `(['b'],'pt')` cau a `b.en.pdf`; `(['a','c'],'es')` = `a.en.pdf` + `g.en.pdf`; `(['asesoramiento'],'pt')` i `([],'pt')` = `[g.en.pdf]`; `(['a','a'],'en')` no repeteix; sense `brandPdf`: `(['c'],'pt')`, `(['asesoramiento'],'pt')` i `([],'pt')` = `[]`, i `(['a','c'],'en')` = només `a.en.pdf`.
  - `config`: els ids de producte són els 7 de dalt, únics; cada `pdf[lang]` (i `brandPdf[lang]` si hi és) és una ruta relativa a un fitxer que existeix i comença per `%PDF-`; cada mapa té la clau `en`; les claus d'idioma són a `config.languages`; `languages` és `['pt','en','es','ca']` i `defaultLang` `'pt'`; `fair` és un text no buit; `dossier === true`; no hi ha `dossierUrl` ni `dossierFileName`; els fitxers són `nom.pdf` en minúscules.
  - `i18n`: les proves que depenien de l'ordre dels idiomes s'ajusten a `config.languages`, no a una llista escrita a mà.
  - `form-download-all`: amb `docs=[{href:'a'},{href:'b'}]` el primer clic és síncron i amb `download === ''`.
- [ ] **Step 2: Executar** `node --test tests/config.test.mjs tests/form-dossier.test.mjs tests/form-download-all.test.mjs tests/i18n.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implementar** `pdfFor`, `dossiersFor`, `downloadAll`, la forma de `docs` a `done-screen.js` i la configuració; esborrar `site/dossier-prova.pdf` (i qualsevol referència a `dossier-prova.pdf` a `scripts/make-test-pdf.mjs`, README i tests, si ja no serveix).
- [ ] **Step 4: Executar** la mateixa ordre — Expected: PASS.
- [ ] **Step 5: Commit** `git add -A site scripts tests && git commit -m "feat: config d'Enertech 2026 amb 7 productes, idiomes PT/EN/ES/CA i PDF per idioma"`

### Task 3: Inici amb el nom de la fira, productes (multi-tria) i ciutat

**Files:**

- Modify: `site/js/ui/entry-screen.js`, `site/js/i18n-form.js` (`FORM` i `FORM_NO_DOSSIER`), `site/css/page.css`
- Test: `tests/ui-steps.test.mjs`, `tests/no-dossier.test.mjs`, `tests/form-i18n.test.mjs`, `tests/css.test.mjs`

**Interfaces:**

- Consumes: `emptyForm` (Task 1), `CONFIG.fair` (Task 2), `makeFields(...).checks/text` de `site/js/ui/fields.js`.
- Produces: `EntryScreen({ t, fair, links, email, products, askProduct, values, errors, onChange, onToggle, legalQuery, onOpenForm, onContactClick })`. `onContactClick(button: 'whatsapp' | 'email') -> void` es crida al clic de cada botó sense impedir la navegació (Task 6 el connecta). El nom de la fira (`fair`, text literal, no traduït) surt dins de l'escena superior com a etiqueta sobre el títol. El bloc de productes és el mateix `checks('products', f.productLegend, [...productes, ADVICE])` (`name: 'products'`, multi-tria, dins de `.form__products`, que ja és una quadrícula de 2 columnes amb l'últim element a tota l'amplada) i només surt si `askProduct`; la ciutat és `text('city', f.cityLabel, { placeholder: f.cityPlaceholder })`. Ordre: escena (fira + títol + subtítol), productes, ciutat, contacte, CTA, enllaços legals. Surten `profile*`, `onProfile` i `onClearProfile`.
- Literals (4 idiomes): `cityLabel` i `cityPlaceholder` substitueixen `demo`/`demoPlaceholder` (es: «¿De qué ciudad eres?» / «Lisboa»); `productLegend` ja existeix (revisar-lo perquè serveixi a l'inici: «¿Qué producto te interesa?»). `entrySubtitle` ja no diu «quién eres»: «Cuéntanos qué te interesa y te enviamos el dossier.» (sense dossier: «…y nos pondremos en contacto contigo.»). S'esborren `entryProfileLegend` i els literals `demo*`. El `pt` amb «tu».

- [ ] **Step 1: Escriure els tests que fallen**
  - `ui-steps` (inici): hi apareix el text `Enertech 2026` dins de l'escena; no hi ha cap `ChoiceChips` ni llegenda de perfil; hi ha un `CheckboxGroup` `products` amb les opcions `[...ids, 'asesoramiento']`, marcades segons `values.products`, i marcar-ne una crida `onToggle('products', id)`; hi ha un `Field` `city` que crida `onChange('city', 'Lisboa')`; l'ordre és productes → ciutat → botons de contacte → CTA; clicar WhatsApp crida `onContactClick('whatsapp')` i el correu `onContactClick('email')`, i els `href` no canvien.
  - `no-dossier`: amb `askProduct: false` no hi ha el grup `products` però sí la ciutat i el nom de la fira.
  - `form-i18n`: `cityLabel` i `cityPlaceholder` existeixen i no són buits als 4 idiomes; `entryProfileLegend` i `demo` ja no existeixen; el test del CTA d'entrada es manté.
  - `css`: si es toca la quadrícula de `.form__products`, el test existent segueix passant i hi ha una regla per a l'escena de l'inici compactada.
- [ ] **Step 2: Executar** `node --test tests/ui-steps.test.mjs tests/no-dossier.test.mjs tests/form-i18n.test.mjs tests/css.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Disseny.** Invocar `impeccable` (shape/layout) amb la restricció «inici complet a 360×740 sense scroll: fira, títol, 8 caselles en 2 columnes, ciutat, WhatsApp, correu i CTA»; si no hi cap, decidir què es compacta (alçada de l'escena, nota de contacte, espais) i deixar-ho a `page.css`.
- [ ] **Step 4: Implementar** `EntryScreen`, els literals (traduir `ca`, `pt`, `en` amb el mateix sentit) i el CSS decidit.
- [ ] **Step 5: Executar** la mateixa ordre — Expected: PASS.
- [ ] **Step 6: Commit** `git add site tests && git commit -m "feat: l'inici mostra Enertech 2026 i pregunta productes i ciutat"`

### Task 4: Pàgina 1 amb el producte; fi del pas 2 i text de privacitat

**Files:**

- Modify: `site/js/ui/step-contact.js`, `site/js/i18n-form.js` (`submit`, `next`, text de privacitat, esborrar literals de perfilació i `step2*`), `site/js/form/focus.js` si referencia el pas 2, `site/index.html` (treure el `modulepreload` de `step-profile.js`), `site/css/page.css`
- Delete: `site/js/ui/step-profile.js`
- Test: `tests/ui-steps.test.mjs`, `tests/form-i18n.test.mjs`, `tests/privacy-text.test.mjs`, `tests/no-dossier.test.mjs`, `tests/html.test.mjs`

**Interfaces:**

- Consumes: `makeFields(...).checks` (`fields.js`), `values.products` (Task 1).
- Produces: `StepContact({ t, lang, products, askProduct, values, errors, onChange, onToggle, onSubmit, onBack, onKeyDown, privacyHref })`: `onNext` passa a `onSubmit`; el bloc `form__products` (el mateix `checks('products', …)` que a l'inici) surt entre el telèfon i el consentiment quan `askProduct`. L'indicador queda «Paso 1 de 2» (la descàrrega és la pàgina 2). El botó principal és `f.submit` («Acceder al dossier» / «Enviar» sense dossier). La ciutat **no** es demana aquí.
- Literals: `privacyText` (4 idiomes, amb `{responsable}` i `{email}`) enumera només el que es desa de veritat: nom, correu, telèfon, idioma, origen, la casella de novetats, el producte i la ciutat, i el seu ús (enviar el dossier i contactar); es treuen les referències a embarcació, localitat de la demostració i comentaris. Es treuen els literals i el codi d'error `profileRequired` de perfilació (`step2*`, `profiles`, `activit*`, `hasBoat`, `hasElectric`, `intent`, `enthusiasm*`, `concerns*`, `factors*`, `otherLabel`, `otherPlaceholder`, `comments*`).

- [ ] **Step 1: Escriure els tests que fallen**
  - `ui-steps`: el pas 1 amb `askProduct` mostra una casella per producte més «asesoramiento» al final, marcades segons `values.products`, i marcar-ne una crida `onToggle('products', id)`; sense `askProduct` no hi ha caselles; no hi ha camp `city`; enviar el formulari crida `onSubmit`; el botó principal diu `f.submit`. Els tests del pas 2 (perfil, activitat, opinions, comentaris) s'esborren amb el fitxer.
  - `form-i18n`: `ERROR_CODES` és `['required','email','phone','prefix','privacy']`; paritat de claus entre idiomes; no queden les claus esborrades; el test de privacitat cita ara producte i ciutat (i no «embarcación», «comentarios», «demostración»).
  - `no-dossier`: el pas 1 sense dossier no conté «dossier|pdf|descarg|download» als literals visibles.
  - `html`: `index.html` no preveu cap mòdul que no existeixi.
- [ ] **Step 2: Executar** `node --test tests/ui-steps.test.mjs tests/form-i18n.test.mjs tests/privacy-text.test.mjs tests/no-dossier.test.mjs tests/html.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Disseny.** `impeccable` (layout): la pàgina 1 (nom, correu, prefix+telèfon, 8 caselles en 2 columnes, 2 consentiments, botó i «← Volver») ha de cabre a 360×740; ajustar espais a `page.css` i, si cal, el títol.
- [ ] **Step 4: Implementar** `StepContact`, esborrar `step-profile.js` i els literals sobrants.
- [ ] **Step 5: Executar** la mateixa ordre — Expected: PASS.
- [ ] **Step 6: Commit** `git add -A site tests && git commit -m "feat: el producte passa a la pàgina de dades; desapareix la perfilació i el text de privacitat es posa al dia"`

### Task 5: Cablejat de l'aplicació, confirmació per idioma i textos de la fira

**Files:**

- Modify: `site/js/app.js`, `site/js/ui/done-screen.js`, `site/js/messages.js`, `site/js/i18n.js`, `site/index.html` (meta description i fallback si citen Barcelona), `site/js/form/context.js`
- Test: `tests/ui-steps.test.mjs`, `tests/ui.test.mjs`, `tests/messages.test.mjs`, `tests/html.test.mjs`, `tests/no-dossier.test.mjs`

**Interfaces:**

- Consumes: `EntryScreen` (Task 3), `StepContact` (Task 4), `handleSubmit`, `dossiersFor(ids, lang, config, generalMeta)` (Tasks 1-2).
- Produces:
  - Vistes `entry | step1 | done` (desapareix `step2`); `submit = () => handleSubmit(...)` al pas 1; l'inici rep `fair`, `products`, `askProduct`, `values`, `onToggle` i `onContactClick`.
  - A `done`: `docs = dossier ? dossiersFor(receipt?.products ?? [], lang, CONFIG, t.form.doneCardGeneral) : []`; si `docs` és buit, la pantalla usa els literals de la versió sense dossier (`dictFor(lang, false)`), de manera que mai parla d'una descàrrega inexistent. `DoneScreen` rep `onContactClick` i el crida igual que l'inici.
  - Missatges: `contactLinks(config, dict, session)` substitueix `{fair}` per `config.fair` als textos i assumptes de `dict.messages.*` (4 idiomes); desapareix «Salón Náutico de Barcelona» / «Saló Nàutic de Barcelona» / «Salão Náutico de Barcelona» / «Barcelona Boat Show» de tots els textos visibles, de `index.html` i de `docs/textos-contacte.md`.
  - `onContactClick` d'`app.js` emet per ara `tsf:contact-click` amb `{ button, from: 'entry' | 'done' }` (Task 6 hi afegeix la resta).

- [ ] **Step 1: Escriure els tests que fallen**
  - `ui-steps` (confirmació): amb `docs` de 2 elements surten 2 targetes; amb `docs=[]` no hi ha targeta ni botó de descàrrega; clicar WhatsApp/correu crida `onContactClick('whatsapp'|'email')`.
  - `messages`: `contactLinks({ ...CONFIG, fair: 'Enertech 2026' }, DICT.es)` produeix un enllaç de WhatsApp amb `Enertech%202026` i sense `Barcelona`; ho mateix als 4 idiomes i al `subject` del correu.
  - `ui`: `app.js` no importa `step-profile.js` ni conté `step2`; crida `dossiersFor` amb `lang`.
  - `html`: `index.html` no conté «Barcelona».
  - `no-dossier`: amb `docs=[]` el títol i el text de la confirmació són els de `FORM_NO_DOSSIER`.
- [ ] **Step 2: Executar** `node --test tests/ui-steps.test.mjs tests/ui.test.mjs tests/messages.test.mjs tests/html.test.mjs tests/no-dossier.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implementar** `app.js` (estat de vistes, `goBack`, `leaveToEntry`, `emit('tsf:contact-click')`), la confirmació i els textos amb `{fair}`; `npm run texts` per regenerar `docs/textos-contacte.md`.
- [ ] **Step 4: Executar** `npm test` — Expected: tots verds.
- [ ] **Step 5: Verificació manual** amb `npm run serve` i el navegador a 360×740 (`superpowers-chrome:browsing` o `claude-in-chrome`): obrir `http://localhost:8080/?lang=pt`, triar dos productes i una ciutat, anar a les dades (productes marcats), canviar-ne un, enviar, veure les dues targetes; repetir amb `?lang=en`, amb «asesoramiento» (confirmació sense descàrrega) i amb `?dossier=0`. A cada pantalla, mesurar `document.documentElement.scrollHeight <= window.innerHeight` (inici i dades). Expected: cap error a la consola; si una pantalla fa scroll, tornar a l'Step 3 de la Task 3/4.
- [ ] **Step 6: Commit** `git add -A site docs tests && git commit -m "feat: recorregut entry → dades → descàrrega i textos d'Enertech 2026"`

### Task 6: Clics anònims i detallats, ciutat i `Clics` al full de Google

**Files:**

- Create: `site/js/form/click-info.js`
- Modify: `site/js/form/payload.js`, `site/js/form/sender.js`, `site/js/app.js`, `site/index.html` (`modulepreload`), `apps-script/Code.gs`, `scripts/smoke-sheet.mjs`, `docs/google-sheet.md`, `site/js/i18n.js` i `site/js/i18n-form.js` (`cookiesText`)
- Test: `tests/form-click-info.test.mjs` (nou), `tests/lead-payload.test.mjs`, `tests/lead-sender.test.mjs`, `tests/apps-script.test.mjs`, `tests/form-i18n.test.mjs`

**Interfaces:**

- Produces al client:
  - `clickInfo({ nav, win, doc, startedAt, now }) -> { browserLang, device, os, tz, screen, seconds, referrer }`, funció pura que rep els globals injectats: `browserLang = nav.language ?? ''`; `device` = `'tablet'` / `'mobile'` / `'desktop'` (de `nav.userAgentData?.mobile` o del user-agent: `iPad|Tablet`, `Mobi|Android|iPhone`; res més → `'desktop'`); `os` = `'ios' | 'android' | 'other'`; `tz = win.Intl?.DateTimeFormat?.().resolvedOptions().timeZone ?? ''`; `screen = \`${win.innerWidth}x${win.innerHeight}\``; `seconds = Math.round((now - startedAt) / 1000)`; `referrer` = només el `hostname` de `doc.referrer` (res si és buit o invàlid, mai ruta ni paràmetres). Cap valor llença mai: qualsevol cosa que falti queda `''`.
  - `clickPayload({ id, visit, button, from, lang, origin, products, city, info }) -> { id, stage: 'click', click: { visit, button, from, lang, origin, products, city, ...info } }`; `products` és el text d'ids separats per comes (com a `contact.product`) i `city` és `values.city` retallada (pot ser `''`).
  - `app.js`: `visit` = identificador aleatori creat en carregar la pàgina i **regenerat** a `discardSession` (tauleta); `onContactClick(button, from)` emet `tsf:contact-click` amb `clickPayload(...)` i `connectSender` el cursa a `sender.send`.
- Produces a `Code.gs`:
  - `CLICK_SHEET = 'Clics'`; `CLICK_COLUMNS = ['id','day','time','at','button','from','lang','origin','visit','products','city','device','os','browserLang','tz','screen','seconds','referrer']`.
  - `sanitizeClick(payload) -> object | null`: `stage === 'click'`; `id` i `visit` `/^[A-Za-z0-9-]{8,64}$/`; `button` ∈ `['whatsapp','email']`; `from` ∈ `['entry','done']`; `lang` ∈ `LANGS`; `origin` ∈ `ORIGINS`; `products` com al lead (si no encaixa, `''`); `city` retallada a 80 (`clip`); `device` ∈ `['mobile','tablet','desktop']` i `os` ∈ `['ios','android','other']` (si no, `''`); `browserLang` ≤ 15, `tz` ≤ 40, `referrer` ≤ 80 caràcters; `screen` `/^\d{2,5}x\d{2,5}$/` (si no, `''`); `seconds` enter entre 0 i 86400 (si no, `''`). Un lleuger error de format d'un camp opcional no rebutja el clic; sí ho fan `id`, `button`, `from`, `lang` i `origin` invàlids.
  - `recordClick(book, click, now: Date) -> 'created' | 'ignored'`: crea la pestanya amb capçalera si cal; una fila per `id` (un reintent → `'ignored'`); `day` = `Utilities.formatDate(now, book.getSpreadsheetTimeZone(), 'yyyy-MM-dd')`, `time` = `'HH:mm:ss'`, `at` = ISO UTC; cel·les en text pla amb `asText`.
  - `doPost`: comprova el token com ara; si `payload.stage === 'click'` desa el clic i respon `{ ok: true, result }`, si no, el camí de leads.
  - Lead: la columna `demo` es renomena `city` **a la mateixa posició** (mateixes dades); `sanitizeLead` llegeix `c.city` retallat a 80; `profile` deixa de ser obligatori a `complete`; `profiling` s'ignora (les columnes antigues queden buides). `ensureHeader` torna a escriure la capçalera quan no coincideix amb `COLUMNS` (cobreix el canvi de nom), no només si la primera cel·la és diferent.
- Textos: `cookiesText` (4 idiomes) diu que no hi ha cookies i que només es compta, de forma anònima, cada clic a WhatsApp o correu (botó, idioma, tipus de dispositiu, producte i ciutat triats, sense nom, correu ni telèfon); no afirma que no hi ha mesura.

- [ ] **Step 1: Escriure els tests que fallen**
  - `form-click-info` (globals falsos): iPhone UA → `device 'mobile'`, `os 'ios'`; iPad UA → `'tablet'`; Android amb `Mobi` → `'mobile'`, `'android'`; Windows → `'desktop'`, `'other'`; `{ innerWidth: 360, innerHeight: 740 }` → `screen '360x740'`; `startedAt = 1000`, `now = 13400` → `seconds 12`; `referrer 'https://www.google.com/search?q=x'` → `'www.google.com'`; `referrer ''` o `'no és una url'` → `''`; sense `Intl`, sense `nav.language` i sense `doc` → tot `''` i no llença.
  - `lead-payload`: `clickPayload({ id:'c1', visit:'v1', button:'whatsapp', from:'entry', lang:'pt', origin:'mobil', products:'sifly,tko', city:'Lisboa', info:{ device:'mobile' } })` = `{ id:'c1', stage:'click', click:{ visit:'v1', button:'whatsapp', from:'entry', lang:'pt', origin:'mobil', products:'sifly,tko', city:'Lisboa', device:'mobile' } }`.
  - `lead-sender`: disparar `tsf:contact-click` al `target` fals acaba en un `fetch` amb aquest cos; el mateix `id` enviat dues vegades només hi és un cop a la cua.
  - `apps-script`: lead `complete` sense `profile` i amb `city: 'Lisboa'` → fila amb `city 'Lisboa'`; `city` de 100 caràcters → 80; `city: '=1+1'` s'escriu amb apòstrof; capçalera antiga amb `demo` → es reescriu amb `city`. `sanitizeClick` rebutja `button: 'sms'`, `from: 'x'`, `id` curt, `lang: 'fr'` i accepta un clic complet; `screen: '360 x 740'` → `''` sense rebutjar-lo; `referrer` de 200 caràcters → 80. `doPost` d'un clic a un full buit (zona `Europe/Lisbon`, `now = 2026-11-17T10:30:00Z` → `day '2026-11-17'`, `time '10:30:00'`) crea `Clics` amb capçalera i 1 fila amb les 18 columnes; el mateix `id` una segona vegada → `'ignored'` i segueix havent-hi 1 fila; amb `TOKEN` i sense token → `{ ok:false, error:'token' }`; `referrer: '=HYPERLINK("x")'` i `city: '=1+1'` s'escriuen com a text; `city` de 100 caràcters → 80.
  - `form-i18n`: `cookiesText` de cada idioma cita WhatsApp i no coincideix amb `/herramientas de medici|ferramentas de medi|mesura|measurement tools/i`.
- [ ] **Step 2: Executar** `node --test tests/form-click-info.test.mjs tests/lead-payload.test.mjs tests/lead-sender.test.mjs tests/apps-script.test.mjs tests/form-i18n.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implementar** `click-info.js`, `clickPayload`, l'escolta del sender, `app.js` i `Code.gs`. Actualitzar `smoke-sheet.mjs` (lead sense `profile` ni `profiling`, amb `city`; un clic; el mateix clic repetit) i `docs/google-sheet.md` (pestanya `Clics` i les seves 18 columnes; zona horària del full = Lisboa a *File → Settings*; recompte `=COUNTIF(Clics!E:E;"whatsapp")` i `"email"`; visites diferents `=COUNTUNIQUE(Clics!I:I)`; pas «tornar a desplegar l'script en una **nova versió**», imprescindible abans del 19/11).
- [ ] **Step 4: Executar** la mateixa ordre — Expected: PASS.
- [ ] **Step 5: Commit** `git add -A site apps-script scripts docs tests && git commit -m "feat: clics anònims i detallats a la pestanya Clics; city al full de Google"`

### Task 7: Revisió, documentació i entrega

**Files:**

- Modify: `README.md` (recorregut, productes i PDF, taula de dades de prova, recompte de tests), `docs/superpowers/README.md` (fila del 12/11), `docs/textos-contacte.md` (`npm run texts`)
- Test: tota la suite

**Interfaces:** Consumes totes les anteriors.

- [ ] **Step 1: Verificació** `npm test && npm run sync && git status --short` (`superpowers:verification-before-completion`) — Expected: tests verds i cap canvi de `sync`.
- [ ] **Step 2: Documentar** al README (i treure-hi «amb la línia `Co-Authored-By` al final», que contradiu la regla d'Olga) el recorregut nou (inici → dades → descàrrega), com afegir un idioma a un PDF (afegir la clau al mapa `pdf`) o el PDF general (`brandPdf`), la pestanya `Clics` i la llista actualitzada de «dades de prova a substituir»; afegir la fila del 12/11 a `docs/superpowers/README.md`; `npm run texts`.
- [ ] **Step 3: Qualitat de la UI.** `impeccable audit` i `polish` sobre l'inici, les dades i la confirmació a 360×740 i a 768 de ample (contrast, tàctils de 48 px, focus, ordre de tabulació); corregir el que surti amb tests.
- [ ] **Step 4: Revisió de codi.** `superpowers:requesting-code-review` sobre tota la branca; fer servir `/simplify` per DRY/KISS (cap codi mort de perfilació, cap duplicat entre l'inici i el pas 1 en el bloc de productes).
- [ ] **Step 5: Proves reals (Olga).** Amb l'script desplegat i `npm run serve`: a cada idioma, fer el flux amb un producte, amb diversos i amb «asesoramiento»; comprovar que cada targeta descarrega el PDF anglès correcte (el de 17 MB de SeaNXT inclòs, amb dades mòbils), que a `Leads` hi ha la fila amb producte i ciutat i que a `Clics` hi ha una fila per clic, amb dia i hora de Lisboa i totes les columnes. Provar-ho també amb el mòbil.
- [ ] **Step 6: Commit i PR** (`superpowers:finishing-a-development-branch`): `git add -A && git commit -m "docs: recorregut d'Enertech 2026"`; `git push -u origin feat/feria-portugal` i obrir PR cap a `main`; CI en verd i vistiplau d'Olga abans de fusionar (Pages desplega en fusionar).
