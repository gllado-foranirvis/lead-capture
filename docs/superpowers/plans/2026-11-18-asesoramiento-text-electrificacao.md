# «Busco asesoramiento» amb text lliure + Electrificação sense dossier — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que un producte pugui no tenir dossier (Electrificação no en té), i que, quan el visitant tria «Busco asesoramiento», pugui escriure un text lliure que arriba al full de Google, als missatges de WhatsApp/correu i queda cobert al text de privacitat.

**Architecture:** El text és un camp nou del formulari, `adviceNote`, que viu al **contacte** (no a la perfilació del pas 2), així arriba ja amb el lead parcial del pas 1 i el visitant que salta el pas 2 no el perd. Es mostra a l'inici i al pas 1 just sota el grup de productes quan `products` inclou `ADVICE`; s'esborra si deixa de ser-hi. A Apps Script és una columna nova **al final** de `Leads` (les anteriors no es mouen).

**Tech Stack:** JS modular sense build (`site/js`), React via `h()` amb `tests/helpers/fake-react.mjs`, `node --test`, Google Apps Script (`apps-script/Code.gs`).

**Spec:** cap document previ; la petició de l'usuari (18/11/2026): (1) Electrificação no ha de mostrar cap PDF i no n'hi ha: eliminar-lo i fer que un producte pugui no tenir document; (2) camp de text lliure a «Busco asesoramiento»; (3) ampliar el text de privacitat; (4) més informació als missatges de WhatsApp i correu.

## Global Constraints

- Comentaris i missatges de commit en **català**; sense `Co-Authored-By` ni atribució (preferència de l'usuari).
- Les 4 llengües del formulari (`es`, `ca`, `pt`, `en`) han de tenir les mateixes claus (`tests/i18n*.test.mjs`).
- `MAX.adviceNote = 500` (igual que `comments`); `clip()` per retallar (no parteix emojis).
- Columnes de `Leads`: només s'afegeix al final; `visit` deixa de ser l'última, però `id…visit` no es mouen (els índexs 24/25/26 es mantenen).
- `pdf` és **opcional** a cada producte de `CONFIG.products`; si hi és, `npm test` valida que existeix i és un PDF. Electrificação (`id: 'electric'`) **no té `pdf`** i `site/dossiers/electric.en.pdf` (còpia de Boatee) s'elimina.
- El text de privacitat conserva intactes les subcadenes que `FORM_NO_DOSSIER[*].privacy` substitueix (`i18n-form.js:285` i equivalents), o aquests reemplaços llencen error.
- L'script de Google es desplega **a mà** (copiar `Code.gs` a l'editor): el web nou no l'ha de necessitar per no trencar-se (camp desconegut = ignorat).

## Review Focus

- `adviceNote` amb text i després el visitant desmarca «asesoramiento» o tria un model: el text **no** ha d'arribar al lead (`withDependencies`).
- Text d'una fórmula (`=1+1`, `@SUM(A1)`) o amb 5000 caràcters/emojis: ha d'anar retallat a 500 i, al full, com a text pla.
- `adviceNote` amb només espais: no s'envia (equival a buit).
- `?producto=asesoramiento` (producte preseleccionat, bloc de productes plegat): el camp s'ha de veure igualment (és fora del plegable).
- Un client antic/payload sense `adviceNote`, o amb `adviceNote` però sense `asesoramiento` al `product`: Apps Script l'accepta i el deixa buit.
- Només Electrificação triat: cap targeta ni botó de descàrrega, la nota del pas 1 no diu «tria un producte» (ja n'ha triat un) i la confirmació usa els textos sense dossier i no promet correu.
- Electrificação + Sifly: es descarrega només el de Sifly (la nota diu «Se descargará: Sifly»); el clic de descàrrega no registra `electric`.
- Text d'assessorament llarg (500 caràcters amb emojis, salts de línia) als enllaços de WhatsApp i `mailto:`: ha d'arribar sencer i codificat, sense trencar l'URL.
- El text d'assessorament no ha de sortir als missatges si el visitant ha canviat a un model (ja s'ha esborrat) ni a la confirmació després de «Tornar a l'inici».

---

### Task 1: Productes sense dossier (Electrificação)

**Files:**
- Delete: `site/dossiers/electric.en.pdf` (és una còpia de Boatee; sense seguiment a git)
- Modify: `site/js/config.js` (entrada `electric` sense `pdf`)
- Modify: `site/js/i18n-form.js` (clau `downloadNoDoc` als 4 idiomes), `site/js/ui/step-contact.js` (nota de descàrrega)
- Modify: `README.md:57` (explicar que `pdf` és opcional; «Els 7 PDF …»; Electrificação no en té), `docs/textos-contacte.md` (`npm run texts`)
- Test: `tests/config.test.mjs`, `tests/form-dossier.test.mjs`, `tests/form-views.test.mjs`, `tests/ui-steps.test.mjs`, `tests/form-i18n.test.mjs`

**Interfaces:**
- Consumes: `dossiersFor(productIds, lang, config, generalMeta)` de `site/js/form/dossier.js` (ja ignora els productes sense `href`; cal comprovar-ho amb test, no reescriure-ho).
- Produces: `CONFIG.products[7] = { id: 'electric', name: 'Electrificação' }` (sense `pdf`); `form.downloadNoDoc: string` (p. ex. es «Este producto no tiene dossier; te contactaremos con la información.», ca «Aquest producte no té dossier; et contactarem amb la informació.», pt «Este produto não tem dossier; vamos contactar-te com a informação.», en «This product has no dossier; we will contact you with the information.»).

- [ ] **Step 1: Escriure els tests que fallen**
  - `config.test.mjs`: `pdfMaps()` salta els productes sense `pdf` (només valida els que en tenen); nou test «Electrificação no té PDF: `CONFIG.products.find(p => p.id === 'electric').pdf === undefined`»; «cap PDF orfe»: els fitxers de `site/dossiers/` són exactament els referenciats per la config (així `electric.en.pdf` no reapareix).
  - `form-dossier.test.mjs`: amb un producte `{ id:'e', name:'E' }` sense `pdf` i un `{ id:'a', pdf:{en:'a.en.pdf'} }`: `docs(['e'], 'en')` → `[]` sense `brandPdf`; `docs(['e','a'], 'en')` → només `a`; amb `brandPdf`, `docs(['e'])` → el general (comportament existent); `onlyEnglishPdfs` no peta amb productes sense `pdf`.
  - `form-views.test.mjs`: `doneView` amb `['electric']` → `docs: []`, `t === dictFor('pt', false)`, `emailDelivery === false`; amb `['electric','sifly']` → només el PDF de Sifly.
  - `ui-steps.test.mjs`: pas 1 amb `products:['electric']` i `downloads:[]` → la nota (`form__download`) és `f.downloadNoDoc`; amb `products:[]` continua sent `f.downloadNone`; amb `downloads:['Sifly']` → `downloadList`.
  - `form-i18n.test.mjs`: `downloadNoDoc` no buit als 4 idiomes i sense «PDF» (mateixa regla que `downloadNone`, línia 117).
- [ ] **Step 2: Executar** `node --test tests/config.test.mjs tests/form-dossier.test.mjs tests/form-views.test.mjs tests/ui-steps.test.mjs tests/form-i18n.test.mjs`. Esperat: FALLA (config conté `pdf` d'electric i el fitxer existeix; falta la clau).
- [ ] **Step 3: Implementar**: treure `pdf` de l'entrada `electric` a `config.js`; `rm site/dossiers/electric.en.pdf`; `downloadNoDoc` als 4 idiomes; a `step-contact.js` la nota passa a `downloads.length ? downloadList : values.products.length ? f.downloadNoDoc : f.downloadNone`; si cal, `pdf?.` als llocs que llegeixen `p.pdf` (`onlyEnglishPdfs` ja usa `p.pdf?.[lang]`). Corregir el README i executar `npm run texts`.
- [ ] **Step 4: Executar** `npm test`. Esperat: tot verd, també `no-dossier.test.mjs`.
- [ ] **Step 5: Provar al navegador** (`npm run serve`, mòbil): triar només Electrificação → nota «no té dossier», enviar el formulari → confirmació sense botons de descàrrega ni «t'hem enviat per correu»; triar Electrificação + Sifly → només es baixa Sifly.
- [ ] **Step 6: Commit**

```bash
git add site/js/config.js site/js/i18n-form.js site/js/ui/step-contact.js tests README.md docs/textos-contacte.md
git commit -m "feat: productes sense dossier i Electrificação sense PDF"
```

---

### Task 2: Camp `adviceNote` al model i al lead

**Files:**
- Modify: `site/js/form/model.js` (`MAX`, `emptyForm`, `withDependencies`)
- Modify: `site/js/form/lead.js` (`buildContact`)
- Test: `tests/form-model.test.mjs`, `tests/form-lead.test.mjs`

**Interfaces:**
- Produces: `MAX.adviceNote === 500`; `emptyForm()` inclou `adviceNote: ''` (darrere de `comments`); `formReducer` esborra `adviceNote` si `products` no inclou `ADVICE`; `buildContact` posa `contact.adviceNote: string` **només** si `products` inclou `ADVICE` i el text retallat no és buit (si no, la clau no hi és).

- [ ] **Step 1: Escriure els tests que fallen**
  - `form-model.test.mjs`: actualitzar el `deepEqual` d'`emptyForm` amb `adviceNote: ''`; nou test «`adviceNote` s'esborra en desmarcar l'assessorament o en triar un model»: amb `products:['asesoramiento']` i `set adviceNote 'hola'` → `toggle products 'asesoramiento'` dona `adviceNote === ''`; `set` + `toggle products 'sifly'` dona `adviceNote === ''` i `products` `['sifly']`; amb `asesoramiento` marcat el `set` el conserva.
  - `form-lead.test.mjs` (mirar com construeix els valors el fitxer): `buildLead` amb `products:['asesoramiento'], adviceNote:'  Vull una barca per a 6 persones  '` → `lead.contact.adviceNote === 'Vull una barca per a 6 persones'`; amb 600 caràcters → longitud 500; amb `'   '` → `Object.hasOwn(contact,'adviceNote') === false`; amb `products:['sifly'], adviceNote:'x'` → no hi és; `buildPartialLead` també el porta.
- [ ] **Step 2: Executar** `node --test tests/form-model.test.mjs tests/form-lead.test.mjs`. Esperat: FALLA.
- [ ] **Step 3: Implementar** a `model.js` (`MAX.adviceNote = 500`, `emptyForm`, i a `withDependencies`: `if (!next.products.includes(ADVICE)) next.adviceNote = ''`) i a `lead.js` (`buildContact` afegeix `adviceNote` sota la condició descrita; `payload.js` no canvia: `contact` ja viatja sencer).
- [ ] **Step 4: Executar** els mateixos tests. Esperat: PASS.
- [ ] **Step 5: Commit** `git commit -m "feat: camp adviceNote al model i al lead"`

---

### Task 3: Apps Script i documentació del full

**Files:**
- Modify: `apps-script/Code.gs` (`COLUMNS`, `MAX`, `sanitizeLead`, comentari de la capçalera)
- Modify: `docs/google-sheet.md:21`
- Test: `tests/apps-script.test.mjs`

**Interfaces:**
- Consumes: `payload.contact.adviceNote?: string` (Task 2).
- Produces: `COLUMNS` acaba en `…'city', 'comments', 'visit', 'adviceNote'`; `MAX.adviceNote = 500`; `sanitizeLead(...).adviceNote: string` = text retallat si `lead.product` conté el id `asesoramiento`, sinó `''`.

- [ ] **Step 1: Escriure els tests que fallen** (reutilitzant els `complete`/`contact` del fitxer):
  - Substituir el test de `«visit» és l'última columna` per: `COLUMNS.at(-1) === 'adviceNote'` i `indexOf` de `city/comments/visit` = `[24, 25, 26]`, `adviceNote` = 27.
  - `sanitizeLead` amb `product:'asesoramiento'` i `adviceNote:'  Vull assessorament  '` → `'Vull assessorament'`; 600 caràcters → 500; `product:'sifly'` + `adviceNote` → `''`; sense `adviceNote` → `''`; `adviceNote: {a:1}` → `''` (no objectes).
  - Upsert d'un lead amb `adviceNote:'=1+1'` escriu `"'=1+1"` a la columna (mateix patró que el test del `comments`, línia ~91).
- [ ] **Step 2: Executar** `node --test tests/apps-script.test.mjs`. Esperat: FALLA.
- [ ] **Step 3: Implementar** a `Code.gs`: afegir `'adviceNote'` al final de `COLUMNS`, `adviceNote: 500` a `MAX`, i a `sanitizeLead` `lead.adviceNote = lead.product.split(',').indexOf('asesoramiento') > -1 && typeof c.adviceNote === 'string' ? clip(c.adviceNote, MAX.adviceNote) : ''`. Actualitzar el comentari «visit és l'última» i `docs/google-sheet.md:21` (nova columna `adviceNote`, text lliure de «Busco asesoramiento», **l'script es torna a copiar a l'editor i es desplega una versió nova**; `ensureHeader` hi escriu la capçalera sol).
- [ ] **Step 4: Executar** `npm test`. Esperat: tot verd.
- [ ] **Step 5: Commit** `git commit -m "feat: columna adviceNote a l'script de Google"`

---

### Task 4: Camp de text a la pantalla d'inici i al pas 1 (4 llengües)

**Files:**
- Modify: `site/js/i18n-form.js` (claus noves als 4 blocs `form`)
- Modify: `site/js/ui/entry-screen.js`, `site/js/ui/step-contact.js`
- Modify: `docs/textos-contacte.md` (regenerar amb `npm run texts`)
- Test: `tests/ui-steps.test.mjs`, `tests/form-i18n.test.mjs`

**Interfaces:**
- Consumes: `values.adviceNote`, `values.products`, `ADVICE` (Task 2); `makeFields().text(field, label, extra)` de `site/js/ui/fields.js` (accepta `multiline: true` i `placeholder`, com `comments` a `step-profile.js:38`).
- Produces: claus `form.adviceNoteLabel` i `form.adviceNotePlaceholder` a `es`, `ca`, `pt`, `en`. Etiquetes suggerides: es «¿Qué necesitas? (opcional)» / «Cuéntanos qué buscas o qué dudas tienes»; ca «Què necessites? (opcional)» / «Explica\'ns què busques o quins dubtes tens»; pt «De que precisas? (opcional)» / «Conta-nos o que procuras ou que dúvidas tens»; en «What do you need? (optional)» / «Tell us what you are looking for or what questions you have».

- [ ] **Step 1: Escriure els tests que fallen** (a `ui-steps.test.mjs`, amb els helpers `entry`, `contact`, `byName`):
  - Inici: amb `products:['asesoramiento']` hi ha un camp `adviceNote` (`T.Field` amb `multiline: true`, `label === f.adviceNoteLabel`, `onChange` crida `onChange('adviceNote', valor)`), **després** del `CheckboxGroup` de productes; amb `products:['sifly']` o `[]` no n'hi ha cap.
  - Pas 1: el mateix, i amb `productsOpen:false` el camp **no** és dins del `details` del plegable (`findAll(fold, …adviceNote)` és buit) però sí a l'arbre.
  - `form-i18n.test.mjs` (o l'existent de claus idèntiques): les dues claus existeixen i no són buides als 4 idiomes.
- [ ] **Step 2: Executar** `node --test tests/ui-steps.test.mjs tests/form-i18n.test.mjs`. Esperat: FALLA.
- [ ] **Step 3: Implementar** les claus a `i18n-form.js` (al costat de `productAdvice`) i, a les dues pantalles, `values.products.includes(ADVICE) ? text('adviceNote', f.adviceNoteLabel, { multiline: true, placeholder: f.adviceNotePlaceholder, maxLength: MAX.adviceNote }) : null`, col·locat just sota el grup de productes (a `step-contact.js`, entre el `Fold` i la nota `form__download`, fora del `Fold`). Executar `npm run texts` per regenerar `docs/textos-contacte.md`.
- [ ] **Step 4: Executar** `npm test`. Esperat: tot verd.
- [ ] **Step 5: Provar al navegador** (`npm run serve`, mòbil 360×740): triar «Busco asesoramiento» → surt el camp, escriure, continuar al pas 1 → el text hi és; marcar un model → el camp desapareix i el text s'esborra; comprovar que el botó principal continua visible sense scroll horitzontal.
- [ ] **Step 6: Commit** `git commit -m "feat: text lliure quan es tria «Busco asesoramiento»"`

---

### Task 5: Més informació als missatges de WhatsApp i correu

**Files:**
- Modify: `site/js/form/session.js` (`toSession`), `site/js/messages.js` (`contextLines`), `site/js/i18n.js` (`messageContext` als 4 idiomes), `site/js/form/flow.js:25` (el `receipt`)
- Test: `tests/form-session.test.mjs`, `tests/messages.test.mjs`, `tests/form-flow.test.mjs`

**Interfaces:**
- Consumes: `values.adviceNote`, `values.products`, `ADVICE`, `MAX.adviceNote` (Task 2).
- Produces: `toSession(values, ctx)` retorna també `adviceNote: string` (retallat a 500; `''` si `products` no inclou `ADVICE`); `messageContext.advice` amb `{value}` als 4 idiomes (es «Consulta: {value}», ca «Consulta: {value}», pt «Questão: {value}», en «Question: {value}»); el `receipt` de `finish()` passa a `{ products, name, city, adviceNote }`. Ordre de les línies: nom, producte, ciutat, consulta.

- [ ] **Step 1: Escriure els tests que fallen**
  - `form-session`: `toSession({ products:['asesoramiento'], adviceNote:'  Vull una barca per a 6  ' }, …).adviceNote === 'Vull una barca per a 6'`; amb `products:['sifly']` → `''`; 600 caràcters → 500; sense camp → `''`. El `deepEqual` del primer test passa a incloure `adviceNote: ''`.
  - `messages`: amb `{ name:'Ana', product:'No lo sé aún', city:'Lisboa', adviceNote:'Quiero algo silencioso' }` el WhatsApp i el cos del correu acaben (abans del comiat) amb `Consulta: Quiero algo silencioso` a una línia pròpia; sense `adviceNote` la línia no hi és; un text amb `&`, `"`, emojis i salt de línia arriba intacte als dos canals (`decodeURIComponent`); `{value}` a cada `messageContext.advice` dels 4 idiomes.
  - `form-flow`: el `receipt` rebut per `setReceipt` porta `adviceNote`.
- [ ] **Step 2: Executar** `node --test tests/form-session.test.mjs tests/messages.test.mjs tests/form-flow.test.mjs`. Esperat: FALLA.
- [ ] **Step 3: Implementar** `adviceNote` a `toSession` (mateix criteri que `lead.js`: només amb `ADVICE`), la línia a `contextLines` (`advice && fill(c.advice, advice)`), les 4 cadenes i el camp al `receipt`. `app.js` no canvia: `sessionOf(values)` i `sessionOf(receipt)` ja passen per `toSession`.
- [ ] **Step 4: Executar** `npm test`. Esperat: tot verd.
- [ ] **Step 5: Commit** `git commit -m "feat: la consulta d'assessorament viatja als missatges de WhatsApp i correu"`

---

### Task 6: Text de privacitat

**Files:**
- Modify: `site/js/i18n-form.js` (`privacyText` als 4 idiomes; `FORM_NO_DOSSIER[*].privacy` per la versió sense dossier)
- Modify: `docs/textos-contacte.md` (`npm run texts`)
- Test: `tests/form-i18n.test.mjs`, `tests/privacy-text.test.mjs`, `tests/no-dossier.test.mjs`

**Interfaces:**
- Consumes: res de les tasques anteriors (només el text).
- Produces: `form.privacyText` menciona, als 4 idiomes, que si el visitant tria «Busco asesoramiento» es desa **el text que escrigui**, i que s'hi pot escriure el que es vulgui però convé **no incloure-hi dades sensibles ni de tercers**; es manté en 6 paràgrafs (`privacy-text.test.mjs` exigeix 6 de curts). La clàusula es posa dins del paràgraf 1, **darrere** de «… si les envies» (no entre «el producto que te interesa, » i la resta, que són subcadenes dels reemplaços sense dossier). A la versió sense dossier (no hi ha producte ni camp) la clàusula s'elimina amb un reemplaç nou a `FORM_NO_DOSSIER[lang].privacy`.

- [ ] **Step 1: Escriure els tests que fallen**: a `form-i18n.test.mjs`, el `privacyText` de cada idioma coincideix amb `/asesoramiento|assessorament|aconselhamento|advice/i` i amb una paraula de «no dades sensibles» (`/sensibles|sensibles|sensíveis|sensitive/i`); a `privacy-text.test.mjs`, `paragraphs(...)` continua sent de 6 i cap paràgraf passa del límit de paraules del test existent (revisar-lo i, si cal, retallar text en lloc d'ampliar el límit); a `no-dossier.test.mjs`, el text sense dossier **no** parla d'assessorament i `withoutDossier` no llença.
- [ ] **Step 2: Executar** els tres fitxers. Esperat: FALLA.
- [ ] **Step 3: Implementar** el text als 4 idiomes (revisar la redacció amb Bruno abans de producció: és text legal) i els reemplaços sense dossier; `npm run texts`.
- [ ] **Step 4: Executar** `npm test`. Esperat: tot verd.
- [ ] **Step 5: Commit** `git commit -m "feat: la privacitat explica el text lliure de l'assessorament"`

---

## Self-review

- **Cobertura:** Electrificação sense dossier i productes sense PDF (Task 1); text lliure: model/lead (2), full (3), UI + 4 llengües (4); missatges (5); privacitat (6). Cada línia de Review Focus té test a la tasca propietària.
- **Tipus coherents:** `adviceNote` (string), `MAX.adviceNote`, `ADVICE`, `form.downloadNoDoc`, `messageContext.advice` s'usen igual arreu.
- **Ordre:** 1 (independent) → 2 → 3, 4, 5 (depenen de 2) → 6.
- **Interpretació a confirmar:** per «personalitzacions que donin més info per WhatsApp i correu» he afegit **la consulta escrita** com a línia dels missatges (Task 5). Si volies també altres dades (p. ex. perfil/activitat del pas 2, o que el missatge digui que el producte no té dossier), cal dir-ho.
